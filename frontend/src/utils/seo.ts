import { Metadata } from 'next';
import { SITE_CONFIG } from '@/constants/site';

export function constructMetadata({
  title = SITE_CONFIG.title,
  description = SITE_CONFIG.description,
  image = SITE_CONFIG.ogImage,
  icons = '/favicon.ico',
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title: {
      default: title,
      template: `%s | ResumeIQ`,
    },
    description,
    keywords: SITE_CONFIG.keywords,
    authors: [{ name: 'ResumeIQ Architecture Team' }],
    creator: 'ResumeIQ',
    openGraph: {
      title,
      description,
      url: SITE_CONFIG.url,
      siteName: 'ResumeIQ',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@resumeiq',
    },
    icons,
    metadataBase: new URL(SITE_CONFIG.url),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
