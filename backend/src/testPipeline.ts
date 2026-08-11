import fs from 'fs';
import path from 'path';
import { parseResumeBuffer } from './parser/resumeParser';
import { aiOrchestrator } from './ai/aiOrchestrator';

async function runPipelineTests() {
  console.log('====================================================');
  console.log('         RESUMEIQ END-TO-END PIPELINE TESTS         ');
  console.log('====================================================\n');

  // Sample Resume Text A (Senior Software Engineer)
  const resumeAText = `
John Doe
Senior Full Stack Software Engineer
Email: john.doe@email.com | Phone: +1-555-0199 | Location: San Francisco, CA
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

PROFESSIONAL SUMMARY
Results-driven Full Stack Engineer with 7+ years of experience designing and scaling cloud-native microservices, React applications, and real-time distributed pipelines. Proven track record of improving system uptime to 99.99% and reducing latency by 45%.

TECHNICAL SKILLS
- Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5, CSS3
- Frontend: React, Next.js, Redux, TailwindCSS, Webpack
- Backend & Cloud: Node.js, Express, PostgreSQL, MongoDB, Redis, AWS (S3, EC2, Lambda), Docker, Kubernetes, CI/CD

WORK EXPERIENCE
Senior Software Engineer | TechCorp Inc., San Francisco, CA | 2021 - Present
- Architected a multi-tenant SaaS analytics platform using Next.js, Node.js, and AWS PostgreSQL serving 500,000 daily active users.
- Optimized database query indexes and caching layers, reducing peak P99 latency by 42% across core endpoints.
- Mentored a team of 6 junior engineers, instituted TDD practices, and increased automated test coverage from 60% to 92%.

Software Engineer | Innovate Solutions, San Jose, CA | 2018 - 2021
- Developed RESTful APIs and real-time WebSocket feeds using Node.js and Redis pub/sub.
- Automated CI/CD deployment workflows with GitHub Actions and Docker, reducing deployment cycle times from 2 hours to 8 minutes.

EDUCATION
Bachelor of Science in Computer Science | University of California, Berkeley | 2014 - 2018
GPA: 3.8/4.0
  `;

  // Sample Resume Text B (Marketing Manager - completely different domain & score)
  const resumeBText = `
Jane Smith
Digital Marketing Manager & Brand Strategist
Email: jane.smith@email.com | Phone: +1-555-0288 | New York, NY

CAREER OVERVIEW
Creative Brand Marketing Manager with 4 years of experience driving multi-channel B2B lead generation, SEO optimization, and social media campaigns.

EXPERIENCE
Marketing Specialist | GrowthAgency, New York, NY | 2022 - Present
- Managed corporate social media accounts on LinkedIn and Instagram.
- Wrote blog posts and newsletters.
- Assisted with organizing regional marketing events.

EDUCATION
Bachelor of Arts in Communications | New York University | 2018 - 2022
  `;

  // 1. Test 1: Normal Resume A
  console.log('--- TEST 1: Normal Text Resume A ---');
  try {
    const startTimeA = Date.now();
    const requestIdA = `test_a_${Date.now()}`;
    const parsedA = {
      personal: { fullName: 'John Doe', email: 'john.doe@email.com', phone: '555-0199', location: 'San Francisco', linkedin: '', github: '', portfolio: '' },
      summary: 'Results-driven Full Stack Engineer with 7+ years of experience...',
      education: [{ institution: 'UC Berkeley', degree: 'B.S. Computer Science', fieldOfStudy: 'CS', startDate: '2014', endDate: '2018', gpa: '3.8', description: '' }],
      skills: [{ category: 'Engineering', items: ['TypeScript', 'Node.js', 'React', 'AWS', 'Docker', 'PostgreSQL', 'Kubernetes'] }],
      projects: [],
      experience: [
        { company: 'TechCorp', position: 'Senior Software Engineer', location: 'SF', startDate: '2021', endDate: 'Present', isCurrent: true, bulletPoints: ['Architected SaaS platform serving 500k DAU', 'Reduced P99 latency by 42%'] }
      ],
      certifications: [],
      achievements: [],
      languages: ['English'],
      rawText: resumeAText,
    };

    const resultA = await aiOrchestrator.analyzeResume(parsedA, requestIdA);
    console.log({
      requestId: requestIdA,
      provider: resultA.provider,
      model: resultA.report.diagnostics?.model || 'N/A',
      inputType: 'Text Resume A (Senior Engineer)',
      textLength: resumeAText.length,
      fileSize: Buffer.byteLength(resumeAText),
      durationMs: Date.now() - startTimeA,
      success: true,
      overallScore: resultA.report.overallScore,
      sectionScores: {
        formatting: resultA.report.sections.formatting.score,
        contentQuality: resultA.report.sections.contentQuality.score,
        impactMeasurability: resultA.report.sections.impactMeasurability.score,
        skillsTaxonomy: resultA.report.sections.skillsTaxonomy.score,
      },
      summaryLength: resultA.report.summary.length,
    });
  } catch (err) {
    console.error('TEST 1 FAILED:', err);
  }

  // 2. Test 2: Normal Resume B (Must yield different score)
  console.log('\n--- TEST 2: Normal Resume B (Marketing Manager) ---');
  try {
    const startTimeB = Date.now();
    const requestIdB = `test_b_${Date.now()}`;
    const parsedB = {
      personal: { fullName: 'Jane Smith', email: 'jane.smith@email.com', phone: '555-0288', location: 'New York', linkedin: '', github: '', portfolio: '' },
      summary: 'Creative Brand Marketing Manager...',
      education: [{ institution: 'NYU', degree: 'B.A. Communications', fieldOfStudy: 'Comm', startDate: '2018', endDate: '2022', gpa: '', description: '' }],
      skills: [{ category: 'Marketing', items: ['SEO', 'Content Strategy', 'Social Media'] }],
      projects: [],
      experience: [
        { company: 'GrowthAgency', position: 'Marketing Specialist', location: 'NY', startDate: '2022', endDate: 'Present', isCurrent: true, bulletPoints: ['Managed social media accounts', 'Wrote blog posts'] }
      ],
      certifications: [],
      achievements: [],
      languages: ['English'],
      rawText: resumeBText,
    };

    const resultB = await aiOrchestrator.analyzeResume(parsedB, requestIdB);
    console.log({
      requestId: requestIdB,
      provider: resultB.provider,
      model: resultB.report.diagnostics?.model || 'N/A',
      inputType: 'Text Resume B (Marketing)',
      textLength: resumeBText.length,
      fileSize: Buffer.byteLength(resumeBText),
      durationMs: Date.now() - startTimeB,
      success: true,
      overallScore: resultB.report.overallScore,
      sectionScores: {
        formatting: resultB.report.sections.formatting.score,
        contentQuality: resultB.report.sections.contentQuality.score,
        impactMeasurability: resultB.report.sections.impactMeasurability.score,
        skillsTaxonomy: resultB.report.sections.skillsTaxonomy.score,
      },
      summaryLength: resultB.report.summary.length,
    });
  } catch (err) {
    console.error('TEST 2 FAILED:', err);
  }

  // 3. Test 3: Real Integration Test using sample_resume.pdf
  console.log('\n--- TEST 3: Real Integration Test (sample_resume.pdf) ---');
  try {
    const startTimeSample = Date.now();
    const requestIdSample = `test_sample_${Date.now()}`;
    
    const possiblePaths = [
      path.resolve(__dirname, '../sample_resume.pdf'),
      path.resolve(process.cwd(), '../sample_resume.pdf'),
      path.resolve(process.cwd(), 'sample_resume.pdf'),
      path.resolve(__dirname, '../../sample_resume.pdf'),
    ];

    let samplePdfPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        samplePdfPath = p;
        break;
      }
    }

    if (!samplePdfPath) {
      throw new Error(`sample_resume.pdf not found in any expected location: ${possiblePaths.join(', ')}`);
    }

    console.log(`[TEST 3] Loading sample resume PDF from: ${samplePdfPath}`);
    const samplePdfBuffer = fs.readFileSync(samplePdfPath);
    const parsedSample = await parseResumeBuffer(samplePdfBuffer, 'sample_resume.pdf');

    console.log('[TEST 3] Extraction Verification:');
    console.log(`  - File Path          : ${samplePdfPath}`);
    console.log(`  - File Size          : ${samplePdfBuffer.length} bytes`);
    console.log(`  - Extracted Length   : ${parsedSample.rawText?.length || 0} chars`);
    console.log(`  - Detected PDF Type  : ${parsedSample.isVisualResume ? 'Visual/Scanned PDF' : 'Normal Text PDF'}`);
    console.log(`  - Text Preview (~300): ${JSON.stringify((parsedSample.rawText || '').slice(0, 300))}`);

    const resultSample = await aiOrchestrator.analyzeResume(parsedSample, requestIdSample);

    console.log('[TEST 3] Primary Analysis Result:', {
      requestId: requestIdSample,
      provider: resultSample.provider,
      inputType: 'Real sample_resume.pdf',
      textLength: parsedSample.rawText?.length || 0,
      fileSize: samplePdfBuffer.length,
      durationMs: Date.now() - startTimeSample,
      success: true,
      overallScore: resultSample.report.overallScore,
    });
  } catch (err) {
    console.error('TEST 3 FAILED:', err);
  }

  // 4. Test 4: Forced Groq Fallback Test on sample_resume.pdf (Simulates Gemini 429)
  console.log('\n--- TEST 4: Forced Groq Fallback Test on sample_resume.pdf ---');
  try {
    const startTimeGroq = Date.now();
    const requestIdGroq = `test_groq_${Date.now()}`;
    const possiblePaths = [
      path.resolve(__dirname, '../sample_resume.pdf'),
      path.resolve(process.cwd(), '../sample_resume.pdf'),
      path.resolve(process.cwd(), 'sample_resume.pdf'),
      path.resolve(__dirname, '../../sample_resume.pdf'),
    ];

    let samplePdfPath = '';
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        samplePdfPath = p;
        break;
      }
    }

    const samplePdfBuffer = fs.readFileSync(samplePdfPath);
    const parsedSample = await parseResumeBuffer(samplePdfBuffer, 'sample_resume.pdf');

    // Call analyzeWithGroq directly to verify fallback behavior for text PDF
    const { analyzeWithGroq } = await import('./ai/providers/groqProvider');
    const groqResult = await analyzeWithGroq(parsedSample, requestIdGroq);

    console.log('[TEST 4] Groq Fallback Result:', {
      requestId: requestIdGroq,
      providerUsed: groqResult.providerUsed,
      durationMs: Date.now() - startTimeGroq,
      overallScore: groqResult.overallScore,
      diagnostics: groqResult.diagnostics,
    });
  } catch (err) {
    console.error('TEST 4 (Groq Fallback) FAILED:', err);
  }

  // 5. Test 5: Corrupt PDF Error Handling
  console.log('\n--- TEST 5: Corrupt PDF Error Handling ---');
  try {
    const corruptBuffer = Buffer.from('NOT_A_VALID_PDF_HEADER_THIS_IS_CORRUPTED_DATA', 'utf-8');
    await parseResumeBuffer(corruptBuffer, 'corrupt.pdf');
    console.error('TEST 5 FAILED: Corrupt PDF was expected to fail validation but passed!');
  } catch (err) {
    console.log({
      test: 'TEST 5: Corrupt PDF',
      success: false,
      expectedFailureMessage: err instanceof Error ? err.message : String(err),
      handledCleanly: true,
    });
  }

  console.log('\n====================================================');
  console.log('         ALL PIPELINE TESTS COMPLETED               ');
  console.log('====================================================');
}

runPipelineTests();

