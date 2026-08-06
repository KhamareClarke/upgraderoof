'use client';

import { Calendar, User, Clock, ArrowRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function ChimneyRepairGuidePost() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-r from-brand-navy/95 to-brand-navy/90">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-brand-orange mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">March 1, 2026</span>
              <span className="text-white/50">•</span>
              <User className="w-4 h-4" />
              <span className="text-sm">Upgrade Roofs Team</span>
              <span className="text-white/50">•</span>
              <Clock className="w-4 h-4" />
              <span className="text-sm">6 min read</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Chimney Repairs in Cheshire: Complete Homeowner's Guide
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              From repointing to full rebuilds, learn everything about chimney maintenance 
              and repairs. Protect your home from water damage and structural issues.
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
                  src="/images/1.jpeg"
                  alt="Professional chimney repair and repointing in Cheshire"
                  width={800}
                  height={400}
                  className="rounded-xl shadow-lg w-full object-cover"
                />
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Chimneys are one of the most exposed parts of your home, facing constant assault from 
                Cheshire's wind, rain, and temperature changes. As specialist <strong>chimney repair 
                contractors in Cheshire</strong>, we see the consequences of neglected chimneys daily.
              </p>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 mb-8">
                <div className="flex items-start gap-3">
                  <Flame className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-orange-800 font-semibold mb-2">Safety First</p>
                    <p className="text-orange-700">
                      A damaged chimney can allow water into your home, cause structural damage, 
                      and in severe cases, pose a collapse risk. Never ignore chimney problems.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Common Chimney Problems
              </h2>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Cracked or missing mortar</strong> between bricks (repointing needed)</li>
                <li><strong>Damaged flashing</strong> where chimney meets roof</li>
                <li><strong>Cracked chimney pot</strong> or missing cowl</li>
                <li><strong>Leaning chimney stack</strong> indicating structural issues</li>
                <li><strong>Spalling bricks</strong> (face of bricks flaking off)</li>
                <li><strong>Damaged or missing cap</strong> allowing water entry</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Types of Chimney Repairs
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-brand-navy mb-3">Minor Repairs</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Repointing mortar joints</li>
                    <li>• Flashing repairs</li>
                    <li>• Chimney pot replacement</li>
                    <li>• Cowl installation</li>
                    <li>• Minor brick replacement</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">Typical cost: £150-£500</p>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-brand-navy mb-3">Major Repairs</h3>
                  <ul className="text-sm space-y-2">
                    <li>• Partial chimney rebuild</li>
                    <li>• Full chimney rebuild</li>
                    <li>• Stack straightening</li>
                    <li>• Lead flashing replacement</li>
                    <li>• Structural reinforcement</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">Typical cost: £500-£3,000+</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Signs You Need Chimney Repairs
              </h2>

              <p className="mb-4">
                Watch for these warning signs that indicate chimney problems:
              </p>

              <ol className="list-decimal pl-6 mb-6 space-y-2">
                <li><strong>Water stains</strong> on ceiling or walls near the chimney</li>
                <li><strong>Damp patches</strong> in the loft around the chimney breast</li>
                <li><strong>White staining</strong> (efflorescence) on chimney bricks</li>
                <li><strong>Mortar debris</strong> in gutters or on the ground</li>
                <li><strong>Visible cracks</strong> in the chimney stack</li>
                <li><strong>Loose or wobbly</strong> chimney pot</li>
              </ol>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Chimney Flashing Explained
              </h2>

              <p className="mb-4">
                Flashing is the weatherproof seal between your chimney and roof. It's one of the most 
                common sources of leaks when it fails:
              </p>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Lead flashing</strong> is traditional and long-lasting (50+ years)</li>
                <li><strong>Step flashing</strong> runs up the sides of the chimney</li>
                <li><strong>Back gutter</strong> diverts water behind the chimney</li>
                <li><strong>Apron flashing</strong> seals the front base</li>
              </ul>

              <div className="bg-brand-orange/10 border-l-4 border-brand-orange p-6 mb-8">
                <p className="text-brand-navy font-semibold mb-2">Expert Tip:</p>
                <p className="text-gray-700">
                  If your flashing is over 20 years old, have it inspected. Failed flashing is the 
                  number one cause of chimney-related water damage we see in Cheshire homes.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Chimney Maintenance Tips
              </h2>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Have your chimney inspected annually</li>
                <li>Get it swept if you use the fireplace</li>
                <li>Install a chimney cap to prevent water and debris entry</li>
                <li>Check flashing after severe storms</li>
                <li>Address small repairs before they become major problems</li>
              </ul>

              <div className="bg-brand-navy text-white p-8 rounded-xl mb-8">
                <h3 className="text-xl font-bold mb-4">Professional Chimney Repairs</h3>
                <p className="mb-4">
                  Our experienced team handles all chimney repairs across Cheshire. From simple 
                  repointing to complete rebuilds, we provide lasting solutions with a 10-year guarantee.
                </p>
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" asChild>
                  <Link href="/services/chimney-repairs">
                    View Chimney Services
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Chimney Repair Costs in Cheshire
              </h2>

              <div className="overflow-x-auto mb-8">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Repair Type</th>
                      <th className="border border-gray-300 p-3 text-left">Typical Cost</th>
                      <th className="border border-gray-300 p-3 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3">Repointing</td>
                      <td className="border border-gray-300 p-3">£200-£400</td>
                      <td className="border border-gray-300 p-3">Half day</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Flashing repair</td>
                      <td className="border border-gray-300 p-3">£150-£350</td>
                      <td className="border border-gray-300 p-3">Half day</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">New lead flashing</td>
                      <td className="border border-gray-300 p-3">£400-£800</td>
                      <td className="border border-gray-300 p-3">1 day</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Partial rebuild</td>
                      <td className="border border-gray-300 p-3">£800-£1,500</td>
                      <td className="border border-gray-300 p-3">1-2 days</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3">Full rebuild</td>
                      <td className="border border-gray-300 p-3">£1,500-£3,000+</td>
                      <td className="border border-gray-300 p-3">2-3 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mb-8">
                For a free chimney inspection and quote, <Link href="/contact" className="text-brand-orange hover:underline">contact our team</Link> today. 
                Chimney issues often coincide with other roofing problems — see our <Link href="/roof-repairs" className="text-brand-orange hover:underline">roof repair services</Link> for 
                a full assessment. If your chimney has suffered storm damage, our <Link href="/emergency-roofing" className="text-brand-orange hover:underline">24/7 emergency roofing</Link> team 
                can make it safe immediately. We serve all of Cheshire including Sandbach, Crewe, Middlewich, Congleton, and surrounding areas.
              </p>
            </div>

            <div className="border-t pt-8 mt-8">
              <h3 className="text-xl font-bold text-brand-navy mb-6">Related Articles</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <Link href="/blog/roof-damage-signs" className="group">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange mb-2">
                      How to Spot Roof Damage Early
                    </h4>
                    <p className="text-sm text-gray-600">
                      Identify problems before they become expensive.
                    </p>
                  </div>
                </Link>
                <Link href="/blog/emergency-roof-repairs" className="group">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange mb-2">
                      Emergency Roof Repairs Guide
                    </h4>
                    <p className="text-sm text-gray-600">
                      What to do when disaster strikes.
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
