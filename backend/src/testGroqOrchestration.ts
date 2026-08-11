import { aiOrchestrator } from './ai/aiOrchestrator';
import { logStartupDiagnostics } from './ai/config';
import { ParsedResumeData } from './types/resume';

const sampleResumeData: ParsedResumeData = {
  personal: {
    fullName: 'Alex Vance',
    email: 'alex.vance@tech.dev',
    phone: '+1-555-0199',
    location: 'Austin, TX',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  summary: 'Senior Cloud Solutions Architect with 8+ years specializing in AWS microservices, Kubernetes orchestration, and Golang backend infrastructure.',
  education: [
    {
      institution: 'UT Austin',
      degree: 'B.S. Computer Engineering',
      fieldOfStudy: 'Engineering',
      startDate: '2012',
      endDate: '2016',
      gpa: '3.9',
      description: '',
    },
  ],
  skills: [
    {
      category: 'Cloud & Infrastructure',
      items: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Golang', 'Python', 'PostgreSQL', 'Redis'],
    },
  ],
  projects: [],
  experience: [
    {
      company: 'CloudScale Systems',
      position: 'Lead Cloud Architect',
      location: 'Austin, TX',
      startDate: '2020',
      endDate: 'Present',
      isCurrent: true,
      bulletPoints: [
        'Designed high-throughput Kubernetes ingress controller processing 2.5B requests daily.',
        'Reduced AWS infrastructure spend by $340,000 annually through automated spot instance scheduling.',
      ],
    },
  ],
  certifications: ['AWS Certified Solutions Architect Professional'],
  achievements: [],
  languages: ['English'],
  rawText: `
Alex Vance - Senior Cloud Solutions Architect
Email: alex.vance@tech.dev | Phone: +1-555-0199 | Austin, TX

SUMMARY
Senior Cloud Solutions Architect with 8+ years specializing in AWS microservices, Kubernetes orchestration, and Golang backend infrastructure.

EXPERIENCE
Lead Cloud Architect | CloudScale Systems, Austin, TX | 2020 - Present
- Designed high-throughput Kubernetes ingress controller processing 2.5B requests daily.
- Reduced AWS infrastructure spend by $340,000 annually through automated spot instance scheduling.

EDUCATION
B.S. Computer Engineering | UT Austin | 2012 - 2016 (GPA: 3.9)
  `,
};

async function runGroqOrchestrationTests() {
  console.log('====================================================');
  console.log('    GROQ FALLBACK & ORCHESTRATION TEST SUITE        ');
  console.log('====================================================\n');

  // Diagnostic Log Test
  logStartupDiagnostics();

  // PHASE 1: Direct Groq Primary Execution Test
  console.log('--- PHASE 1: Direct Groq Execution (Primary = Groq) ---');
  process.env.AI_PRIMARY_PROVIDER = 'groq';
  process.env.AI_FALLBACK_PROVIDER = 'gemini';

  try {
    const startTime = Date.now();
    const resultGroq = await aiOrchestrator.analyzeResume(sampleResumeData, 'test_direct_groq');
    console.log('[Phase 1 Success]', {
      provider: resultGroq.provider,
      fallbackUsed: resultGroq.fallbackUsed,
      overallScore: resultGroq.report.overallScore,
      durationMs: resultGroq.durationMs,
    });
  } catch (err) {
    console.error('[Phase 1 Error]', err);
  }

  // PHASE 2: Gemini Primary Fail -> Groq Fallback Test
  console.log('\n--- PHASE 2: Gemini Failure -> Groq Fallback Execution ---');
  process.env.AI_PRIMARY_PROVIDER = 'gemini';
  process.env.AI_FALLBACK_PROVIDER = 'groq';
  // Force Gemini failure using invalid model
  process.env.GEMINI_MODEL = 'gemini-invalid-model-for-testing';

  try {
    const startTime = Date.now();
    const resultFallback = await aiOrchestrator.analyzeResume(sampleResumeData, 'test_fallback_groq');
    console.log('[Phase 2 Success]', {
      provider: resultFallback.provider,
      fallbackUsed: resultFallback.fallbackUsed,
      overallScore: resultFallback.report.overallScore,
      durationMs: resultFallback.durationMs,
    });
  } catch (err) {
    console.error('[Phase 2 Error]', err);
  }

  // PHASE 3: Groq Error Logging Test (Simulating Groq 401 Invalid Key)
  console.log('\n--- PHASE 3: Groq Error Logging Verification (Invalid Groq Key) ---');
  process.env.AI_PRIMARY_PROVIDER = 'groq';
  process.env.GROQ_API_KEY = 'gsk_invalid_key_for_testing_1234567890';

  try {
    await aiOrchestrator.analyzeResume(sampleResumeData, 'test_groq_error_401');
    console.error('[Phase 3 Failure] Groq expected to fail but passed!');
  } catch (err) {
    console.log('[Phase 3 Handled Cleanly]', err instanceof Error ? err.message : String(err));
  }

  // RESTORE ENVIRONMENT VARIABLES TO VALID PRODUCTION SETTINGS
  console.log('\n--- RESTORING PRODUCTION CONFIGURATION ---');
  process.env.AI_PRIMARY_PROVIDER = 'gemini';
  process.env.AI_FALLBACK_PROVIDER = 'groq';
  process.env.GEMINI_MODEL = 'gemini-2.5-flash';
  process.env.GROQ_MODEL = 'llama-3.3-70b-versatile';
  // Reload dotenv to restore valid keys from backend/.env
  require('dotenv').config();

  console.log('\n====================================================');
  console.log('      ALL ORCHESTRATION TESTS COMPLETED            ');
  console.log('====================================================\n');
}

runGroqOrchestrationTests();
