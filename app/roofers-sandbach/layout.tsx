import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { TownLocalBusinessSchema } from '@/components/TownLocalBusinessSchema';

export const metadata: Metadata = {
  title: 'Roofers Sandbach | 5★ Rated | Free Quotes in 24hrs | Upgrade Roofs',
  description: 'Trusted roofers in Sandbach (CW11) with 127 five-star reviews. Roof repairs, new roofs & flat roofing from a local team based on Crewe Road. 25+ yrs, £10M insured. Call 01270 897606 for a free no-obligation quote.',
  keywords: 'roofers sandbach, roofer sandbach, roofing sandbach, roofing company sandbach, roof repair sandbach, roofer near me sandbach, new roofs sandbach, emergency roofer sandbach, flat roofing sandbach, tile roofing sandbach',
  openGraph: {
    title: 'Roofers Sandbach | 5★ Rated Local Roofers | Upgrade Roofs',
    description: 'Sandbach\'s trusted roofers. 127 five-star reviews, 25+ years, CORC certified, £10M insured. Free quotes.',
    url: 'https://www.upgraderoofs.co.uk/roofers-sandbach',
    siteName: 'Upgrade Roofs',
    images: [
      {
        url: 'https://www.upgraderoofs.co.uk/images/6.jpeg',
        width: 1200,
        height: 630,
        alt: 'Professional roofers in Sandbach, Cheshire - Upgrade Roofs',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Roofers Sandbach | 5★ Rated | Upgrade Roofs',
    description: 'Trusted roofers in Sandbach. 127 five-star reviews, 25+ years. Free quotes · 01270 897606.',
    images: ['https://www.upgraderoofs.co.uk/images/6.jpeg'],
  },
  alternates: {
    canonical: 'https://www.upgraderoofs.co.uk/roofers-sandbach',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RoofersSandbachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TownLocalBusinessSchema
        town="Sandbach"
        postcode="CW11 4NE"
        slug="roofers-sandbach"
        lat={53.1461}
        lng={-2.3679}
      />
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.upgraderoofs.co.uk' },
        { name: 'Service Areas', url: 'https://www.upgraderoofs.co.uk/service-areas' },
        { name: 'Roofers Sandbach', url: 'https://www.upgraderoofs.co.uk/roofers-sandbach' },
      ]} />
      {children}
    </>
  );
}
