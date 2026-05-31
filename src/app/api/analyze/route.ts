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
      return NextResponse.json({ error: "缺少 review_id" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({
      where: { id: review_id },
    });

    if (!review) {
      return NextResponse.json({ error: "审查记录不存在" }, { status: 404 });
    }

    await prisma.review.update({
      where: { id: review_id },
      data: { status: "processing" },
    });

    // 解析文件
    const buffer = await fs.readFile(review.filePath);
    const mimeType = review.fileName.endsWith(".pdf")
      ? "application/pdf"
      : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    // 修复: parseFile 现在需要 fileName 参数
    const parseResult = await parseFile(buffer, review.fileName, mimeType);
    const text = parseResult.text;

    // 分类合同
    const classification = await classifyContract(text);
    const contractType = classification.type;

    // 切分条款
    const clauses = splitClauses(text);

    // 分析每个条款
    const analysisResult = await analyzeContract(clauses, contractType);

    // 计算风险评分
    const scoreResult = calculateScore(analysisResult.issues);

    // 保存结果
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
    return NextResponse.json({ error: "分析失败" }, { status: 500 });
  }
}
