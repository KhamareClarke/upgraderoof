'use client';

import { Calendar, User, Clock, ArrowRight, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function GutterMaintenanceGuidePost() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-r from-brand-navy/95 to-brand-navy/90">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-brand-orange mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">March 5, 2026</span>
              <span className="text-white/50">•</span>
              <User className="w-4 h-4" />
              <span className="text-sm">Upgrade Roofs Team</span>
              <span className="text-white/50">•</span>
              <Clock className="w-4 h-4" />
              <span className="text-sm">5 min read</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Complete Guide to Gutter Maintenance in Cheshire
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              Properly maintained gutters protect your home from water damage. Learn how to keep 
              your gutters flowing freely and when to call in the professionals.
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
                  src="/images/2.jpeg"
                  alt="Professional gutter cleaning and maintenance in Cheshire"
                  width={800}
                  height={400}
                  className="rounded-xl shadow-lg w-full object-cover"
                />
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Gutters are often overlooked until problems arise. As experienced <strong>gutter and fascia specialists 
                in Cheshire</strong>, we've seen how neglected gutters can cause thousands of pounds in damage to 
                properties across Sandbach, Crewe, Middlewich, and surrounding areas.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
                <div className="flex items-start gap-3">
                  <Droplets className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-blue-800 font-semibold mb-2">Why Gutters Matter</p>
                    <p className="text-blue-700">
                      A single blocked gutter can allow water to overflow, damaging fascias, soffits, 
                      walls, and even foundations. Prevention is always cheaper than repair.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Signs Your Gutters Need Attention
              </h2>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Water overflowing</strong> during rainfall</li>
                <li><strong>Sagging or pulling away</strong> from the fascia</li>
                <li><strong>Plants growing</strong> in the gutters</li>
                <li><strong>Staining on walls</strong> below the gutters</li>
                <li><strong>Peeling paint</strong> on fascias or soffits</li>
                <li><strong>Damp patches</strong> inside near external walls</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Seasonal Gutter Maintenance Schedule
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-amber-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-3">Autumn (October-November)</h3>
                  <p className="text-sm text-gray-700 mb-3">Most critical time for gutter maintenance:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Clear fallen leaves and debris</li>
                    <li>• Check downspout flow</li>
                    <li>• Inspect for damage before winter</li>
                    <li>• Consider leaf guards</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-3">Spring (March-April)</h3>
                  <p className="text-sm text-gray-700 mb-3">Post-winter check and clean:</p>
                  <ul className="text-sm space-y-1">
                    <li>• Remove winter debris</li>
                    <li>• Check for ice damage</li>
                    <li>• Inspect brackets and fixings</li>
                    <li>• Test water flow</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                DIY vs Professional Gutter Cleaning
              </h2>

              <p className="mb-4">
                While some homeowners clean their own gutters, there are important safety considerations:
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-brand-navy mb-3">DIY Considerations</h3>
                  <ul className="text-sm space-y-2">
                    <li>✓ Suitable for single-storey properties</li>
                    <li>✓ If you have proper ladder safety equipment</li>
                    <li>✗ Risk of falls and injury</li>
                    <li>✗ May miss underlying problems</li>
                  </ul>
                </div>
                <div className="bg-brand-orange/10 p-6 rounded-lg">
                  <h3 className="font-semibold text-brand-navy mb-3">Professional Service</h3>
                  <ul className="text-sm space-y-2">
                    <li>✓ Safe access equipment</li>
                    <li>✓ Full inspection included</li>
                    <li>✓ Minor repairs on the spot</li>
                    <li>✓ Fully insured work</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Common Gutter Problems We Fix
              </h2>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Blocked gutters and downspouts</strong></li>
                <li><strong>Leaking joints</strong> between sections</li>
                <li><strong>Sagging gutters</strong> due to failed brackets</li>
                <li><strong>Cracked or damaged sections</strong></li>
                <li><strong>Fascia board rot</strong> from water damage</li>
                <li><strong>Incorrect fall</strong> preventing proper drainage</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Gutter Types We Install and Maintain
              </h2>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Gutter Type</th>
                      <th className="border border-gray-300 p-3 text-left">Best For</th>
                      <th className="border border-gray-300 p-3 text-left">Lifespan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3">uPVC</td>
                      <td className="border border-gray-300 p-3">Most homes, low maintenance</td>
                      <td className="border border-gray-300 p-3">20-30 years</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Aluminium</td>
                      <td className="border border-gray-300 p-3">Durability, seamless options</td>
                      <td className="border border-gray-300 p-3">30-50 years</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Cast Iron</td>
                      <td className="border border-gray-300 p-3">Period properties, heritage</td>
                      <td className="border border-gray-300 p-3">50-100 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-brand-navy text-white p-8 rounded-xl mb-8">
                <h3 className="text-xl font-bold mb-4">Professional Gutter Services</h3>
                <p className="mb-4">
                  From cleaning to complete replacement, our team handles all gutter and fascia work 
                  across Cheshire. We serve Sandbach, Crewe, Middlewich, Congleton, Alsager, Nantwich, 
                  Holmes Chapel, and surrounding areas.
                </p>
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" asChild>
                  <Link href="/services/gutters-fascias">
                    View Gutter Services
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Cost of Gutter Services in Cheshire
              </h2>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Gutter cleaning:</strong> £60-£120 (typical house)</li>
                <li><strong>Minor repairs:</strong> £50-£150</li>
                <li><strong>Section replacement:</strong> £100-£300</li>
                <li><strong>Full gutter replacement:</strong> £400-£1,200</li>
              </ul>

              <p className="mb-8">
                For a free quote on gutter services, <Link href="/contact" className="text-brand-orange hover:underline">contact our team</Link> today. 
                Gutter problems often signal wider roof issues — our <Link href="/roof-repairs" className="text-brand-orange hover:underline">roof repair team</Link> can 
                carry out a full assessment. If water is actively entering your home, call our <Link href="/emergency-roofing" className="text-brand-orange hover:underline">24/7 emergency line</Link> on 01270 897 606.
              </p>
            </div>

            <div className="border-t pt-8 mt-8">
              <h3 className="text-xl font-bold text-brand-navy mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Link href="/blog/roof-maintenance-checklist" className="group">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange mb-2">
                      Complete Roof Maintenance Checklist
                    </h4>
                    <p className="text-sm text-gray-600">
                      Keep your entire roof system in top condition.
                    </p>
                  </div>
                </Link>
                <Link href="/blog/fascia-soffit-guide" className="group">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange mb-2">
                      Fascias and Soffits Explained
                    </h4>
                    <p className="text-sm text-gray-600">
                      Understanding your roofline components.
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
