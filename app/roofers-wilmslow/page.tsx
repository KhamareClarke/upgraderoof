import type { Metadata } from 'next';
import { AreaPageTemplate } from '@/components/AreaPageTemplate';
import { townData } from '@/lib/town-data';

export const dynamic = 'force-static';
export const revalidate = false;

const data = townData['wilmslow'];

export const metadata: Metadata = {
  title: 'Roofers Wilmslow | Quality-First Roofing for High-Value Homes SK9 | Upgrade Roofs',
  description: 'Expert roofers in Wilmslow, SK9. Quality-first roofing for executive and high-value homes with complex rooflines. 25+ years experience. Based 18 miles from Wilmslow. CORC certified. Free quotes. 01270 897606.',
  keywords: 'roofers wilmslow, roofer wilmslow, roof repair wilmslow, roof replacement wilmslow, high value home roofing SK9',
  openGraph: {
    title: 'Roofers Wilmslow | Quality-First Roofing | Upgrade Roofs',
    description: 'Expert roofers in Wilmslow, SK9. Quality-first roofing for high-value homes. Free quotes.',
    url: 'https://www.upgraderoofs.co.uk/roofers-wilmslow',
    siteName: 'Upgrade Roofs',
    images: [{ url: 'https://www.upgraderoofs.co.uk/images/6.jpeg', width: 1200, height: 630, alt: 'Professional roofers serving Wilmslow, Cheshire' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofers Wilmslow | Upgrade Roofs | 01270 897606',
    description: 'Quality-first roofing for high-value Wilmslow homes. Free quotes.',
    images: ['https://www.upgraderoofs.co.uk/images/6.jpeg'],
  },
  alternates: { canonical: 'https://www.upgraderoofs.co.uk/roofers-wilmslow' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <AreaPageTemplate {...data} />;
}