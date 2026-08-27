import Link from 'next/link';
import { CheckCircle, MapPin, Star, ArrowRight } from 'lucide-react';
import type { ServiceData } from '@/lib/service-data';
import type { TownData } from '@/lib/town-data';
import { services } from '@/lib/service-data';
import { generateServiceLocationFaqs, buildServiceTownSolution } from '@/lib/service-location-helpers';
import { GhlReviewsWidget } from '@/components/GhlReviewsWidget';
import { AuthorityBar } from '@/components/AuthorityBar';
import { SectionHeader } from '@/components/SectionHeader';
import { ServiceHero } from '@/components/ServiceHero';
import { TrustBadgeGrid, InspectionChecklist, FinalCta } from '@/components/SpecialOfferSections';

interface ServiceLocationTemplateProps {
  service: ServiceData;
  town: TownData;
}

const TRUST_ANGLE = [
  'CORC certified · £10M insured · 10-year workmanship guarantee',
  'Free written quotes · no pressure, no obligation',
  '25+ years serving Cheshire homeowners and businesses',
] as const;

function pickTrustAngle(slug: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i += 1) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % TRUST_ANGLE.length;
}

export function ServiceLocationTemplate({ service, town }: ServiceLocationTemplateProps) {
  const faqs = generateServiceLocationFaqs(service, town);
  const townSlug = town.slug; // e.g. 'roofers-crewe'
  const canonical = `https://www.upgraderoofs.co.uk/${townSlug}/${service.slug}`;

  const otherServices = services.filter((s) => s.slug !== service.slug);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.name} in ${town.town}`,
    description: service.description,
    url: canonical,
    serviceType: service.name,
    priceRange: '££',
    provider: {
      '@type': 'LocalBusiness',
      '@id': 'https://www.upgraderoofs.co.uk/#organization',
      name: 'Upgrade Roofs',
    },
    areaServed: {
      '@type': 'City',
      name: town.town,
      containedInPlace: {
        '@type': 'State',
        name: 'Cheshire',
        sameAs: 'https://en.wikipedia.org/wiki/Cheshire',
      },
    },
    offers: {
      '@type': 'Offer',
      name: `Free ${service.name} Quote in ${town.town}`,
      price: '0',
      priceCurrency: 'GBP',
      description: 'Free no-obligation inspection and written quote.',
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.upgraderoofs.co.uk' },
      { '@type': 'ListItem', position: 2, name: `Roofers ${town.town}`, item: `https://www.upgraderoofs.co.uk/${townSlug}` },
      { '@type': 'ListItem', position: 3, name: service.name, item: canonical },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero + LeadFormWizard */}
      <ServiceHero service={service} town={town} />

      {/* 2. Trust Badge Grid */}
      <TrustBadgeGrid />

      {/* Trust Bar */}
      <AuthorityBar />

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left: service + local description */}
            <div>
              <SectionHeader
                align="left"
                kicker={`${service.name} · ${town.town}`}
                title={<>{service.name} in <span className="text-brand-orange">{town.town}</span></>}
                className="mb-6"
              />
              <div className="text-gray-600 leading-relaxed space-y-4 text-lg">
                <p>{buildServiceTownSolution(service, town)}</p>
                <p>
                  Our team is based in Sandbach · {town.distanceFromBase} · making us one of the closest qualified roofing contractors to {town.town}. {town.proofPoint} Whether you need a small repair or a full installation, we understand the roofing characteristics of properties in the {town.postcode} area.
                </p>
                {town.roofingChallenges && (
                  <p className="text-base">{town.roofingChallenges}</p>
                )}
              </div>
            </div>

            {/* Right: why us in this location */}
            <div className="bg-gray-50 p-8 border-l-4 border-brand-navy">
              <h3 className="text-xl font-bold text-brand-navy mb-6">Why Choose Upgrade Roofs in {town.town}?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{town.distanceFromBase} · one of the fastest local roofers to your door</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">Emergency response within {town.emergencyResponseTime}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{town.proofPoint}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{TRUST_ANGLE[pickTrustAngle(town.slug)]}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{TRUST_ANGLE[(pickTrustAngle(town.slug) + 1) % TRUST_ANGLE.length]}</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{TRUST_ANGLE[(pickTrustAngle(town.slug) + 2) % TRUST_ANGLE.length]}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Inspection Checklist */}
      <InspectionChecklist />

      {/* FAQs */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              kicker="Frequently Asked Questions"
              title={<>{service.name} Questions · {town.town}</>}
            />
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

      {/* Other Services in This Town */}
      <section className="section-padding">
        <div className="container-custom">
          <SectionHeader
            kicker="More From Us"
            title={<>Other Roofing Services in {town.town}</>}
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherServices.map((s) => (
              <Link
                key={s.slug}
                href={`/${townSlug}/${s.slug}`}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-300 hover:border-brand-navy hover:bg-white transition-colors text-brand-navy font-medium text-sm"
              >
                {s.name}
                <ArrowRight className="w-4 h-4 text-brand-orange flex-shrink-0" />
              </Link>
            ))}
            <Link
              href={`/${townSlug}`}
              className="flex items-center justify-between p-4 bg-brand-orange/5 border border-brand-orange/20 hover:border-brand-orange transition-colors text-brand-navy font-medium text-sm"
            >
              All Roofing Services in {town.town}
              <ArrowRight className="w-4 h-4 text-brand-orange flex-shrink-0" />
            </Link>
          </div>
        </div>
      </section>

      {/* Nearby Areas */}
      <section className="py-8 bg-gray-50">
        <div className="container-custom">
          <SectionHeader kicker="Coverage" title="Nearby Areas We Also Serve" />
          <div className="flex flex-wrap justify-center gap-3">
            {town.nearbyAreas.map((area) => (
              <Link
                key={area.href}
                href={`${area.href}/${service.slug}`}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-brand-orange/50 text-sm text-brand-navy font-medium hover:text-brand-orange transition-all"
              >
                <MapPin className="w-3 h-3 text-brand-orange" />
                {service.name} in {area.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Google Reviews */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <SectionHeader
            kicker="Reviews"
            title={<>What {town.town} Homeowners Say</>}
            subtitle={<>
              <span className="inline-flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </span>{' '}5★ rated on Google with hundreds of verified customer reviews
            </>}
          />
          <div className="max-w-5xl mx-auto">
            <GhlReviewsWidget />
          </div>
        </div>
      </section>

      {/* 5. Final CTA */}
      <FinalCta
        kicker="Free Inspection"
        title={<>Need {service.name} in {town.town}?</>}
        subtitle={town.ctaLine || `Get a free, no-obligation quote. We'll inspect and provide a clear written price.`}
      />

      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </div>
  );
}
