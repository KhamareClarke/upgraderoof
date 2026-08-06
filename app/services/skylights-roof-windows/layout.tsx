import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { ServiceSchema } from '@/components/ServiceSchema';
import { getService } from '@/lib/service-data';

const service = getService('skylights-roof-windows')!;

export const metadata: Metadata = {
  title: 'Skylights & Roof Windows Cheshire | Velux Installers | 01270 897606',
  description: 'Professional skylight and roof window installation in Cheshire. Velux certified installers. Sun tunnels, flat roof windows, loft conversions. CORC certified, £10M insured. Call 01270 897606.',
  keywords: 'skylights Cheshire, roof windows Cheshire, Velux installation, sun tunnels, flat roof windows, loft windows, skylight repair Cheshire',
  openGraph: {
    title: 'Skylights & Roof Windows Cheshire | Velux Certified',
    description: 'Professional skylight installation. Velux certified. Sun tunnels, roof windows. Call 01270 897606.',
    url: 'https://www.upgraderoofs.co.uk/services/skylights-roof-windows',
    siteName: 'Upgrade Roofs',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Skylights & Roof Windows Cheshire | 01270 897606',
    description: 'Expert skylight installation in Cheshire. Velux certified. Free quotes.',
  },
  alternates: {
    canonical: 'https://www.upgraderoofs.co.uk/services/skylights-roof-windows',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SkylightsRoofWindowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.upgraderoofs.co.uk' },
        { name: 'Services', url: 'https://www.upgraderoofs.co.uk/services' },
        { name: 'Skylights & Roof Windows', url: 'https://www.upgraderoofs.co.uk/services/skylights-roof-windows' },
      ]} />
      <ServiceSchema service={service} />
      {children}
    </>
  );
}
