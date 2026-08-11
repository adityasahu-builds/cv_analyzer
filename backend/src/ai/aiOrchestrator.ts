import { ParsedResumeData, ResumeAnalysisReport } from '../types/resume';
import { getAIConfig } from './config';
import { analyzeWithGemini } from './providers/geminiProvider';
import { analyzeWithGroq, GroqVisualPdfUnsupportedError } from './providers/groqProvider';

export class AIOrchestrationError extends Error {
  primaryProvider: string;
  primaryError: string;
  fallbackProvider?: string;
  fallbackError?: string;

  constructor(
    message: string,
    primaryProvider: string,
    primaryError: string,
    fallbackProvider?: string,
    fallbackError?: string
  ) {
    super(message);
    this.name = 'AIOrchestrationError';
    this.primaryProvider = primaryProvider;
    this.primaryError = primaryError;
    this.fallbackProvider = fallbackProvider;
    this.fallbackError = fallbackError;
  }
}

export interface OrchestrationResult {
  report: ResumeAnalysisReport;
  provider: string;
  fallbackUsed: boolean;
  durationMs: number;
}

export class AIOrchestrator {
  async analyzeResume(
    resumeData: ParsedResumeData,
    correlationId: string = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const config = getAIConfig();

    console.log(`[AIOrchestrator] [${correlationId}] Starting analysis. Primary=${config.primaryProvider}, Fallback=${config.fallbackProvider}`);

    let primaryErrorMsg = '';
    const primaryName = config.primaryProvider.toLowerCase();
    const fallbackName = config.fallbackProvider.toLowerCase();

    // 1. Execute Primary Provider
    try {
      console.log(`[AIOrchestrator] Attempting Primary Provider: ${config.primaryProvider}`);
      let report: ResumeAnalysisReport;

      if (primaryName === 'gemini') {
        report = await analyzeWithGemini(resumeData, correlationId);
      } else if (primaryName === 'groq') {
        report = await analyzeWithGroq(resumeData, correlationId);
      } else {
        throw new Error(`Unsupported primary provider: '${config.primaryProvider}'`);
      }

      const durationMs = Date.now() - startTime;
      console.log(`[AIOrchestrator] Primary Provider (${config.primaryProvider}) succeeded in ${durationMs}ms with overallScore=${report.overallScore}`);
      return {
        report,
        provider: report.providerUsed || config.primaryProvider,
        fallbackUsed: false,
        durationMs,
      };
    } catch (primaryErr) {
      primaryErrorMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      console.warn(`[AIOrchestrator] Primary Provider (${config.primaryProvider}) failed: ${primaryErrorMsg}`);
    }

    // 2. Execute Fallback Provider (if specified and different)
    if (fallbackName && fallbackName !== primaryName) {
      try {
        console.log(`[AIOrchestrator] Attempting Fallback Provider: ${config.fallbackProvider}`);
        let fallbackReport: ResumeAnalysisReport;

        if (fallbackName === 'groq') {
          fallbackReport = await analyzeWithGroq(resumeData, correlationId);
        } else if (fallbackName === 'gemini') {
          fallbackReport = await analyzeWithGemini(resumeData, correlationId);
        } else {
          throw new Error(`Unsupported fallback provider: '${config.fallbackProvider}'`);
        }

        const durationMs = Date.now() - startTime;
        console.log(`[AIOrchestrator] Fallback Provider (${config.fallbackProvider}) succeeded in ${durationMs}ms with overallScore=${fallbackReport.overallScore}`);
        return {
          report: fallbackReport,
          provider: fallbackReport.providerUsed || config.fallbackProvider,
          fallbackUsed: true,
          durationMs,
        };
      } catch (fallbackErr) {
        const fallbackErrorMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);
        console.error(`[AIOrchestrator] Fallback Provider (${config.fallbackProvider}) also failed: ${fallbackErrorMsg}`);

        if (fallbackErr instanceof GroqVisualPdfUnsupportedError) {
          throw new AIOrchestrationError(
            `Primary AI (${config.primaryProvider}) failed: ${primaryErrorMsg}. Fallback AI (${config.fallbackProvider}) cannot analyze visual/scanned PDFs without extracted text.`,
            config.primaryProvider,
            primaryErrorMsg,
            config.fallbackProvider,
            fallbackErrorMsg
          );
        }

        throw new AIOrchestrationError(
          `AI Analysis failed. Primary (${config.primaryProvider}): ${primaryErrorMsg} | Fallback (${config.fallbackProvider}): ${fallbackErrorMsg}`,
          config.primaryProvider,
          primaryErrorMsg,
          config.fallbackProvider,
          fallbackErrorMsg
        );
      }
    }

    // If no fallback available
    throw new AIOrchestrationError(
      `Primary AI provider (${config.primaryProvider}) failed: ${primaryErrorMsg}`,
      config.primaryProvider,
      primaryErrorMsg
    );
  }
}

export const aiOrchestrator = new AIOrchestrator();
