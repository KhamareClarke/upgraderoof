import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { GeoEntityCitation } from '@/components/GeoEntityCitation';
import { Services } from '@/components/Services';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { VideoTestimonials } from '@/components/VideoTestimonials';
import { CTABanner } from '@/components/CTABanner';
import { GalleryBlock, FAQBlock, ContactBlock, SEOBlock } from '@/components/HomepageSections';
import { GhlReviewsWidget } from '@/components/GhlReviewsWidget';
import { Star, Award, Shield, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  // The root layout already provides a default title and template.
  // We can override the title here for the homepage specifically.
  title: 'Your Trusted Local Roofers in Sandbach & Cheshire | Upgrade Roofs',
  description: 'Upgrade Roofs offers expert roof repair, new roofs, and flat roofing in Sandbach, Crewe, and across Cheshire. CORC-certified with 25+ years of experience. Get your free quote today.',
  openGraph: {
    title: 'Upgrade Roofs | Trusted Roofers in Sandbach & Cheshire',
    description: '25+ years experience, CORC certified, £10M insured. We offer roof repairs, new roofs, and more. Free quotes available.',
    url: 'https://www.upgraderoofs.co.uk',
    siteName: 'Upgrade Roofs',
    images: [
      {
        url: 'https://www.upgraderoofs.co.uk/og-image.jpg', // Using a dedicated OG image is better
        width: 1200,
        height: 630,
        alt: 'A newly installed roof by Upgrade Roofs in Cheshire',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Upgrade Roofs | Trusted Roofers in Sandbach & Cheshire',
    description: 'Your local, certified roofing experts for repairs, new roofs, and more in Sandbach & Cheshire.',
    images: ['https://www.upgraderoofs.co.uk/twitter-image.jpg'], // Using a dedicated Twitter image
  },
  alternates: {
    canonical: 'https://www.upgraderoofs.co.uk',
  },
};

export default function Home() {
  return (
    <>
      <section id="hero">
        <Hero />
      </section>

      {/* GEO Entity Citation — dense, quotable business entity for AI answer engines */}
      <GeoEntityCitation />

      {/* Trust Badges Section */}
      <section className="section-padding bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-4">
              Trusted & Approved
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Recognised by leading industry bodies and trusted by thousands of customers
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {/* MyApproved */}
            <a
              href="https://myapproved.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 overflow-hidden">
                {/* MyApproved logo */}
                <img
                  src="https://myapproved.com/logo-icon.svg"
                  alt="MyApproved logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <p className="text-sm font-semibold text-gray-800">MyApproved</p>
              <p className="text-xs text-gray-600 mt-1">Vetted & Verified</p>
            </a>

            {/* Google Reviews */}
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800">Google Reviews</p>
              <p className="text-xs text-gray-600 mt-1">5 Star Rated</p>
            </div>

            {/* CORC */}
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800">CORC</p>
              <p className="text-xs text-gray-600 mt-1">Approved Member</p>
            </div>

            {/* IBG */}
            <div className="flex flex-col items-center text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800">IBG</p>
              <p className="text-xs text-gray-600 mt-1">Insurance Backed Guarantee</p>
            </div>
          </div>
        </div>
      </section>
      
      <section id="services">
        <Services />
      </section>
      <section id="about">
        <WhyChooseUs />
      </section>
      <VideoTestimonials />

      {/* Live Google Reviews — real customer reviews via GHL */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-2">
              Real Reviews from Real Customers
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              5★ rated on Google with hundreds of verified reviews from homeowners across Cheshire
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <GhlReviewsWidget />
          </div>
        </div>
      </section>
      <div className="bg-gradient-to-b from-white via-gray-50 to-gray-100">
        <section id="gallery">
          <GalleryBlock />
        </section>
        <FAQBlock />
      </div>
      <CTABanner />

      {/* Local Service Areas — Internal Linking Hub */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-3">
              Roofing Services Across <span className="text-brand-orange">Cheshire</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Based in Sandbach, we serve homeowners and businesses throughout south and mid-Cheshire.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-brand-orange/10 border-2 border-brand-orange/30 rounded-xl">
              <MapPin className="w-5 h-5 text-brand-orange" />
              <span className="text-sm font-semibold text-brand-navy">
                Looking for{' '}
                <Link href="/roofers-sandbach" className="text-brand-orange hover:underline font-bold">
                  roofers in Sandbach
                </Link>
                ? We're based on Crewe Road, CW11 4NE
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {[
              { name: 'Roofers Sandbach', href: '/roofers-sandbach' },
              { name: 'Roofers Crewe', href: '/roofers-crewe' },
              { name: 'Roofers Middlewich', href: '/roofers-middlewich' },
              { name: 'Roofers Congleton', href: '/roofers-congleton' },
              { name: 'Roofers Nantwich', href: '/roofers-nantwich' },
              { name: 'Roofers Alsager', href: '/roofers-alsager' },
              { name: 'Roofers Holmes Chapel', href: '/roofers-holmes-chapel' },
              { name: 'All Service Areas', href: '/service-areas' },
            ].map((area, i) => (
              <Link key={i} href={area.href} className="group flex items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-orange/50 hover:shadow-md transition-all">
                <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0" />
                <span className="text-sm font-semibold text-brand-navy group-hover:text-brand-orange transition-colors">{area.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/service-areas" className="inline-flex items-center gap-2 text-brand-orange font-semibold hover:underline">
              View all service areas <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <SEOBlock />
      <section id="contact">
        <ContactBlock />
      </section>

      {/* Homepage FAQPage Schema — matches FAQ component questions */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'How much does a new roof cost in Cheshire?',
                acceptedAnswer: { '@type': 'Answer', text: 'Costs vary by property size and materials. A terraced house re-roof in Cheshire typically costs £5,000–£8,000; semi-detached £6,500–£10,000; larger detached homes £8,000–£15,000+. We provide free, no-obligation written quotes with transparent itemised pricing — no hidden costs.' }
              },
              {
                '@type': 'Question',
                name: 'How long does a roof replacement take?',
                acceptedAnswer: { '@type': 'Answer', text: 'Most residential roof replacements take 3 to 7 working days depending on property size and weather conditions. We provide a clear schedule before starting, keep you informed throughout, and remove debris daily.' }
              },
              {
                '@type': 'Question',
                name: 'Do you offer emergency roofing services?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes. Upgrade Roofs provides a 24/7 emergency call-out service across Cheshire. Based in Sandbach on Crewe Road, we can typically reach any Cheshire property within 30–60 minutes. Call 01270 897606 for emergencies.' }
              },
              {
                '@type': 'Question',
                name: 'What areas of Cheshire do you cover?',
                acceptedAnswer: { '@type': 'Answer', text: 'We cover Sandbach, Crewe, Middlewich, Congleton, Alsager, Nantwich, Holmes Chapel, and surrounding areas throughout Cheshire. Our base is at 20 Crewe Road, Sandbach, CW11 4NE.' }
              },
              {
                '@type': 'Question',
                name: 'What warranty do you offer on roofing work?',
                acceptedAnswer: { '@type': 'Answer', text: 'All work comes with a 10-year workmanship guarantee backed by our Insurance Backed Guarantee (IBG) scheme. Marley tile roofs carry a 15-year manufacturer warranty and EPDM flat roofs a 20-year waterproof guarantee. We are CORC certified and carry £10M public liability insurance.' }
              },
              {
                '@type': 'Question',
                name: 'Can you match existing tiles for repairs?',
                acceptedAnswer: { '@type': 'Answer', text: 'Yes. Tile and slate matching is part of our service. We source from a wide range of manufacturers and suppliers and can usually find a very close match for most tile and slate types used on Cheshire properties.' }
              },
            ]
          })
        }}
      />

      {/* BreadcrumbList Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.upgraderoofs.co.uk' }
            ]
          })
        }}
      />

      {/* Speakable Schema — key sections for AI/voice assistants */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': 'https://www.upgraderoofs.co.uk/#webpage',
            url: 'https://www.upgraderoofs.co.uk',
            name: 'Trusted Roofers in Sandbach & Cheshire | Upgrade Roofs',
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#entity-citation', '#hero', '#services', '#about']
            },
            isPartOf: { '@id': 'https://www.upgraderoofs.co.uk/#website' }
          })
        }}
      />
    </>
  );
}
