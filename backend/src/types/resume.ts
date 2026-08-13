import { z } from 'zod';

export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ProjectEntry {
  title: string;
  description: string;
  technologies: string[];
  link: string;
}

export interface ExperienceEntry {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bulletPoints: string[];
}

export const ParsedResumeSchema = z.object({
  personal: z.object({
    fullName: z.string().default(''),
    email: z.string().default(''),
    phone: z.string().default(''),
    location: z.string().default(''),
    linkedin: z.string().default(''),
    github: z.string().default(''),
    portfolio: z.string().default(''),
  }),
  summary: z.string().default(''),
  education: z.array(
    z.object({
      institution: z.string().default(''),
      degree: z.string().default(''),
      fieldOfStudy: z.string().default(''),
      startDate: z.string().default(''),
      endDate: z.string().default(''),
      gpa: z.string().default(''),
      description: z.string().default(''),
    })
  ).default([]),
  skills: z.array(
    z.object({
      category: z.string().default('Skills'),
      items: z.array(z.string()).default([]),
    })
  ).default([]),
  projects: z.array(
    z.object({
      title: z.string().default(''),
      description: z.string().default(''),
      technologies: z.array(z.string()).default([]),
      link: z.string().default(''),
    })
  ).default([]),
  experience: z.array(
    z.object({
      company: z.string().default(''),
      position: z.string().default(''),
      location: z.string().default(''),
      startDate: z.string().default(''),
      endDate: z.string().default(''),
      isCurrent: z.boolean().default(false),
      bulletPoints: z.array(z.string()).default([]),
    })
  ).default([]),
  certifications: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  rawText: z.string().default(''),
  pdfBase64: z.string().optional(),
  images: z.array(z.string()).optional(),
  isVisualResume: z.boolean().optional(),
});

export type ParsedResumeData = z.infer<typeof ParsedResumeSchema>;

export interface SectionScore {
  name: string;
  score: number; // 0 - 100
  weight: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface ResumeAnalysisReport {
  overallScore: number; // 0 - 100
  summary: string;
  sections: {
    formatting: SectionScore;
    contentQuality: SectionScore;
    impactMeasurability: SectionScore;
    skillsTaxonomy: SectionScore;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  missingKeywords: string[];
  improvedBullets?: { original: string; improved: string; reason: string }[];
  rewrittenSummary?: string;
  confidenceScore: number;
  providerUsed?: string;
  diagnostics?: Record<string, unknown>;
}

export interface ParseApiResponse {
  success: boolean;
  data?: ParsedResumeData;
  error?: string | { code: string; message: string };
  meta?: {
    fileName: string;
    fileSizeBytes: number;
    mimeType: string;
    parsedAt: string;
    characterCount: number;
    wordCount: number;
    durationMs: number;
  };
}

export interface AnalyzeApiResponse {
  success: boolean;
  data?: {
    atsReport: ResumeAnalysisReport;
    aiStatus: {
      aiAvailable: boolean;
      fallbackUsed: boolean;
      provider: string;
      cached?: boolean;
    };
  };
  error?: string;
  category?: string;
  correlationId?: string;
  durationMs?: number;
}

export interface JobMatchResult {
  matchScore: number;
  roleTitle: string | null;
  matchedSkills: string[];
  missingSkills: string[];
  experienceAlignment: string;
  summary: string;
  isLimitedAnalysis?: boolean;
}


export interface JobMatchApiResponse {
  success: boolean;
  data?: JobMatchResult;
  error?: string;
  category?: string;
  correlationId?: string;
  durationMs?: number;
}

