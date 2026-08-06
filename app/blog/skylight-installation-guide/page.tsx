'use client';

import { Calendar, User, Clock, ArrowRight, Sun, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function SkylightInstallationGuidePost() {
  const benefits = [
    'Up to 30% more natural light than vertical windows',
    'Improved ventilation and air quality',
    'Increased property value',
    'Reduced energy bills (less artificial lighting)',
    'Enhanced mood and wellbeing',
    'Privacy with natural light',
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-r from-brand-navy/95 to-brand-navy/90">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-brand-orange mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">February 20, 2026</span>
              <span className="text-white/50">•</span>
              <User className="w-4 h-4" />
              <span className="text-sm">Upgrade Roofs Team</span>
              <span className="text-white/50">•</span>
              <Clock className="w-4 h-4" />
              <span className="text-sm">7 min read</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Skylight Installation Guide: Transform Your Home with Natural Light
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              Everything you need to know about adding skylights to your Cheshire home. 
              Types, costs, installation process, and choosing the right skylight for your needs.
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
                  src="/images/10.jpeg"
                  alt="Velux skylight installation in Cheshire home"
                  width={800}
                  height={400}
                  className="rounded-xl shadow-lg w-full object-cover"
                />
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Skylights are one of the most effective ways to transform dark spaces into bright, 
                welcoming areas. As experienced <strong>skylight installers in Cheshire</strong>, we've 
                helped hundreds of homeowners bring natural light into their homes.
              </p>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Benefits of Skylights
              </h2>

              <div className="bg-yellow-50 p-6 rounded-xl mb-8">
                <div className="flex items-start gap-3 mb-4">
                  <Sun className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                  <h3 className="font-semibold text-yellow-800">Why Install Skylights?</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Types of Skylights
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-brand-navy mb-3">Fixed Skylights</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Non-opening, light only</li>
                    <li>• Most affordable option</li>
                    <li>• Ideal for high ceilings</li>
                    <li>• Minimal maintenance</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">From £300 installed</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-brand-navy mb-3">Opening Skylights</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Manual or electric opening</li>
                    <li>• Ventilation + light</li>
                    <li>• Rain sensors available</li>
                    <li>• Ideal for kitchens/bathrooms</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">From £500 installed</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-brand-navy mb-3">Sun Tunnels</h3>
                  <ul className="text-sm space-y-2">
                    <li>• For spaces far from roof</li>
                    <li>• Reflective tube system</li>
                    <li>• Minimal structural work</li>
                    <li>• Great for hallways</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">From £400 installed</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-brand-navy mb-3">Flat Roof Skylights</h3>
                  <ul className="text-sm space-y-2">
                    <li>• For flat roof extensions</li>
                    <li>• Fixed or opening options</li>
                    <li>• Modern aesthetic</li>
                    <li>• Triple glazed available</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">From £600 installed</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Velux vs Other Brands
              </h2>

              <p className="mb-4">
                Velux is the most recognized skylight brand, but there are quality alternatives:
              </p>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Brand</th>
                      <th className="border border-gray-300 p-3 text-left">Pros</th>
                      <th className="border border-gray-300 p-3 text-left">Price Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Velux</td>
                      <td className="border border-gray-300 p-3">Industry standard, wide range, excellent warranty</td>
                      <td className="border border-gray-300 p-3">£££</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Fakro</td>
                      <td className="border border-gray-300 p-3">Good quality, competitive pricing</td>
                      <td className="border border-gray-300 p-3">££</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-medium">Keylite</td>
                      <td className="border border-gray-300 p-3">Budget-friendly, good for basic needs</td>
                      <td className="border border-gray-300 p-3">£</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Installation Process
              </h2>

              <ol className="list-decimal pl-6 mb-6 space-y-3">
                <li>
                  <strong>Survey and planning</strong>
                  <p className="text-gray-600 text-sm mt-1">We assess your roof structure and recommend the best position</p>
                </li>
                <li>
                  <strong>Preparation</strong>
                  <p className="text-gray-600 text-sm mt-1">Internal protection and scaffolding if needed</p>
                </li>
                <li>
                  <strong>Opening creation</strong>
                  <p className="text-gray-600 text-sm mt-1">Carefully cut through roof covering and structure</p>
                </li>
                <li>
                  <strong>Frame installation</strong>
                  <p className="text-gray-600 text-sm mt-1">Secure the skylight frame to roof timbers</p>
                </li>
                <li>
                  <strong>Weatherproofing</strong>
                  <p className="text-gray-600 text-sm mt-1">Install flashing kit for watertight seal</p>
                </li>
                <li>
                  <strong>Finishing</strong>
                  <p className="text-gray-600 text-sm mt-1">Internal trim and any plastering required</p>
                </li>
              </ol>

              <div className="bg-brand-orange/10 border-l-4 border-brand-orange p-6 mb-8">
                <p className="text-brand-navy font-semibold mb-2">Planning Permission:</p>
                <p className="text-gray-700">
                  Most skylights don't require planning permission under permitted development rights. 
                  However, there are restrictions in conservation areas and for listed buildings. 
                  We'll advise you during the survey.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Skylight Costs in Cheshire
              </h2>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Skylight Type</th>
                      <th className="border border-gray-300 p-3 text-left">Supply + Install</th>
                      <th className="border border-gray-300 p-3 text-left">Installation Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3">Fixed skylight</td>
                      <td className="border border-gray-300 p-3">£300-£600</td>
                      <td className="border border-gray-300 p-3">Half day</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Manual opening</td>
                      <td className="border border-gray-300 p-3">£500-£900</td>
                      <td className="border border-gray-300 p-3">Half day</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Electric opening</td>
                      <td className="border border-gray-300 p-3">£800-£1,500</td>
                      <td className="border border-gray-300 p-3">1 day</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Sun tunnel</td>
                      <td className="border border-gray-300 p-3">£400-£700</td>
                      <td className="border border-gray-300 p-3">Half day</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Flat roof skylight</td>
                      <td className="border border-gray-300 p-3">£600-£1,200</td>
                      <td className="border border-gray-300 p-3">1 day</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-brand-navy text-white p-8 rounded-xl mb-8">
                <h3 className="text-xl font-bold mb-4">Professional Skylight Installation</h3>
                <p className="mb-4">
                  Transform your home with natural light. Our experienced team installs all types 
                  of skylights across Cheshire with full weatherproofing guarantees.
                </p>
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" asChild>
                  <Link href="/services/skylights-roof-windows">
                    View Skylight Services
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <p className="mb-8">
                Ready to brighten your home? <Link href="/contact" className="text-brand-orange hover:underline">Contact us</Link> for 
                a free skylight consultation and quote. Skylights are often installed as part of a <Link href="/new-roofs" className="text-brand-orange hover:underline">new roof</Link> or 
                re-roofing project — the ideal time to add natural light. We also handle all related <Link href="/roof-repairs" className="text-brand-orange hover:underline">roof repairs</Link> if 
                your existing roof needs attention first.
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
                      Which roof type suits your property?
                    </p>
                  </div>
                </Link>
                <Link href="/blog/how-long-does-roof-last" className="group">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange mb-2">
                      How Long Does a Roof Last?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Roof lifespan guide for UK homeowners.
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
