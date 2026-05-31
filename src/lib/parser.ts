/**
 * 合同解析模块
 * 支持 PDF 和 DOCX 文件解析
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
    quality_score: number; // 0-100 文本质量评分
    is_scanned: boolean;    // 是否为扫描件
  };
}

export interface ParsedContract {
  rawText: string;
  cleanedText: string;
  metadata: ParseResult["metadata"];
}

/**
 * 清理文本：去除多余空白、规范化格式
 */
function cleanText(text: string): string {
  return text
    // 去除非打印字符
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // 规范化换行符
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // 去除连续的空白字符（保留换行）
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    // 去除连续空行（保留最多2个换行）
    .replace(/\n{3,}/g, "\n\n")
    // 规范化引号
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    // 规范化破折号
    .replace(/—/g, "-")
    .replace(/–/g, "-")
    // 去除首尾空白
    .trim();
}

/**
 * 评估文本质量
 */
function assessQuality(text: string): { score: number; isScanned: boolean } {
  const lines = text.split("\n").filter(l => l.trim().length > 0);
  
  // 检查是否是扫描件（文本混乱、无有效行）
  const avgLineLength = lines.reduce((sum, l) => sum + l.length, 0) / Math.max(lines.length, 1);
  const hasReasonableLength = avgLineLength > 10 && avgLineLength < 200;
  
  // 检查乱码比例
  const garbledRatio = (text.match(/[?]/g) || []).length / Math.max(text.length, 1);
  const hasGarbled = garbledRatio > 0.01;
  
  // 检查有效字符比例
  const validChars = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s.,;:!?。，；：！？""''（）【】《》\-]/g, "").length;
  const validRatio = validChars / Math.max(text.length, 1);
  
  // 综合评分
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
 * 估算中文字符数（用于 token 估算）
 */
function estimateChineseChars(text: string): number {
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const otherChars = text.length - chineseChars;
  // 中文按2个字符估算（LLM token 考量）
  return chineseChars * 2 + otherChars;
}

/**
 * 解析文件
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
      throw new Error(`不支持的文件格式: ${mimeType}`);
  }
}

/**
 * 解析 PDF
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
    console.error("PDF 解析失败:", error);
    throw new Error(`PDF 解析失败: ${error instanceof Error ? error.message : "未知错误"}`);
  }
}

/**
 * 解析 DOCX
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
      console.warn("DOCX 解析警告:", result.messages);
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
    console.error("DOCX 解析失败:", error);
    throw new Error(`DOCX 解析失败: ${error instanceof Error ? error.message : "未知错误"}`);
  }
}

/**
 * 解析文件并返回完整结构（便捷方法）
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
