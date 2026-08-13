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
  improvedBullets?: { original: string; improved: string; reason: string }[];
  rewrittenSummary?: string;
  confidenceScore: number;
  diagnostics?: Record<string, unknown>;
}

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

export interface ParsedResumeData {
  personal: PersonalDetails;
  summary: string;
  education: EducationEntry[];
  skills: SkillCategory[];
  projects: ProjectEntry[];
  experience: ExperienceEntry[];
  certifications: string[];
  achievements: string[];
  languages: string[];
  rawText: string;
}

export interface JobMatchResult {
  matchScore: number;
  roleTitle: string | null;
  matchedSkills: string[];
  missingSkills: string[];
  experienceAlignment: string;
  summary: string;
}

