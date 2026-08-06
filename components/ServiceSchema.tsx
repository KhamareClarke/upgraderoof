import type { ServiceData } from '@/lib/service-data';

export function ServiceSchema({ service }: { service: ServiceData }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: service.url,
    serviceType: service.name,
    priceRange: '££',
    offers: {
      '@type': 'Offer',
      name: `Free ${service.name} Quote`,
      price: '0',
      priceCurrency: 'GBP',
      description: 'Free no-obligation inspection and written quote.',
      eligibleRegion: {
        '@type': 'Place',
        name: 'Cheshire, England',
      },
      seller: {
        '@id': 'https://www.upgraderoofs.co.uk/#organization',
      },
    },
    provider: {
      '@type': 'LocalBusiness',
      '@id': 'https://www.upgraderoofs.co.uk/#organization',
      name: 'Upgrade Roofs',
    },
    areaServed: {
      '@type': 'Place',
      name: 'Cheshire, England',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${service.name} Services`,
    },
  };

  const speakableSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#answer', 'h1'],
    },
    isPartOf: { '@id': 'https://www.upgraderoofs.co.uk/#website' },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(speakableSchema) }}
      />
    </>
  );
}
