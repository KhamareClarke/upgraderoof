interface SpeakableSchemaProps {
  cssSelectors: string[];
  url: string;
}

export function SpeakableSchema({ cssSelectors, url }: SpeakableSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: cssSelectors,
    },
    url,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
