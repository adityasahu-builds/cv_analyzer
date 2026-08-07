import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/constants/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/#features', '/#ats-analyzer', '/#jd-matcher', '/#target-users'].map(
    (route) => ({
      url: `${SITE_CONFIG.url}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : 0.8,
    })
  );

  return routes;
}
