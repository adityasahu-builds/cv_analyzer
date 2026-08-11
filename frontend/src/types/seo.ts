export interface SiteSEO {
  title: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    github: string;
    docs?: string;
  };
  keywords: string[];
}
