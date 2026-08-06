import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { ServiceSchema } from '@/components/ServiceSchema';
import { getService } from '@/lib/service-data';

const service = getService('chimney-repairs')!;

export const metadata: Metadata = {
  title: 'Chimney Repairs Cheshire | Repointing & Rebuilds | 01270 897606',
  description: 'Professional chimney repairs in Cheshire. Repointing, lead flashing, stack repairs, cowl installation, full rebuilds. CORC certified, £10M insured. Free quotes. Call 01270 897606.',
  keywords: 'chimney repairs Cheshire, chimney repointing, chimney stack repair, lead flashing, chimney cowl, chimney rebuild, chimney maintenance Cheshire',
  openGraph: {
    title: 'Chimney Repairs Cheshire | Expert Maintenance & Rebuilds',
    description: 'Professional chimney repair services. Repointing, flashing, rebuilds. Free quotes. Call 01270 897606.',
    url: 'https://www.upgraderoofs.co.uk/services/chimney-repairs',
    siteName: 'Upgrade Roofs',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chimney Repairs Cheshire | 01270 897606',
    description: 'Expert chimney repairs in Cheshire. Free quotes, 10-year guarantee.',
  },
  alternates: {
    canonical: 'https://www.upgraderoofs.co.uk/services/chimney-repairs',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ChimneyRepairsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.upgraderoofs.co.uk' },
        { name: 'Services', url: 'https://www.upgraderoofs.co.uk/services' },
        { name: 'Chimney Repairs', url: 'https://www.upgraderoofs.co.uk/services/chimney-repairs' },
      ]} />
      <ServiceSchema service={service} />
      {children}
    </>
  );
}
