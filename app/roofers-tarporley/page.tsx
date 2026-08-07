import type { Metadata } from 'next';
import { AreaPageTemplate } from '@/components/AreaPageTemplate';
import { townData } from '@/lib/town-data';

export const dynamic = 'force-static';
export const revalidate = false;

const data = townData['tarporley'];

export const metadata: Metadata = {
  title: 'Roofers Tarporley | Heritage Roofing Specialists CW6 | Upgrade Roofs',
  description: 'Expert roofers in Tarporley, CW6. Specialists in period, listed, and rural property roofing across the CW6 area. 25+ years experience. Based 15 miles from Tarporley. CORC certified. Free quotes. 01270 897606.',
  keywords: 'roofers tarporley, roofer tarporley, roof repair tarporley, raftering rural farmhouse CW6, heritage roofing tarporley',
  openGraph: {
    title: 'Roofers Tarporley | Heritage Roofing Specialists | Upgrade Roofs',
    description: 'Expert roofers in Tarporley, CW6. Period and rural property roofing specialists. Free quotes.',
    url: 'https://www.upgraderoofs.co.uk/roofers-tarporley',
    siteName: 'Upgrade Roofs',
    images: [{ url: 'https://www.upgraderoofs.co.uk/images/6.jpeg', width: 1200, height: 630, alt: 'Professional roofers serving Tarporley, Cheshire' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofers Tarporley | Upgrade Roofs | 01270 897606',
    description: 'Heritage and rural property roofing in Tarporley, CW6. Free quotes.',
    images: ['https://www.upgraderoofs.co.uk/images/6.jpeg'],
  },
  alternates: { canonical: 'https://www.upgraderoofs.co.uk/roofers-tarporley' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <AreaPageTemplate {...data} />;
}