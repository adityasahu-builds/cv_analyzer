import { EducationEntry, ExperienceEntry, ProjectEntry, SkillCategory } from '../types/resume';

export function parseSummarySection(lines: string[]): string {
  return lines.join(' ').trim();
}

export function parseEducationSection(lines: string[]): EducationEntry[] {
  if (!lines || lines.length === 0) return [];
  return [
    {
      institution: lines[0] || '',
      degree: lines[1] || '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      gpa: '',
      description: lines.slice(2).join(' '),
    },
  ];
}

export function parseSkillsSection(lines: string[]): SkillCategory[] {
  if (!lines || lines.length === 0) return [];
  const allSkills = lines.join(', ').split(/[,•|]/).map((s) => s.trim()).filter((s) => s.length > 0);
  return [
    {
      category: 'Technical Skills',
      items: allSkills,
    },
  ];
}

export function parseExperienceSection(lines: string[]): ExperienceEntry[] {
  if (!lines || lines.length === 0) return [];
  return [
    {
      company: lines[0] || '',
      position: lines[1] || '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      bulletPoints: lines.slice(2),
    },
  ];
}

export function parseProjectsSection(lines: string[]): ProjectEntry[] {
  if (!lines || lines.length === 0) return [];
  return [
    {
      title: lines[0] || '',
      description: lines.slice(1).join(' '),
      technologies: [],
      link: '',
    },
  ];
}

export function parseCertificationsSection(lines: string[]): string[] {
  return lines.map((l) => l.replace(/^[•\-*]\s*/, '').trim()).filter((l) => l.length > 0);
}

export function parseAchievementsSection(lines: string[]): string[] {
  return lines.map((l) => l.replace(/^[•\-*]\s*/, '').trim()).filter((l) => l.length > 0);
}

export function parseLanguagesSection(lines: string[]): string[] {
  return lines.map((l) => l.replace(/^[•\-*]\s*/, '').trim()).filter((l) => l.length > 0);
}
