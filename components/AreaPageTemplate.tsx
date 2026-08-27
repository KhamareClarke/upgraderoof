import Link from 'next/link';
import { StickyMobileCta } from '@/components/StickyMobileCta';
import { CheckCircle, MapPin } from 'lucide-react';
import { GeoEntityCitation } from '@/components/GeoEntityCitation';
import { ReviewsSection } from '@/components/ReviewsSection';
import { AuthorityBar } from '@/components/AuthorityBar';
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
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero + LeadFormWizard */}
      <AreaHero town={town} intro={intro} />

      {/* 2. Trust Badge Grid */}
      <TrustBadgeGrid />

      {/* GEO Entity Citation · dense, quotable business entity for AI answer engines */}
      <GeoEntityCitation town={town} postcode={postcode} />

      {/* Trust Bar */}
      <AuthorityBar />

      {/* 3. Prose & postcodes · bespoke local context, landmarks, property types, common problems */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <SectionHeader
              align="left"
              kicker={`Roofing · ${town}`}
              title={<>Professional Roofing in <span className="text-brand-orange">{town}</span></>}
              className="mb-6"
            />
            <div className="text-gray-600 leading-relaxed space-y-4 text-lg">
              <p>{localContext}</p>
              <p>{roofingChallenges}</p>
            </div>
            {/* Landmarks & Property Types */}
            {(landmarks?.length || propertyTypes?.length) && (
              <div className="grid sm:grid-cols-2 gap-6 mt-8">
                {landmarks && landmarks.length > 0 && (
                  <div className="bg-gray-50 p-6 border-l-4 border-brand-orange">
                    <h3 className="text-lg font-bold text-brand-navy mb-3">Areas We Cover in {town}</h3>
                    <ul className="space-y-2">
                      {landmarks.map((l, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />{l}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {propertyTypes && propertyTypes.length > 0 && (
                  <div className="bg-gray-50 p-6 border-l-4 border-brand-orange">
                    <h3 className="text-lg font-bold text-brand-navy mb-3">Property Types in {town}</h3>
                    <ul className="space-y-2">
                      {propertyTypes.map((p, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

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
              {faqs.map((faq, i) => (
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
            mainEntity: faqs.map(faq => ({
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
              cssSelector: ['#entity-citation', 'h1'],
            },
            isPartOf: { '@id': 'https://www.upgraderoofs.co.uk/#website' },
          })
        }}
      />

      {/* Sticky mobile CTA · Call / WhatsApp / Quick Form */}
      <StickyMobileCta placement={`area_page_${town.toLowerCase().replace(/\s+/g, '_')}`} />
    </div>
  );
}
