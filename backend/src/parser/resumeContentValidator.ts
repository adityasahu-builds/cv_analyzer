import { ParsedResumeData } from '../types/resume';

export interface ResumeContentValidationResult {
  isValidResume: boolean;
  reason?: string;
  confidenceScore: number;
  signals: {
    hasContact: boolean;
    sectionCount: number;
    hasDateRanges: boolean;
    hasJobTokens: boolean;
    nonResumeFlagCount: number;
  };
}

// Regex patterns for Academic Notes, Question Papers, Invoices, Articles
const NON_RESUME_PATTERNS = [
  /\bchapter\s*[-–:]?\s*\d+\b/i,
  /\bunit\s*[-–:]?\s*\d+\b/i,
  /\bmodule\s*[-–:]?\s*\d+\b/i,
  /\blecture\s*[-–:]?\s*\d+\b/i,
  /\blesson\s*[-–:]?\s*\d+\b/i,
  /\btopic\s*[-–:]?\s*\d+\b/i,
  /\bnotes\s+on\b/i,
  /\bclass\s*notes\b/i,
  /\bsemester\s*[-–:]?\s*\d+\b/i,
  /\bsyllabus\b/i,
  /\bassignment\s*[-–:]?\s*\d+\b/i,
  /\bquestion\s*[-–:]?\s*\d+\b/i,
  /\bq\s*\d+[\.:\)]/i,
  /\bans[\.:\)]/i,
  /\bsolution\s*:/i,
  /\bproblem\s*[-–:]?\s*\d+\b/i,
  /\bexercise\s*[-–:]?\s*\d+\b/i,
  /\bhomework\b/i,
  /\btutorial\s*[-–:]?\s*\d+\b/i,
  /\blab\s*manual\b/i,
  /\bexperiment\s*[-–:]?\s*\d+\b/i,
  /\baim\s*:/i,
  /\bprocedure\s*:/i,
  /\bapparatus\s*:/i,
  /\bdefinition\s*:/i,
  /\btheorem\b/i,
  /\blemma\b/i,
  /\bproof\s*:/i,
  /\bderivation\b/i,
  /\bmidterm\b/i,
  /\bendterm\b/i,
  /\btotal\s*marks\b/i,
  /\bquestion\s*paper\b/i,
  /\binvoice\s*(number|#|no)?\b/i,
  /\bbill\s*to\b/i,
  /\bamount\s*due\b/i,
];

