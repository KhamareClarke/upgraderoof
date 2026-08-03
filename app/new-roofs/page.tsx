import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { QuoteForm } from '@/components/QuoteForm';
import { TrackedPhoneLink } from '@/components/TrackedPhoneLink';
import { Home, CheckCircle, Clock, Shield, Award, MapPin, ArrowRight, Phone, Star } from 'lucide-react';
import Link from 'next/link';
import { ServiceAreaLinks } from '@/components/ServiceAreaLinks';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'New Roofs Sandbach & Cheshire | 10-Year Guarantee | Upgrade Roofs',
  description: 'New roof installations in Sandbach & across Cheshire. Tile, slate, flat roofing. 10-year guarantee, £10M insured. Expert re-roofing from our Sandbach base. Free quotes. Call 01270 897606.',
  keywords: 'new roofs Sandbach, re-roofing Sandbach, new roof Cheshire, roof replacement Sandbach, new tile roof, new slate roof',
  openGraph: {
    title: 'New Roofs Sandbach & Cheshire | 10-Year Guarantee',
    description: 'New roof installations in Sandbach & across Cheshire. 10-year guarantee. Free quotes.',
    url: 'https://www.upgraderoofs.co.uk/new-roofs',
    siteName: 'Upgrade Roofs',
    images: [
      {
        url: 'https://www.upgraderoofs.co.uk/images/6.jpeg',
        width: 1200,
        height: 630,
        alt: 'New Roofs Sandbach - Upgrade Roofs',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'New Roofs Sandbach & Cheshire | Upgrade Roofs',
    description: 'Complete roof replacements from our Sandbach base. Tile, slate, flat roofing. 10-year guarantee.',
    images: ['https://www.upgraderoofs.co.uk/images/6.jpeg'],
  },
  alternates: {
    canonical: 'https://www.upgraderoofs.co.uk/new-roofs',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function NewRoofsPage() {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.upgraderoofs.co.uk' },
        { name: 'New Roofs', url: 'https://www.upgraderoofs.co.uk/new-roofs' },
      ]} />
      <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-r from-brand-navy via-brand-navy/95 to-brand-navy/90">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
              <Home className="w-4 h-4 text-brand-orange" />
              <span>Complete Installations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              New Roofs &amp; Re-Roofing in <span className="text-brand-orange">Sandbach</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl">
              Complete roof replacements from our Sandbach base. Premium materials, expert craftsmanship, and a 10-year guarantee on every installation. Serving Sandbach and all of Cheshire.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <QuoteForm trigger={
                <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-8 h-14">
                  Get Free Quote
                </Button>
              } />
              <Button size="lg" variant="outline" className="border-2 border-white !text-white hover:bg-white/10 hover:border-brand-orange font-bold px-8 h-14" asChild>
                <TrackedPhoneLink href="tel:01270897606" placement="new_roofs_hero">
                  <Phone className="w-5 h-5 mr-2" />
                  01270 897 606
                </TrackedPhoneLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Roof Types */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
              New Roof Options for Sandbach &amp; Cheshire Homes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've installed hundreds of new roofs in Sandbach and across Cheshire. Tile, slate, and modern flat roofing systems for every property type.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Tile Roofing', 
                desc: 'Concrete and clay tiles. Traditional look, excellent durability. Popular choice across Cheshire.',
                features: ['50+ year lifespan', 'Wide colour range', 'Weather resistant']
              },
              { 
                title: 'Slate Roofing', 
                desc: 'Natural Welsh slate. Premium quality, timeless appearance. Perfect for period properties.',
                features: ['100+ year lifespan', 'Low maintenance', 'Adds property value']
              },
              { 
                title: 'Flat Roofing', 
                desc: 'EPDM rubber and GRP fibreglass. Modern systems for extensions, garages, and dormer roofs.',
                features: ['20 year guarantee', 'Seamless finish', 'Quick installation']
              },
            ].map((type, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-8 border border-gray-200 hover:border-brand-orange/50 hover:shadow-lg transition-all">
                <h3 className="text-2xl font-bold text-brand-navy mb-3">{type.title}</h3>
                <p className="text-gray-600 mb-6">{type.desc}</p>
                <ul className="space-y-2">
                  {type.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-brand-orange flex-shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
              Our Re-Roofing Process
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From initial survey to final inspection, we manage every step professionally.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Free Survey', desc: 'We visit your property in Sandbach or anywhere in Cheshire, assess the roof, and provide a detailed written quote.' },
              { step: '2', title: 'Strip & Prepare', desc: 'Old roof removed, timbers inspected and repaired, new felt and battens installed.' },
              { step: '3', title: 'Install New Roof', desc: 'Premium materials installed by experienced roofers. All work to building regulations.' },
              { step: '4', title: 'Clean & Inspect', desc: 'Site cleaned, final inspection, 10-year guarantee certificate issued.' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="w-12 h-12 bg-brand-orange text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-6">
                Why Choose Upgrade Roofs for Your New Roof?
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Award, title: 'CORC Certified', desc: 'Competent Roofer Scheme member. Independently assessed and approved.' },
                  { icon: Shield, title: '£10M Insurance', desc: 'Full public liability insurance. Your property is protected throughout the project.' },
                  { icon: CheckCircle, title: '10-Year Guarantee', desc: 'Comprehensive workmanship guarantee on all new roof installations.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-brand-orange" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-navy mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/service-areas" className="inline-flex items-center gap-2 text-brand-orange font-semibold hover:underline">
                  <MapPin className="w-4 h-4" />
                  See all Cheshire areas we cover <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-brand-navy mb-6">Get Your Free Quote</h3>
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>

      {/* New Roof Reviews */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-brand-navy mb-6 text-center">What Customers Say About Our New Roofs</h2>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { text: 'Complete re-roof on our 1930s semi. New Marley tiles, new felt, new battens — the lot. Team were brilliant, tidy, and finished in 4 days. Our house looks brand new from the street.', name: 'Sarah & David P.', location: 'Elworth, Sandbach' },
              { text: 'Had three quotes for a full re-roof. Upgrade Roofs were the most detailed — they explained everything, showed us tile samples, and the final result is outstanding. 10-year guarantee too.', name: 'Graham T.', location: 'Congleton Road, Sandbach' },
              { text: 'New slate roof on our Victorian terrace. They matched the original Welsh slate perfectly. Neighbours have been asking who did the work. Very happy with the result.', name: 'Helen & James M.', location: 'Middlewich' },
            ].map((r, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex gap-1 mb-2">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />)}</div>
                <p className="text-sm text-gray-700 italic mb-3">"{r.text}"</p>
                <p className="text-sm font-semibold text-brand-navy">{r.name}</p>
                <p className="text-xs text-gray-500">{r.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contextual Cross-Links */}
      <section className="py-10 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto prose prose-lg text-gray-600 leading-relaxed">
            <p>
              Not sure if you need a full replacement? Our team can assess whether <Link href="/roof-repairs" className="text-brand-orange hover:underline font-medium">targeted roof repairs</Link> could 
              extend your existing roof's life. Find your local page for recent projects: <Link href="/roofers-sandbach" className="text-brand-orange hover:underline font-medium">Sandbach</Link>, <Link href="/roofers-crewe" className="text-brand-orange hover:underline font-medium">Crewe</Link>, <Link href="/roofers-congleton" className="text-brand-orange hover:underline font-medium">Congleton</Link>, <Link href="/roofers-nantwich" className="text-brand-orange hover:underline font-medium">Nantwich</Link>, or <Link href="/roofers-middlewich" className="text-brand-orange hover:underline font-medium">Middlewich</Link>. We also specialise in <Link href="/services/flat-roofing" className="text-brand-orange hover:underline font-medium">flat roofing systems</Link> for 
              extensions and garages, and <Link href="/services/chimney-repairs" className="text-brand-orange hover:underline font-medium">chimney repairs</Link> that are often needed alongside a new roof. 
              Read our guides on <Link href="/blog/how-long-does-roof-last" className="text-brand-orange hover:underline font-medium">how long different roofs last</Link> and <Link href="/blog/flat-vs-tile-roofs" className="text-brand-orange hover:underline font-medium">flat vs tile roofs compared</Link> to help you choose.
            </p>
          </div>
        </div>
      </section>

      <ServiceAreaLinks serviceName="New Roofs & Re-Roofing" />

      {/* CTA */}
      <section className="section-padding bg-brand-navy text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready for a New Roof in Sandbach?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Get a free, no-obligation quote for your complete roof replacement in Sandbach or across Cheshire
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-10 h-14" asChild>
              <TrackedPhoneLink href="tel:01270897606" placement="new_roofs_bottom_cta">
                <Phone className="w-5 h-5 mr-2" />
                Call 01270 897 606
              </TrackedPhoneLink>
            </Button>
            <QuoteForm trigger={
              <Button size="lg" variant="outline" className="border-2 border-white !text-white hover:bg-white/10 hover:border-brand-orange font-bold px-10 h-14">
                Get Free Quote
              </Button>
            } />
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
