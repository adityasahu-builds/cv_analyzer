import { ParsedResumeData, ResumeAnalysisReport, SectionScore } from '../types/resume';

export const SCORING_VERSION = 'v2.0-deterministic';

/**
 * Standard ATS Weight System:
 * - Content Quality & Depth       : 30% (0.30)
 * - ATS Formatting & Structure    : 25% (0.25)
 * - Impact Bullet Measurability   : 25% (0.25)
 * - Skills & Keyword Taxonomy     : 20% (0.20)
 */
export const SECTION_WEIGHTS = {
  contentQuality: 0.30,
  formatting: 0.25,
  impactMeasurability: 0.25,
  skillsTaxonomy: 0.20,
};

/**
 * Bounds a score value to integer between 0 and 100.
 */
export function normalizeScoreValue(value: number | undefined | null): number {
  if (typeof value !== 'number' || isNaN(value)) return 75;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Maps a raw score (0-100) to a discrete, stable Rubric Tier score.
 * Rubric Tiers:
 * - 90: Excellent / Flawless
 * - 80: Good / Solid
 * - 68: Adequate / Moderate
 * - 50: Needs Improvement
 */
export function mapToRubricTier(score: number): number {
  if (score >= 85) return 90;
  if (score >= 70) return 80;
  if (score >= 55) return 68;
  return 50;
}

/**
 * Computes 100% deterministic section scores from parsed resume features & rubric tiers:
 * - Formatting: Section headers presence & text structure
 * - Content Quality: Total word count & depth of career experience
 * - Impact Measurability: Percentage of experience bullets containing quantified metrics
 * - Skills Taxonomy: Skill counts & keyword taxonomy matching
 */
export function computeRubricSectionScores(
  resumeData: ParsedResumeData,
  rawReportSections: ResumeAnalysisReport['sections'],
  jobDescription?: string
): {
  formattingScore: number;
  contentQualityScore: number;
  impactMeasurabilityScore: number;
  skillsTaxonomyScore: number;
} {
  const rawText = (resumeData.rawText || '').toLowerCase();

  // 1. FORMATTING SCORE (25% Weight)
  const headers = ['experience', 'work history', 'education', 'skills', 'summary', 'projects'];
  const headerCount = headers.filter((h) => rawText.includes(h)).length;

  let baseFormatting = 70;
  if (headerCount >= 4) baseFormatting = 90;
  else if (headerCount >= 3) baseFormatting = 80;
  else if (headerCount >= 2) baseFormatting = 70;
  else baseFormatting = 55;

  const aiFormattingTier = mapToRubricTier(normalizeScoreValue(rawReportSections?.formatting?.score));
  const formattingScore = Math.round(baseFormatting * 0.8 + aiFormattingTier * 0.2);

  // 2. CONTENT QUALITY SCORE (30% Weight)
  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  let baseContent = 70;
  if (wordCount >= 400) baseContent = 90;
  else if (wordCount >= 250) baseContent = 82;
  else if (wordCount >= 120) baseContent = 70;
  else baseContent = 55;

  const aiContentTier = mapToRubricTier(normalizeScoreValue(rawReportSections?.contentQuality?.score));
  const contentQualityScore = Math.round(baseContent * 0.8 + aiContentTier * 0.2);

  // 3. IMPACT MEASURABILITY SCORE (25% Weight)
  let totalBullets = 0;
  let quantifiedBullets = 0;

  (resumeData.experience || []).forEach((exp) => {
    (exp.bulletPoints || []).forEach((bp) => {
      totalBullets++;
      if (/(\d+%|\$\d+|\b\d+\s*k\b|\b\d+\s*m\b|\b\d+\+|\b\d+\s*years?\b|\b\d+\s*users?\b|\b\d+\s*teams?\b|\b\d+\s*projects?\b)/i.test(bp)) {
        quantifiedBullets++;
      }
    });
  });

  const metricRatio = totalBullets > 0 ? quantifiedBullets / totalBullets : 0;
  let baseImpact = 55;
  if (metricRatio >= 0.5) baseImpact = 95;
  else if (metricRatio >= 0.3) baseImpact = 85;
  else if (metricRatio >= 0.15) baseImpact = 75;
  else if (metricRatio > 0) baseImpact = 65;

  const aiImpactTier = mapToRubricTier(normalizeScoreValue(rawReportSections?.impactMeasurability?.score));
  const impactMeasurabilityScore = Math.round(baseImpact * 0.8 + aiImpactTier * 0.2);

  // 4. SKILLS TAXONOMY SCORE (20% Weight)
  let totalSkills = 0;
  (resumeData.skills || []).forEach((sc) => {
    totalSkills += (sc.items || []).length;
  });

  let baseSkills = 65;
  if (totalSkills >= 12) baseSkills = 95;
  else if (totalSkills >= 8) baseSkills = 85;
  else if (totalSkills >= 4) baseSkills = 75;
  else if (totalSkills > 0) baseSkills = 65;

  if (jobDescription && jobDescription.trim()) {
    const jdText = jobDescription.toLowerCase();
    const resumeSkills: string[] = [];
    (resumeData.skills || []).forEach((sc) => {
      (sc.items || []).forEach((item) => resumeSkills.push(item.toLowerCase()));
    });
    const matchedCount = resumeSkills.filter((sk) => jdText.includes(sk)).length;
    const matchPct = Math.min(100, Math.max(50, Math.round((matchedCount / Math.max(1, resumeSkills.length)) * 100)));
    baseSkills = Math.round(baseSkills * 0.6 + matchPct * 0.4);
  }

  const aiSkillsTier = mapToRubricTier(normalizeScoreValue(rawReportSections?.skillsTaxonomy?.score));
  const skillsTaxonomyScore = Math.round(baseSkills * 0.8 + aiSkillsTier * 0.2);

  return {
    formattingScore: Math.min(100, Math.max(0, mapToRubricTier(formattingScore))),
    contentQualityScore: Math.min(100, Math.max(0, mapToRubricTier(contentQualityScore))),
    impactMeasurabilityScore: Math.min(100, Math.max(0, mapToRubricTier(impactMeasurabilityScore))),
    skillsTaxonomyScore: Math.min(100, Math.max(0, mapToRubricTier(skillsTaxonomyScore))),
  };
}

/**
 * Deterministically calculates overall ATS score from section scores and weights.
 */
export function calculateDeterministicOverallScore(scores: {
  formattingScore: number;
  contentQualityScore: number;
  impactMeasurabilityScore: number;
  skillsTaxonomyScore: number;
}): number {
  const weightedScore =
    scores.contentQualityScore * SECTION_WEIGHTS.contentQuality +
    scores.formattingScore * SECTION_WEIGHTS.formatting +
    scores.impactMeasurabilityScore * SECTION_WEIGHTS.impactMeasurability +
    scores.skillsTaxonomyScore * SECTION_WEIGHTS.skillsTaxonomy;

  return Math.min(100, Math.max(0, Math.round(weightedScore)));
}

const BANNED_MISSING_KEYWORDS = new Set([
  'work experience', 'experience', 'employment', 'employment history', 'work history', 'professional experience',
  'technical skills', 'skills', 'core competencies', 'qualifications', 'proficiencies',
  'education', 'academic background', 'academic history', 'academic details',
  'projects', 'personal projects', 'key projects', 'academic projects',
  'summary', 'professional summary', 'profile', 'about me', 'objective', 'career objective',
  'certifications', 'certificates', 'achievements', 'awards', 'languages',
  'contact details', 'contact info', 'personal details', 'personal information',
  'resume', 'cv', 'curriculum vitae', 'references', 'declaration', 'internship', 'internships'
]);

export function processKeywords(
  rawMissingKeywords: string[] | undefined,
  rawDetectedKeywords: string[] | undefined,
  resumeData: ParsedResumeData
): { detectedKeywords: string[]; missingKeywords: string[] } {
  const detectedSet = new Set<string>();

  // 1. Gather detected keywords from parsed skills
  if (resumeData.skills && Array.isArray(resumeData.skills)) {
    for (const skillCat of resumeData.skills) {
      if (skillCat.items && Array.isArray(skillCat.items)) {
        for (const item of skillCat.items) {
          const trimmed = item.trim();
          if (trimmed.length >= 2 && !BANNED_MISSING_KEYWORDS.has(trimmed.toLowerCase())) {
            detectedSet.add(trimmed);
          }
        }
      }
    }
  }

  // 2. Add detected keywords from AI
  if (rawDetectedKeywords && Array.isArray(rawDetectedKeywords)) {
    for (const kw of rawDetectedKeywords) {
      const trimmed = kw.trim();
      if (trimmed.length >= 2 && !BANNED_MISSING_KEYWORDS.has(trimmed.toLowerCase())) {
        detectedSet.add(trimmed);
      }
    }
  }

  const detectedKeywords = Array.from(detectedSet);
  const detectedLower = new Set(detectedKeywords.map((k) => k.toLowerCase()));

  // 3. Sanitize missing keywords (remove section names & already detected keywords)
  const cleanMissing: string[] = [];
  const seenMissing = new Set<string>();

  if (rawMissingKeywords && Array.isArray(rawMissingKeywords)) {
    for (const kw of rawMissingKeywords) {
      const trimmed = kw.trim();
      const lower = trimmed.toLowerCase();

      if (trimmed.length < 2 || BANNED_MISSING_KEYWORDS.has(lower)) {
        continue;
      }
      if (detectedLower.has(lower)) {
        continue;
      }
      if (seenMissing.has(lower)) {
        continue;
      }

      seenMissing.add(lower);
      cleanMissing.push(trimmed);
    }
  }

  return {
    detectedKeywords,
    missingKeywords: cleanMissing,
  };
}

/**
 * Applies the deterministic scoring layer to an AI report.
 */
export function applyDeterministicScoring(
  report: ResumeAnalysisReport,
  resumeData: ParsedResumeData,
  jobDescription?: string
): ResumeAnalysisReport {
  // Compute deterministic rubric section scores
  const rubricScores = computeRubricSectionScores(resumeData, report.sections, jobDescription);

  const sections = {
    formatting: {
      ...report.sections.formatting,
      name: 'ATS Formatting & Structure',
      score: rubricScores.formattingScore,
      weight: SECTION_WEIGHTS.formatting,
      feedback: report.sections.formatting?.feedback || 'Evaluated layout, section headers, and ATS parser safety.',
    },
    contentQuality: {
      ...report.sections.contentQuality,
      name: 'Content Quality & Depth',
      score: rubricScores.contentQualityScore,
      weight: SECTION_WEIGHTS.contentQuality,
      feedback: report.sections.contentQuality?.feedback || 'Evaluated role depth, responsibilities, and career progression.',
    },
    impactMeasurability: {
      ...report.sections.impactMeasurability,
      name: 'Impact Bullet Measurability',
      score: rubricScores.impactMeasurabilityScore,
      weight: SECTION_WEIGHTS.impactMeasurability,
      feedback: report.sections.impactMeasurability?.feedback || 'Evaluated metric density and action verb impact in experience bullets.',
    },
    skillsTaxonomy: {
      ...report.sections.skillsTaxonomy,
      name: 'Skills & Keyword Taxonomies',
      score: rubricScores.skillsTaxonomyScore,
      weight: SECTION_WEIGHTS.skillsTaxonomy,
      feedback: report.sections.skillsTaxonomy?.feedback || 'Evaluated technical stack coverage and keyword taxonomy match.',
    },
  };

  // Calculate final weighted overall ATS score
  const overallScore = calculateDeterministicOverallScore(rubricScores);

  // Normalize confidence score (ensure value is an integer percentage between 80 and 99)
  let confidenceScore = report.confidenceScore;
  if (confidenceScore <= 1.0) {
    confidenceScore = Math.round(confidenceScore * 100);
  } else {
    confidenceScore = Math.min(99, Math.max(80, Math.round(confidenceScore)));
  }

  // Process keywords (clean missing keywords and attach actual detected keywords)
  const { detectedKeywords, missingKeywords } = processKeywords(
    report.missingKeywords,
    report.detectedKeywords,
    resumeData
  );

  return {
    ...report,
    overallScore,
    sections,
    confidenceScore,
    detectedKeywords,
    missingKeywords,
  };
}
