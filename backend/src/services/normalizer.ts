import crypto from 'crypto';
import { ParsedResumeData } from '../types/resume';

/**
 * Normalizes raw text deterministically:
 * - Standardizes newlines (\r\n -> \n, \r -> \n)
 * - Trims trailing whitespace from each line
 * - Collapses multiple consecutive empty lines to a max of two
 * - Trims leading/trailing text whitespace
 */
export function normalizeRawText(rawText: string): string {
  if (!rawText) return '';
  const standardized = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = standardized.split('\n').map((line) => line.trimEnd());
  const cleaned = lines.join('\n').replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
}

/**
 * Normalizes a list of strings:
 * - Trims each item
 * - Filters out empty strings
 * - Deduplicates case-insensitively while preserving original case of first occurrence
 * - Sorts items alphabetically for deterministic key order
 */
export function normalizeStringList(items: string[]): string[] {
  if (!items || !Array.isArray(items)) return [];
  const map = new Map<string, string>();
  for (const rawItem of items) {
    if (!rawItem || typeof rawItem !== 'string') continue;
    const trimmed = rawItem.trim();
    if (!trimmed) continue;
    const lowerKey = trimmed.toLowerCase();
    if (!map.has(lowerKey)) {
      map.set(lowerKey, trimmed);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.localeCompare(b));
}

/**
 * Deterministically normalizes ParsedResumeData.
 * Guarantees that the exact same CV content yields the exact same object structure & values.
 */
export function normalizeParsedResumeData(data: ParsedResumeData): ParsedResumeData {
  const normalizedRawText = normalizeRawText(data.rawText || '');

  const personal = {
    fullName: (data.personal?.fullName || '').trim(),
    email: (data.personal?.email || '').trim().toLowerCase(),
    phone: (data.personal?.phone || '').trim(),
    location: (data.personal?.location || '').trim(),
    linkedin: (data.personal?.linkedin || '').trim().toLowerCase(),
    github: (data.personal?.github || '').trim().toLowerCase(),
    portfolio: (data.personal?.portfolio || '').trim().toLowerCase(),
  };

  const summary = normalizeRawText(data.summary || '');

  const skills = (data.skills || [])
    .map((sc) => ({
      category: (sc.category || 'Skills').trim(),
      items: normalizeStringList(sc.items || []),
    }))
    .filter((sc) => sc.items.length > 0)
    .sort((a, b) => a.category.localeCompare(b.category));

  const experience = (data.experience || [])
    .map((exp) => ({
      company: (exp.company || '').trim(),
      position: (exp.position || '').trim(),
      location: (exp.location || '').trim(),
      startDate: (exp.startDate || '').trim(),
      endDate: (exp.endDate || '').trim(),
      isCurrent: Boolean(exp.isCurrent),
      bulletPoints: (exp.bulletPoints || []).map((bp) => (bp || '').trim()).filter(Boolean),
    }))
    .sort((a, b) => (b.startDate || b.company).localeCompare(a.startDate || a.company));

  const education = (data.education || [])
    .map((edu) => ({
      institution: (edu.institution || '').trim(),
      degree: (edu.degree || '').trim(),
      fieldOfStudy: (edu.fieldOfStudy || '').trim(),
      startDate: (edu.startDate || '').trim(),
      endDate: (edu.endDate || '').trim(),
      gpa: (edu.gpa || '').trim(),
      description: (edu.description || '').trim(),
    }))
    .sort((a, b) => (b.startDate || b.institution).localeCompare(a.startDate || a.institution));

  const projects = (data.projects || [])
    .map((proj) => ({
      title: (proj.title || '').trim(),
      description: (proj.description || '').trim(),
      technologies: normalizeStringList(proj.technologies || []),
      link: (proj.link || '').trim(),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));

  const certifications = normalizeStringList(data.certifications || []);
  const achievements = normalizeStringList(data.achievements || []);
  const languages = normalizeStringList(data.languages || []);

  return {
    personal,
    summary,
    education,
    skills,
    projects,
    experience,
    certifications,
    achievements,
    languages,
    rawText: normalizedRawText,
    pdfBase64: data.pdfBase64,
    images: data.images,
    isVisualResume: data.isVisualResume,
  };
}

/**
 * Computes a stable SHA-256 hash of the normalized resume data.
 */
export function computeResumeHash(data: ParsedResumeData): string {
  const normalized = normalizeParsedResumeData(data);

  // Payload structure for hash computation
  const payloadToHash = {
    rawText: normalized.rawText,
    personal: normalized.personal,
    summary: normalized.summary,
    skills: normalized.skills,
    experience: normalized.experience,
    education: normalized.education,
    projects: normalized.projects,
    certifications: normalized.certifications,
    achievements: normalized.achievements,
    languages: normalized.languages,
    // If rawText is missing (visual PDF), include SHA-256 of pdfBase64
    pdfHash: (!normalized.rawText && normalized.pdfBase64)
      ? crypto.createHash('sha256').update(normalized.pdfBase64).digest('hex')
      : '',
  };

  return crypto
    .createHash('sha256')
    .update(JSON.stringify(payloadToHash))
    .digest('hex');
}

/**
 * Computes SHA-256 hash of an optional job description.
 */
export function computeJobDescriptionHash(jobDescription?: string): string {
  if (!jobDescription || !jobDescription.trim()) return 'no_jd';
  const cleanJD = normalizeRawText(jobDescription).toLowerCase();
  return crypto.createHash('sha256').update(cleanJD).digest('hex');
}
