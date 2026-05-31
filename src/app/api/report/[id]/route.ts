import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findFirst({
      where: {
        OR: [{ id: params.id }, { shareToken: params.id }],
      },
    });

    if (!review) {
      return NextResponse.json({ error: "报告不存在" }, { status: 404 });
    }

    return NextResponse.json({
      id: review.id,
      file_name: review.fileName,
      contract_type: review.contractType,
      overall_score: review.overallScore,
      risk_level: review.overallScore && review.overallScore >= 60 
        ? "高" : review.overallScore && review.overallScore >= 30 ? "中" : "低",
      share_token: review.shareToken,
      status: review.status,
      report_data: review.reportData,
      created_at: review.createdAt,
    });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "获取报告失败" }, { status: 500 });
  }
}
