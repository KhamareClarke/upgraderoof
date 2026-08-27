import type { Metadata } from 'next';
import { Flame, CheckCircle, Award, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QuoteForm } from '@/components/QuoteForm';
import { ServiceAreaLinks } from '@/components/ServiceAreaLinks';
import { TrackedPhoneLink } from '@/components/TrackedPhoneLink';

export const metadata: Metadata = {
  title: 'Chimney Repairs Cheshire | Repointing & Rebuilds | Upgrade Roofs',
  description: 'Professional chimney repairs in Cheshire. Stack repairs, repointing, rebuilds, lead flashing. Keep your chimney safe and functional. Free quotes.',
  keywords: 'chimney repairs Cheshire, chimney repointing, chimney stack repairs, lead flashing',
};

export default function ChimneyRepairsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/1.jpeg)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-orange/20" />
        </div>

        <div className="container-custom relative z-10 px-4">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium">
              <Flame className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Specialist Service</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-2">Chimney Repairs Cheshire</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 px-2">
              Expert maintenance and repair to keep your chimney safe and functional
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
              <strong>Upgrade Roofs provides expert chimney repairs across Cheshire</strong> including repointing, lead flashing replacement, stack rebuilds, and cowl installation. Most repairs completed in a single visit, with free no-obligation inspections. CORC certified, £10M insured. Serving Sandbach, Crewe, Middlewich, Congleton, Nantwich, Alsager, and Holmes Chapel.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center mb-10 sm:mb-12 md:mb-16">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-4 sm:mb-6">
                Professional Chimney Services
              </h2>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                <p>
                  A well-maintained chimney is essential for safety and functionality. We provide comprehensive chimney repair and maintenance services for residential and commercial properties. For <Link href="/roofers-sandbach" className="text-brand-orange font-semibold hover:underline">chimney repairs in Sandbach</Link>, we offer fast local response times and have extensive experience with older Cheshire properties.
                </p>
                <p>
                  From minor repointing to complete rebuilds, our skilled craftsmen use traditional techniques combined with modern materials for lasting results.
                </p>
              </div>
            </div>

            <div className="overflow-hidden border border-brand-navy border-l-4 border-l-brand-orange order-1 lg:order-2">
              <img
                src="/images/1.jpeg"
                alt="Professional chimney stack repointing and repair in Cheshire by Upgrade Roofs"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white border-l-4 border-l-brand-orange p-6 sm:p-8 md:p-12 mb-10 sm:mb-12 md:mb-16">
            <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center px-2">Our Chimney Services</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {[
                'Chimney stack repairs and rebuilds',
                'Professional repointing',
                'Lead flashing installation',
                'Chimney cowl fitting',
                'Brick replacement',
                'Weatherproofing solutions',
                'Structural assessments',
                'Emergency repairs',
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
                title: 'Expert Craftsmen',
                description: 'Skilled professionals with decades of experience',
              },
              {
                icon: Shield,
                title: 'Safety First',
                description: 'All work meets building regulations and safety standards',
              },
              {
                icon: Clock,
                title: 'Prompt Service',
                description: 'Fast response for emergency repairs',
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

      <ServiceAreaLinks serviceName="Chimney Repairs" />

      {/* FAQ Section · visible details/summary accordions + matching FAQPage JSON-LD */}
      <section className="section-padding bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"FAQPage\",\n  \"mainEntity\": [\n    {\n      \"@type\": \"Question\",\n      \"name\": \"How much do chimney repairs cost in Cheshire?\",\n      \"acceptedAnswer\": {\n        \"@type\": \"Answer\",\n        \"text\": \"Chimney repairs in Cheshire typically start from around £150 for minor repointing and rise to £1,500 or more for a full chimney stack rebuild. The price depends on height, access, and the extent of the damage. We provide a free, no-obligation inspection and written quote before any work begins.\"\n      }\n    },\n    {\n      \"@type\": \"Question\",\n      \"name\": \"How do I know if my chimney needs repointing or rebuilding?\",\n      \"acceptedAnswer\": {\n        \"@type\": \"Answer\",\n        \"text\": \"Crumbling mortar, loose or missing bricks, damp patches around the chimney breast, and leaning stacks all point to repointing or a rebuild. We inspect the flaunching, flashing, and brickwork, then recommend the most cost-effective fix · repointing where the mortar is sound, a rebuild where the stack is structurally unsafe.\"\n      }\n    },\n    {\n      \"@type\": \"Question\",\n      \"name\": \"Is your chimney repair work guaranteed?\",\n      \"acceptedAnswer\": {\n        \"@type\": \"Answer\",\n        \"text\": \"Yes. All our chimney repairs are backed by a 10-year workmanship guarantee, and we are CORC certified and £10M insured. We serve Sandbach, Crewe, Middlewich, Congleton, Nantwich, Alsager, and Holmes Chapel, so your chimney is covered long after the work is done.\"\n      }\n    }\n  ]\n}" }}
        />
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-3">
                Frequently Asked Questions
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">
                Answers to common questions about our service across Cheshire.
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {[
                {
                  question: "How much do chimney repairs cost in Cheshire?",
                  answer: "Chimney repairs in Cheshire typically start from around £150 for minor repointing and rise to £1,500 or more for a full chimney stack rebuild. The price depends on height, access, and the extent of the damage. We provide a free, no-obligation inspection and written quote before any work begins.",
                },
                {
                  question: "How do I know if my chimney needs repointing or rebuilding?",
                  answer: "Crumbling mortar, loose or missing bricks, damp patches around the chimney breast, and leaning stacks all point to repointing or a rebuild. We inspect the flaunching, flashing, and brickwork, then recommend the most cost-effective fix · repointing where the mortar is sound, a rebuild where the stack is structurally unsafe.",
                },
                {
                  question: "Is your chimney repair work guaranteed?",
                  answer: "Yes. All our chimney repairs are backed by a 10-year workmanship guarantee, and we are CORC certified and £10M insured. We serve Sandbach, Crewe, Middlewich, Congleton, Nantwich, Alsager, and Holmes Chapel, so your chimney is covered long after the work is done.",
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-3 sm:mb-4">Need Chimney Repairs in Cheshire?</h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Contact us for a free inspection and quote
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
