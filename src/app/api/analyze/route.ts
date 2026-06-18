import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseFile } from "@/lib/parser";
import { classifyContract } from "@/lib/classifier";
import { splitClauses } from "@/lib/splitter";
import { analyzeContract } from "@/lib/analyzer";
import { calculateScore } from "@/lib/scorer";
import fs from "fs/promises";

export async function POST(request: NextRequest) {
  try {
    const { review_id } = await request.json();

    if (!review_id) {
      return NextResponse.json({ error: "ȱ�� review_id" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id: review_id },
    });

    if (!review) {
      return NextResponse.json({ error: "����¼������" }, { status: 404 });
    }

    await prisma.review.update({
      where: { id: review_id },
      data: { status: "processing" },
    });

    // �����ļ�
    const buffer = await fs.readFile(review.filePath);
    const mimeType = review.fileName.endsWith(".pdf")
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    // �޸�: parseFile ������Ҫ fileName ����
    const parseResult = await parseFile(buffer, review.fileName, mimeType);
    const text = parseResult.text;

    // �����ͬ
    const classification = await classifyContract(text);
    const contractType = classification.type;

    // �з�����
    const clauses = splitClauses(text);

    // ����ÿ������
    const analysisResult = await analyzeContract(clauses, contractType);

    // �����������
    const scoreResult = calculateScore(analysisResult.issues);

    // ������
    const reportData = {
      contract_type: contractType,
      overall_score: scoreResult.overall_score,
      risk_level: scoreResult.risk_level,
      summary: scoreResult.breakdown,
      clauses: analysisResult.clauses,
      issues: analysisResult.issues,
      metadata: parseResult.metadata,
    };

    await prisma.review.update({
      where: { id: review_id },
      data: {
        contractType,
        overallScore: scoreResult.overall_score,
        status: "completed",
        reportData: reportData as any,
      },
    });

    return NextResponse.json({
      success: true,
      status: "completed",
      report_id: review_id,
      risk_level: scoreResult.risk_level,
      risk_score: scoreResult.overall_score,
      issue_count: analysisResult.issues.length,
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json({ error: "����ʧ��" }, { status: 500 });
  }
}
