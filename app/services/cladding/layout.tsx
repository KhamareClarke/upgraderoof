import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { ServiceSchema } from '@/components/ServiceSchema';
import { getService } from '@/lib/service-data';

const service = getService('cladding')!;

export const metadata: Metadata = {
  title: 'Cladding Installation Cheshire | Wall Cladding | 01270 897606',
  description: 'Professional cladding installation in Cheshire. Composite, timber, metal cladding. Residential and commercial. Weather protection, insulation. CORC certified, £10M insured. Call 01270 897606.',
  keywords: 'cladding Cheshire, wall cladding, composite cladding, timber cladding, metal cladding, exterior cladding, cladding installation Cheshire',
  openGraph: {
    title: 'Cladding Installation Cheshire | Residential & Commercial',
    description: 'Professional cladding solutions. Composite, timber, metal. Free quotes. Call 01270 897606.',
    url: 'https://www.upgraderoofs.co.uk/services/cladding',
    siteName: 'Upgrade Roofs',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cladding Installation Cheshire | 01270 897606',
    description: 'Expert cladding installation in Cheshire. Free quotes.',
  },
  alternates: {
    canonical: 'https://www.upgraderoofs.co.uk/services/cladding',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function CladdingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.upgraderoofs.co.uk' },
        { name: 'Services', url: 'https://www.upgraderoofs.co.uk/services' },
        { name: 'Cladding', url: 'https://www.upgraderoofs.co.uk/services/cladding' },
      ]} />
      <ServiceSchema service={service} />
      {children}
    </>
  );
}
