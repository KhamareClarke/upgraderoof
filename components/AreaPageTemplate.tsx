import Link from 'next/link';
import { PHONE_DISPLAY, PHONE_TEL } from '@/lib/contact';
import { Button } from '@/components/ui/button';
import { QuoteForm } from '@/components/QuoteForm';
import { InlineLeadForm } from '@/components/InlineLeadForm';
import { StickyMobileCta } from '@/components/StickyMobileCta';
import { TrackedPhoneLink } from '@/components/TrackedPhoneLink';
import { CheckCircle, PhoneCall, MapPin, ShieldCheck, Medal, CalendarClock, Star, ArrowRight, BrickWall, Layers, Flame, CloudRain, Zap, Hammer, Clock, Phone } from 'lucide-react';
import { GeoEntityCitation } from '@/components/GeoEntityCitation';
import { ReviewsSection } from '@/components/ReviewsSection';
import { AuthorityBar } from '@/components/AuthorityBar';
import { SectionHeader } from '@/components/SectionHeader';
import { HeroKicker } from '@/components/HeroKicker';
import { CtaSubMessage } from '@/components/CtaSubMessage';

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

const QA_ANGLE = [
  'a rapid, no-fuss solution',
  'a reliable, long-lasting fix',
  'a tidy, high-quality result',
  'peace of mind backed by a written warranty',
] as const;

function pickQaAngle(town: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < town.length; i += 1) {
    h ^= town.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) % QA_ANGLE.length;
}

