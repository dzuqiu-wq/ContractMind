declare module 'pdf-parse' {
  interface PDFParseResult {
    numpages: number;
    text: string;
  }
  function pdfParse(buffer: Buffer): Promise<PDFParseResult>;
  export = pdfParse;
}

declare module 'mammoth' {
  interface ExtractResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  function extractRawText(options: { buffer: Buffer }): Promise<ExtractResult>;
  export { extractRawText };
}
