export interface SectionScore {
  name: string;
  score: number;
  weight?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
}

export interface ResumeAnalysisReport {
  overallScore: number;
  summary: string;
  sections: {
    formatting: SectionScore;
    contentQuality: SectionScore;
    impactMeasurability: SectionScore;
    skillsTaxonomy: SectionScore;
    [key: string]: SectionScore;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  missingKeywords: string[];
  detectedKeywords?: string[];
  improvedBullets?: { original: string; improved: string; reason: string }[];
  rewrittenSummary?: string;
  confidenceScore: number;
  diagnostics?: Record<string, unknown>;
}



