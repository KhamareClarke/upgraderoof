const serviceData = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Emergency Roofing',
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
  name: '24/7 Emergency Roofing Services',
  description: 'Fast, round-the-clock emergency roofing for storm damage, sudden leaks, and missing tiles. Serving Sandbach and the wider Cheshire area with same-day response.',
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Emergency Roofing Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Storm Damage Make-Safe' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Emergency Leak Repairs' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Missing Tile Replacement' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: '24/7 Call-Out Response' } },
    ],
  },
};

const faqData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How fast can you respond to a roofing emergency?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer a 24/7 emergency call-out service across Cheshire and the North West. Being based in Sandbach allows us to reach most locations quickly, often getting on-site within 30-45 minutes for urgent repairs.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer emergency roofing services?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. We offer a 24/7 emergency call-out service across Cheshire and the North West. If you have an urgent leak or storm damage, call us now on 01270 897 606.',
      },
    },
    {
      '@type': 'Question',
      name: 'What should I do while waiting for an emergency roofer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Move furniture away from the affected area, place a bucket under active leaks, and avoid climbing onto the roof yourself. Our team will make the roof safe and watertight as quickly as possible before arranging a permanent fix.',
      },
    },
  ],
};

export function EmergencyRoofingSchema() {
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
