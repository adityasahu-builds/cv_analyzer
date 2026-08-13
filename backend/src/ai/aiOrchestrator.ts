import { ParsedResumeData, ResumeAnalysisReport, JobMatchResult } from '../types/resume';
import { getAIConfig } from './config';
import { analyzeWithGemini, matchWithGemini } from './providers/geminiProvider';
import { analyzeWithGroq, GroqVisualPdfUnsupportedError, matchWithGroq } from './providers/groqProvider';
import { normalizeParsedResumeData, computeResumeHash, computeJobDescriptionHash } from '../services/normalizer';
import { applyDeterministicScoring, SCORING_VERSION } from '../services/deterministicScorer';
import { analysisCache } from '../services/analysisCache';
import { JobMatchResponse } from './schemas/jobMatchSchema';

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

  private matchCache = new Map<string, JobMatchResult>();

  async matchJobDescription(
    resumeData: ParsedResumeData,
    jobDescription: string,
    correlationId: string = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  ): Promise<JobMatchResult> {
    // 1. Validation
    const validation = validateJobDescription(jobDescription);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const isShortTitle = validation.isShortTitle;
    const normalizedResume = normalizeParsedResumeData(resumeData);
    const resumeHash = computeResumeHash(normalizedResume);
    const jobDescriptionHash = computeJobDescriptionHash(jobDescription);

    const config = getAIConfig();
    const primaryName = config.primaryProvider.toLowerCase();
    
    // 2. Cache Check
    const cacheKey = `${resumeHash}_${jobDescriptionHash}_${SCORING_VERSION}_${primaryName}_short_${isShortTitle}`;
    const cachedResult = this.matchCache.get(cacheKey);
    if (cachedResult) {
      console.log(`[AIOrchestrator] [${correlationId}] Returned CACHED job match result for resumeHash=${resumeHash.slice(0, 8)}`);
      return cachedResult;
    }

    console.log(`[AIOrchestrator] [${correlationId}] Running live job match analysis (isShortTitle=${isShortTitle}).`);
    
    // 3. AI Execution with Fallback
    let aiResponse: JobMatchResponse;
    let primaryErrorMsg = '';
    const fallbackName = config.fallbackProvider.toLowerCase();

    try {
      if (primaryName === 'gemini') {
        aiResponse = await matchWithGemini(normalizedResume, jobDescription, correlationId, isShortTitle);
      } else if (primaryName === 'groq') {
        aiResponse = await matchWithGroq(normalizedResume, jobDescription, correlationId, isShortTitle);
      } else {
        throw new Error(`Unsupported primary provider: '${config.primaryProvider}'`);
      }
    } catch (primaryErr) {
      primaryErrorMsg = primaryErr instanceof Error ? primaryErr.message : String(primaryErr);
      console.warn(`[AIOrchestrator] Primary match provider failed: ${primaryErrorMsg}`);

      if (fallbackName && fallbackName !== primaryName) {
        try {
          console.log(`[AIOrchestrator] Attempting Fallback match provider: ${config.fallbackProvider}`);
          if (fallbackName === 'groq') {
            aiResponse = await matchWithGroq(normalizedResume, jobDescription, correlationId, isShortTitle);
          } else if (fallbackName === 'gemini') {
            aiResponse = await matchWithGemini(normalizedResume, jobDescription, correlationId, isShortTitle);
          } else {
            throw new Error(`Unsupported fallback provider: '${config.fallbackProvider}'`);
          }
        } catch (fallbackErr) {
          console.error(`[AIOrchestrator] Fallback match provider failed: ${fallbackErr}`);
          throw new Error(`AI Job Match failed. Primary: ${primaryErrorMsg} | Fallback: ${fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr)}`);
        }
      } else {
        throw new Error(`AI Job Match failed: ${primaryErrorMsg}`);
      }
    }

    // 4. Deterministic Scoring & Verification
    const resumeKeywords = extractAllResumeKeywords(normalizedResume);
    const resumeRawText = normalizedResume.rawText || '';

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    // Verify each AI-extracted skill against the resume
    (aiResponse.extractedSkills || []).forEach(skill => {
      const cleanSkill = skill.trim();
      if (!cleanSkill) return;
      
      if (isSkillInResume(cleanSkill, resumeKeywords, resumeRawText)) {
        matchedSkills.push(cleanSkill);
      } else {
        missingSkills.push(cleanSkill);
      }
    });

    // Score Calculation
    let finalScore = 70;
    if (isShortTitle) {
      const roleAlign = aiResponse.roleAlignmentScore || 70;
      const expAlign = aiResponse.experienceAlignmentScore || 70;
      finalScore = Math.min(100, Math.max(0, Math.round(roleAlign * 0.6 + expAlign * 0.4)));
    } else {
      const totalSkills = matchedSkills.length + missingSkills.length;
      const skillScore = totalSkills > 0 ? (matchedSkills.length / totalSkills) * 100 : 70;
      finalScore = Math.min(100, Math.max(0, Math.round(
        skillScore * 0.5 + 
        (aiResponse.experienceAlignmentScore || 70) * 0.3 + 
        (aiResponse.roleAlignmentScore || 70) * 0.2
      )));
    }

    const result: JobMatchResult = {
      matchScore: finalScore,
      roleTitle: aiResponse.roleTitle || (isShortTitle ? jobDescription.trim() : null),
      matchedSkills,
      missingSkills,
      experienceAlignment: aiResponse.experienceAlignment,
      summary: aiResponse.summary || (isShortTitle ? 'Limited analysis — only the job title was provided. Add the full job description for a more accurate skills and experience match.' : ''),
      isLimitedAnalysis: isShortTitle
    };

    // Store in cache
    this.matchCache.set(cacheKey, result);
    return result;
  }
}

