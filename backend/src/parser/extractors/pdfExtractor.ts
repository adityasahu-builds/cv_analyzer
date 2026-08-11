// Use require for pdf-parse to avoid CJS/ESM interop issues with pdf.js internal worker
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

export interface PdfExtractionResult {
  rawText: string;
  pdfBase64: string;
  hasSufficientText: boolean;
  pageCount: number;
}

export function normalizeWhitespace(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function hasUsableResumeText(text: string): boolean {
  const cleanText = normalizeWhitespace(text);
  if (!cleanText || cleanText.length < 15) {
    return false;
  }

  const alphaCount = (cleanText.match(/[a-zA-Z]/g) || []).length;
  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

  if (cleanText.length >= 100 && alphaCount >= 30) {
    return true;
  }

  if (alphaCount >= 25 && wordCount >= 5) {
    return true;
  }

  const resumeSignals = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // Email
    /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone
    /\b(education|university|college|bachelor|master|degree|phd|diploma|gpa)\b/i,
    /\b(skills|technical|technologies|proficient|programming|languages|frameworks|tools)\b/i,
    /\b(experience|work|employment|history|role|position|engineer|developer|manager|analyst|intern)\b/i,
    /\b(projects|built|developed|designed|implemented|architected)\b/i,
    /\b(summary|profile|objective|contact|linkedin|github)\b/i,
  ];

  let signalCount = 0;
  for (const signal of resumeSignals) {
    if (signal.test(cleanText)) {
      signalCount++;
    }
  }

  if (cleanText.length >= 30 && signalCount >= 1) {
    return true;
  }

  return false;
}

export function extractFallbackPdfText(buffer: Buffer): string {
  try {
    const content = buffer.toString('latin1');
    const textChunks: string[] = [];

    const matches = content.matchAll(/\(([^()]{2,})\)\s*T[jd]/g);
    for (const match of matches) {
      if (match[1]) {
        const unescaped = match[1]
          .replace(/\\([()])/g, '$1')
          .replace(/\\\\/g, '\\');
        if (unescaped.trim().length > 0) {
          textChunks.push(unescaped.trim());
        }
      }
    }

    return normalizeWhitespace(textChunks.join('\n'));
  } catch {
    return '';
  }
}

export async function extractPdfContent(buffer: Buffer, fileName: string = 'document.pdf'): Promise<PdfExtractionResult> {
  const startTime = performance.now();
  let pdfReadTime = 0;
  let extractionTime = 0;
  let base64PrepTime = 0;

  try {
    const parseStart = performance.now();
    const data = await pdfParse(buffer);
    pdfReadTime = performance.now() - parseStart;

    const extractStart = performance.now();
    const rawText = normalizeWhitespace(data.text || '');
    const pageCount = data.numpages || 1;
    const isUsable = hasUsableResumeText(rawText);

    let finalRawText = rawText;
    let finalIsUsable = isUsable;

    if (!finalIsUsable) {
      const fallbackText = extractFallbackPdfText(buffer);
      if (hasUsableResumeText(fallbackText)) {
        console.log(`[pdfExtractor] Standard parsing had insufficient text, but fallback stream extraction recovered ${fallbackText.length} chars.`);
        finalRawText = fallbackText;
        finalIsUsable = true;
      }
    }
    extractionTime = performance.now() - extractStart;

    const base64Start = performance.now();
    const pdfBase64 = !finalIsUsable ? buffer.toString('base64') : '';
    base64PrepTime = performance.now() - base64Start;

    const totalTime = performance.now() - startTime;

    console.log('\n====================================================');
    console.log('         PDF EXTRACTION PERFORMANCE DIAGNOSTICS      ');
    console.log('====================================================');
    console.log(`  - filename            : ${fileName}`);
    console.log(`  - fileSizeBytes       : ${buffer.length}`);
    console.log(`  - extractedTextLength : ${finalRawText.length} chars`);
    console.log(`  - pageCount           : ${pageCount}`);
    console.log(`  - isVisualResume      : ${!finalIsUsable}`);
    console.log(` [PERF] PDF read        : ${pdfReadTime.toFixed(2)} ms`);
    console.log(` [PERF] PDF extraction  : ${extractionTime.toFixed(2)} ms`);
    console.log(` [PERF] Base64 prep     : ${base64PrepTime.toFixed(2)} ms`);
    console.log(` [PERF] Total PDF Parse : ${totalTime.toFixed(2)} ms`);
    console.log('====================================================\n');

    return {
      rawText: finalRawText,
      pdfBase64,
      hasSufficientText: finalIsUsable,
      pageCount,
    };
  } catch (error) {
    console.warn(`[pdfExtractor] pdf-parse failed on '${fileName}':`, error instanceof Error ? error.message : String(error));

    const fallbackStart = performance.now();
    const fallbackText = extractFallbackPdfText(buffer);
    const isFallbackUsable = hasUsableResumeText(fallbackText);
    extractionTime = performance.now() - fallbackStart;

    if (isFallbackUsable) {
      console.log(`[pdfExtractor] pdf-parse failed, but fallback stream extraction recovered ${fallbackText.length} chars of usable text for '${fileName}'.`);
      return {
        rawText: fallbackText,
        pdfBase64: '',
        hasSufficientText: true,
        pageCount: 1,
      };
    }

    const signature = buffer.slice(0, 5).toString('ascii');
    if (signature.startsWith('%PDF-')) {
      const base64Start = performance.now();
      const pdfBase64 = buffer.toString('base64');
      base64PrepTime = performance.now() - base64Start;

      console.warn('[pdfExtractor] Valid PDF signature found. Falling back to visual pdfBase64 payload.');
      console.log(` [PERF] Fallback Base64 prep: ${base64PrepTime.toFixed(2)} ms`);

      return {
        rawText: '',
        pdfBase64,
        hasSufficientText: false,
        pageCount: 1,
      };
    }
    throw new Error(`Failed to parse PDF document: ${error instanceof Error ? error.message : String(error)}`);
  }
}

