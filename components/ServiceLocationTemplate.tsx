import Link from 'next/link';
import { PHONE_DISPLAY, PHONE_TEL } from '@/lib/contact';
import { Button } from '@/components/ui/button';
import { QuoteForm } from '@/components/QuoteForm';
import { TrackedPhoneLink } from '@/components/TrackedPhoneLink';
import { CheckCircle, PhoneCall, MapPin, ShieldCheck, CalendarClock, Star, ArrowRight } from 'lucide-react';
import type { ServiceData } from '@/lib/service-data';
import type { TownData } from '@/lib/town-data';
import { services } from '@/lib/service-data';
import { generateServiceLocationFaqs, buildServiceTownSolution } from '@/lib/service-location-helpers';
import { GhlReviewsWidget } from '@/components/GhlReviewsWidget';
import { AuthorityBar } from '@/components/AuthorityBar';
import { SectionHeader } from '@/components/SectionHeader';

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
      {/* Hero */}
      <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/6.jpeg)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/90 via-brand-navy/80 to-brand-navy/70" />
        </div>
        <div className="container-custom relative z-10">
          <div className="max-w-3xl text-white space-y-5">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-orange text-white font-bold">
              <MapPin className="w-4 h-4" />
              <span className="text-sm tracking-wide">FREE ROOF INSPECTION · {town.town.toUpperCase()}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              {service.name} in <span className="text-brand-orange">{town.town}</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl leading-relaxed">
              Expert {service.name.toLowerCase()} from your local Cheshire roofers. {town.distanceFromBase} · fast response, free quotes, 10-year guarantee.
            </p>

            {/* Call-first highlight box */}
            <div className="bg-white/10 backdrop-blur-sm border-l-4 border-brand-orange p-6 text-left max-w-md">
              <div className="text-3xl sm:text-4xl font-bold text-brand-orange mb-1">{PHONE_DISPLAY}</div>
              <div className="text-lg font-semibold">We Answer in 30 Seconds!</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <QuoteForm trigger={
                <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-8 h-14 text-lg rounded-xl">
                  <span className="!text-white">Get Your Free Inspection</span>
                </Button>
              } />
              <Button size="lg" variant="outline" className="!bg-transparent border-2 border-white !text-white hover:bg-white/10 hover:border-brand-orange font-bold px-8 h-14 text-lg rounded-xl transition-colors" asChild>
                <TrackedPhoneLink href={PHONE_TEL} placement="service_location_hero">
                  <PhoneCall className="w-5 h-5 mr-2" /><span className="!text-white">{PHONE_DISPLAY}</span>
                </TrackedPhoneLink>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20 max-w-md">
              <div className="text-center">
                <ShieldCheck className="w-7 h-7 text-brand-orange mx-auto mb-1.5" />
                <div className="text-xs font-semibold">£10M Public Liability Insured</div>
              </div>
              <div className="text-center">
                <Star className="w-7 h-7 text-yellow-400 fill-current mx-auto mb-1.5" />
                <div className="text-xs font-semibold">5-Star Google · MyApproved Verified</div>
              </div>
              <div className="text-center">
                <CalendarClock className="w-7 h-7 text-brand-orange mx-auto mb-1.5" />
                <div className="text-xs font-semibold">Same Day Response</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AEO Answer Block */}
      <section id="answer" className="bg-gray-50 border-b-2 border-brand-orange/20 py-6">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <p className="text-base font-semibold text-brand-navy leading-relaxed">
              <strong>Upgrade Roofs provides expert {service.name.toLowerCase()} in {town.town} ({town.postcode}).</strong>{' '}
              {buildServiceTownSolution(service, town).split('.')[0]}. {town.distanceFromBase} · emergency response within {town.emergencyResponseTime}. CORC certified, £10M insured, 10-year workmanship guarantee, free written quotes.
            </p>
          </div>
        </div>
      </section>

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
              <div className="mt-6 pt-6 border-t border-gray-200">
                <QuoteForm trigger={
                  <Button className="w-full bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold h-12 text-base rounded-xl">
                    <span className="!text-white">Get Free {service.name} Quote</span>
                  </Button>
                } />
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* CTA */}
      <section className="section-padding bg-gradient-to-r from-brand-navy to-brand-navy/90 text-white">
        <div className="container-custom text-center">
          <SectionHeader
            dark
            kicker="Free Inspection"
            title={<>Need {service.name} in {town.town}?</>}
          />
          <p className="text-xl mb-2 max-w-2xl mx-auto">
            {town.ctaLine || `Get a free, no-obligation quote. We'll inspect and provide a clear written price.`}
          </p>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white/80">
            We'll call you within 10 minutes to confirm your booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <QuoteForm trigger={
              <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-10 h-14 text-lg rounded-xl">
                <span className="!text-white">Get Your Free Inspection</span>
              </Button>
            } />
            <Button size="lg" variant="outline" className="!bg-transparent border-2 border-white !text-white hover:bg-white/10 hover:border-brand-orange font-bold px-10 h-14 text-lg rounded-xl transition-colors" asChild>
              <TrackedPhoneLink href={PHONE_TEL} placement="service_location_cta">
                <PhoneCall className="w-5 h-5 mr-2" /><span className="!text-white">Call Now</span>
              </TrackedPhoneLink>
            </Button>
          </div>
          <p className="text-white/60 text-sm mt-6">
            Based in Sandbach · Serving {town.town} & all of Cheshire · Call: {PHONE_DISPLAY}
          </p>
        </div>
      </section>

      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </div>
  );
}
