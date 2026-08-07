export * from './navigation';
export * from './theme';
export * from './seo';

export interface UserTargetAudience {
  id: string;
  role: 'Student' | 'Developer' | 'Recruiter' | 'Job Seeker';
  description: string;
  iconName: string;
}

export interface FeaturePreview {
  id: string;
  title: string;
  description: string;
  badge?: string;
  icon: string;
}
