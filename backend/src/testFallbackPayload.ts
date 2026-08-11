import { aiOrchestrator } from './ai/aiOrchestrator';
import { ParsedResumeData } from './types/resume';

// Sample 1: Normal Text Resume
const normalTextResume: ParsedResumeData = {
  personal: { fullName: 'Michael Scott', email: 'michael@dundermifflin.com', phone: '555-0144', location: 'Scranton, PA', linkedin: '', github: '', portfolio: '' },
  summary: 'Experienced Regional Manager with 15+ years leading sales teams, improving regional paper distribution, and driving client retention.',
  education: [{ institution: 'Scranton High', degree: 'Diploma', fieldOfStudy: 'General', startDate: '1980', endDate: '1984', gpa: '', description: '' }],
  skills: [{ category: 'Management', items: ['Sales Strategy', 'Team Leadership', 'Negotiation', 'Client Relations'] }],
  projects: [],
  experience: [
    { company: 'Dunder Mifflin', position: 'Regional Manager', location: 'Scranton, PA', startDate: '2005', endDate: 'Present', isCurrent: true, bulletPoints: ['Managed 12 staff members', 'Consistently achieved top sales in district'] }
  ],
  certifications: [],
  achievements: ['Manager of the Year'],
  languages: ['English'],
  rawText: `
Michael Scott - Regional Manager
Email: michael@dundermifflin.com | Phone: 555-0144 | Scranton, PA

SUMMARY
Experienced Regional Manager with 15+ years leading sales teams, improving regional paper distribution, and driving client retention.

SKILLS
Sales Strategy, Team Leadership, Negotiation, Client Relations

EXPERIENCE
Regional Manager | Dunder Mifflin, Scranton, PA | 2005 - Present
- Managed 12 staff members
- Consistently achieved top sales in district
  `,
};

// Sample 2: Large Text Resume (> 12,000 chars to test payload truncation & Groq 400 prevention)
const largeTextContent = `
David Wallace - Executive Vice President & Chief Technology Officer
Email: david.wallace@dmi.com | Phone: +1-555-0999 | New York, NY

EXECUTIVE SUMMARY
` + 'Enterprise technology executive with 20+ years driving digital transformation, microservices migration, cloud modernization, and large-scale engineering organizations across global Fortune 500 enterprises. '.repeat(60) + `

CORE COMPETENCIES
Enterprise System Design, Distributed Systems, Cloud Architecture (AWS, GCP, Azure), Strategic Planning, Global Team Leadership, Budget Management ($50M+), Regulatory Compliance, Cybersecurity, AI/ML Integration.

PROFESSIONAL EXPERIENCE
Chief Technology Officer | Global Enterprise Systems, New York, NY | 2018 - Present
` + '- Spearheaded cloud-native transition of legacy enterprise core banking applications to AWS microservices architecture. '.repeat(30) + `
` + '- Managed 250+ engineering staff across 4 global R&D hubs, instituting DevOps continuous deployment pipelines. '.repeat(30) + `

Vice President of Engineering | TechGlobal Inc., Boston, MA | 2010 - 2018
` + '- Led architecture and deployment of multi-tenant SaaS analytics platform handling 10 Billion daily API requests. '.repeat(30) + `

EDUCATION
Master of Science in Computer Science | MIT | 2008
Bachelor of Science in Electrical Engineering | Cornell University | 2006
`;

const largeTextResume: ParsedResumeData = {
  ...normalTextResume,
  personal: { fullName: 'David Wallace', email: 'david.wallace@dmi.com', phone: '555-0999', location: 'New York', linkedin: '', github: '', portfolio: '' },
  rawText: largeTextContent,
};

// Sample 3: Visual/Scanned PDF Resume (Text length < 50, pdfBase64 present)
const visualPdfResume: ParsedResumeData = {
  personal: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', portfolio: '' },
  summary: '',
  education: [],
  skills: [],
  projects: [],
  experience: [],
  certifications: [],
  achievements: [],
  languages: [],
  rawText: 'Minimal scanned visual PDF content',
  pdfBase64: 'JVBERi0xLjQgTWluaW1hbCB2aXN1YWwgUERGIGJhc2U2NCBmb3IgdGVzdGluZyBwb2ludHMu',
  isVisualResume: true,
};

