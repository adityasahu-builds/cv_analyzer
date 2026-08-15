import { ParsedResumeData } from '../types/resume';

export function smartTruncateResumeText(rawText: string, maxChars = 9000): string {
  if (!rawText || rawText.length <= maxChars) {
    return rawText || '';
  }

  const lines = rawText.split('\n');
  let truncatedText = '';

  for (const line of lines) {
    if (truncatedText.length + line.length + 1 > maxChars) {
      truncatedText += '\n[...Text truncated for analysis context limit...]';
      break;
    }
    truncatedText += line + '\n';
  }

  return truncatedText.trim();
}

export function buildResumeAnalysisPrompt(resumeData: ParsedResumeData, jobDescription?: string): string {
  const isVisual = Boolean(resumeData.pdfBase64 && resumeData.pdfBase64.length > 0);

  const headerNotice = isVisual
    ? 'Analyze the attached visual PDF resume document directly.'
    : 'Analyze the text content of the provided resume document.';

  const contentBlock = isVisual
    ? ''
    : `\nRESUME CONTENT:\n---\n${smartTruncateResumeText(resumeData.rawText || '', 12000)}\n---\n`;

  const jdBlock = (jobDescription && jobDescription.trim())
    ? `\nTARGET JOB DESCRIPTION FOR MATCHING:\n---\n${smartTruncateResumeText(jobDescription, 3000)}\n---\n`
    : '';

  return `
You are an executive ATS (Applicant Tracking System) Auditor and Senior Technical Career Coach.
${headerNotice}

STEP 1: DOCUMENT TYPE VALIDATION (CRITICAL)
First, verify whether the provided document is actually a legitimate professional Resume or CV (Curriculum Vitae).
- If the document is NOT a resume/CV (e.g. it is class/study notes, lecture material, textbook chapter, homework/assignment, test/exam paper, mathematical proof, recipe, source code dump, invoice, article, or random text):
  You MUST set "isResume": false and "rejectionReason": "The uploaded document appears to be study/lecture notes or non-resume content rather than a Resume or CV. Please upload a valid Resume or CV." (You may fill other fields with placeholders/defaults).
- If the document IS a valid Resume or CV:
  Set "isResume": true, leave "rejectionReason": "", and perform the complete evaluation following the rubric.

SCORING RUBRIC BOUNDARIES (0 to 100 per dimension):
1. ATS Formatting & Structure (formatting):
   - 90-100: Flawless ATS-safe layout, clear standard headings, clean hierarchy, no complex visual tables/columns.
   - 75-89: Good structure with minor ATS layout risks.
   - 60-74: Multiple formatting risks or non-standard section headers.
   - <60: Severe ATS parsing risks.

2. Content Quality & Depth (contentQuality):
   - 90-100: Exceptional technical depth, clear career progression, precise role context.
   - 75-89: Solid responsibility descriptions with standard detail.
   - 60-74: Vague descriptions, passive wording, or missing context.
   - <60: Lacks meaningful substance or detail.

3. Impact Bullet Measurability (impactMeasurability):
   - 90-100: >50% of bullet points contain explicit metrics, percentages, revenue impact, or team scale.
   - 75-89: Moderate quantification across experience bullets.
   - 60-74: Mostly task-oriented bullets lacking measurable business metrics.
   - <60: Zero or minimal metrics across experience section.

4. Skills & Keyword Taxonomies (skillsTaxonomy):
   - 90-100: Rich, relevant tech stack keywords matching target role demands.
   - 75-89: Adequate core skill coverage.
   - 60-74: Key industry tools/technologies missing.
   - <60: Sparse skill list.

Return ONLY a valid JSON object matching this exact JSON schema:

{
  "isResume": true,
  "rejectionReason": "string (only if isResume is false)",
  "summary": "string (executive 2-3 sentence overview of resume quality and ATS readiness)",
  "sections": {
    "formatting": {
      "name": "ATS Formatting & Structure",
      "score": number (0-100 integer based on rubric),
      "weight": 0.25,
      "feedback": "string",
      "strengths": ["string"],
      "improvements": ["string"]
    },
    "contentQuality": {
      "name": "Content Quality & Depth",
      "score": number (0-100 integer based on rubric),
      "weight": 0.30,
      "feedback": "string",
      "strengths": ["string"],
      "improvements": ["string"]
    },
    "impactMeasurability": {
      "name": "Impact Bullet Measurability",
      "score": number (0-100 integer based on rubric),
      "weight": 0.25,
      "feedback": "string",
      "strengths": ["string"],
      "improvements": ["string"]
    },
    "skillsTaxonomy": {
      "name": "Skills & Keyword Taxonomies",
      "score": number (0-100 integer based on rubric),
      "weight": 0.20,
      "feedback": "string",
      "strengths": ["string"],
      "improvements": ["string"]
    }
  },
  "strengths": ["string", "string", "string"],
  "weaknesses": ["string", "string", "string"],
  "recommendations": ["string", "string", "string"],
  "detectedKeywords": ["string (actual technical skills, tools, frameworks found in resume)"],
  "missingKeywords": ["string (industry technical/role keywords missing for candidate - NEVER list section names like Work Experience or Education)"],
  "improvedBullets": [
    {
      "original": "string",
      "improved": "string",
      "reason": "string"
    }
  ],
  "rewrittenSummary": "string",
  "confidenceScore": number (between 85 and 99)
}

IMPORTANT CONSTRAINTS:
1. Return ONLY the raw JSON object. Do not include markdown code block backticks such as \`\`\`json.
2. Evaluate each section strictly according to the rubric boundaries.
3. If not a resume, isResume must be false.
4. detectedKeywords must be actual technologies/skills found in the text. missingKeywords must be relevant industry skills (never section names).
${jdBlock}${contentBlock}`;
}

export function buildCompactGroqPrompt(resumeData: ParsedResumeData, jobDescription?: string): string {
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

  const normalizedText = smartTruncateResumeText(cleanText, 9000);
  const jdText = jobDescription ? smartTruncateResumeText(jobDescription, 2000) : '';

  return `First verify if this text is a real Resume/CV. If it is study notes, assignment, article, or non-resume text, set isResume to false and provide rejectionReason.
Analyze and return ONLY JSON matching this schema:
{
  "isResume": true,
  "rejectionReason": "string",
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
  "detectedKeywords": ["string"],
  "missingKeywords": ["string"],
  "improvedBullets": [{ "original": "string", "improved": "string", "reason": "string" }],
  "rewrittenSummary": "string",
  "confidenceScore": 95
}

${jdText ? `TARGET JOB DESCRIPTION:\n${jdText}\n\n` : ''}RESUME TEXT:
${normalizedText}`;
}



