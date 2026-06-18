/**
 * ��ͬ����ģ��
 * ֧�� PDF �� DOCX �ļ�����
 */

export interface ParseResult {
  text: string;
  metadata: {
    pages?: number;
    word_count: number;
    char_count: number;
    file_size: number;
    file_name: string;
    mime_type: string;
    extract_date: string;
    quality_score: number; // 0-100 �ı���������
    is_scanned: boolean;    // �Ƿ�Ϊɨ���
  };
}

export interface ParsedContract {
  rawText: string;
  cleanedText: string;
  metadata: ParseResult["metadata"];
}

/**
 * �����ı���ȥ������հס��淶����ʽ
 */
function cleanText(text: string): string {
  return text
    // ȥ���Ǵ�ӡ�ַ�
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // �淶�����з�
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // ȥ�������Ŀհ��ַ���������У�
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    // ȥ���������У��������2�����У�
    .replace(/\n{3,}/g, "\n\n")
    // �淶������
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // �淶�����ۺ�
    .replace(/��/g, "-")
    .replace(/�C/g, "-")
    // ȥ����β�հ�
    .trim();
}

/**
 * �����ı�����
 */
function assessQuality(text: string): { score: number; isScanned: boolean } {
  const lines = text.split("\n").filter(l => l.trim().length > 0);
  
  // ����Ƿ���ɨ������ı����ҡ�����Ч�У�
  const avgLineLength = lines.reduce((sum, l) => sum + l.length, 0) / Math.max(lines.length, 1);
  const hasReasonableLength = avgLineLength > 10 && avgLineLength < 200;
  
  // ����������
  const garbledRatio = (text.match(/[?]/g) || []).length / Math.max(text.length, 1);
  const hasGarbled = garbledRatio > 0.01;
  
  // �����Ч�ַ�����
  const validChars = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s.,;:!?������������""''������������\-]/g, "").length;
  const validRatio = validChars / Math.max(text.length, 1);
  
  // �ۺ�����
  let score = 50;
  if (hasReasonableLength) score += 20;
  if (!hasGarbled) score += 20;
  if (validRatio > 0.7) score += 10;
  
  return {
    score: Math.min(100, Math.max(0, score)),
    isScanned: !hasReasonableLength || hasGarbled
  };
}

/**
 * ���������ַ��������� token ���㣩
 */
function estimateChineseChars(text: string): number {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;
  // ���İ�2���ַ����㣨LLM token ������
  return chineseChars * 2 + otherChars;
}

/**
 * �����ļ�
 */
export async function parseFile(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ParseResult> {
  switch (mimeType) {
    case "application/pdf":
      return parsePDF(buffer, fileName, mimeType);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return parseDOCX(buffer, fileName, mimeType);
    default:
      throw new Error(`��֧�ֵ��ļ���ʽ: ${mimeType}`);
  }
}

/**
 * ���� PDF
 */
async function parsePDF(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ParseResult> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    
    const rawText = data.text;
    const cleanedText = cleanText(rawText);
    const quality = assessQuality(cleanedText);
    
    return {
      text: cleanedText,
      metadata: {
        pages: data.numpages,
        word_count: cleanedText.split(/\s+/).filter(w => w.length > 0).length,
        char_count: estimateChineseChars(cleanedText),
        file_size: buffer.length,
        file_name: fileName,
        mime_type: mimeType,
        extract_date: new Date().toISOString(),
        quality_score: quality.score,
        is_scanned: quality.isScanned,
      },
    };
  } catch (error) {
    console.error("PDF ����ʧ��:", error);
    throw new Error(`PDF ����ʧ��: ${error instanceof Error ? error.message : "δ֪����"}`);
  }
}

/**
 * ���� DOCX
 */
async function parseDOCX(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ParseResult> {
  try {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    
    if (result.messages && result.messages.length > 0) {
      console.warn("DOCX ��������:", result.messages);
    }
    
    const rawText = result.value;
    const cleanedText = cleanText(rawText);
    const quality = assessQuality(cleanedText);
    
    return {
      text: cleanedText,
      metadata: {
        word_count: cleanedText.split(/\s+/).filter(w => w.length > 0).length,
        char_count: estimateChineseChars(cleanedText),
        file_size: buffer.length,
        file_name: fileName,
        mime_type: mimeType,
        extract_date: new Date().toISOString(),
        quality_score: quality.score,
        is_scanned: quality.isScanned,
      },
    };
  } catch (error) {
    console.error("DOCX ����ʧ��:", error);
    throw new Error(`DOCX ����ʧ��: ${error instanceof Error ? error.message : "δ֪����"}`);
  }
}

/**
 * �����ļ������������ṹ����ݷ�����
 */
export async function parseContract(
  buffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<ParsedContract> {
  const result = await parseFile(buffer, fileName, mimeType);
  
  return {
    rawText: result.text,
    cleanedText: result.text,
    metadata: result.metadata,
  };
}
