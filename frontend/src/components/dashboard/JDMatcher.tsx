'use client';

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ParsedResumeData, JobMatchResult } from '@/types/resume';

interface JDMatcherProps {
  resumeData?: ParsedResumeData;
  missingKeywords?: string[];
}

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

export const JDMatcher: React.FC<JDMatcherProps> = ({ resumeData }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);

  const handleRunMatch = async () => {
    const trimmed = jobDescription.trim();
    setError(null);
    setMatchResult(null);

    // 1. Validation
    if (trimmed.length < 20) {
      setError('Please enter a valid job description with enough role information to analyze.');
      return;
    }
    const words = trimmed.split(/\s+/).filter((w) => w.length > 1);
    if (words.length < 5) {
      setError('Please enter a valid job description with enough role information to analyze.');
      return;
    }

    const hasExtremelyLongWord = words.some(
      (w) => w.length > 25 && !w.startsWith('http') && !w.includes('/') && !w.includes('.') && !w.includes('-')
    );
    const vowelMatch = trimmed.match(/[aeiouyAEIOUY]/g);
    const vowelRatio = vowelMatch ? vowelMatch.length / trimmed.length : 0;
    if (hasExtremelyLongWord || (vowelRatio < 0.1 && trimmed.length > 30)) {
      setError('Please enter a valid job description with enough role information to analyze.');
      return;
    }

    if (!resumeData) {
      setError('No resume data loaded. Please upload a resume first.');
      return;
    }

    setIsMatching(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/analyze/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeData,
          jobDescription: trimmed,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const resJson = await response.json();
      if (!resJson.success || !resJson.data) {
        throw new Error(resJson.error || 'Analysis returned invalid response');
      }

      setMatchResult(resJson.data);
    } catch (err: any) {
      console.error('[JDMatcher Error]:', err);
      setError('Unable to analyze this job description right now. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  const scoreColor =
    matchResult && matchResult.matchScore >= 85
      ? 'text-[#059669]'
      : matchResult && matchResult.matchScore >= 70
      ? 'text-[#059669]'
      : 'text-amber-600';

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[14px] shadow-token p-6">
      <div className="mb-5 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#059669]" />
          <h3 className="text-base font-bold text-[#1A1A1A]">Job Description Matcher</h3>
        </div>
        <p className="text-xs text-[#6B7280]">
          Paste a target job posting below to run multi-dimensional skill alignment scoring against your resume.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-[10px] text-xs text-red-700 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Input */}
      <div className="space-y-3 mb-4">
        <textarea
          rows={5}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description requirements, responsibilities, or technical skills list..."
          className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-[10px] p-4 text-xs text-[#1A1A1A] placeholder-[#6B7280] focus:outline-none focus:border-[#059669] leading-relaxed resize-y"
        />
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleRunMatch}
            disabled={!jobDescription.trim() || isMatching}
            isLoading={isMatching}
          >
            {isMatching ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Job Match...</>
            ) : (
              'Analyze Role Match'
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {matchResult && (
        <div className="border border-[#E5E7EB] bg-[#F7F8FA] rounded-[10px] overflow-hidden animate-in fade-in duration-200">
          {/* Score header */}
          <div className="flex flex-col gap-3 px-5 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-5">
              <div className="text-center shrink-0">
                <div className={`text-4xl font-black ${scoreColor}`}>{matchResult.matchScore}%</div>
                <div className="text-[10px] text-[#6B7280] uppercase font-bold tracking-wider mt-0.5">Role Match</div>
              </div>
              <div>
                <p className="text-sm font-bold text-[#1A1A1A]">
                  {matchResult.roleTitle ? `Target Role: ${matchResult.roleTitle}` : 'Target role could not be confidently identified.'}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">{matchResult.summary}</p>
              </div>
            </div>
            {matchResult.experienceAlignment && (
              <div className="mt-2 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[8px] p-3 text-xs text-[#6B7280] leading-relaxed">
                <span className="font-bold text-[#1A1A1A] block mb-1">Experience Alignment:</span>
                {matchResult.experienceAlignment}
              </div>
            )}
          </div>

          {/* Skills breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB]">
            <div className="p-4">
              <p className="text-xs font-bold text-[#059669] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" /> Matched Role Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {matchResult.matchedSkills.length > 0 ? (
                  matchResult.matchedSkills.map((sk, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-[#059669]/10 border border-[#059669]/20 text-[#059669] rounded-[6px] font-semibold">
                      ✓ {sk}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#6B7280] italic">No matching skills identified.</span>
                )}
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Missing Role Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {matchResult.missingSkills.length > 0 ? (
                  matchResult.missingSkills.map((sk, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-[6px] font-semibold">
                      ⚠ {sk}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#6B7280] italic">No missing skills identified.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

