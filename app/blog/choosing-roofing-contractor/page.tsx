'use client';

import { Calendar, User, Clock, ArrowRight, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function ChoosingRoofingContractorPost() {
  const greenFlags = [
    'Written quotes with detailed breakdown',
    'Proof of insurance (£10M+ public liability)',
    'Trade body membership (CORC, NFRC)',
    'Local references you can verify',
    'Clear contract terms and guarantees',
    'No pressure for immediate decisions',
    'Professional communication',
    'Registered business address',
  ];

  const redFlags = [
    'Demands cash payment upfront',
    'No written quote or contract',
    'Cannot provide insurance details',
    'Pressure to sign immediately',
    'Significantly cheaper than others',
    'No fixed business address',
    'Poor or no online reviews',
    'Vague about start dates',
  ];

  return (
    <div className="min-h-screen bg-white">
      <section className="relative py-20 bg-gradient-to-r from-brand-navy/95 to-brand-navy/90">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 text-brand-orange mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">February 25, 2026</span>
              <span className="text-white/50">•</span>
              <User className="w-4 h-4" />
              <span className="text-sm">Upgrade Roofs Team</span>
              <span className="text-white/50">•</span>
              <Clock className="w-4 h-4" />
              <span className="text-sm">8 min read</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How to Choose a Reliable Roofing Contractor in Cheshire
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl">
              Avoid cowboy builders and rogue traders. Learn what to look for when hiring 
              a roofing contractor and protect yourself from costly mistakes.
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
                  alt="Professional roofing contractor team in Cheshire"
                  width={800}
                  height={400}
                  className="rounded-xl shadow-lg w-full object-cover"
                />
              </div>

              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Choosing the right roofing contractor is one of the most important decisions you'll make 
                as a homeowner. A poor choice can lead to substandard work, wasted money, and ongoing 
                problems. Here's our expert guide to finding a <strong>reliable roofer in Cheshire</strong>.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-blue-800 font-semibold mb-2">Protect Yourself</p>
                    <p className="text-blue-700">
                      The roofing industry unfortunately attracts some unscrupulous operators. 
                      Taking time to verify credentials can save you thousands in the long run.
                    </p>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Green Flags: Signs of a Reputable Roofer
              </h2>

              <div className="bg-green-50 p-6 rounded-xl mb-8">
                <div className="grid md:grid-cols-2 gap-3">
                  {greenFlags.map((flag, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Red Flags: Warning Signs to Watch For
              </h2>

              <div className="bg-red-50 p-6 rounded-xl mb-8">
                <div className="grid md:grid-cols-2 gap-3">
                  {redFlags.map((flag, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Essential Questions to Ask
              </h2>

              <p className="mb-4">
                Before hiring any roofing contractor, ask these important questions:
              </p>

              <ol className="list-decimal pl-6 mb-6 space-y-3">
                <li>
                  <strong>Are you insured?</strong>
                  <p className="text-gray-600 text-sm mt-1">Ask for proof of public liability insurance (minimum £2M, ideally £10M)</p>
                </li>
                <li>
                  <strong>Are you a member of any trade bodies?</strong>
                  <p className="text-gray-600 text-sm mt-1">Look for CORC, NFRC, or similar accreditations</p>
                </li>
                <li>
                  <strong>Can you provide local references?</strong>
                  <p className="text-gray-600 text-sm mt-1">A good contractor will happily share recent customer contacts</p>
                </li>
                <li>
                  <strong>What guarantee do you offer?</strong>
                  <p className="text-gray-600 text-sm mt-1">Look for minimum 10-year workmanship guarantee</p>
                </li>
                <li>
                  <strong>Will you provide a written contract?</strong>
                  <p className="text-gray-600 text-sm mt-1">Everything should be documented before work begins</p>
                </li>
              </ol>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Getting Quotes: Best Practice
              </h2>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>Get at least 3 quotes from different contractors</li>
                <li>Ensure all quotes are for the same scope of work</li>
                <li>Be wary of quotes significantly lower than others</li>
                <li>Check what's included (scaffolding, skip, materials)</li>
                <li>Ask about payment terms (never pay 100% upfront)</li>
              </ul>

              <div className="bg-brand-orange/10 border-l-4 border-brand-orange p-6 mb-8">
                <p className="text-brand-navy font-semibold mb-2">Payment Advice:</p>
                <p className="text-gray-700">
                  A reasonable payment structure is: no deposit or small deposit (10-20%), 
                  progress payment if work spans multiple weeks, and final payment on completion. 
                  Never pay the full amount before work is finished.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Checking Credentials
              </h2>

              <p className="mb-4">
                Verify your contractor's claims:
              </p>

              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li><strong>Companies House:</strong> Check they're a registered business</li>
                <li><strong>Trade body websites:</strong> Verify membership claims</li>
                <li><strong>Google Reviews:</strong> Read recent customer feedback</li>
                <li><strong>Checkatrade/TrustATrader:</strong> Check verified reviews</li>
                <li><strong>Insurance:</strong> Ask to see certificate, not just claim</li>
              </ul>

              <h2 className="text-2xl font-bold text-brand-navy mb-4">
                Why Choose Upgrade Roofs
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-brand-navy mb-3">Our Credentials</h3>
                  <ul className="text-sm space-y-2">
                    <li>✓ CORC Approved Member</li>
                    <li>✓ £10M Public Liability Insurance</li>
                    <li>✓ 25+ Years Experience</li>
                    <li>✓ 5 Star Google Rating</li>
                    <li>✓ Insurance Backed Guarantees</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-brand-navy mb-3">Our Promise</h3>
                  <ul className="text-sm space-y-2">
                    <li>✓ Free written quotes</li>
                    <li>✓ No pressure sales</li>
                    <li>✓ 10-year workmanship guarantee</li>
                    <li>✓ Local Cheshire team</li>
                    <li>✓ Clear communication throughout</li>
                  </ul>
                </div>
              </div>

              <div className="bg-brand-navy text-white p-8 rounded-xl mb-8">
                <h3 className="text-xl font-bold mb-4">Get a Free, No-Obligation Quote</h3>
                <p className="mb-4">
                  See the Upgrade Roofs difference. We provide detailed written quotes, 
                  proof of all credentials, and references from satisfied customers across 
                  Sandbach, Crewe, Middlewich, Congleton, and all of Cheshire.
                </p>
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" asChild>
                  <Link href="/special-offer">
                    Request Free Quote
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>

              <p className="mb-8">
                Have questions about hiring a roofer? <Link href="/contact" className="text-brand-orange hover:underline">Contact us</Link> for 
                honest, no-obligation advice.
              </p>
            </div>

            {/* Money Page Links */}
            <div className="bg-brand-navy/5 border border-brand-navy/10 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-brand-navy mb-3">Ready to Get Quotes?</h3>
              <p className="text-gray-600 text-sm mb-3">
                Whether you need <Link href="/roof-repairs" className="text-brand-orange hover:underline font-medium">roof repairs</Link>, a 
                complete <Link href="/new-roofs" className="text-brand-orange hover:underline font-medium">new roof</Link>, or 
                <Link href="/emergency-roofing" className="text-brand-orange hover:underline font-medium"> emergency roofing</Link>, we provide 
                free written quotes with no obligation. See what Sandbach customers say on our <Link href="/roofers-sandbach" className="text-brand-orange hover:underline font-medium">local Sandbach page</Link>, 
                or view our <Link href="/case-studies" className="text-brand-orange hover:underline font-medium">case studies</Link> with before/after photos.
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
                      Know when you need to call a professional.
                    </p>
                  </div>
                </Link>
                <Link href="/blog/how-long-does-roof-last" className="group">
                  <div className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition-colors">
                    <h4 className="font-semibold text-brand-navy group-hover:text-brand-orange mb-2">
                      How Long Does a Roof Last?
                    </h4>
                    <p className="text-sm text-gray-600">
                      Plan for roof replacement with our guide.
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
