export interface SegmentedSections {
  summary: string[];
  education: string[];
  skills: string[];
  experience: string[];
  projects: string[];
  certifications: string[];
  achievements: string[];
  languages: string[];
}

const SECTION_HEADERS: Record<string, RegExp> = {
  summary: /^(summary|profile|about me|objective|professional summary)\b/i,
  education: /^(education|academic background|qualifications)\b/i,
  skills: /^(skills|technical skills|core competencies|technologies)\b/i,
  experience: /^(experience|work experience|employment history|work history)\b/i,
  projects: /^(projects|key projects|personal projects)\b/i,
  certifications: /^(certifications|licenses|courses)\b/i,
  achievements: /^(achievements|awards|honors)\b/i,
  languages: /^(languages|spoken languages)\b/i,
};

export function segmentSections(rawText: string): SegmentedSections {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const sections: SegmentedSections = {
    summary: [],
    education: [],
    skills: [],
    experience: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
  };

  let currentSection: keyof SegmentedSections | null = null;

  for (const line of lines) {
    let matchedHeader = false;
    for (const [sectionKey, regex] of Object.entries(SECTION_HEADERS)) {
      if (regex.test(line)) {
        currentSection = sectionKey as keyof SegmentedSections;
        matchedHeader = true;
        break;
      }
    }

    if (!matchedHeader && currentSection) {
      sections[currentSection].push(line);
    }
  }

  return sections;
}