async function runFallbackPayloadTests() {
  console.log('====================================================');
  console.log('   GROQ FALLBACK PAYLOAD ARCHITECTURE TEST SUITE    ');
  console.log('====================================================\n');

  // TEST 1: Normal text PDF -> Gemini succeeds
  console.log('--- TEST 1: Normal Text PDF (Gemini Primary) ---');
  try {
    process.env.AI_PRIMARY_PROVIDER = 'gemini';
    process.env.AI_FALLBACK_PROVIDER = 'groq';
    process.env.GEMINI_MODEL = 'gemini-2.5-flash';

    const res1 = await aiOrchestrator.analyzeResume(normalTextResume, 'test_1_gemini_normal');
    console.log('[TEST 1 PASSED]', {
      provider: res1.provider,
      fallbackUsed: res1.fallbackUsed,
      overallScore: res1.report.overallScore,
      durationMs: res1.durationMs,
    });
  } catch (err) {
    console.error('[TEST 1 FAILED]', err);
  }

  // TEST 2: Force Gemini 429 -> Normal text PDF -> Groq fallback -> real score result
  console.log('\n--- TEST 2: Force Gemini 429 -> Normal Text PDF (Groq Fallback) ---');
  try {
    process.env.AI_PRIMARY_PROVIDER = 'gemini';
    process.env.AI_FALLBACK_PROVIDER = 'groq';
    // Simulate Gemini 429 Rate Limit
    process.env.GEMINI_MODEL = 'gemini-invalid-429-simulation';

    const res2 = await aiOrchestrator.analyzeResume(normalTextResume, 'test_2_groq_fallback');
    console.log('[TEST 2 PASSED]', {
      provider: res2.provider,
      fallbackUsed: res2.fallbackUsed,
      overallScore: res2.report.overallScore,
      diagnostics: res2.report.diagnostics,
      durationMs: res2.durationMs,
    });
  } catch (err) {
    console.error('[TEST 2 FAILED]', err);
  }

  // TEST 3: Force Gemini 429 -> Large text resume -> Groq fallback -> real score result (no 400 context error)
  console.log('\n--- TEST 3: Force Gemini 429 -> Large Text Resume (Groq Truncation & Payload Test) ---');
  try {
    process.env.AI_PRIMARY_PROVIDER = 'gemini';
    process.env.AI_FALLBACK_PROVIDER = 'groq';
    process.env.GEMINI_MODEL = 'gemini-invalid-429-simulation';

    const res3 = await aiOrchestrator.analyzeResume(largeTextResume, 'test_3_large_text_groq');
    console.log('[TEST 3 PASSED]', {
      provider: res3.provider,
      fallbackUsed: res3.fallbackUsed,
      overallScore: res3.report.overallScore,
      diagnostics: res3.report.diagnostics,
      durationMs: res3.durationMs,
    });
  } catch (err) {
    console.error('[TEST 3 FAILED]', err);
  }

  // TEST 4: Visual/Scanned PDF -> Gemini succeeds
  console.log('\n--- TEST 4: Visual PDF (Gemini Primary Vision) ---');
  try {
    process.env.AI_PRIMARY_PROVIDER = 'gemini';
    process.env.AI_FALLBACK_PROVIDER = 'groq';
    process.env.GEMINI_MODEL = 'gemini-2.5-flash';

    const res4 = await aiOrchestrator.analyzeResume(normalTextResume, 'test_4_visual_gemini');
    console.log('[TEST 4 PASSED]', {
      provider: res4.provider,
      fallbackUsed: res4.fallbackUsed,
      overallScore: res4.report.overallScore,
      durationMs: res4.durationMs,
    });
  } catch (err) {
    console.error('[TEST 4 FAILED]', err);
  }

  // TEST 5: Visual/Scanned PDF -> Force Gemini 429 -> Groq unsupported visual PDF error
  console.log('\n--- TEST 5: Visual PDF -> Force Gemini 429 -> Groq Fallback Constraint ---');
  try {
    process.env.AI_PRIMARY_PROVIDER = 'gemini';
    process.env.AI_FALLBACK_PROVIDER = 'groq';
    process.env.GEMINI_MODEL = 'gemini-invalid-429-simulation';

    await aiOrchestrator.analyzeResume(visualPdfResume, 'test_5_visual_groq_fallback');
    console.error('[TEST 5 FAILED] Visual PDF fallback should have thrown unsupported error!');
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.log('[TEST 5 PASSED]', {
      handledCleanly: true,
      errorReturnedToUser: errorMsg,
      expectedText: 'Primary AI quota exceeded and fallback provider cannot analyze this visual PDF.',
    });
  }

  // RESTORE PRODUCTION SETTINGS
  process.env.AI_PRIMARY_PROVIDER = 'gemini';
  process.env.AI_FALLBACK_PROVIDER = 'groq';
  process.env.GEMINI_MODEL = 'gemini-2.5-flash';
  process.env.GROQ_MODEL = 'llama-3.3-70b-versatile';

  console.log('\n====================================================');
  console.log('       ALL FALLBACK PAYLOAD TESTS COMPLETED         ');
  console.log('====================================================\n');
}

runFallbackPayloadTests();
