import type { Metadata } from 'next';
import { AreaPageTemplate } from '@/components/AreaPageTemplate';
import { townData } from '@/lib/town-data';

export const dynamic = 'force-static';
export const revalidate = false;

const data = townData['knutsford'];

export const metadata: Metadata = {
  title: 'Roofers Knutsford | Heritage & High-Value Roofing Specialists WA16 | Upgrade Roofs',
  description: 'Expert roofers in Knutsford, WA16. Specialists in listed building, conservation area, and high-value property roofing. 25+ years experience. Based 17 miles from Knutsford. CORC certified. Free quotes. 01270 897606.',
  keywords: 'roofers knutsford, roofer knutsford, roof repair knutsford, listed building roofer knutsford, conservation area roofing WA16',
  openGraph: {
    title: 'Roofers Knutsford | Heritage & High-Value Roofing Specialists | Upgrade Roofs',
    description: 'Expert roofers in Knutsford, WA16. Listed building and conservation area specialists. Free quotes.',
    url: 'https://www.upgraderoofs.co.uk/roofers-knutsford',
    siteName: 'Upgrade Roofs',
    images: [{ url: 'https://www.upgraderoofs.co.uk/images/6.jpeg', width: 1200, height: 630, alt: 'Professional roofers serving Knutsford, Cheshire' }],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofers Knutsford | Upgrade Roofs | 01270 897606',
    description: 'Heritage and high-value roofing in Knutsford, WA16. Free quotes.',
    images: ['https://www.upgraderoofs.co.uk/images/6.jpeg'],
  },
  alternates: { canonical: 'https://www.upgraderoofs.co.uk/roofers-knutsford' },
  robots: { index: true, follow: true },
};

export default function Page() {
  return <AreaPageTemplate {...data} />;
}