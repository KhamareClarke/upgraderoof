import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { ServiceSchema } from '@/components/ServiceSchema';
import { getService } from '@/lib/service-data';

const service = getService('flat-roofing')!;

export const metadata: Metadata = {
  title: 'Flat Roofing Cheshire | EPDM, GRP & Felt | 01270 897606',
  description: 'Expert flat roofing in Cheshire. EPDM rubber, GRP fibreglass, felt roofing systems. Garages, extensions, commercial. 20-year warranty. CORC certified, £10M insured. Call 01270 897606.',
  keywords: 'flat roofing Cheshire, EPDM roofing, GRP fibreglass roof, felt roofing, garage roof, extension roof, flat roof repair Cheshire, waterproof roofing',
  openGraph: {
    title: 'Flat Roofing Cheshire | EPDM, GRP & Felt Systems',
    description: 'Professional flat roofing solutions. EPDM, GRP, felt systems. 20-year warranty. Call 01270 897606.',
    url: 'https://www.upgraderoofs.co.uk/services/flat-roofing',
    siteName: 'Upgrade Roofs',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flat Roofing Cheshire | 01270 897606',
    description: 'Expert flat roofing in Cheshire. EPDM, GRP, felt. Free quotes.',
  },
  alternates: {
    canonical: 'https://www.upgraderoofs.co.uk/services/flat-roofing',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FlatRoofingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.upgraderoofs.co.uk' },
        { name: 'Services', url: 'https://www.upgraderoofs.co.uk/services' },
        { name: 'Flat Roofing', url: 'https://www.upgraderoofs.co.uk/services/flat-roofing' },
      ]} />
      <ServiceSchema service={service} />
      {children}
    </>
  );
}
