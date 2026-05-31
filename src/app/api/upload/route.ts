import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const today = new Date().toISOString().split("T")[0];
    
    let stat = await prisma.dailyStat.findUnique({
      where: { ipAddress_reviewDate: { ipAddress: ip, reviewDate: today } },
    });

    if (stat && stat.reviewCount >= 3) {
      return NextResponse.json({ error: "今日免费次数已用完" }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "请上传文件" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "只支持 PDF 和 DOCX" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "文件不能超过 10MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name;
    const filePath = path.join(UPLOAD_DIR, uuidv4() + "_" + fileName);

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(filePath, buffer);

    const review = await prisma.review.create({
      data: {
        fileName,
        filePath,
        fileSize: file.size,
        status: "pending",
        ipAddress: ip,
      },
    });

    if (stat) {
      await prisma.dailyStat.update({
        where: { id: stat.id },
        data: { reviewCount: { increment: 1 } },
      });
    } else {
      await prisma.dailyStat.create({
        data: { ipAddress: ip, reviewDate: today, reviewCount: 1 },
      });
    }

    return NextResponse.json({
      success: true,
      review_id: review.id,
      status: "pending",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}
