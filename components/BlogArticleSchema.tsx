interface BlogArticleSchemaProps {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}

export function BlogArticleSchema({ title, description, url, datePublished, dateModified, image }: BlogArticleSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    datePublished,
    dateModified: dateModified ?? datePublished,
    inLanguage: 'en-GB',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'h2'],
    },
    author: {
      '@type': 'Organization',
      name: 'Upgrade Roofs',
      url: 'https://www.upgraderoofs.co.uk',
      '@id': 'https://www.upgraderoofs.co.uk/#organization',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Upgrade Roofs',
      url: 'https://www.upgraderoofs.co.uk',
      '@id': 'https://www.upgraderoofs.co.uk/#organization',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.upgraderoofs.co.uk/images/upgrade_logo.png',
        width: 112,
        height: 112,
      },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'WebSite', '@id': 'https://www.upgraderoofs.co.uk/#website' },
    ...(image ? { image: { '@type': 'ImageObject', url: `https://www.upgraderoofs.co.uk${image}`, width: 800, height: 400 } } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
