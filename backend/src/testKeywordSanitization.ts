import { processKeywords } from './services/deterministicScorer';
import { ParsedResumeData } from './types/resume';

console.log('================================================================');
console.log('            TESTING KEYWORD EXTRACTION & SANITIZATION           ');
console.log('================================================================\n');

const pythonResume: ParsedResumeData = {
  personal: {
    fullName: 'Aditya Sahu',
    email: 'aditya@example.com',
    phone: '+91 9999999999',
    location: 'Delhi',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  summary: 'Python and Data Engineer with experience in Django, PostgreSQL, and AWS.',
  education: [],
  skills: [
    {
      category: 'Languages & Frameworks',
      items: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'AWS', 'Docker'],
    },
  ],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
  rawText: 'Python Developer with Django, FastAPI, PostgreSQL, AWS, and Docker.',
  isVisualResume: false,
};

// Simulated AI output that contains bad section names as missing keywords and duplicate detected keywords
const rawAIOutput = {
  detectedKeywords: ['Python', 'Docker', 'Kubernetes'],
  missingKeywords: [
    'Work Experience', // BAD - section name!
    'Technical Skills', // BAD - section name!
    'Education', // BAD - section name!
    'Python', // BAD - already detected!
    'Redis', // VALID
    'GraphQL', // VALID
    'CI/CD', // VALID
  ],
};

const result = processKeywords(
  rawAIOutput.missingKeywords,
  rawAIOutput.detectedKeywords,
  pythonResume
);

console.log('Detected Keywords:', result.detectedKeywords);
console.log('Missing Keywords:', result.missingKeywords);

// Assertions:
// 1. Detected keywords must contain Python, Django, FastAPI, PostgreSQL, AWS, Docker, Kubernetes
const expectedDetected = ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'];
const hasAllDetected = expectedDetected.every((k) => result.detectedKeywords.includes(k));

// 2. Missing keywords must NOT contain 'Work Experience', 'Technical Skills', 'Education', 'Python'
const hasNoBadMissing =
  !result.missingKeywords.includes('Work Experience') &&
  !result.missingKeywords.includes('Technical Skills') &&
  !result.missingKeywords.includes('Education') &&
  !result.missingKeywords.includes('Python');

// 3. Missing keywords should contain Redis, GraphQL, CI/CD
const hasGoodMissing =
  result.missingKeywords.includes('Redis') &&
  result.missingKeywords.includes('GraphQL') &&
  result.missingKeywords.includes('CI/CD');

if (hasAllDetected && hasNoBadMissing && hasGoodMissing) {
  console.log('\n>>> ALL KEYWORD SANITIZATION TESTS PASSED! <<<');
} else {
  console.error('\n>>> KEYWORD SANITIZATION TESTS FAILED! <<<');
  console.error({ hasAllDetected, hasNoBadMissing, hasGoodMissing });
  process.exit(1);
}
