import { ParsedResumeData, ResumeAnalysisReport } from '../../types/resume';
import { getAIConfig, maskApiKey } from '../config';
import { buildResumeAnalysisPrompt } from '../prompts';
import { ResumeAnalysisReportSchema } from '../schemas/resumeAnalysisSchema';

export function cleanJsonText(rawText: string): string {
  let cleaned = rawText.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

export async function analyzeWithGemini(
  resumeData: ParsedResumeData,
  correlationId: string = 'local',
  jobDescription?: string
): Promise<ResumeAnalysisReport> {
  const startTime = performance.now();
  const config = getAIConfig();

  if (!config.geminiApiKey) {
    console.error(`[GeminiProvider] [${correlationId}] GEMINI_API_KEY is missing in server environment.`);
    throw new Error('GEMINI_API_KEY is missing in server environment variables.');
  }

  const maskedKey = maskApiKey(config.geminiApiKey);
  const model = config.geminiModel || 'gemini-3.6-flash';

  const promptStart = performance.now();
  const prompt = buildResumeAnalysisPrompt(resumeData, jobDescription);
  const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

  parts.push({ text: prompt });

  if (resumeData.pdfBase64 && resumeData.pdfBase64.length > 0) {
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: resumeData.pdfBase64,
      },
    });
  }
  const promptDurationMs = performance.now() - promptStart;

  const requestUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey}`;

  console.log(`[GeminiProvider] [${correlationId}] Sending request to Gemini model '${model}' (Key: ${maskedKey})...`);
  const apiStart = performance.now();

  const response = await fetch(requestUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.0,
      },
    }),
  });

  const apiDurationMs = performance.now() - apiStart;

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'No error body');
    const status = response.status;
    let detailMessage = errorText;

    try {
      const parsedErr = JSON.parse(errorText);
      if (parsedErr.error?.message) {
        detailMessage = parsedErr.error.message;
      }
    } catch {}

    console.error(`[GeminiProvider] Gemini request failed`);
    console.error(`  Correlation ID : ${correlationId}`);
    console.error(`  Status         : ${status}`);
    console.error(`  Message        : ${detailMessage}`);
    console.error(`  Duration       : ${apiDurationMs.toFixed(2)}ms`);

    let categorizedMsg = `Gemini API HTTP ${status}: ${detailMessage}`;
    if (status === 401 || detailMessage.includes('API_KEY_INVALID') || detailMessage.includes('API key not valid')) {
      categorizedMsg = `Gemini API Error 401 (Unauthorized): Invalid or expired GEMINI_API_KEY. ${detailMessage}`;
    } else if (status === 403 || detailMessage.includes('PERMISSION_DENIED')) {
      categorizedMsg = `Gemini API Error 403 (Forbidden): Permission denied. ${detailMessage}`;
    } else if (status === 429 || detailMessage.includes('RESOURCE_EXHAUSTED') || detailMessage.includes('Quota exceeded')) {
      categorizedMsg = `Gemini API Error 429 (Rate Limit / Quota Exceeded): ${detailMessage}`;
    } else if (status === 400 || detailMessage.includes('INVALID_ARGUMENT')) {
      categorizedMsg = `Gemini API Error 400 (Bad Request): ${detailMessage}`;
    } else if (status === 404 || detailMessage.includes('NOT_FOUND')) {
      categorizedMsg = `Gemini API Error 404 (Model Not Found): Model '${model}' not found. ${detailMessage}`;
    } else if (status >= 500) {
      categorizedMsg = `Gemini API Error ${status} (Server Error): ${detailMessage}`;
    }

    const err = new Error(categorizedMsg);
    Object.assign(err, { status });
    throw err;
  }

  const jsonParseStart = performance.now();
  const jsonResult = await response.json();
  const rawTextOutput = jsonResult?.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!rawTextOutput) {
    throw new Error('Gemini API returned an empty text content response.');
  }

  const cleanedJson = cleanJsonText(rawTextOutput);
  let parsedObject: unknown;

  try {
    parsedObject = JSON.parse(cleanedJson);
  } catch (jsonErr) {
    console.error(`[GeminiProvider] [${correlationId}] JSON parse error. Raw text snippet:`, rawTextOutput.slice(0, 300));
    throw new Error(`Gemini API response could not be parsed as JSON: ${jsonErr instanceof Error ? jsonErr.message : String(jsonErr)}`);
  }
  const jsonParseDurationMs = performance.now() - jsonParseStart;

  const zodStart = performance.now();
  const validatedReport = ResumeAnalysisReportSchema.parse(parsedObject);
  const zodDurationMs = performance.now() - zodStart;

  const totalDurationMs = performance.now() - startTime;

  console.log('\n====================================================');
  console.log('         GEMINI ENGINE PERFORMANCE DIAGNOSTICS       ');
  console.log('====================================================');
  console.log(` [PERF] Prompt construction     : ${promptDurationMs.toFixed(2)} ms`);
  console.log(` [PERF] Gemini request          : ${apiDurationMs.toFixed(2)} ms`);
  console.log(` [PERF] Gemini response parsing : ${jsonParseDurationMs.toFixed(2)} ms`);
  console.log(` [PERF] Zod validation          : ${zodDurationMs.toFixed(2)} ms`);
  console.log(` [PERF] Total AI Engine Time    : ${totalDurationMs.toFixed(2)} ms`);
  console.log('====================================================\n');

  return {
    ...validatedReport,
    providerUsed: `gemini (${model})`,
    diagnostics: {
      model,
      durationMs: totalDurationMs,
      correlationId,
      rawTextLength: rawTextOutput.length,
      promptDurationMs,
      apiDurationMs,
      jsonParseDurationMs,
      zodDurationMs,
    },
  };
}
