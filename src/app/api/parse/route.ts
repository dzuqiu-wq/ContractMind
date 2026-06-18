/**
 * ��ͬ�������� API
 * POST /api/parse - �����ϴ����ļ�
 */

import { NextRequest, NextResponse } from "next/server";
import { parseFile } from "@/lib/parser";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "���ϴ��ļ�" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "ֻ֧�� PDF �� DOCX" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "�ļ����ܳ��� 10MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await parseFile(buffer, file.name, file.type);

    return NextResponse.json({
      success: true,
      text_length: result.text.length,
      metadata: result.metadata,
      preview: result.text.slice(0, 500) + (result.text.length > 500 ? "..." : ""),
    });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "����ʧ��" },
      { status: 500 }
    );
  }
}
