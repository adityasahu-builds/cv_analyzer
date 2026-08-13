import { z } from 'zod';

export const JobMatchResponseSchema = z.object({
  roleTitle: z.string().nullable(),
  extractedSkills: z.array(z.string()),
  experienceAlignmentScore: z.number().min(0).max(100),
  roleAlignmentScore: z.number().min(0).max(100),
  experienceAlignment: z.string(),
  summary: z.string()
});

export const JobMatchResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  roleTitle: z.string().nullable(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
  experienceAlignment: z.string(),
  summary: z.string(),
  isLimitedAnalysis: z.boolean().optional().default(false),
});

export type JobMatchResponse = z.infer<typeof JobMatchResponseSchema>;
export type JobMatchResult = z.infer<typeof JobMatchResultSchema>;

