import Groq from 'groq-sdk';
import { ParsedResumeData, ResumeAnalysisReport } from '../../types/resume';
import { getAIConfig, maskApiKey } from '../config';
import { buildCompactGroqPrompt } from '../prompts';
import { ResumeAnalysisReportSchema } from '../schemas/resumeAnalysisSchema';
import { cleanJsonText } from './geminiProvider';
import { hasUsableResumeText } from '../../parser/extractors/pdfExtractor';

export class GroqVisualPdfUnsupportedError extends Error {
  constructor(message: string = 'Fallback provider cannot analyze visual/scanned PDFs with no extracted text.') {
    super(message);
    this.name = 'GroqVisualPdfUnsupportedError';
  }
}

export interface GroqErrorDetails {
  status?: number;
  code?: string;
  message: string;
}

export function extractGroqErrorDetails(err: unknown): GroqErrorDetails {
  if (err && typeof err === 'object') {
    const groqObj = err as Record<string, unknown>;
    const status = typeof groqObj.status === 'number' ? groqObj.status : typeof groqObj.statusCode === 'number' ? groqObj.statusCode : undefined;
    const code = typeof groqObj.code === 'string' ? groqObj.code : (groqObj.error as Record<string, unknown>)?.code ? String((groqObj.error as Record<string, unknown>).code) : undefined;
    const message = typeof groqObj.message === 'string' ? groqObj.message : String(err);

    return { status, code, message };
  }
  return { message: String(err) };
}

export async function analyzeWithGroq(
  resumeData: ParsedResumeData,
  correlationId: string = 'local',
  jobDescription?: string
): Promise<ResumeAnalysisReport> {
  const startTime = Date.now();
  const config = getAIConfig();

  if (!config.groqApiKey) {
    console.error(`[GroqProvider] [${correlationId}] GROQ_API_KEY is missing in server environment.`);
    throw new Error('GROQ_API_KEY is missing in server environment variables.');
  }

  const rawText = (resumeData.rawText || '').trim();
  const isUsableText = hasUsableResumeText(rawText);

  // Visual/Scanned PDF Constraint: Groq cannot process native PDF base64 images/binary.
  // Only reject if the PDF genuinely lacks usable text AND has pdfBase64 (visual/scanned PDF).
  if (!isUsableText && resumeData.pdfBase64) {
    console.warn(`[GroqProvider] [${correlationId}] Visual/scanned PDF detected with no usable extracted text (${rawText.length} chars). Groq fallback unsupported for visual PDFs.`);
    throw new GroqVisualPdfUnsupportedError('Primary AI provider failed and fallback provider (Groq) cannot analyze visual/scanned PDFs without extracted text.');
  }

  // Build COMPACT Groq Prompt (Never includes pdfBase64)
  const prompt = buildCompactGroqPrompt(resumeData, jobDescription);

  const textLength = rawText.length;
  const promptLength = prompt.length;
  const estimatedInputTokens = Math.ceil(promptLength / 4);
  const maxTokens = 3072;
  const hasPdfBase64 = false; // Strictly false for Groq

  const maskedKey = maskApiKey(config.groqApiKey);
  const model = config.groqModel || 'llama-3.3-70b-versatile';

  console.log(`[GroqProvider] [${correlationId}] Payload Size Diagnostics:`);
  console.log(`  - textLength           : ${textLength} chars`);
  console.log(`  - estimatedInputTokens : ~${estimatedInputTokens} tokens`);
  console.log(`  - promptLength         : ${promptLength} chars`);
  console.log(`  - max_tokens           : ${maxTokens}`);
  console.log(`  - hasPdfBase64         : ${hasPdfBase64}`);
  console.log(`[GroqProvider] [${correlationId}] Sending request to Groq model '${model}' (Key: ${maskedKey})...`);

  const groq = new Groq({ apiKey: config.groqApiKey });

  const messages: Groq.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: 'You are an executive ATS Auditor. Return ONLY valid JSON matching the schema.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  let completion;
  try {
    try {
      completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: 0.0,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
      });
    } catch (firstErr) {
      const errMsg = firstErr instanceof Error ? firstErr.message : String(firstErr);
      if (errMsg.includes('response_format') || errMsg.includes('json_object')) {
        console.warn(`[GroqProvider] [${correlationId}] Model '${model}' does not support response_format json_object. Retrying without response_format...`);
        completion = await groq.chat.completions.create({
          messages,
          model,
          temperature: 0.0,
          max_tokens: maxTokens,
        });
      } else {
        throw firstErr;
      }
    }
  } catch (groqErr) {
    const durationMs = Date.now() - startTime;
    const errorDetails = extractGroqErrorDetails(groqErr);

    console.error(`[GroqProvider] Groq request failed`);
    console.error(`  Correlation ID : ${correlationId}`);
    console.error(`  Status         : ${errorDetails.status ?? 'N/A'}`);
    console.error(`  Code           : ${errorDetails.code ?? 'N/A'}`);
    console.error(`  Message        : ${errorDetails.message}`);
    console.error(`  Duration       : ${durationMs}ms`);

    let categorizedMessage = errorDetails.message;
    if (errorDetails.status === 401) {
      categorizedMessage = `Groq API Error 401 (Unauthorized): Invalid or expired GROQ_API_KEY. ${errorDetails.message}`;
    } else if (errorDetails.status === 400) {
      categorizedMessage = `Groq API Error 400 (Bad Request): ${errorDetails.message}`;
    } else if (errorDetails.status === 404) {
      categorizedMessage = `Groq API Error 404 (Model Not Found): Model '${model}' not found. ${errorDetails.message}`;
    } else if (errorDetails.status === 429) {
      categorizedMessage = `Groq API Error 429 (Rate Limit / Quota Exceeded): ${errorDetails.message}`;
    } else if (errorDetails.status && errorDetails.status >= 500) {
      categorizedMessage = `Groq API Error ${errorDetails.status} (Internal Server Error): ${errorDetails.message}`;
    }

    const finalErr = new Error(categorizedMessage);
    if (errorDetails.status) {
      Object.assign(finalErr, { status: errorDetails.status });
    }
    throw finalErr;
  }

  const durationMs = Date.now() - startTime;
  const rawTextOutput = completion.choices[0]?.message?.content || '';

  console.log(`[GroqProvider] [${correlationId}] Groq request succeeded in ${durationMs}ms. Output length: ${rawTextOutput.length} chars.`);

  if (!rawTextOutput || rawTextOutput.trim().length === 0) {
    throw new Error('Groq API returned an empty completion response.');
  }

  const cleanedJson = cleanJsonText(rawTextOutput);
  let parsedObject: unknown;

  try {
    parsedObject = JSON.parse(cleanedJson);
  } catch (jsonErr) {
    console.error(`[GroqProvider] [${correlationId}] JSON parse error. Raw text snippet:`, rawTextOutput.slice(0, 300));
    throw new Error(`Groq API response could not be parsed as JSON: ${jsonErr instanceof Error ? jsonErr.message : String(jsonErr)}`);
  }

  const validatedReport = ResumeAnalysisReportSchema.parse(parsedObject);

  return {
    ...validatedReport,
    providerUsed: `groq (${model})`,
    diagnostics: {
      model,
      durationMs,
      correlationId,
      rawTextLength: rawTextOutput.length,
      estimatedInputTokens,
      hasPdfBase64: false,
    },
  };
}
