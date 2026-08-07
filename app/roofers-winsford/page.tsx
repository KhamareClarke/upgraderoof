import type { Metadata } from 'next';
import { AreaPageTemplate } from '@/components/AreaPageTemplate';
import { townData } from '@/lib/town-data';

export const dynamic = 'force-static';
export const revalidate = false;

const data = townData['winsford'];

export const metadata: Metadata = {
  title: 'Roofers Winsford | Roof Repair & Replacement Specialists CW7 | Upgrade Roofs',
  description: 'Expert roofers in Winsford, CW7. Roof repairs, re-roofing, and flat roof replacement for 1970s and modern properties. 25+ years experience. Based 8 miles away. CORC certified. Free quotes. 01270 897606.',
  keywords: 'roofers winsford, roofer winsford, roof repair winsford, roof replacement winsford, flat roofing winsford CW7',
  openGraph: {
    title: 'Roofers Winsford | Roof Repair & Replacement Specialists | Upgrade Roofs',
    description: 'Expert roofers in Winsford, CW7. Roof repairs, re-roofs, and flat roofing. Free quotes.',
    url: 'https://www.upgraderoofs.co.uk/roofers-winsford',
    siteName: 'Upgrade Roofs',
    images: [{ url: 'https://www.upgraderoofs.co.uk/images/6.jpeg', width: 1200, height: 630, alt: 'Professional roofers serving Winsford, Cheshire' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofers Winsford | Upgrade Roofs | 01270 897606',
    description: 'Roof repair and replacement specialists in Winsford, CW7. Free quotes.',
    images: ['https://www.upgraderoofs.co.uk/images/6.jpeg'],
  },
  alternates: { canonical: 'https://www.upgraderoofs.co.uk/roofers-winsford' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <AreaPageTemplate {...data} />;
}