// Regex for Resume Date Ranges (e.g., 2020 - 2024, May 2021 - Present, 2022-Present)
const DATE_RANGE_REGEX = /(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?\b(19\d{2}|20\d{2})\s*[-–to]+\s*(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(?:(19\d{2}|20\d{2})|present|current)\b/i;

// Regex for Career/Job Title Tokens
const JOB_TITLE_REGEX = /\b(software engineer|developer|frontend|backend|full stack|data scientist|analyst|intern|internship|manager|lead|architect|consultant|designer|specialist|administrator|assistant|associate|executive|director|technician|freelancer)\b/i;

// Regex for Standard Resume Section Headers
const SECTION_INDICATORS = [
  { name: 'experience', regex: /\b(experience|work experience|employment history|work history|professional experience)\b/i },
  { name: 'education', regex: /\b(education|academic background|qualifications|academic history|degrees?|bachelor|master|b\.tech|b\.e|b\.sc|bca|mca|m\.tech|m\.s|mba|phd)\b/i },
  { name: 'skills', regex: /\b(skills|technical skills|technologies|core competencies|tools & technologies|programming languages)\b/i },
  { name: 'projects', regex: /\b(projects|key projects|academic projects|personal projects|portfolio projects)\b/i },
  { name: 'summary', regex: /\b(summary|professional summary|profile|about me|career objective|objective)\b/i },
  { name: 'certifications', regex: /\b(certifications?|certificates?|licenses?|courses?)\b/i },
];

/**
 * Evaluates whether extracted document text represents a genuine Resume or CV,
 * or if it represents non-resume material such as lecture notes, assignments, or random text.
 */
export function validateResumeContent(parsedData: ParsedResumeData): ResumeContentValidationResult {
  const rawText = parsedData.rawText || '';

  // Count non-resume/academic notes indicators
  let nonResumeFlagCount = 0;
  for (const pattern of NON_RESUME_PATTERNS) {
    if (pattern.test(rawText)) {
      nonResumeFlagCount++;
    }
  }

  // Check contact details presence
  const hasContact = Boolean(
    (parsedData.personal?.email && parsedData.personal.email.includes('@')) ||
    (parsedData.personal?.phone && parsedData.personal.phone.length >= 7) ||
    (parsedData.personal?.linkedin && parsedData.personal.linkedin.length > 5) ||
    (parsedData.personal?.github && parsedData.personal.github.length > 5) ||
    (parsedData.personal?.portfolio && parsedData.personal.portfolio.length > 5)
  );

  // Check standard resume section headers
  let matchedSectionCount = 0;
  for (const section of SECTION_INDICATORS) {
    if (section.regex.test(rawText)) {
      matchedSectionCount++;
    }
  }

  // Also count structured entities extracted by parsers
  const hasParsedExperience = parsedData.experience && parsedData.experience.length > 0;
  const hasParsedEducation = parsedData.education && parsedData.education.length > 0;
  const hasParsedSkills = parsedData.skills && parsedData.skills.some((s) => s.items && s.items.length > 0);
  const hasParsedProjects = parsedData.projects && parsedData.projects.length > 0;

  const hasDateRanges = DATE_RANGE_REGEX.test(rawText);
  const hasJobTokens = JOB_TITLE_REGEX.test(rawText);

  // Calculate positive resume score (0 to 100)
  let resumeScore = 0;
  if (hasContact) resumeScore += 25;
  resumeScore += Math.min(30, matchedSectionCount * 10);
  if (hasParsedExperience) resumeScore += 20;
  if (hasParsedEducation) resumeScore += 15;
  if (hasParsedSkills) resumeScore += 10;
  if (hasParsedProjects) resumeScore += 10;
  if (hasDateRanges) resumeScore += 15;
  if (hasJobTokens) resumeScore += 10;

  // Penalize for non-resume flags (e.g. Chapter, Lecture, Assignment, Question/Answer)
  const penalty = nonResumeFlagCount * 20;
  const netScore = Math.max(0, resumeScore - penalty);

  const signals = {
    hasContact,
    sectionCount: matchedSectionCount,
    hasDateRanges,
    hasJobTokens,
    nonResumeFlagCount,
  };

  console.log(`[ResumeContentValidator] Evaluation: resumeScore=${resumeScore}, nonResumeFlagCount=${nonResumeFlagCount}, netScore=${netScore}, sections=${matchedSectionCount}, hasContact=${hasContact}, hasDates=${hasDateRanges}`);

  // Decision Logic:
  // Case 1: Strong notes/academic assignment markers present with low resume structure
  if (nonResumeFlagCount >= 2 && (matchedSectionCount < 2 || !hasContact)) {
    return {
      isValidResume: false,
      reason: 'The uploaded document appears to be study/lecture notes, an assignment, or course material rather than a Resume or CV. Please upload a valid Resume or CV.',
      confidenceScore: netScore,
      signals,
    };
  }

  // Case 2: No contact info AND less than 2 recognizable resume sections AND no experience/projects
  if (!hasContact && matchedSectionCount < 2 && !hasParsedExperience && !hasParsedProjects && !hasParsedEducation) {
    return {
      isValidResume: false,
      reason: 'The uploaded document does not appear to be a valid Resume or CV. It is missing key sections such as Work Experience, Education, Skills, or Projects.',
      confidenceScore: netScore,
      signals,
    };
  }

  // Case 3: Extremely low net score (< 25) and no date ranges or career tokens
  if (netScore < 25 && !hasDateRanges && !hasJobTokens) {
    return {
      isValidResume: false,
      reason: 'The uploaded document does not match a standard Resume or CV structure. Please upload a document detailing your professional experience, education, and skills.',
      confidenceScore: netScore,
      signals,
    };
  }

  return {
    isValidResume: true,
    confidenceScore: netScore,
    signals,
  };
}
