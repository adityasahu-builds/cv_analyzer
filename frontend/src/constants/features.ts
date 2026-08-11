import { FeaturePreview, UserTargetAudience } from '@/types';

export const TARGET_AUDIENCES: UserTargetAudience[] = [
  {
    id: 'students',
    role: 'Student',
    description: 'Structure internship & entry-level projects to pass strict applicant tracking systems.',
    iconName: 'GraduationCap',
  },
  {
    id: 'developers',
    role: 'Developer',
    description: 'Highlight technical stacks, GitHub contributions, and system architectures accurately.',
    iconName: 'Code2',
  },
  {
    id: 'job-seekers',
    role: 'Job Seeker',
    description: 'Tailor executive and mid-level resumes directly against target Job Descriptions.',
    iconName: 'Briefcase',
  },
  {
    id: 'recruiters',
    role: 'Recruiter',
    description: 'Audit candidates and quickly spot keyword density, missing competencies, and red flags.',
    iconName: 'Users',
  },
];

export const FEATURE_PREVIEWS: FeaturePreview[] = [
  {
    id: 'ats-analysis',
    title: 'ATS Parser & Compatibility Engine',
    description: 'Simulate parsing across major enterprise ATS solutions (Greenhouse, Lever, Workday) with instant formatting diagnostic reports.',
    badge: 'Core Architecture',
    icon: 'Cpu',
  },
  {
    id: 'jd-matching',
    title: 'Semantic Job Description Matcher',
    description: 'Compare CVs against any job vacancy URL or description text using multi-dimensional vector similarity score metrics.',
    badge: 'Precision',
    icon: 'Target',
  },
  {
    id: 'ai-suggestions',
    title: 'Actionable Bullet-Point Refinement',
    description: 'Contextual AI recommendations to convert passive descriptions into high-impact metric-driven accomplishment statements.',
    badge: 'AI Intelligence',
    icon: 'Sparkles',
  },
  {
    id: 'analytics-dashboard',
    title: 'Live Candidate Analytics',
    description: 'Track resume iterations, keyword density, section-by-section breakdown, and readiness indexes over time.',
    badge: 'Real-time',
    icon: 'BarChart3',
  },
];
