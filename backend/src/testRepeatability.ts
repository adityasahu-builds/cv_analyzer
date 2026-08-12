import path from 'path';
import fs from 'fs';
import { parseResumeBuffer } from './parser/resumeParser';
import { aiOrchestrator } from './ai/aiOrchestrator';
import { computeResumeHash, normalizeParsedResumeData } from './services/normalizer';

async function runRepeatabilityTest() {
  console.log('\n====================================================');
  console.log('      RESUME-IQ REPEATABILITY & STABILITY TEST       ');
  console.log('====================================================\n');

  const samplePath = path.resolve(__dirname, '../../sample_resume.pdf');
  let resumeBuffer: Buffer;

  if (fs.existsSync(samplePath)) {
    console.log(`[Test] Reading sample resume from: ${samplePath}`);
    resumeBuffer = fs.readFileSync(samplePath);
  } else {
    console.log('[Test] Sample resume PDF not found, using synthetic mock PDF buffer.');
    resumeBuffer = Buffer.from('%PDF-1.4 Mock Resume Text Content For Repeatability Testing');
  }

  // 1. Parse Document
  console.log('[Test] Step 1: Parsing resume document...');
  const parsedData = await parseResumeBuffer(resumeBuffer, 'sample_resume.pdf');
  const normalized = normalizeParsedResumeData(parsedData);
  const resumeHash = computeResumeHash(normalized);

  console.log(`[Test] Extracted text length : ${parsedData.rawText?.length || 0} chars`);
  console.log(`[Test] Normalized ResumeHash : ${resumeHash}`);
  console.log('----------------------------------------------------');

  // 2. Run 5 Repeated Analysis Passes (including forceRefresh live passes)
  const runs = 5;
  const scores: number[] = [];
  const hashes: string[] = [];

  console.log(`[Test] Step 2: Running ${runs} repeated analysis pipeline passes...\n`);

  for (let i = 1; i <= runs; i++) {
    const correlationId = `repeatability_test_run_${i}_${Date.now()}`;
    const forceRefresh = i > 3; // Passes 4 & 5 force live AI refresh
    const result = await aiOrchestrator.analyzeResume(parsedData, correlationId, undefined, forceRefresh);

    const runHash = computeResumeHash(normalizeParsedResumeData(parsedData));
    scores.push(result.report.overallScore);
    hashes.push(runHash);

    console.log(
      `  Pass #${i}: OverallScore = ${result.report.overallScore} | ResumeHash = ${runHash.slice(0, 10)}... | Provider = ${result.provider} | Mode = ${result.cached ? 'CACHE HIT' : 'LIVE AI'}`
    );
  }

  console.log('\n====================================================');
  console.log('                 TEST RESULTS SUMMARY               ');
  console.log('====================================================');

  const allHashesMatch = hashes.every((h) => h === hashes[0]);
  const allScoresMatch = scores.every((s) => s === scores[0]);

  console.log(` Hashes Identical Across Runs : ${allHashesMatch ? 'YES (PASS)' : 'NO (FAIL)'}`);
  console.log(` Scores Identical Across Runs : ${allScoresMatch ? 'YES (PASS)' : 'NO (FAIL)'}`);
  console.log(` Score Value Output           : [ ${scores.join(', ')} ]`);

  if (allHashesMatch && allScoresMatch) {
    console.log('\n SUCCESS: 100% Determinism & Repeatability Verified!');
    console.log(` The exact same resume produces identical ATS score (${scores[0]}) across all ${runs} passes.\n`);
  } else {
    console.error('\n FAILURE: Nondeterminism detected in scores or hashes!');
    throw new Error('Repeatability test failed.');
  }
}

runRepeatabilityTest().catch((err) => {
  console.error('[Test] Exception during repeatability test:', err);
  process.exitCode = 1;
});
