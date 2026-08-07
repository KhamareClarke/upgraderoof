import type { Metadata } from 'next';
import { AreaPageTemplate } from '@/components/AreaPageTemplate';
import { townData } from '@/lib/town-data';

export const dynamic = 'force-static';
export const revalidate = false;

const data = townData['newcastle-under-lyme'];

export const metadata: Metadata = {
  title: 'Roofers Newcastle-under-Lyme | Roofing Contractors ST5 | Upgrade Roofs',
  description: 'Expert roofers in Newcastle-under-Lyme, ST5. Roof repairs, re-roofing, and flat roofing for homes and businesses. 25+ years experience. Based 14 miles away. CORC certified. Free quotes. 01270 897606.',
  keywords: 'roofers newcastle under lyme, roofer newcastle-under-lyme, roof repair newcastle under lyme, roof replacement ST5, commercial roofing newcastle',
  openGraph: {
    title: 'Roofers Newcastle-under-Lyme | ST5 Roofing Contractors | Upgrade Roofs',
    description: 'Residential and commercial roofing across Newcastle-under-Lyme, ST5. Free quotes.',
    url: 'https://www.upgraderoofs.co.uk/roofers-newcastle-under-lyme',
    siteName: 'Upgrade Roofs',
    images: [{ url: 'https://www.upgraderoofs.co.uk/images/6.jpeg', width: 1200, height: 630, alt: 'Professional roofers serving Newcastle-under-Lyme, Staffordshire' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofers Newcastle-under-Lyme | Upgrade Roofs | 01270 897606',
    description: 'Residential and commercial roofing across the ST5 area. Free quotes.',
    images: ['https://www.upgraderoofs.co.uk/images/6.jpeg'],
  },
  alternates: { canonical: 'https://www.upgraderoofs.co.uk/roofers-newcastle-under-lyme' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <AreaPageTemplate {...data} />;
}