export function AreaPageTemplate({ town, postcode, distanceFromBase, emergencyResponseTime, intro, localContext, roofingChallenges, landmarks, propertyTypes, commonProblems, proofPoint, ctaLine, faqs, nearbyAreas }: AreaPageProps) {
  const services = [
    { icon: BrickWall, title: 'Tile & Slate Roofing', desc: `Expert tile and slate roof installation and repair across ${town}. Traditional and modern options.`, href: '/services/tile-slate-roofing' },
    { icon: Layers, title: 'Flat Roofing', desc: `EPDM rubber and GRP fibreglass flat roofing for ${town} properties. Up to 20-year guarantee.`, href: '/services/flat-roofing' },
    { icon: Flame, title: 'Chimney Repairs', desc: `Chimney repointing, lead flashing, and stack repairs for ${town} homes.`, href: '/services/chimney-repairs' },
    { icon: CloudRain, title: 'Guttering & Fascias', desc: `uPVC guttering, fascias, and soffits. Full replacements and repairs in ${town}.`, href: '/services/gutters-fascias' },
    { icon: Hammer, title: 'Roof Repairs', desc: `Fast, reliable roof repairs for leaks, storm damage, and missing tiles in ${town}.`, href: '/roof-repairs' },
    { icon: Zap, title: 'Emergency Roofing', desc: `24/7 emergency call-outs to ${town}. Storm damage, leaks, and urgent make-safe work.`, href: '/emergency-roofing' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero · two-column, inline lead form (matches special-offer design) */}
      <section className="relative py-10 sm:py-14 md:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/6.jpeg)' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/90 via-brand-navy/80 to-brand-navy/70" />
        </div>
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left column · headlines & trust */}
            <div className="text-white space-y-5">
              <HeroKicker light>Free Roof Inspection · {town}</HeroKicker>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                Roofers in <span className="text-brand-orange">{town}</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 leading-relaxed">{intro}</p>

              {/* Call-first highlight box */}
              <div className="bg-white/10 backdrop-blur-sm border-l-4 border-brand-orange p-6 text-left max-w-md">
                <div className="text-3xl sm:text-4xl font-bold text-brand-orange mb-1">{PHONE_DISPLAY}</div>
                <div className="text-lg font-semibold">We Answer in 30 Seconds!</div>
              </div>

              <ul className="text-base text-white/90 space-y-1">
                <li>✓ CORC certified · properly qualified roofers</li>
                <li>✓ £10M public liability insurance</li>
                <li>✓ 10-year workmanship guarantee on all work</li>
                <li>✓ Free written quote · no obligation, no pressure</li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" variant="outline" className="!bg-transparent border-2 border-white !text-white hover:bg-white/10 hover:border-brand-orange font-bold px-8 h-14 text-lg rounded-xl transition-colors" asChild>
                  <TrackedPhoneLink href={PHONE_TEL} placement="area_page_hero"><PhoneCall className="w-5 h-5 mr-2" /><span className="!text-white">{PHONE_DISPLAY}</span></TrackedPhoneLink>
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

            {/* Right column · inline lead form */}
            <InlineLeadForm town={town} />
          </div>
        </div>
      </section>

      {/* AEO Answer Block */}
      <section id="answer" className="bg-gray-50 border-b-2 border-brand-orange/20 py-6">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <p className="text-base font-semibold text-brand-navy leading-relaxed">
              <strong>Upgrade Roofs provides expert roofing services in {town}, Cheshire.</strong>{' '}
              Our CORC-certified team covers roof repairs, new roofs, flat roofing, chimney repairs, gutters, skylights, and 24/7 emergency call-outs across the {town} area. Based in Sandbach · {distanceFromBase || 'within 8 miles'} · with {QA_ANGLE[pickQaAngle(town)]} and a 10-year workmanship guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* GEO Entity Citation · dense, quotable business entity for AI answer engines */}
      <GeoEntityCitation town={town} postcode={postcode} />

      {/* AEO Quick-Answer Block · direct answers to high-intent voice/AI questions */}
      <section id="quick-answers" className="bg-white border-b border-gray-100 py-8">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <SectionHeader kicker="Quick Answers" title={<>Roofing in {town} · Quick Answers</>} />
            <dl className="space-y-4">
              <div className="bg-gray-50 p-5 border-l-4 border-brand-navy">
                <dt className="font-semibold text-brand-navy mb-1">How much does a roof repair cost in {town}?</dt>
                <dd className="text-sm text-gray-600 leading-relaxed">
                  Minor roof repairs in {town} (slipped tiles, ridge repointing) typically cost £150–£500. Larger repairs involving leadwork or valleys range from £500–£2,000. Upgrade Roofs provides a free, no-obligation written quote after a roof inspection.
                </dd>
              </div>
              <div className="bg-gray-50 p-5 border-l-4 border-brand-navy">
                <dt className="font-semibold text-brand-navy mb-1">Who is the best rated emergency roofer in {town}?</dt>
                <dd className="text-sm text-gray-600 leading-relaxed">
                  Upgrade Roofs is a 5-star rated, CORC-certified emergency roofer serving {town}, with 127+ five-star Google reviews. Based {distanceFromBase || 'nearby in Sandbach'}, the team offers 24/7 emergency call-outs{emergencyResponseTime ? ` and typically reaches ${town} within ${emergencyResponseTime}` : ''}. Call {PHONE_DISPLAY} for emergencies.
                </dd>
              </div>
              <div className="bg-gray-50 p-5 border-l-4 border-brand-navy">
                <dt className="font-semibold text-brand-navy mb-1">How long does a flat roof replacement take?</dt>
                <dd className="text-sm text-gray-600 leading-relaxed">
                  Most flat roof replacements in {town} (garage or extension) are completed in 1–2 days using EPDM rubber or GRP fibreglass, both backed by a 20-year waterproof guarantee. Larger or more complex flat roofs may take 2–4 days.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <AuthorityBar />

      {/* Local Proof Bar */}
      {(postcode || distanceFromBase || proofPoint) && (
        <section className="py-6 bg-brand-orange/5 border-b border-brand-orange/10">
          <div className="container-custom">
            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm text-gray-700">
              {postcode && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-orange" />
                  <span className="font-semibold">Covering {postcode}</span>
                </div>
              )}
              {distanceFromBase && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-orange" />
                  <span className="font-semibold">{distanceFromBase}</span>
                  <span className="font-semibold">Emergency: {emergencyResponseTime}</span>
                </div>
              )}
            </div>
            {proofPoint && (
              <p className="text-center text-sm font-medium text-brand-navy mt-3">{proofPoint}</p>
            )}
          </div>
        </section>
      )}

      {/* Local Context */}
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

      {/* Contextual Cross-Links */}
      <section className="py-8 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-gray-600 leading-relaxed text-lg">
            <p>
              We handle everything from <Link href="/roof-repairs" className="text-brand-orange hover:underline font-medium">urgent roof repairs</Link> and 
              <Link href="/emergency-roofing" className="text-brand-orange hover:underline font-medium"> emergency roofing</Link> call-outs to 
              complete <Link href="/new-roofs" className="text-brand-orange hover:underline font-medium">new roof installations</Link> across {town}. 
              Based in Sandbach, our team can usually reach {town} the same day. See our <Link href="/roofers-sandbach" className="text-brand-orange hover:underline font-medium">Sandbach roofing page</Link> for 
              local case studies, or browse our full <Link href="/services" className="text-brand-orange hover:underline font-medium">range of services</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <SectionHeader kicker="Our Services" title={<>Roofing Services in {town}</>} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, i) => (
              <Link key={i} href={s.href} className="group bg-white p-6 border border-gray-300 hover:border-brand-navy transition-colors">
                <div className="w-12 h-12 bg-brand-orange/10 flex items-center justify-center mb-4">
                  <s.icon className="w-6 h-6 text-brand-orange" />
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-2 group-hover:text-brand-orange transition-colors">{s.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">{s.desc}</p>
                <span className="text-brand-orange font-semibold text-sm flex items-center gap-1">
                  Learn more <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
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
      <ReviewsSection />

      {/* CTA */}
      <section className="section-padding bg-gradient-to-r from-brand-navy to-brand-navy/90 text-white">
        <div className="container-custom text-center">
          <SectionHeader dark kicker="Free Inspection" title={<>Need a Roofer in {town}?</>} />
          <p className="text-xl mb-2 max-w-2xl mx-auto">
            {ctaLine || 'Get a free, no-obligation quote. We\'ll inspect your roof and provide a clear, written price.'}
          </p>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white/80">
            We'll call you within 10 minutes to confirm your booking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex flex-col items-center gap-2">
              <QuoteForm trigger={
                <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-10 h-14 text-lg rounded-xl shadow-lg">
                  <span className="!text-white">Get Your Free Inspection</span>
                </Button>
              } />
              <CtaSubMessage dark />
            </div>
            <Button size="lg" variant="outline" className="!bg-transparent border-2 border-white !text-white hover:bg-white/10 hover:border-brand-orange font-bold px-10 h-14 text-lg rounded-xl transition-colors" asChild>
              <TrackedPhoneLink href={PHONE_TEL} placement="area_page_cta"><Phone className="w-5 h-5 mr-2" /><span className="!text-white">Call Now</span></TrackedPhoneLink>
            </Button>
          </div>
          <p className="text-white/60 text-sm mt-6">
            Based in Sandbach · Serving {town} & all of Cheshire · Call: {PHONE_DISPLAY}
          </p>
        </div>
      </section>

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
      {/* FAQ Schema · town FAQs + the 3 above-the-fold quick answers */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: `How much does a roof repair cost in ${town}?`,
                acceptedAnswer: { '@type': 'Answer', text: `Minor roof repairs in ${town} (slipped tiles, ridge repointing) typically cost £150–£500. Larger repairs involving leadwork or valleys range from £500–£2,000. Upgrade Roofs provides a free, no-obligation written quote after a roof inspection.` }
              },
              {
                '@type': 'Question',
                name: `Who is the best rated emergency roofer in ${town}?`,
                acceptedAnswer: { '@type': 'Answer', text: `Upgrade Roofs is a 5-star rated, CORC-certified emergency roofer serving ${town}, with 127+ five-star Google reviews. Based ${distanceFromBase || 'nearby in Sandbach'}, the team offers 24/7 emergency call-outs${emergencyResponseTime ? ` and typically reaches ${town} within ${emergencyResponseTime}` : ''}. Call ${PHONE_DISPLAY} for emergencies.` }
              },
              {
                '@type': 'Question',
                name: 'How long does a flat roof replacement take?',
                acceptedAnswer: { '@type': 'Answer', text: `Most flat roof replacements in ${town} (garage or extension) are completed in 1–2 days using EPDM rubber or GRP fibreglass, both backed by a 20-year waterproof guarantee. Larger or more complex flat roofs may take 2–4 days.` }
              },
              ...faqs.map(faq => ({
                '@type': 'Question',
                name: faq.q,
                acceptedAnswer: { '@type': 'Answer', text: faq.a }
              }))
            ]
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
              cssSelector: ['#entity-citation', '#answer', '#quick-answers', 'h1'],
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
