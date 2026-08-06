'use client';

import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function HowLongDoesRoofLastPost() {
  const roofTypes = [
    { type: 'Natural Slate', lifespan: '75-100+ years', maintenance: 'Low', cost: '££££' },
    { type: 'Clay Tiles', lifespan: '50-100 years', maintenance: 'Low', cost: '£££' },
    { type: 'Concrete Tiles', lifespan: '30-50 years', maintenance: 'Medium', cost: '££' },
    { type: 'EPDM Rubber (Flat)', lifespan: '25-30 years', maintenance: 'Low', cost: '££' },
    { type: 'GRP Fibreglass (Flat)', lifespan: '25-30 years', maintenance: 'Low', cost: '££' },
    { type: 'Felt (Flat)', lifespan: '10-20 years', maintenance: 'High', cost: '£' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-r from-brand-navy/95 to-brand-navy/90">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-brand-orange mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">March 8, 2026</span>
              <span className="text-white/50">•</span>
              <User className="w-4 h-4" />
              <span className="text-sm">Upgrade Roofs Team</span>
              <span className="text-white/50">•</span>
              <Clock className="w-4 h-4" />
              <span className="text-sm">7 min read</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How Long Does a Roof Last? Complete UK Guide
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              Understanding roof lifespans helps you plan for replacement and make informed decisions. 
              Learn how long different roofing materials last in the UK climate.
            </p>
          </div>
        </div>
      </section>

      <article className="section-padding">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <div className="mb-8">
                <Image
                  src="/images/7.jpeg"
                  alt="Various roof types in Cheshire showing slate, tile and flat roofing"
                  width={800}
                  height={400}
                  className="rounded-xl shadow-lg w-full object-cover"
                />
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                One of the most common questions we receive as <strong>roofing contractors in Cheshire</strong> is 
                "How long will my roof last?" The answer depends on several factors including materials, installation 
                quality, maintenance, and local weather conditions.
              </p>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Roof Lifespan by Material Type
              </h2>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-brand-navy text-white">
                      <th className="border border-gray-300 p-3 text-left">Roof Type</th>
                      <th className="border border-gray-300 p-3 text-left">Expected Lifespan</th>
                      <th className="border border-gray-300 p-3 text-left">Maintenance</th>
                      <th className="border border-gray-300 p-3 text-left">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roofTypes.map((roof, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="border border-gray-300 p-3 font-medium">{roof.type}</td>
                        <td className="border border-gray-300 p-3">{roof.lifespan}</td>
                        <td className="border border-gray-300 p-3">{roof.maintenance}</td>
                        <td className="border border-gray-300 p-3">{roof.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Factors That Affect Roof Lifespan in Cheshire
              </h2>

              <p className="mb-4">
                The Cheshire climate presents unique challenges for roofing systems:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">Weather Factors</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Heavy rainfall and persistent dampness</li>
                    <li>• Strong winds from the Irish Sea</li>
                    <li>• Freeze-thaw cycles in winter</li>
                    <li>• Occasional severe storms</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">Positive Factors</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Quality installation by professionals</li>
                    <li>• Regular maintenance and inspections</li>
                    <li>• Proper ventilation in roof space</li>
                    <li>• Prompt repair of minor damage</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Signs Your Roof Needs Replacing
              </h2>

              <p className="mb-4">
                Even before reaching its expected lifespan, watch for these warning signs:
              </p>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Multiple leaks</strong> appearing in different areas</li>
                <li><strong>Widespread moss or algae</strong> that keeps returning</li>
                <li><strong>Sagging sections</strong> indicating structural issues</li>
                <li><strong>Daylight visible</strong> through roof boards in loft</li>
                <li><strong>Frequent repairs</strong> becoming uneconomical</li>
                <li><strong>Energy bills increasing</strong> due to poor insulation</li>
              </ul>

              <div className="bg-brand-orange/10 border-l-4 border-brand-orange p-6 mb-8">
                <p className="text-brand-navy font-semibold mb-2">Expert Tip:</p>
                <p className="text-gray-700">
                  If your roof is over 20 years old, we recommend annual professional inspections. 
                  This helps identify problems early and plan for eventual replacement.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Extending Your Roof's Lifespan
              </h2>

              <p className="mb-4">
                Maximize your roof's longevity with these practices:
              </p>

              <ol className="list-decimal pl-6 mb-6 space-y-2">
                <li>Schedule professional inspections annually</li>
                <li>Clean gutters at least twice per year</li>
                <li>Remove moss and debris promptly</li>
                <li>Trim overhanging tree branches</li>
                <li>Ensure adequate loft ventilation</li>
                <li>Address minor repairs immediately</li>
              </ol>

              <div className="bg-brand-navy text-white p-8 rounded-xl mb-8">
                <h3 className="text-xl font-bold mb-4">Free Roof Assessment</h3>
                <p className="mb-4">
                  Wondering how much life your roof has left? Our experienced team provides free, 
                  no-obligation roof assessments throughout Cheshire. We'll give you an honest 
                  evaluation and recommendations.
                </p>
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" asChild>
                  <Link href="/special-offer">
                    Book Free Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Roof Replacement Costs in Cheshire
              </h2>

              <p className="mb-4">
                When replacement becomes necessary, here are typical costs:
              </p>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Terraced house:</strong> £4,000 - £7,000</li>
                <li><strong>Semi-detached:</strong> £5,000 - £9,000</li>
                <li><strong>Detached house:</strong> £7,000 - £15,000+</li>
                <li><strong>Flat roof (garage/extension):</strong> £1,500 - £4,000</li>
              </ul>

              <p className="mb-8">
                For an accurate quote tailored to your property, <Link href="/contact" className="text-brand-orange hover:underline">contact our team</Link> for 
                a free survey and detailed estimate.
              </p>
            </div>

            {/* Money Page Links */}
            <div className="bg-brand-navy/5 border border-brand-navy/10 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-brand-navy mb-3">Thinking About a New Roof?</h3>
              <p className="text-gray-600 text-sm mb-3">
                If your roof is nearing the end of its lifespan, explore our <Link href="/new-roofs" className="text-brand-orange hover:underline font-medium">new roof installation service</Link> — 
                we offer tile, slate, and flat roofing with 10-year workmanship guarantees. For minor issues, our 
                <Link href="/roof-repairs" className="text-brand-orange hover:underline font-medium"> roof repair service</Link> can extend your roof's life. 
                See <Link href="/roofers-sandbach" className="text-brand-orange hover:underline font-medium">roofers in Sandbach</Link> for local project examples.
              </p>
            </div>

            <div className="border-t pt-8 mt-8">
              <h3 className="text-xl font-bold text-brand-navy mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Link href="/blog/flat-vs-tile-roofs" className="group">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange mb-2">
                      Flat vs Tile Roofs: Which is Best?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Compare roofing materials for your property.
                    </p>
                  </div>
                </Link>
                <Link href="/blog/roof-maintenance-checklist" className="group">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange mb-2">
                      Complete Roof Maintenance Checklist
                    </h4>
                    <p className="text-sm text-gray-600">
                      Keep your roof in top condition year-round.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
