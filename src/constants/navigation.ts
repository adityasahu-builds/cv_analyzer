import { NavItem, FooterGroup } from '@/types';

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Features', href: '#features' },
  { label: 'ATS Score', href: '#ats-analyzer', badge: 'v1.0' },
  { label: 'JD Matcher', href: '#jd-matcher' },
  { label: 'Target Roles', href: '#target-users' },
  { label: 'Docs', href: '#docs', external: true },
];

export const FOOTER_NAV_GROUPS: FooterGroup[] = [
  {
    title: 'Product',
    links: [
      { label: 'ATS Scanner', href: '#ats-analyzer' },
      { label: 'JD Matcher', href: '#jd-matcher' },
      { label: 'AI Suggestions', href: '#features' },
      { label: 'Analytics Dashboard', href: '#dashboard' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'For Students', href: '#target-users' },
      { label: 'For Developers', href: '#target-users' },
      { label: 'For Job Seekers', href: '#target-users' },
      { label: 'For Recruiters', href: '#target-users' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'ATS Best Practices', href: '#' },
      { label: 'API Reference', href: '#' },
      { label: 'Release Notes', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
];
