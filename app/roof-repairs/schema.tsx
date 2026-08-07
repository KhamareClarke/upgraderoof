const serviceData = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Roof Repair',
  provider: {
    '@type': 'RoofingContractor',
    name: 'Upgrade Roofs',
    '@id': 'https://www.upgraderoofs.co.uk/#organization',
  },
  areaServed: {
    '@type': 'GeoCircle',
    geoMidpoint: {
      '@type': 'GeoCoordinates',
      latitude: 53.1461,
      longitude: -2.3679,
    },
    geoRadius: '30000',
  },
  name: 'Roof Repair Services',
  description: 'Fast, reliable roof repairs for leaks, storm damage, missing tiles, and more. Serving Sandbach and the wider Cheshire area.',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Common Roof Repairs',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Leak Repairs' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Missing Tile Replacement' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Storm Damage Repair' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ridge & Valley Repairs' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Flashing Repairs' } },
    ],
  },
};

const faqData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do you offer same-day service for urgent roof repairs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we offer same-day service for most urgent repairs. Being based in Sandbach allows us to quickly reach locations across south and mid-Cheshire, often getting on-site within 30-45 minutes for emergencies.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is there a guarantee on your roof repairs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Absolutely. All our roof repairs are backed by our comprehensive 10-year workmanship guarantee, giving you complete peace of mind.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are there any hidden costs or call-out fees?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. We provide fixed-price quotes for all repair work. There are no surprise charges or hidden call-out fees.',
      },
    },
  ],
};

export function RoofRepairsSchema() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  );
}
