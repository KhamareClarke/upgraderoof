import Link from 'next/link';
import { MapPin } from 'lucide-react';

interface ServiceAreaLinksProps {
  serviceName: string;
}

export function ServiceAreaLinks({ serviceName }: ServiceAreaLinksProps) {
  const areas = [
    { name: 'Sandbach', href: '/roofers-sandbach' },
    { name: 'Crewe', href: '/roofers-crewe' },
    { name: 'Middlewich', href: '/roofers-middlewich' },
    { name: 'Congleton', href: '/roofers-congleton' },
    { name: 'Nantwich', href: '/roofers-nantwich' },
    { name: 'Alsager', href: '/roofers-alsager' },
    { name: 'Holmes Chapel', href: '/roofers-holmes-chapel' },
    { name: 'Winsford', href: '/roofers-winsford' },
    { name: 'Northwich', href: '/roofers-northwich' },
    { name: 'Macclesfield', href: '/roofers-macclesfield' },
    { name: 'Knutsford', href: '/roofers-knutsford' },
    { name: 'Tarporley', href: '/roofers-tarporley' },
    { name: 'Biddulph', href: '/roofers-biddulph' },
    { name: 'Newcastle-under-Lyme', href: '/roofers-newcastle-under-lyme' },
    { name: 'Wilmslow', href: '/roofers-wilmslow' },
  ];

  return (
    <section className="py-10 bg-gray-50 border-t border-gray-200">
      <div className="container-custom">
        <h3 className="text-xl font-bold text-brand-navy mb-4 text-center">
          {serviceName} Across Cheshire
        </h3>
        <p className="text-gray-600 text-sm text-center mb-6 max-w-xl mx-auto">
          We provide {serviceName.toLowerCase()} services across south Cheshire. Based in Sandbach, we cover:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {areas.map((area, i) => (
            <Link key={i} href={area.href} className="inline-flex items-center gap-1.5 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-brand-orange/50 hover:shadow-sm transition-all text-sm font-medium text-brand-navy hover:text-brand-orange">
              <MapPin className="w-3.5 h-3.5 text-brand-orange" />
              {area.name}
            </Link>
          ))}
          <Link href="/service-areas" className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-orange/10 rounded-lg border border-brand-orange/20 hover:bg-brand-orange/20 transition-all text-sm font-medium text-brand-orange">
            All areas →
          </Link>
        </div>
      </div>
    </section>
  );
}
