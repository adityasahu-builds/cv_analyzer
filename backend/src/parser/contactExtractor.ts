import { PersonalDetails } from '../types/resume';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i;
const GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i;
const PORTFOLIO_REGEX = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.(?:io|dev|me|com|org|net)\b/i;

export function extractPersonalDetails(rawText: string): PersonalDetails {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let fullName = '';
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (!firstLine.includes('@') && !firstLine.includes('http') && firstLine.length < 50) {
      fullName = firstLine.replace(/[^a-zA-Z\s.]/g, '').trim();
    }
  }

  const emailMatch = rawText.match(EMAIL_REGEX);
  const email = emailMatch ? emailMatch[0] : '';

  const phoneMatch = rawText.match(PHONE_REGEX);
  const phone = phoneMatch ? phoneMatch[0] : '';

  const linkedinMatch = rawText.match(LINKEDIN_REGEX);
  const linkedin = linkedinMatch ? linkedinMatch[0] : '';

  const githubMatch = rawText.match(GITHUB_REGEX);
  const github = githubMatch ? githubMatch[0] : '';

  const portfolioMatch = rawText.match(PORTFOLIO_REGEX);
  const portfolio = portfolioMatch && !portfolioMatch[0].includes('github.com') && !portfolioMatch[0].includes('linkedin.com')
    ? portfolioMatch[0]
    : '';

  return {
    fullName,
    email,
    phone,
    location: '',
    linkedin,
    github,
    portfolio,
  };
}
