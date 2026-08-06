'use client';

import { Calendar, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const caseStudies = [
  {
    id: 1,
    title: 'Complete Roof Replacement on Congleton Road, Sandbach',
    location: 'Congleton Road, Sandbach, CW11',
    date: 'February 2026',
    duration: '5 days',
    type: 'Tile Roof Replacement',
    beforeImage: '/images/1.jpeg',
    afterImage: '/images/6.jpeg',
    description: 'This 1930s semi-detached property had an aging concrete tile roof with multiple leaks and damaged tiles. The homeowners wanted a complete replacement with modern, long-lasting materials.',
    challenge: 'The existing roof had significant water damage to the felt underlayment, and several rafters needed reinforcement. The chimney flashing had also failed, causing damp in the bedroom.',
    solution: 'We stripped the entire roof, replaced damaged timbers, installed breathable membrane, and fitted new Marley Edgemere interlocking tiles. The chimney was repointed and fitted with new lead flashing.',
    results: [
      'Complete weatherproofing with 50+ year tile lifespan',
      'Improved loft insulation reducing heating bills',
      'New lead flashing eliminating chimney damp',
      '10-year workmanship guarantee provided',
    ],
    testimonial: {
      text: "Upgrade Roofs transformed our leaky old roof into something we're proud of. Professional team, fair price, and the work was completed exactly when promised.",
      author: 'Mr & Mrs Thompson',
      location: 'Sandbach',
    },
  },
  {
    id: 2,
    title: 'Flat Roof Extension on Nantwich Road, Crewe',
    location: 'Nantwich Road, Crewe, CW2',
    date: 'January 2026',
    duration: '2 days',
    type: 'GRP Fibreglass Flat Roof',
    beforeImage: '/images/3.jpeg',
    afterImage: '/images/7.jpeg',
    description: 'A kitchen extension with a failing felt flat roof that had been patched multiple times. Water was pooling and the homeowner was experiencing regular leaks during heavy rain.',
    challenge: 'The existing roof had inadequate falls, causing ponding water. The felt had cracked in multiple places and the insulation beneath was saturated.',
    solution: 'We removed the old felt and wet insulation, installed tapered insulation boards to create proper drainage falls, and applied a seamless GRP fibreglass system with a 25-year guarantee.',
    results: [
      'No more ponding water with correct drainage falls',
      'Seamless waterproof finish with no joints to fail',
      'Improved thermal insulation',
      '25-year manufacturer guarantee',
    ],
    testimonial: {
      text: "After years of patching our leaky flat roof, we finally have a permanent solution. The GRP system looks great and we haven't had a single drop of water since.",
      author: 'David M.',
      location: 'Crewe',
    },
  },
  {
    id: 3,
    title: 'Emergency Storm Damage Repair on Lewin Street, Middlewich',
    location: 'Lewin Street, Middlewich, CW10',
    date: 'December 2025',
    duration: '1 day emergency + 3 days full repair',
    type: 'Storm Damage Repair',
    beforeImage: '/images/1.jpeg',
    afterImage: '/images/2.jpeg',
    description: 'High winds had lifted a large section of ridge tiles and several roof tiles, leaving the property exposed to the elements. The homeowner called our emergency line at 7am.',
    challenge: 'With rain forecast for that afternoon, we needed to make the roof watertight immediately while planning a proper permanent repair.',
    solution: 'Our emergency team arrived within 2 hours, installed temporary weatherproofing, and returned the following week for full repairs including new ridge tiles, replacement slates, and repointing.',
    results: [
      'Property protected within 3 hours of call',
      'Full insurance documentation provided',
      'All damaged tiles replaced with matching materials',
      'Ridge tiles re-bedded with modern dry ridge system',
    ],
    testimonial: {
      text: "When the storm damaged our roof, Upgrade Roofs were absolute lifesavers. They had us weatherproof before the rain came and handled everything with our insurance.",
      author: 'Sarah K.',
      location: 'Middlewich',
    },
  },
  {
    id: 4,
    title: 'Chimney Rebuild on West Road, Congleton',
    location: 'West Road, Congleton, CW12',
    date: 'November 2025',
    duration: '3 days',
    type: 'Chimney Repair & Rebuild',
    beforeImage: '/images/1.jpeg',
    afterImage: '/images/6.jpeg',
    description: 'A Victorian property with a severely deteriorated chimney stack. The mortar had eroded, bricks were spalling, and the chimney was visibly leaning.',
    challenge: 'The chimney was structurally compromised and needed to be taken down to roof level and rebuilt. Access was difficult due to the steep roof pitch.',
    solution: 'We erected scaffolding, carefully dismantled the damaged chimney, rebuilt it using reclaimed Victorian bricks to match the property, and installed new lead flashing and a chimney cap.',
    results: [
      'Structurally sound chimney matching original character',
      'New lead flashing preventing water ingress',
      'Chimney cap preventing rain and debris entry',
      'Property value protected with sympathetic restoration',
    ],
    testimonial: {
      text: "Our Victorian chimney was in a terrible state. Upgrade Roofs sourced matching bricks and rebuilt it beautifully. You'd never know it was new work.",
      author: 'The Williams Family',
      location: 'Congleton',
    },
  },
  {
    id: 5,
    title: 'Full Gutter & Fascia Replacement on Crewe Road, Alsager',
    location: 'Crewe Road, Alsager, ST7',
    date: 'October 2025',
    duration: '2 days',
    type: 'Gutters & Fascias',
    beforeImage: '/images/2.jpeg',
    afterImage: '/images/7.jpeg',
    description: 'A detached property with original wooden fascias that had rotted, causing the gutters to sag and overflow. Water damage was visible on the exterior walls.',
    challenge: 'The wooden fascias had rotted in several places, and the old cast iron gutters were corroded and leaking at every joint.',
    solution: 'We removed all old fascias, soffits, and gutters. Installed new uPVC fascia boards, ventilated soffits, and a complete new gutter system with larger capacity downpipes.',
    results: [
      'Maintenance-free uPVC system',
      'Improved water drainage capacity',
      'Clean, fresh appearance to roofline',
      'No more water staining on walls',
    ],
    testimonial: {
      text: "The difference is incredible. Our house looks so much better with the new white fascias and gutters, and we'll never have to paint them again!",
      author: 'John & Mary P.',
      location: 'Alsager',
    },
  },
  {
    id: 6,
    title: 'Velux Skylight Installation on Welsh Row, Nantwich',
    location: 'Welsh Row, Nantwich, CW5',
    date: 'September 2025',
    duration: '1 day',
    type: 'Skylight Installation',
    beforeImage: '/images/10.jpeg',
    afterImage: '/images/6.jpeg',
    description: 'A loft conversion bedroom that was dark and felt cramped. The homeowners wanted to add natural light without compromising the roof structure.',
    challenge: 'Installing a skylight in an existing roof requires careful cutting of rafters and proper weatherproofing to prevent future leaks.',
    solution: 'We installed a Velux centre-pivot roof window with electric opening and rain sensor. The opening was carefully framed, insulated, and finished with internal plasterboard reveals.',
    results: [
      'Dramatically brighter loft bedroom',
      'Improved ventilation with electric opening',
      'Rain sensor for worry-free ventilation',
      'Professional internal finishing included',
    ],
    testimonial: {
      text: "Our loft bedroom has been transformed! It's so much brighter and the electric skylight is brilliant for ventilation. Wish we'd done it years ago.",
      author: 'Emma R.',
      location: 'Nantwich',
    },
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-r from-brand-navy/95 to-brand-navy/90">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium">
              <span>Real Projects, Real Results</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Roofing Case Studies
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              See the quality of our work through real projects completed across Cheshire. 
              Before and after photos, challenges overcome, and satisfied customers.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="space-y-16">
            {caseStudies.map((study, index) => (
              <article key={study.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative">
                    <div className="grid grid-cols-2 h-full">
                      <div className="relative">
                        <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          BEFORE
                        </div>
                        <Image
                          src={study.beforeImage}
                          alt={`Before: ${study.title}`}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover min-h-[250px]"
                        />
                      </div>
                      <div className="relative">
                        <div className="absolute top-4 right-4 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          AFTER
                        </div>
                        <Image
                          src={study.afterImage}
                          alt={`After: ${study.title}`}
                          width={400}
                          height={300}
                          className="w-full h-full object-cover min-h-[250px]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 lg:p-10">
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {study.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {study.date}
                      </span>
                      <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-xs font-medium">
                        {study.type}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">
                      {study.title}
                    </h2>

                    <p className="text-gray-600 mb-6">
                      {study.description}
                    </p>

                    <div className="space-y-4 mb-6">
                      <div>
                        <h3 className="font-semibold text-brand-navy mb-2">The Challenge:</h3>
                        <p className="text-gray-600 text-sm">{study.challenge}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-brand-navy mb-2">Our Solution:</h3>
                        <p className="text-gray-600 text-sm">{study.solution}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold text-brand-navy mb-3">Results:</h3>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {study.results.map((result, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-600">{result}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 italic text-sm mb-2">"{study.testimonial.text}"</p>
                      <p className="text-brand-navy font-semibold text-sm">
                        — {study.testimonial.author}, {study.testimonial.location}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {study.type === 'Tile Roof Replacement' && (
                        <Link href="/new-roofs" className="text-xs bg-brand-orange/10 text-brand-orange px-3 py-1.5 rounded-full font-medium hover:bg-brand-orange/20 transition-colors">View New Roofs Service →</Link>
                      )}
                      {study.type === 'GRP Fibreglass Flat Roof' && (
                        <Link href="/services/flat-roofing" className="text-xs bg-brand-orange/10 text-brand-orange px-3 py-1.5 rounded-full font-medium hover:bg-brand-orange/20 transition-colors">View Flat Roofing Service →</Link>
                      )}
                      {study.type === 'Storm Damage Repair' && (
                        <Link href="/emergency-roofing" className="text-xs bg-brand-orange/10 text-brand-orange px-3 py-1.5 rounded-full font-medium hover:bg-brand-orange/20 transition-colors">View Emergency Roofing →</Link>
                      )}
                      {study.type === 'Chimney Repair & Rebuild' && (
                        <Link href="/services/chimney-repairs" className="text-xs bg-brand-orange/10 text-brand-orange px-3 py-1.5 rounded-full font-medium hover:bg-brand-orange/20 transition-colors">View Chimney Repairs →</Link>
                      )}
                      {study.type === 'Gutters & Fascias' && (
                        <Link href="/services/gutters-fascias" className="text-xs bg-brand-orange/10 text-brand-orange px-3 py-1.5 rounded-full font-medium hover:bg-brand-orange/20 transition-colors">View Guttering Service →</Link>
                      )}
                      {study.type === 'Skylight Installation' && (
                        <Link href="/services/skylights-roof-windows" className="text-xs bg-brand-orange/10 text-brand-orange px-3 py-1.5 rounded-full font-medium hover:bg-brand-orange/20 transition-colors">View Skylight Service →</Link>
                      )}
                      {study.testimonial.location === 'Sandbach' && (
                        <Link href="/roofers-sandbach" className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100 transition-colors">Roofers in Sandbach →</Link>
                      )}
                      {study.testimonial.location === 'Crewe' && (
                        <Link href="/roofers-crewe" className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100 transition-colors">Roofers in Crewe →</Link>
                      )}
                      {study.testimonial.location === 'Middlewich' && (
                        <Link href="/roofers-middlewich" className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100 transition-colors">Roofers in Middlewich →</Link>
                      )}
                      {study.testimonial.location === 'Congleton' && (
                        <Link href="/roofers-congleton" className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100 transition-colors">Roofers in Congleton →</Link>
                      )}
                      {study.testimonial.location === 'Alsager' && (
                        <Link href="/roofers-alsager" className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100 transition-colors">Roofers in Alsager →</Link>
                      )}
                      {study.testimonial.location === 'Nantwich' && (
                        <Link href="/roofers-nantwich" className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full font-medium hover:bg-blue-100 transition-colors">Roofers in Nantwich →</Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="bg-brand-navy text-white p-8 md:p-12 rounded-2xl max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to Transform Your Roof?
              </h2>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                Join hundreds of satisfied customers across Cheshire. Get a free, no-obligation 
                quote and see how we can help with your roofing project.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" asChild>
                  <Link href="/special-offer">
                    Get Free Quote
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                  <Link href="/gallery">
                    View Full Gallery
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
                <Link href="/roofers-sandbach" className="text-white/70 hover:text-white transition-colors">Sandbach</Link>
                <span className="text-white/30">·</span>
                <Link href="/roof-repairs" className="text-white/70 hover:text-white transition-colors">Roof Repairs</Link>
                <span className="text-white/30">·</span>
                <Link href="/new-roofs" className="text-white/70 hover:text-white transition-colors">New Roofs</Link>
                <span className="text-white/30">·</span>
                <Link href="/emergency-roofing" className="text-white/70 hover:text-white transition-colors">Emergency</Link>
                <span className="text-white/30">·</span>
                <Link href="/services" className="text-white/70 hover:text-white transition-colors">All Services</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
