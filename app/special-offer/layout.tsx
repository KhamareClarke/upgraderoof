import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Roof Inspection | Upgrade Roofing Solutions Cheshire & Staffordshire',
  description: 'Claim your free roof inspection from Upgrade Roofing Solutions. Trusted roofers serving Stoke-on-Trent, Cheshire & Staffordshire. No obligation. Limited time offer.',
  keywords: [
    'free roof inspection Stoke-on-Trent',
    'roof repairs near me',
    'roofing contractors Staffordshire', 
    'local roofers Stoke-on-Trent',
    'roof inspection Cheshire',
    'emergency roof repairs',
    'roofing company near me',
    'roof survey Staffordshire'
  ],
  authors: [{ name: 'Upgrade Roofing Solutions' }],
  creator: 'Upgrade Roofing Solutions',
  publisher: 'Upgrade Roofing Solutions',
  metadataBase: new URL('https://upgrade-main.vercel.app'),
  alternates: {
    canonical: '/special-offer',
  },
  openGraph: {
    title: 'Free Roof Inspection | Limited Time Offer - Upgrade Roofing',
    description: 'Get a FREE professional roof inspection from experienced roofers. Serving Stoke-on-Trent & Staffordshire. No obligation, no hidden fees.',
    url: 'https://upgrade-main.vercel.app/special-offer',
    siteName: 'Upgrade Roofing Solutions',
    images: [
      {
        url: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1200',
        width: 1200,
        height: 630,
        alt: 'Free Roof Inspection Offer - Professional Roofers Stoke-on-Trent',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Roof Inspection | Limited Time Offer - Upgrade Roofing',
    description: 'Get a FREE professional roof inspection. No obligation, no hidden fees. Trusted roofers in Staffordshire.',
    images: ['https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'google-ads-conversion': 'AW-XXXXXXXXX/XXXXXXXXX', // Replace with actual conversion ID
    'facebook-domain-verification': 'XXXXXXXXXXXXXXXXXXXXXXX', // Replace with actual verification code
  },
};

import Script from 'next/script';

export default function SpecialOfferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Structured Data for Special Offer */}
      <Script
        id="special-offer-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Offer',
            name: 'Free Roof Inspection',
            description: 'Professional roof inspection with no obligation and no hidden fees',
            price: '0',
            priceCurrency: 'GBP',
            availability: 'https://schema.org/LimitedAvailability',
            validThrough: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            seller: {
              '@type': 'LocalBusiness',
              name: 'Upgrade Roofing Solutions',
              address: {
                '@type': 'PostalAddress',
                streetAddress: '1 Hutchins Close',
                addressLocality: 'Middlewich',
                addressRegion: 'Cheshire',
                postalCode: 'CW10 0EX',
                addressCountry: 'GB'
              },
              telephone: '01270897606',
              url: 'https://upgrade-main.vercel.app'
            },
            areaServed: [
              {
                '@type': 'City',
                name: 'Cheshire'
              },
              {
                '@type': 'City',
                name: 'Staffordshire'
              },
              {
                '@type': 'City',
                name: 'Crewe'
              },
              {
                '@type': 'City',
                name: 'Macclesfield'
              }
            ]
          })
        }}
      />
      
      {/* LocalBusiness Schema */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': ['LocalBusiness', 'RoofingContractor'],
            name: 'Upgrade Roofing Solutions',
            image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1200',
            '@id': 'https://upgrade-main.vercel.app/#organization',
            url: 'https://upgrade-main.vercel.app/special-offer',
            telephone: '01270897606',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '1 Laureate Way',
              addressLocality: 'Haslington',
              addressRegion: 'Cheshire',
              postalCode: 'CW1 0LX',
              addressCountry: 'GB'
            },
            geo: {
              '@type': 'GeoCoordinates',
              latitude: 53.0273,
              longitude: -2.1813
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                opens: '08:00',
                closes: '18:00'
              }
            ],
            priceRange: '££',
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '5',
              reviewCount: '127'
            }
          })
        }}
      />

      {/* Google Ads Conversion Tracking */}
      <Script
        id="conversion-tracking"
        dangerouslySetInnerHTML={{
          __html: `
            if (typeof gtag !== 'undefined') {
              gtag('config', 'AW-XXXXXXXXX');
            }
            if (typeof fbq !== 'undefined') {
              fbq('track', 'ViewContent', {
                content_type: 'product',
                content_ids: ['roof-inspection-offer'],
                content_name: 'Free Roof Inspection Offer',
                content_category: 'Roofing Services',
                value: 150,
                currency: 'GBP'
              });
            }
          `
        }}
      />
      {children}
    </>
  );
}
