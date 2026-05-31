export interface ParseResult {
  text: string;
  metadata: {
    pages?: number;
    word_count: number;
  };
}

export async function parseFile(
  buffer: Buffer,
  mimeType: string
): Promise<ParseResult> {
  switch (mimeType) {
    case "application/pdf":
      return parsePDF(buffer);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return parseDOCX(buffer);
    default:
      throw new Error("Unsupported file format: " + mimeType);
  }
}

async function parsePDF(buffer: Buffer): Promise<ParseResult> {
  const pdfParse = (await import("pdf-parse")).default;
  const data = await pdfParse(buffer);
  return {
    text: data.text.trim(),
    metadata: {
      pages: data.numpages,
      word_count: data.text.split(/\s+/).length,
    },
  };
}

async function parseDOCX(buffer: Buffer): Promise<ParseResult> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value.trim(),
    metadata: {
      word_count: result.value.split(/\s+/).length,
    },
  };
}
