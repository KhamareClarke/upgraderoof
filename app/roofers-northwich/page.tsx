import type { Metadata } from 'next';
import { AreaPageTemplate } from '@/components/AreaPageTemplate';
import { townData } from '@/lib/town-data';

export const dynamic = 'force-static';
export const revalidate = false;

const data = townData['northwich'];

export const metadata: Metadata = {
  title: 'Roofers Northwich | Slate & Period Roofing Specialists CW8 | Upgrade Roofs',
  description: 'Expert roofers in Northwich, CW8/CW9. Slate restoration and subsidence-aware roofing for period properties. 25+ years experience. Based 13 miles away. CORC certified. Free quotes. 01270 897606.',
  keywords: 'roofers northwich, roofer northwich, roof repair northwich, slate roofing northwich, period property roofing CW8',
  openGraph: {
    title: 'Roofers Northwich | Slate & Period Roofing Specialists | Upgrade Roofs',
    description: 'Expert roofers in Northwich, CW8/CW9. Slate restoration and period roofing. Free quotes.',
    url: 'https://www.upgraderoofs.co.uk/roofers-northwich',
    siteName: 'Upgrade Roofs',
    images: [{ url: 'https://www.upgraderoofs.co.uk/images/6.jpeg', width: 1200, height: 630, alt: 'Professional roofers serving Northwich, Cheshire' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofers Northwich | Upgrade Roofs | 01270 897606',
    description: 'Slate and period property roofing in Northwich, CW8/CW9. Free quotes.',
    images: ['https://www.upgraderoofs.co.uk/images/6.jpeg'],
  },
  alternates: { canonical: 'https://www.upgraderoofs.co.uk/roofers-northwich' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <AreaPageTemplate {...data} />;
}