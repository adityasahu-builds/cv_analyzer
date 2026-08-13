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
${headerNotice} Provide a rigorous, objective, and highly consistent evaluation.

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
  "missingKeywords": ["string", "string"],
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
3. Be fair, analytical, and highly constructive.
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

  return `Analyze this resume and return JSON matching this schema:
{
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
  "confidenceScore": 95
}

${jdText ? `TARGET JOB DESCRIPTION:\n${jdText}\n\n` : ''}RESUME TEXT:
${normalizedText}`;
}

export function buildJobMatchPrompt(resumeData: ParsedResumeData, jobDescription: string, isShortTitle: boolean = false): string {
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

  const resumeText = smartTruncateResumeText(cleanText, 9000);
  const jdText = smartTruncateResumeText(jobDescription, 3000);

  if (isShortTitle) {
    return `The user provided only a Job Title (or short role description) instead of a full job posting.

RESUME TEXT:
---
${resumeText}
---

TARGET ROLE TITLE:
"${jdText}"

Instructions:
1. Identify the target role title cleanly (e.g., "Software Engineer", "Python Developer").
2. Do NOT invent or fabricate any job description requirements, missing skills, or technologies that were not explicitly mentioned in the target role title.
3. If the role title explicitly mentions a specific technology (e.g. "Python Developer"), list that technology in "extractedSkills". Otherwise, return an empty array [] for "extractedSkills".
4. Evaluate role title alignment score (0 to 100) based on how well the candidate's background matches this target role.
5. Evaluate experience alignment score (0 to 100) based on candidate's experience relevance to this role title.
6. Provide a concise 1-2 sentence "experienceAlignment" note.
7. Provide a "summary" stating: "Limited analysis — only the job title was provided. Add the full job description for a more accurate skills and experience match."

Return ONLY a valid JSON object matching this schema:
{
  "roleTitle": "string or null",
  "extractedSkills": ["string"],
  "experienceAlignmentScore": number,
  "roleAlignmentScore": number,
  "experienceAlignment": "string",
  "summary": "string"
}`;
  }

  return `Compare this candidate's Resume with the Target Job Description and extract matching details.
  
RESUME TEXT:
---
${resumeText}
---

TARGET JOB DESCRIPTION:
---
${jdText}
---

Evaluate the matching profile.
1. Extract the target job title from the job description (e.g., "Senior React Developer", "Python Data Analyst"). If the job description does not have a recognizable role title, return null. Do not invent or fabricate a title.
2. Extract the key technical skills, tools, and methodologies required in the Job Description (aim for 5-15 skills).
3. Evaluate the experience alignment score (0 to 100) based on responsibilities, seniority level, and years of experience.
4. Evaluate the role title alignment score (0 to 100) based on how previous job titles match the target role.
5. Provide a 1-2 sentence "experienceAlignment" explanation.
6. Provide a 2-3 sentence "summary" of the overall alignment between the resume and the job description.

Return ONLY a valid JSON object matching this schema:
{
  "roleTitle": "string or null",
  "extractedSkills": ["string"],
  "experienceAlignmentScore": number,
  "roleAlignmentScore": number,
  "experienceAlignment": "string",
  "summary": "string"
}

IMPORTANT: Do not return markdown block backticks. Return raw JSON. Do not invent skills that are not mentioned in the job description.`;
}


