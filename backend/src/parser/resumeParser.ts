import { ParsedResumeData, ParsedResumeSchema, SkillCategory } from '../types/resume';
import { KEYWORD_TAXONOMY } from './extractors/keywordTaxonomy';
import { extractPdfContent } from './extractors/pdfExtractor';
import { extractTextFromDocx } from './extractors/docxExtractor';
import { extractPersonalDetails } from './contactExtractor';
import { segmentSections } from './sectionSegmenter';
import {
  parseSummarySection,
  parseEducationSection,
  parseSkillsSection,
  parseExperienceSection,
  parseProjectsSection,
  parseCertificationsSection,
  parseAchievementsSection,
  parseLanguagesSection,
} from './sectionParsers';

export async function parseResumeBuffer(
  buffer: Buffer,
  fileName: string
): Promise<ParsedResumeData> {
  const lowerName = fileName.toLowerCase();
  let rawText = '';
  let pdfBase64 = '';
  let isVisualResume = false;

  if (lowerName.endsWith('.pdf')) {
    const pdfResult = await extractPdfContent(buffer, fileName);
    rawText = pdfResult.rawText;
    pdfBase64 = pdfResult.pdfBase64;
    if (!pdfResult.hasSufficientText) {
      isVisualResume = true;
    }
  } else if (lowerName.endsWith('.docx') || lowerName.endsWith('.doc')) {
    rawText = await extractTextFromDocx(buffer);
  } else {
    throw new Error('Unsupported file extension. Only PDF and DOCX documents are supported.');
  }

  if ((!rawText || rawText.trim().length < 10) && !pdfBase64) {
    throw new Error('Extracted resume text is empty or unreadable.');
  }

  const personal = extractPersonalDetails(rawText);
  const segmented = segmentSections(rawText);

  let summary = parseSummarySection(segmented.summary);
  let education = parseEducationSection(segmented.education);
  let skills = parseSkillsSection(segmented.skills);
  let experience = parseExperienceSection(segmented.experience);
  const projects = parseProjectsSection(segmented.projects);
  const certifications = parseCertificationsSection(segmented.certifications);
  const achievements = parseAchievementsSection(segmented.achievements);
  const languages = parseLanguagesSection(segmented.languages);

  // Skill Taxonomy Fallback if section extraction missed skills
  if (skills.length === 0 || skills.every((s) => s.items.length === 0)) {
    const fallbackCategories: Record<string, string[]> = {};

    for (const [category, keywords] of Object.entries(KEYWORD_TAXONOMY)) {
      for (const kw of keywords) {
        const escaped = kw.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(rawText)) {
          if (!fallbackCategories[category]) {
            fallbackCategories[category] = [];
          }
          if (!fallbackCategories[category].includes(kw)) {
            fallbackCategories[category].push(kw);
          }
        }
      }
    }

    const fallbackSkills: SkillCategory[] = Object.entries(fallbackCategories).map(([cat, items]) => ({
      category: `${cat} Skills`,
      items,
    }));

    if (fallbackSkills.length > 0) {
      skills = fallbackSkills;
    }
  }

  const rawParsedData = {
    personal,
    summary,
    education,
    skills,
    projects,
    experience,
    certifications,
    achievements,
    languages,
    rawText,
    pdfBase64,
    images: [],
    isVisualResume,
  };

  return ParsedResumeSchema.parse(rawParsedData);
}