export function validateJobDescription(jd: string): { isValid: boolean; isShortTitle: boolean; error?: string } {
  const trimmed = (jd || '').trim();

  if (trimmed.length < 2) {
    return {
      isValid: false,
      isShortTitle: false,
      error: 'Please enter a valid job description or role title to analyze.'
    };
  }

  const alphabeticChars = trimmed.replace(/[^a-zA-Z]/g, '');
  if (alphabeticChars.length < 2) {
    return {
      isValid: false,
      isShortTitle: false,
      error: 'Please enter a valid job description with enough role information to analyze.'
    };
  }

  // Check for gibberish patterns: 6+ consecutive consonants in a row
  const longConsonantsRegex = /[bcdfghjklmnpqrstvwxz]{6,}/i;
  if (longConsonantsRegex.test(trimmed)) {
    return {
      isValid: false,
      isShortTitle: false,
      error: 'Please enter a valid job description with enough role information to analyze.'
    };
  }

  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  const vowelsCount = (trimmed.match(/[aeiouyAEIOUY]/g) || []).length;
  const vowelRatio = vowelsCount / alphabeticChars.length;
  const isAcronym = words.length === 1 && words[0].length <= 5 && /^[a-zA-Z]+$/.test(words[0]);

  if (vowelRatio < 0.15 && !isAcronym) {
    return {
      isValid: false,
      isShortTitle: false,
      error: 'Please enter a valid job description with enough role information to analyze.'
    };
  }

  const lowerText = trimmed.toLowerCase();
  if (lowerText.includes('asdfgh') || lowerText.includes('zxcvbn') || lowerText.includes('qwertyui')) {
    return {
      isValid: false,
      isShortTitle: false,
      error: 'Please enter a valid job description with enough role information to analyze.'
    };
  }

  const isShortTitle = words.length <= 4 || trimmed.length < 50;
  return { isValid: true, isShortTitle };
}

function extractAllResumeKeywords(resumeData: ParsedResumeData): Set<string> {
  const keywords = new Set<string>();
  
  if (resumeData.personal?.fullName) {
    keywords.add(resumeData.personal.fullName.toLowerCase().trim());
  }

  (resumeData.skills || []).forEach(sc => {
    (sc.items || []).forEach(item => {
      keywords.add(item.toLowerCase().trim());
    });
  });

  (resumeData.experience || []).forEach(exp => {
    if (exp.position) keywords.add(exp.position.toLowerCase().trim());
    (exp.bulletPoints || []).forEach(bp => {
      const words = bp.toLowerCase().split(/[^a-zA-Z0-9+#.-]/).filter(Boolean);
      words.forEach(w => keywords.add(w));
    });
  });

  (resumeData.projects || []).forEach(proj => {
    if (proj.title) keywords.add(proj.title.toLowerCase().trim());
    (proj.technologies || []).forEach(tech => {
      keywords.add(tech.toLowerCase().trim());
    });
    if (proj.description) {
      proj.description.toLowerCase().split(/[^a-zA-Z0-9+#.-]/).filter(Boolean).forEach(w => keywords.add(w));
    }
  });

  if (resumeData.summary) {
    resumeData.summary.toLowerCase().split(/[^a-zA-Z0-9+#.-]/).filter(Boolean).forEach(w => keywords.add(w));
  }

  return keywords;
}

function isSkillInResume(skill: string, resumeKeywords: Set<string>, resumeRawText: string): boolean {
  const normSkill = skill.toLowerCase().trim();
  if (resumeKeywords.has(normSkill)) return true;
  
  const rawText = resumeRawText.toLowerCase();
  if (rawText.includes(normSkill)) return true;

  const escapedSkill = normSkill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
  return regex.test(rawText);
}

export const aiOrchestrator = new AIOrchestrator();


