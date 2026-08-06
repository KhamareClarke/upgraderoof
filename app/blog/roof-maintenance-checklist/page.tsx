'use client';

import { Calendar, User, Clock, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function RoofMaintenanceChecklistPost() {
  const springTasks = [
    'Inspect for winter storm damage',
    'Check and clean gutters',
    'Look for loose or missing tiles',
    'Inspect flashing around chimneys',
    'Check for moss or algae growth',
    'Examine roof valleys for debris',
  ];

  const autumnTasks = [
    'Clear leaves from gutters and roof',
    'Trim overhanging branches',
    'Check seals around vents and skylights',
    'Inspect chimney cap and flashing',
    'Look for cracked or damaged tiles',
    'Ensure downspouts are clear',
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-r from-brand-navy/95 to-brand-navy/90">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-brand-orange mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">March 10, 2026</span>
              <span className="text-white/50">•</span>
              <User className="w-4 h-4" />
              <span className="text-sm">Upgrade Roofs Team</span>
              <span className="text-white/50">•</span>
              <Clock className="w-4 h-4" />
              <span className="text-sm">6 min read</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Complete Roof Maintenance Checklist for Cheshire Homeowners
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              Keep your roof in top condition year-round with our comprehensive maintenance guide. 
              Prevent costly repairs and extend your roof's lifespan.
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
                  src="/images/6.jpeg"
                  alt="Professional roof maintenance inspection in Cheshire"
                  width={800}
                  height={400}
                  className="rounded-xl shadow-lg w-full object-cover"
                />
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Regular roof maintenance is the key to avoiding expensive repairs and extending the life of your roof. 
                As experienced <strong>roofing contractors in Cheshire</strong>, we've created this comprehensive checklist 
                to help homeowners in Sandbach, Crewe, Middlewich, and surrounding areas keep their roofs in excellent condition.
              </p>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Spring Maintenance Checklist
              </h2>
              
              <p className="mb-4">
                After winter storms, spring is the perfect time to assess and repair any damage:
              </p>

              <div className="bg-green-50 p-6 rounded-xl mb-8">
                <h3 className="font-semibold text-green-800 mb-4">Spring Tasks</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {springTasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Autumn Maintenance Checklist
              </h2>

              <p className="mb-4">
                Prepare your roof for the harsh Cheshire winter with these essential tasks:
              </p>

              <div className="bg-orange-50 p-6 rounded-xl mb-8">
                <h3 className="font-semibold text-orange-800 mb-4">Autumn Tasks</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {autumnTasks.map((task, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{task}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Monthly Quick Checks
              </h2>

              <p className="mb-4">
                These simple visual inspections take just 5 minutes and can catch problems early:
              </p>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Look at your roof from ground level for obvious damage</li>
                <li>Check inside your loft for daylight or water stains</li>
                <li>Ensure gutters are draining properly during rain</li>
                <li>Look for debris accumulation in valleys</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                When to Call a Professional
              </h2>

              <p className="mb-4">
                While homeowners can handle basic inspections, professional help is needed for:
              </p>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Any repairs requiring roof access</li>
                <li>Replacing damaged tiles or slates</li>
                <li>Flashing repairs around chimneys</li>
                <li>Moss removal and treatment</li>
                <li>Gutter repairs or replacement</li>
                <li>Annual comprehensive inspections</li>
              </ul>

              <div className="bg-brand-navy text-white p-8 rounded-xl mb-8">
                <h3 className="text-xl font-bold mb-4">Free Professional Roof Inspection</h3>
                <p className="mb-4">
                  Let our experienced team conduct a thorough inspection of your roof. We serve all of Cheshire 
                  including Sandbach, Crewe, Middlewich, Congleton, Alsager, Nantwich, and Holmes Chapel.
                </p>
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" asChild>
                  <Link href="/special-offer">
                    Book Free Inspection
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Cost Savings from Regular Maintenance
              </h2>

              <p className="mb-4">
                Investing in regular maintenance saves money long-term:
              </p>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Maintenance Type</th>
                      <th className="border border-gray-300 p-3 text-left">Annual Cost</th>
                      <th className="border border-gray-300 p-3 text-left">Potential Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3">Professional inspection</td>
                      <td className="border border-gray-300 p-3">FREE with us</td>
                      <td className="border border-gray-300 p-3">£500-£2,000</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Gutter cleaning (2x year)</td>
                      <td className="border border-gray-300 p-3">£80-£150</td>
                      <td className="border border-gray-300 p-3">£300-£1,000</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Minor repairs</td>
                      <td className="border border-gray-300 p-3">£100-£300</td>
                      <td className="border border-gray-300 p-3">£1,000-£5,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mb-8">
                For expert <Link href="/services" className="text-brand-orange hover:underline">roofing services</Link> or 
                to schedule your free inspection, <Link href="/contact" className="text-brand-orange hover:underline">contact our team</Link> today.
              </p>
            </div>

            {/* Money Page Links */}
            <div className="bg-brand-navy/5 border border-brand-navy/10 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-brand-navy mb-3">Spotted Something During Your Inspection?</h3>
              <p className="text-gray-600 text-sm mb-3">
                If you've found damage during your maintenance check, our <Link href="/roof-repairs" className="text-brand-orange hover:underline font-medium">roof repair team</Link> can 
                fix it quickly. For urgent leaks or storm damage, use our <Link href="/emergency-roofing" className="text-brand-orange hover:underline font-medium">24/7 emergency service</Link>. 
                Sandbach homeowners can see local examples on our <Link href="/roofers-sandbach" className="text-brand-orange hover:underline font-medium">Sandbach roofers page</Link>.
              </p>
            </div>

            <div className="border-t pt-8 mt-8">
              <h3 className="text-xl font-bold text-brand-navy mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Link href="/blog/roof-damage-signs" className="group">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange mb-2">
                      How to Spot Roof Damage Before It Gets Expensive
                    </h4>
                    <p className="text-sm text-gray-600">
                      Learn the early warning signs of roof problems.
                    </p>
                  </div>
                </Link>
                <Link href="/blog/gutter-maintenance-guide" className="group">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange mb-2">
                      Complete Guide to Gutter Maintenance
                    </h4>
                    <p className="text-sm text-gray-600">
                      Keep your gutters flowing freely year-round.
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
