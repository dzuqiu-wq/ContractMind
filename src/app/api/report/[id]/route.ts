import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json({ error: "报告不存在" }, { status: 404 });
    }

    return NextResponse.json({
      id: review.id,
      file_name: review.fileName,
      status: review.status,
      overall_score: review.overallScore,
      contract_type: review.contractType,
      reportData: review.reportData,
      createdAt: review.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Report fetch error:", error);
    return NextResponse.json({ error: "获取报告失败" }, { status: 500 });
  }
}