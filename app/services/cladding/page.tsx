import type { Metadata } from 'next';
import { Square, CheckCircle, Award, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QuoteForm } from '@/components/QuoteForm';
import { ServiceAreaLinks } from '@/components/ServiceAreaLinks';
import { TrackedPhoneLink } from '@/components/TrackedPhoneLink';
import { SectionHeader } from '@/components/SectionHeader';

export const metadata: Metadata = {
  title: 'Cladding Installation Cheshire | uPVC & Timber | Upgrade Roofs',
  description: 'Professional cladding installation in Cheshire. uPVC, timber, modern finishes. Weather-resistant, low maintenance. Transform your property.',
  keywords: 'cladding Cheshire, uPVC cladding, timber cladding, wall cladding installation',
};

export default function CladdingPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/4.jpeg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-orange/20" />
        </div>

        <div className="container-custom relative z-10 px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium">
              <Square className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Modern Finishes</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-2">Cladding Installation Cheshire</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 px-2">
              Transform your property with modern, weather-resistant cladding
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
              <strong>Upgrade Roofs installs wall cladding across Cheshire</strong> including uPVC and timber systems for residential and commercial properties. Improves weatherproofing, insulation, and kerb appeal with a fully guaranteed finish. CORC certified, £10M insured, free written quotes. Serving Sandbach, Crewe, Middlewich, Congleton, Nantwich, Alsager, and Holmes Chapel.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center mb-10 sm:mb-12 md:mb-16">
            <div className="order-2 lg:order-1">
              <SectionHeader
                align="left"
                kicker="Professional Cladding Solutions"
                title="Professional Cladding Solutions"
              />
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                <p>
                  Cladding provides both aesthetic appeal and practical protection for your property. We install a wide range of cladding systems to suit any style and budget.
                </p>
                <p>
                  From modern uPVC to traditional timber, our expert installation ensures weather resistance, durability, and a stunning finish that enhances your property's value.
                </p>
              </div>
            </div>

            <div className="overflow-hidden border border-brand-navy border-l-4 border-l-brand-orange order-1 lg:order-2">
              <img
                src="/images/4.jpeg"
                alt="uPVC cladding installation on a residential property in Cheshire by Upgrade Roofs"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white border-l-4 border-l-brand-orange p-6 sm:p-8 md:p-12 mb-10 sm:mb-12 md:mb-16">
            <SectionHeader dark kicker="What We Do" title="Our Cladding Services" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {[
                'uPVC cladding installation',
                'Timber cladding systems',
                'Composite cladding',
                'Insulated cladding panels',
                'Weatherboard installation',
                'Maintenance-free finishes',
                'Color-matched systems',
                'Commercial cladding',
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
                title: 'Premium Materials',
                description: 'High-quality cladding systems built to last',
              },
              {
                icon: Shield,
                title: 'Weather Resistant',
                description: 'Complete protection from the elements',
              },
              {
                icon: Clock,
                title: 'Low Maintenance',
                description: 'Durable finishes that stay looking great',
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

      <ServiceAreaLinks serviceName="Cladding" />

      {/* FAQ Section · visible details/summary accordions + matching FAQPage JSON-LD */}
      <section className="section-padding bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"FAQPage\",\n  \"mainEntity\": [\n    {\n      \"@type\": \"Question\",\n      \"name\": \"How much does exterior cladding cost in Cheshire?\",\n      \"acceptedAnswer\": {\n        \"@type\": \"Answer\",\n        \"text\": \"Exterior cladding in Cheshire typically costs between £60 and £120 per square metre supplied and fitted, depending on whether you choose timber, composite, or metal. A full house front often totals £3,000 to £8,000. We provide a free, itemised written quote tailored to your property.\"\n      }\n    },\n    {\n      \"@type\": \"Question\",\n      \"name\": \"Which cladding material lasts the longest?\",\n      \"acceptedAnswer\": {\n        \"@type\": \"Answer\",\n        \"text\": \"Metal and composite cladding are the most durable, lasting 30 to 40 years with minimal upkeep. Timber cladding looks classic but needs periodic treatment, typically lasting 25 to 30 years when well maintained. We'll recommend the right material for your home's style and exposure across Cheshire.\"\n      }\n    },\n    {\n      \"@type\": \"Question\",\n      \"name\": \"Is your cladding installation guaranteed?\",\n      \"acceptedAnswer\": {\n        \"@type\": \"Answer\",\n        \"text\": \"Yes. All our cladding installations are covered by a 10-year workmanship guarantee, with manufacturer warranties on the materials. As a CORC certified, £10M insured contractor, we cover Sandbach, Crewe, Middlewich, Congleton, Nantwich, Alsager, and Holmes Chapel.\"\n      }\n    }\n  ]\n}" }}
        />
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              kicker="FAQs"
              title="Frequently Asked Questions"
              subtitle="Answers to common questions about our service across Cheshire."
            />
            <div className="space-y-3 sm:space-y-4">
              {[
                {
                  question: "How much does exterior cladding cost in Cheshire?",
                  answer: "Exterior cladding in Cheshire typically costs between £60 and £120 per square metre supplied and fitted, depending on whether you choose timber, composite, or metal. A full house front often totals £3,000 to £8,000. We provide a free, itemised written quote tailored to your property.",
                },
                {
                  question: "Which cladding material lasts the longest?",
                  answer: "Metal and composite cladding are the most durable, lasting 30 to 40 years with minimal upkeep. Timber cladding looks classic but needs periodic treatment, typically lasting 25 to 30 years when well maintained. We'll recommend the right material for your home's style and exposure across Cheshire.",
                },
                {
                  question: "Is your cladding installation guaranteed?",
                  answer: "Yes. All our cladding installations are covered by a 10-year workmanship guarantee, with manufacturer warranties on the materials. As a CORC certified, £10M insured contractor, we cover Sandbach, Crewe, Middlewich, Congleton, Nantwich, Alsager, and Holmes Chapel.",
                },
              ].map((faq, index) => (
                <details
                  key={index}
                  className="group bg-white border border-gray-200 border-l-4 border-l-brand-navy overflow-hidden hover:border-brand-orange/50 transition-colors"
                  open={index === 0}
                >
                  <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-4">
                    <span className="font-semibold text-brand-navy text-base group-hover:text-brand-orange transition-colors text-left pr-2">
                      {faq.question}
                    </span>
                    <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-4">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </details>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 mb-3">Still have questions?</p>
              <TrackedPhoneLink
                href="tel:01270897606"
                placement="faq_section"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Call Us: 01270 897 606
              </TrackedPhoneLink>
            </div>
          </div>
        </div>
      </section>



      <section className="section-padding bg-brand-grey">
        <div className="container-custom text-center px-2">
          <SectionHeader
            kicker="Get Started"
            title="Ready to Transform Your Property?"
            subtitle="Get a free quote for your cladding project in Cheshire"
          />
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
