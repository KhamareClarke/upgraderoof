'use client';

import { Calendar, User, Clock, ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function FlatRoofProblemsPost() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-r from-brand-navy/95 to-brand-navy/90">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-brand-orange mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">February 15, 2026</span>
              <span className="text-white/50">•</span>
              <User className="w-4 h-4" />
              <span className="text-sm">Upgrade Roofs Team</span>
              <span className="text-white/50">•</span>
              <Clock className="w-4 h-4" />
              <span className="text-sm">6 min read</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Common Flat Roof Problems and How to Fix Them
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              Flat roofs on garages, extensions, and commercial buildings need special attention. 
              Learn about common issues and when repairs vs replacement makes sense.
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
                  src="/images/3.jpeg"
                  alt="Flat roof repair and maintenance in Cheshire"
                  width={800}
                  height={400}
                  className="rounded-xl shadow-lg w-full object-cover"
                />
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Flat roofs are common on garages, extensions, porches, and commercial buildings across 
                Cheshire. While modern flat roofing systems are highly durable, they do require proper 
                maintenance and can develop specific problems. As specialist <strong>flat roof contractors 
                in Cheshire</strong>, here's our guide to common issues and solutions.
              </p>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                1. Ponding Water
              </h2>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6">
                <p className="text-blue-800 font-semibold mb-2">The Problem:</p>
                <p className="text-blue-700">
                  Water pooling on the roof surface after rain, not draining within 48 hours.
                </p>
              </div>

              <p className="mb-4"><strong>Causes:</strong></p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Inadequate roof slope (should be minimum 1:80)</li>
                <li>Blocked or insufficient drainage</li>
                <li>Roof structure sagging</li>
                <li>Debris accumulation</li>
              </ul>

              <p className="mb-6"><strong>Solutions:</strong> Install tapered insulation to create falls, improve drainage, or in severe cases, rebuild with correct falls.</p>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                2. Blistering and Bubbling
              </h2>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-6">
                <p className="text-orange-800 font-semibold mb-2">The Problem:</p>
                <p className="text-orange-700">
                  Raised areas or bubbles appearing on the roof surface.
                </p>
              </div>

              <p className="mb-4"><strong>Causes:</strong></p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Moisture trapped during installation</li>
                <li>Poor adhesion of membrane layers</li>
                <li>Thermal expansion and contraction</li>
                <li>Age-related deterioration</li>
              </ul>

              <p className="mb-6"><strong>Solutions:</strong> Small blisters can be cut, dried, and patched. Widespread blistering usually requires overlay or replacement.</p>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                3. Cracking and Splitting
              </h2>

              <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-red-800 font-semibold mb-2">The Problem:</p>
                    <p className="text-red-700">
                      Visible cracks or splits in the roofing membrane, often at joints or stress points.
                    </p>
                  </div>
                </div>
              </div>

              <p className="mb-4"><strong>Causes:</strong></p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>UV degradation (especially felt roofs)</li>
                <li>Building movement</li>
                <li>Thermal cycling</li>
                <li>Poor original installation</li>
              </ul>

              <p className="mb-6"><strong>Solutions:</strong> Patch repairs for isolated cracks. Multiple cracks indicate the membrane is failing and needs replacement.</p>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                4. Flashing Failures
              </h2>

              <p className="mb-4">
                Where the flat roof meets walls, parapets, or other structures, flashing creates a 
                watertight seal. Common issues include:
              </p>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Lifting or peeling</strong> from the wall surface</li>
                <li><strong>Cracking</strong> at the junction point</li>
                <li><strong>Sealant failure</strong> allowing water ingress</li>
                <li><strong>Incorrect installation</strong> without proper upstand</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Flat Roof Types: Repair vs Replace
              </h2>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Roof Type</th>
                      <th className="border border-gray-300 p-3 text-left">Typical Lifespan</th>
                      <th className="border border-gray-300 p-3 text-left">Repair or Replace?</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3">Traditional Felt</td>
                      <td className="border border-gray-300 p-3">10-15 years</td>
                      <td className="border border-gray-300 p-3">Replace with EPDM/GRP if over 10 years</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">EPDM Rubber</td>
                      <td className="border border-gray-300 p-3">25-30 years</td>
                      <td className="border border-gray-300 p-3">Repair if localized damage</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">GRP Fibreglass</td>
                      <td className="border border-gray-300 p-3">25-30 years</td>
                      <td className="border border-gray-300 p-3">Repair if localized damage</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Single Ply (PVC/TPO)</td>
                      <td className="border border-gray-300 p-3">20-30 years</td>
                      <td className="border border-gray-300 p-3">Repair if membrane intact</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                When to Replace Your Flat Roof
              </h2>

              <p className="mb-4">
                Consider full replacement when:
              </p>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Multiple leaks in different areas</li>
                <li>Widespread cracking or blistering</li>
                <li>Roof is over 15 years old (felt) or 25 years (EPDM/GRP)</li>
                <li>Repair costs exceed 50% of replacement cost</li>
                <li>Insulation is wet or damaged</li>
                <li>You want to upgrade to a longer-lasting system</li>
              </ul>

              <div className="bg-brand-orange/10 border-l-4 border-brand-orange p-6 mb-8">
                <p className="text-brand-navy font-semibold mb-2">Our Recommendation:</p>
                <p className="text-gray-700">
                  If you have an old felt roof that's causing problems, we typically recommend 
                  upgrading to EPDM or GRP rather than re-felting. The cost difference is modest, 
                  but you'll get 2-3 times the lifespan.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Flat Roof Costs in Cheshire
              </h2>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Patch repair:</strong> £100-£300</li>
                <li><strong>Flashing repair:</strong> £150-£400</li>
                <li><strong>Garage roof (EPDM):</strong> £800-£1,500</li>
                <li><strong>Extension roof (GRP):</strong> £1,200-£2,500</li>
                <li><strong>Large flat roof:</strong> £60-£100 per m²</li>
              </ul>

              <div className="bg-brand-navy text-white p-8 rounded-xl mb-8">
                <h3 className="text-xl font-bold mb-4">Expert Flat Roof Services</h3>
                <p className="mb-4">
                  From repairs to complete replacements, our team specializes in all flat roofing 
                  systems. We serve Sandbach, Crewe, Middlewich, Congleton, and all of Cheshire.
                </p>
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" asChild>
                  <Link href="/services/flat-roofing">
                    View Flat Roof Services
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <p className="mb-8">
                Got a flat roof problem? <Link href="/contact" className="text-brand-orange hover:underline">Contact us</Link> for 
                a free inspection and honest advice on repair vs replacement. For urgent leaks, our <Link href="/emergency-roofing" className="text-brand-orange hover:underline">24/7 emergency roofing</Link> team 
                responds fast. If your flat roof is part of a wider issue, explore our <Link href="/roof-repairs" className="text-brand-orange hover:underline">roof repair services</Link> or 
                <Link href="/new-roofs" className="text-brand-orange hover:underline"> complete re-roofing options</Link>.
              </p>
            </div>

            <div className="border-t pt-8 mt-8">
              <h3 className="text-xl font-bold text-brand-navy mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Link href="/blog/flat-vs-tile-roofs" className="group">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange mb-2">
                      Flat vs Tile Roofs Compared
                    </h4>
                    <p className="text-sm text-gray-600">
                      Which roof type is right for your property?
                    </p>
                  </div>
                </Link>
                <Link href="/blog/how-long-does-roof-last" className="group">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange mb-2">
                      How Long Does a Roof Last?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Lifespan guide for all roof types.
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
