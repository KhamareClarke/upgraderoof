const serviceData = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'New Roof Installation',
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
  name: 'New Roof & Re-Roofing Services',
  description: 'New roof installations and full re-roofing in tile, slate, and flat roofing systems. Serving Sandbach and the wider Cheshire area with a 10-year workmanship guarantee.',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'New Roof Options',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'New Tile Roofs' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Natural Slate Roofs' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Flat Roof Systems' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Full Re-Roofing' } },
    ],
  },
};

const faqData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How much does a new roof cost in Cheshire?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every roof is different, so costs vary depending on size, materials, and the scope of work involved. We provide free, no-obligation quotes with transparent, itemised pricing · no hidden costs, no surprises.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does a new roof take to install?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Most new roof installations in Sandbach and Cheshire are completed within a few days, depending on the size and complexity of your roof. We'll give you a clear schedule before any work begins and keep you informed throughout the project.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is my new roof guaranteed?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All our new roofs are backed by a comprehensive 10-year workmanship guarantee, giving you complete peace of mind.',
      },
    },
  ],
};

export function NewRoofsSchema() {
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
