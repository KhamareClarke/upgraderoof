interface TownLocalBusinessSchemaProps {
  town: string;
  postcode: string;
  slug: string;
  lat: number;
  lng: number;
  addressRegion?: string;
}

export function TownLocalBusinessSchema({ town, postcode, slug, lat, lng, addressRegion = 'Cheshire' }: TownLocalBusinessSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'RoofingContractor'],
    '@id': `https://www.upgraderoofs.co.uk/${slug}#localbusiness`,
    name: `Upgrade Roofs — Roofers in ${town}`,
    url: `https://www.upgraderoofs.co.uk/${slug}`,
    telephone: '01270 897606',
    email: 'upgraderoofs@yahoo.com',
    image: 'https://www.upgraderoofs.co.uk/images/6.jpeg',
    branchOf: {
      '@id': 'https://www.upgraderoofs.co.uk/#organization',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '20 Crewe Road',
      addressLocality: town,
      postalCode: postcode,
      addressRegion,
      addressCountry: 'GB',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '09:00',
        closes: '16:00',
      },
    ],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: lat,
      longitude: lng,
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: lat,
        longitude: lng,
      },
      geoRadius: '8000',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 5,
      bestRating: 5,
      worstRating: 1,
      reviewCount: 127,
    },
    potentialAction: {
      '@type': 'RequestQuote',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.upgraderoofs.co.uk/contact',
        actionPlatform: [
          'https://schema.org/DesktopWebPlatform',
          'https://schema.org/MobileWebPlatform',
        ],
      },
      result: {
        '@type': 'Offer',
        name: 'Free Roofing Quote',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
