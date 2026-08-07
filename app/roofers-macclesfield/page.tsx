import type { Metadata } from 'next';
import { AreaPageTemplate } from '@/components/AreaPageTemplate';
import { townData } from '@/lib/town-data';

export const dynamic = 'force-static';
export const revalidate = false;

const data = townData['macclesfield'];

export const metadata: Metadata = {
  title: 'Roofers Macclesfield | Pennine-Edge Roofing Specialists SK10 | Upgrade Roofs',
  description: 'Expert roofers in Macclesfield, SK10/SK11. Specialists in exposed Pennine-edge roofing and period property slate. 25+ years experience. Based 15 miles away. CORC certified. Free quotes. 01270 897606.',
  keywords: 'roofers macclesfield, roofer macclesfield, roof repair macclesfield, slate roofing macclesfield, storm damage roofing SK10',
  openGraph: {
    title: 'Roofers Macclesfield | Pennine-Edge Roofing Specialists | Upgrade Roofs',
    description: 'Expert roofers in Macclesfield, SK10/SK11. Slate restoration and storm damage repairs. Free quotes.',
    url: 'https://www.upgraderoofs.co.uk/roofers-macclesfield',
    siteName: 'Upgrade Roofs',
    images: [{ url: 'https://www.upgraderoofs.co.uk/images/6.jpeg', width: 1200, height: 630, alt: 'Professional roofers serving Macclesfield, Cheshire' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofers Macclesfield | Upgrade Roofs | 01270 897606',
    description: 'Pennine-edge and period property roofing in Macclesfield. Free quotes.',
    images: ['https://www.upgraderoofs.co.uk/images/6.jpeg'],
  },
  alternates: { canonical: 'https://www.upgraderoofs.co.uk/roofers-macclesfield' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <AreaPageTemplate {...data} />;
}