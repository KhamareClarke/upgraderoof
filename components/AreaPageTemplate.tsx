import Link from 'next/link';
import { MobileContactBar } from '@/components/MobileContactBar';
import { MapPin } from 'lucide-react';
import { ReviewsSection } from '@/components/ReviewsSection';
import { SectionHeader } from '@/components/SectionHeader';
import { AreaHero } from '@/components/AreaHero';
import { TrustBadgeGrid, InspectionChecklist, FinalCta } from '@/components/SpecialOfferSections';

interface AreaFAQ {
  q: string;
  a: string;
}

interface CommonProblem {
  problem: string;
  solution: string;
}

interface AreaPageProps {
  town: string;
  postcode?: string;
  distanceFromBase?: string;
  emergencyResponseTime?: string;
  intro: string;
  localContext: string;
  roofingChallenges: string;
  landmarks?: string[];
  propertyTypes?: string[];
  commonProblems?: CommonProblem[];
  proofPoint?: string;
  ctaLine?: string;
  faqs: AreaFAQ[];
  nearbyAreas: { name: string; href: string }[];
}

export function AreaPageTemplate({ town, postcode, distanceFromBase, emergencyResponseTime, intro, localContext, roofingChallenges, landmarks, propertyTypes, commonProblems, proofPoint, ctaLine, faqs, nearbyAreas }: AreaPageProps) {
  // Migrate long-form local prose into structured FAQ items so the page body
  // carries no redundant text duplication (directive #2). These derived FAQs
  // also flow into the FAQPage JSON-LD below.
  const allFaqs: AreaFAQ[] = [...faqs];

  if (propertyTypes && propertyTypes.length > 0) {
    allFaqs.push({
      q: `What types of roofs do you work on in ${town}?`,
      a: `We cover every property type in ${town}, including ${propertyTypes.join(', ').toLowerCase()}.`,
    });
  }

  if (roofingChallenges) {
    allFaqs.push({
      q: `How do local weather conditions affect roofs in ${town}?`,
      a: `${roofingChallenges}`,
    });
  }

  if (landmarks && landmarks.length > 0) {
    allFaqs.push({
      q: `Which parts of ${town} do you cover?`,
      a: `We cover the whole of ${town} and the surrounding area, including ${landmarks.join(', ')}.`,
    });
  }

  allFaqs.push({
    q: 'Are you insured and guaranteed?',
    a: 'Yes. Upgrade Roofs is CORC certified and holds £10 million public liability insurance. Every job is covered by a 10-year workmanship guarantee. We are based at 20 Crewe Road, Sandbach CW11 4NE, and cover Cheshire and the surrounding area.',
  });

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero + LeadFormWizard */}
      <AreaHero town={town} intro={intro} />

      {/* 2. Trust Badge Grid */}
      <TrustBadgeGrid />

      {/* Common Local Roofing Problems */}
      {commonProblems && commonProblems.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <SectionHeader
                kicker="Common Problems"
                title={<>Common Roofing Problems in {town}</>}
              />
              <div className="space-y-6">
                {commonProblems.map((cp, i) => (
                  <div key={i} className="bg-gray-50 p-6 border-l-4 border-brand-navy">
                    <h3 className="text-lg font-bold text-brand-navy mb-2">{cp.problem}</h3>
                    <p className="text-gray-600 text-sm">{cp.solution}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Inspection Checklist */}
      <InspectionChecklist />

      {/* 5. FAQs */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <SectionHeader kicker="Frequently Asked Questions" title={<>Roofing Questions · {town}</>} />
            <div className="space-y-4">
              {allFaqs.map((faq, i) => (
                <details key={i} className="bg-white border border-gray-300 border-l-4 border-l-brand-orange">
                  <summary className="p-5 cursor-pointer font-semibold text-brand-navy hover:text-brand-orange transition-colors flex items-center justify-between">
                    {faq.q}
                    <span className="text-brand-orange ml-2 flex-shrink-0">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-gray-600 leading-relaxed">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Areas */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <SectionHeader kicker="Coverage" title="Nearby Areas We Serve" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link href="/roofers-sandbach" className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-300 hover:border-brand-navy transition-colors text-brand-navy font-semibold hover:text-brand-orange">
              <MapPin className="w-4 h-4 text-brand-orange" />Sandbach
            </Link>
            {nearbyAreas.map((area, i) => (
              <Link key={i} href={area.href} className="flex items-center justify-center gap-2 p-4 bg-white border border-gray-300 hover:border-brand-navy transition-colors text-brand-navy font-semibold hover:text-brand-orange">
                <MapPin className="w-4 h-4 text-brand-orange" />{area.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <ReviewsSection reviewCta="quote" />

      {/* 5. Final CTA */}
      <FinalCta
        kicker="Free Inspection"
        title={<>Need a Roofer in {town}?</>}
        subtitle={ctaLine || 'Get a free, no-obligation quote. We\'ll inspect your roof and provide a clear, written price.'}
      />

      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.upgraderoofs.co.uk' },
              { '@type': 'ListItem', position: 2, name: 'Service Areas', item: 'https://www.upgraderoofs.co.uk/service-areas' },
              { '@type': 'ListItem', position: 3, name: `Roofers ${town}`, item: `https://www.upgraderoofs.co.uk/roofers-${town.toLowerCase().replace(/\s+/g, '-')}` },
            ]
          })
        }}
      />
      {/* FAQ Schema · town FAQs only */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: allFaqs.map(faq => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: { '@type': 'Answer', text: faq.a }
            }))
          })
        }}
      />
      {/* Speakable Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['h1'],
            },
            isPartOf: { '@id': 'https://www.upgraderoofs.co.uk/#website' },
          })
        }}
      />

      {/* Sticky mobile CTA · Call / WhatsApp / Message (matches homepage) */}
      <MobileContactBar />
    </div>
  );
}
