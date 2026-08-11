import mammoth from 'mammoth';

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || '').trim();
  } catch (error) {
    throw new Error(`Failed to extract text from DOCX document: ${error instanceof Error ? error.message : String(error)}`);
  }
}
