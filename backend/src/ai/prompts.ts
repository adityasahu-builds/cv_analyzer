import { ParsedResumeData } from '../types/resume';

export function smartTruncateResumeText(rawText: string, maxChars = 9000): string {
  if (!rawText || rawText.length <= maxChars) {
    return rawText || '';
  }

  // Preserve key sections intelligently
  const lines = rawText.split('\n');
  const importantSectionHeaders = /^(summary|profile|education|skills|experience|work history|projects|certifications)\b/i;

  let truncatedText = '';
  let lineCount = 0;

  for (const line of lines) {
    if (truncatedText.length + line.length + 1 > maxChars) {
      // If we reach max limit, append section truncation note
      truncatedText += '\n[...Text truncated for analysis context limit...]';
      break;
    }
    truncatedText += line + '\n';
    lineCount++;
  }

  return truncatedText.trim();
}

export function buildResumeAnalysisPrompt(resumeData: ParsedResumeData): string {
  const isVisual = Boolean(resumeData.pdfBase64 && resumeData.pdfBase64.length > 0);

  const headerNotice = isVisual
    ? 'Analyze the attached visual PDF resume document directly.'
    : 'Analyze the text content of the provided resume document.';

  const contentBlock = isVisual
    ? ''
    : `\nRESUME CONTENT:\n---\n${smartTruncateResumeText(resumeData.rawText || '', 12000)}\n---\n`;

  return `
You are an executive ATS (Applicant Tracking System) Auditor and Senior Career Coach.
${headerNotice} Provide a rigorous, objective evaluation.

Return ONLY a valid JSON object matching this exact JSON schema:

{
  "overallScore": number (integer between 0 and 100 representing total ATS & impact score),
  "summary": "string (executive 2-3 sentence overview of the resume quality and ATS readiness)",
  "sections": {
    "formatting": {
      "name": "ATS Formatting & Structure",
      "score": number (0-100),
      "weight": 0.25,
      "feedback": "string",
      "strengths": ["string"],
      "improvements": ["string"]
    },
    "contentQuality": {
      "name": "Content Quality & Depth",
      "score": number (0-100),
      "weight": 0.30,
      "feedback": "string",
      "strengths": ["string"],
      "improvements": ["string"]
    },
    "impactMeasurability": {
      "name": "Impact Bullet Measurability",
      "score": number (0-100),
      "weight": 0.25,
      "feedback": "string",
      "strengths": ["string"],
      "improvements": ["string"]
    },
    "skillsTaxonomy": {
      "name": "Skills & Keyword Taxonomies",
      "score": number (0-100),
      "weight": 0.20,
      "feedback": "string",
      "strengths": ["string"],
      "improvements": ["string"]
    }
  },
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "recommendations": ["string", "string", "string"],
  "missingKeywords": ["string", "string"],
  "improvedBullets": [
    {
      "original": "string",
      "improved": "string",
      "reason": "string"
    }
  ],
  "rewrittenSummary": "string",
  "confidenceScore": number (0.80 to 1.00)
}

IMPORTANT CONSTRAINTS:
1. Return ONLY the JSON object. Do not include markdown code block backticks such as \`\`\`json.
2. Ensure scores reflect actual content depth, action verbs, layout clarity, and quantifiable metrics.
3. Be fair, analytical, and highly constructive.
${contentBlock}`;
}

export function buildCompactGroqPrompt(resumeData: ParsedResumeData): string {
  // NEVER include pdfBase64 or large stringified JSON objects
  let cleanText = resumeData.rawText ? resumeData.rawText.trim() : '';

  if (!cleanText) {
    const parts: string[] = [];
    if (resumeData.personal?.fullName) parts.push(`Name: ${resumeData.personal.fullName}`);
    if (resumeData.summary) parts.push(`Summary: ${resumeData.summary}`);
    if (resumeData.skills?.length) {
      parts.push(`Skills: ${resumeData.skills.map((s) => s.items.join(', ')).join('; ')}`);
    }
    if (resumeData.experience?.length) {
      parts.push(`Experience: ${resumeData.experience.map((e) => `${e.position} at ${e.company}: ${e.bulletPoints.join(' ')}`).join('\n')}`);
    }
    if (resumeData.education?.length) {
      parts.push(`Education: ${resumeData.education.map((ed) => `${ed.degree} from ${ed.institution}`).join('; ')}`);
    }
    cleanText = parts.join('\n\n');
  }

  // Intelligently truncate if text exceeds 9000 chars (~2250 tokens)
  const normalizedText = smartTruncateResumeText(cleanText, 9000);

  return `Analyze this resume and return JSON matching this schema:
{
  "overallScore": number (0-100),
  "summary": "string",
  "sections": {
    "formatting": { "name": "ATS Formatting & Structure", "score": number, "weight": 0.25, "feedback": "string", "strengths": ["string"], "improvements": ["string"] },
    "contentQuality": { "name": "Content Quality & Depth", "score": number, "weight": 0.30, "feedback": "string", "strengths": ["string"], "improvements": ["string"] },
    "impactMeasurability": { "name": "Impact Bullet Measurability", "score": number, "weight": 0.25, "feedback": "string", "strengths": ["string"], "improvements": ["string"] },
    "skillsTaxonomy": { "name": "Skills & Keyword Taxonomies", "score": number, "weight": 0.20, "feedback": "string", "strengths": ["string"], "improvements": ["string"] }
  },
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "missingKeywords": ["string"],
  "improvedBullets": [{ "original": "string", "improved": "string", "reason": "string" }],
  "rewrittenSummary": "string",
  "confidenceScore": 0.9
}

RESUME TEXT:
${normalizedText}`;
}
