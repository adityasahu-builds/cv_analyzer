import { z } from 'zod';

const SectionScoreSchema = z.object({
  name: z.string(),
  score: z.number().min(0).max(100),
  weight: z.number().optional().default(0.25),
  feedback: z.string().default(''),
  strengths: z.array(z.string()).default([]),
  improvements: z.array(z.string()).default([]),
});

export const ResumeAnalysisReportSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string().default(''),
  sections: z.object({
    formatting: SectionScoreSchema,
    contentQuality: SectionScoreSchema,
    impactMeasurability: SectionScoreSchema,
    skillsTaxonomy: SectionScoreSchema,
  }),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
  improvedBullets: z.array(
    z.object({
      original: z.string(),
      improved: z.string(),
      reason: z.string(),
    })
  ).optional().default([]),
  rewrittenSummary: z.string().optional().default(''),
  confidenceScore: z.number().min(0).max(1).default(0.9),
});

export type ResumeAnalysisReportSchemaType = z.infer<typeof ResumeAnalysisReportSchema>;
