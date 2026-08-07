import type { Metadata } from 'next';
import { AreaPageTemplate } from '@/components/AreaPageTemplate';
import { townData } from '@/lib/town-data';

export const dynamic = 'force-static';
export const revalidate = false;

const data = townData['biddulph'];

export const metadata: Metadata = {
  title: 'Roofers Biddulph | Exposed Moorland Roofing Specialists ST8 | Upgrade Roofs',
  description: 'Expert roofers in Biddulph, ST8. Specialists in exposed upland roofing with dry ridge systems. 25+ years experience. Based 12 miles from Biddulph. CORC certified. Free quotes. 01270 897606.',
  keywords: 'roofers biddulph, roofer biddulph, roof repair biddulph, roof replacement biddulph, storm damage roofing biddulph ST8',
  openGraph: {
    title: 'Roofers Biddulph | Exposed Moorland Roofing Specialists | Upgrade Roofs',
    description: 'Expert roofers in Biddulph, ST8. Dry ridge systems and storm damage repairs. Free quotes.',
    url: 'https://www.upgraderoofs.co.uk/roofers-biddulph',
    siteName: 'Upgrade Roofs',
    images: [{ url: 'https://www.upgraderoofs.co.uk/images/6.jpeg', width: 1200, height: 630, alt: 'Professional roofers serving Biddulph, Staffordshire' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofers Biddulph | Upgrade Roofs | 01270 897606',
    description: 'Exposed moorland roofing specialists in Biddulph, ST8. Free quotes.',
    images: ['https://www.upgraderoofs.co.uk/images/6.jpeg'],
  },
  alternates: { canonical: 'https://www.upgraderoofs.co.uk/roofers-biddulph' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <AreaPageTemplate {...data} />;
}