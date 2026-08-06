import type { Metadata } from 'next';
import { Layers, CheckCircle, Award, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QuoteForm } from '@/components/QuoteForm';
import { ServiceAreaLinks } from '@/components/ServiceAreaLinks';

export const metadata: Metadata = {
  title: 'Flat Roofing Cheshire | EPDM & GRP Installation | Upgrade Roofs',
  description: 'Expert flat roofing in Cheshire. EPDM rubber, GRP fibreglass, felt roofing. 20-year warranty. Perfect for extensions, garages, commercial properties.',
  keywords: 'flat roofing Cheshire, EPDM roofing, GRP fibreglass, flat roof repairs',
};

export default function FlatRoofingPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/3.jpeg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-orange/20" />
        </div>

        <div className="container-custom relative z-10 px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium">
              <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Modern Solutions</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-2">Flat Roofing Cheshire</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 px-2">
              Superior waterproofing with modern materials and expert installation
            </p>
            <QuoteForm trigger={
              <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6 sm:px-8 md:px-10 h-12 sm:h-14 text-base sm:text-lg w-full sm:w-auto">
                Get Free Quote
              </Button>
            } />
          </div>
        </div>
      </section>

      {/* AEO Answer Block */}
      <section id="answer" className="bg-gray-50 border-b-2 border-brand-orange/20 py-6">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <p className="text-base font-semibold text-brand-navy leading-relaxed">
              <strong>Upgrade Roofs provides expert flat roofing in Cheshire</strong> using EPDM rubber, GRP fibreglass, and felt systems — suitable for extensions, garages, and commercial buildings. 20-year waterproof warranty on EPDM and GRP installations. CORC certified, £10M insured, free written quotes. Serving Sandbach, Crewe, Middlewich, Congleton, Nantwich, Alsager, and Holmes Chapel.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center mb-10 sm:mb-12 md:mb-16">
            <div className="order-2 lg:order-1">
              <div className="prose prose-lg max-w-none">
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-4 sm:mb-6">
                  Whether you need a new flat roof for your extension, garage, or commercial property, we deliver reliable, long-lasting solutions using the latest materials and techniques. For homeowners looking for <Link href="/roofers-sandbach" className="text-brand-orange font-semibold hover:underline">flat roof specialists in Sandbach</Link>, we're based on Crewe Road and serve all CW11 areas.
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  From EPDM rubber systems to GRP fibreglass, our experienced team ensures your flat roof is watertight and built to last.
                </p>
              </div>
            </div>

            <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl order-1 lg:order-2">
              <img
                src="/images/3.jpeg"
                alt="EPDM rubber flat roof installation on a garage extension in Cheshire by Upgrade Roofs"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 mb-10 sm:mb-12 md:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center px-2">Our Flat Roofing Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {[
                'EPDM rubber roofing systems',
                'GRP fibreglass installation',
                'Traditional felt roofing',
                'Flat roof repairs and maintenance',
                'Re-roofing and replacements',
                'Waterproofing solutions',
                'Commercial flat roofing',
                'Emergency leak repairs',
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <span className="text-sm sm:text-base break-words">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
            {[
              {
                icon: Award,
                title: '20-Year Warranty',
                description: 'Comprehensive warranty on all flat roofing installations',
              },
              {
                icon: Shield,
                title: 'Superior Waterproofing',
                description: 'Advanced materials for complete weather protection',
              },
              {
                icon: Clock,
                title: 'Fast Installation',
                description: 'Efficient installation with minimal disruption',
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl bg-brand-orange/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-brand-orange" />
                  </div>
                  <h4 className="text-lg sm:text-xl font-bold text-brand-navy mb-1 sm:mb-2">{feature.title}</h4>
                  <p className="text-sm sm:text-base text-gray-600 px-2">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ServiceAreaLinks serviceName="Flat Roofing" />

      <section className="section-padding bg-brand-grey">
        <div className="container-custom text-center px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-3 sm:mb-4">Ready to Start Your Flat Roofing Project?</h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Get a free, no-obligation quote for your flat roofing project in Cheshire
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <QuoteForm trigger={
              <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6 sm:px-8 md:px-10 h-12 sm:h-14 text-base sm:text-lg w-full sm:w-auto">
                Get Free Quote
              </Button>
            } />
            <Button size="lg" variant="outline" className="border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white font-semibold px-6 sm:px-8 md:px-10 h-12 sm:h-14 text-base sm:text-lg w-full sm:w-auto" asChild>
              <Link href="/services" className="flex items-center justify-center">
                View All Services
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
