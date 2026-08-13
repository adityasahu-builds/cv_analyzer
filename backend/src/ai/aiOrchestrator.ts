import { ParsedResumeData, ResumeAnalysisReport } from '../types/resume';
import { getAIConfig } from './config';
import { analyzeWithGemini } from './providers/geminiProvider';
import { analyzeWithGroq, GroqVisualPdfUnsupportedError } from './providers/groqProvider';
import { normalizeParsedResumeData, computeResumeHash, computeJobDescriptionHash } from '../services/normalizer';
import { applyDeterministicScoring, SCORING_VERSION } from '../services/deterministicScorer';
import { analysisCache } from '../services/analysisCache';


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
  cached?: boolean;
}

export class AIOrchestrator {
  async analyzeResume(
    resumeData: ParsedResumeData,
    correlationId: string = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    jobDescription?: string,
    forceRefresh: boolean = false
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const config = getAIConfig();

    // 1. Normalize Resume Data & Hashes
    const normalizedResume = normalizeParsedResumeData(resumeData);
    const resumeHash = computeResumeHash(normalizedResume);
    const jobDescriptionHash = computeJobDescriptionHash(jobDescription);

    const primaryName = config.primaryProvider.toLowerCase();
    const primaryModel = primaryName === 'gemini' ? config.geminiModel : config.groqModel;

    // 2. Compute Cache Identity Key
    const cacheKey = analysisCache.generateCacheKey(
      resumeHash,
      jobDescriptionHash,
      config.primaryProvider,
      primaryModel
    );

    // 3. Check Cache (if not forceRefresh)
    if (!forceRefresh) {
      const cached = analysisCache.get(cacheKey);
      if (cached) {
        const durationMs = Date.now() - startTime;
        console.log(`[AIOrchestrator] [${correlationId}] Returned CACHED analysis for resumeHash=${resumeHash.slice(0, 8)} in ${durationMs}ms with overallScore=${cached.report.overallScore}`);
        return {
          report: {
            ...cached.report,
            diagnostics: {
              ...cached.report.diagnostics,
              cached: true,
              correlationId,
            },
          },
          provider: cached.provider,
          fallbackUsed: false,
          durationMs,
          cached: true,
        };
      }
    }

    console.log(`[AIOrchestrator] [${correlationId}] Starting live analysis. Primary=${config.primaryProvider}, Fallback=${config.fallbackProvider}, ResumeHash=${resumeHash.slice(0, 8)}`);

    let primaryErrorMsg = '';
    const fallbackName = config.fallbackProvider.toLowerCase();

    // 4. Execute Primary Provider
    try {
      console.log(`[AIOrchestrator] Attempting Primary Provider: ${config.primaryProvider}`);
      let rawReport: ResumeAnalysisReport;

      if (primaryName === 'gemini') {
        rawReport = await analyzeWithGemini(normalizedResume, correlationId, jobDescription);
      } else if (primaryName === 'groq') {
        rawReport = await analyzeWithGroq(normalizedResume, correlationId, jobDescription);
      } else {
        throw new Error(`Unsupported primary provider: '${config.primaryProvider}'`);
      }

      // Apply deterministic scoring layer
      const report = applyDeterministicScoring(rawReport, normalizedResume, jobDescription);
      const durationMs = Date.now() - startTime;

      // Inject DEV Debug Diagnostics
      const isDev = process.env.NODE_ENV !== 'production';
      if (isDev) {
        report.diagnostics = {
          analysisId: correlationId,
          resumeHash,
          jobDescriptionHash,
          analysisVersion: SCORING_VERSION,
          provider: report.providerUsed || config.primaryProvider,
          model: primaryModel,
          temperature: 0,
          scoringVersion: SCORING_VERSION,
          cached: false,
        };
      }

      // Save to cache
      analysisCache.set(cacheKey, resumeHash, jobDescriptionHash, config.primaryProvider, primaryModel, report);

      console.log(`[AIOrchestrator] Primary Provider (${config.primaryProvider}) succeeded in ${durationMs}ms with overallScore=${report.overallScore}`);
      return {
        report,
        provider: report.providerUsed || config.primaryProvider,
        fallbackUsed: false,
        durationMs,
        cached: false,
      };
    } catch (primaryErr) {
      primaryErrorMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      console.warn(`[AIOrchestrator] Primary Provider (${config.primaryProvider}) failed: ${primaryErrorMsg}`);
    }

    // 5. Execute Fallback Provider (if specified and different)
    if (fallbackName && fallbackName !== primaryName) {
      try {
        console.log(`[AIOrchestrator] Attempting Fallback Provider: ${config.fallbackProvider}`);
        let rawFallbackReport: ResumeAnalysisReport;

        if (fallbackName === 'groq') {
          rawFallbackReport = await analyzeWithGroq(normalizedResume, correlationId, jobDescription);
        } else if (fallbackName === 'gemini') {
          rawFallbackReport = await analyzeWithGemini(normalizedResume, correlationId, jobDescription);
        } else {
          throw new Error(`Unsupported fallback provider: '${config.fallbackProvider}'`);
        }

        // Apply deterministic scoring layer
        const fallbackReport = applyDeterministicScoring(rawFallbackReport, normalizedResume, jobDescription);
        const durationMs = Date.now() - startTime;

        const isDev = process.env.NODE_ENV !== 'production';
        if (isDev) {
          fallbackReport.diagnostics = {
            analysisId: correlationId,
            resumeHash,
            jobDescriptionHash,
            analysisVersion: SCORING_VERSION,
            provider: fallbackReport.providerUsed || config.fallbackProvider,
            model: config.groqModel,
            temperature: 0,
            scoringVersion: SCORING_VERSION,
            cached: false,
          };
        }

        // Save to cache under fallback key
        const fallbackCacheKey = analysisCache.generateCacheKey(
          resumeHash,
          jobDescriptionHash,
          config.fallbackProvider,
          config.groqModel
        );
        analysisCache.set(fallbackCacheKey, resumeHash, jobDescriptionHash, config.fallbackProvider, config.groqModel, fallbackReport);

        console.log(`[AIOrchestrator] Fallback Provider (${config.fallbackProvider}) succeeded in ${durationMs}ms with overallScore=${fallbackReport.overallScore}`);
        return {
          report: fallbackReport,
          provider: fallbackReport.providerUsed || config.fallbackProvider,
          fallbackUsed: true,
          durationMs,
          cached: false,
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



