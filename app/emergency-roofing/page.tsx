import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { QuoteForm } from '@/components/QuoteForm';
import { TrackedPhoneLink } from '@/components/TrackedPhoneLink';
import { Zap, Phone, CheckCircle, Clock, Shield, AlertTriangle, MapPin, ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';
import { ServiceAreaLinks } from '@/components/ServiceAreaLinks';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';

export const dynamic = 'force-static';
export const revalidate = false;

export const metadata: Metadata = {
  title: 'Emergency Roofer Sandbach | 24/7 Storm Damage | 01270 897606',
  description: 'Emergency roof repairs in Sandbach & Cheshire. 24/7 call-out. Storm damage, leaks, fallen tiles. Usually on-site within 30 minutes from our Sandbach base. Call 01270 897606 now.',
  keywords: 'emergency roofer Sandbach, emergency roof repairs Sandbach, 24/7 roofer Cheshire, storm damage Sandbach, urgent roof repair',
  openGraph: {
    title: 'Emergency Roofer Sandbach | 24/7 | 01270 897606',
    description: 'Emergency roof repairs in Sandbach & Cheshire. 24/7 call-out. Fast response from our Sandbach base.',
    url: 'https://www.upgraderoofs.co.uk/emergency-roofing',
    siteName: 'Upgrade Roofs',
    images: [
      {
        url: 'https://www.upgraderoofs.co.uk/images/6.jpeg',
        width: 1200,
        height: 630,
        alt: 'Emergency Roofer Sandbach - Upgrade Roofs',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Emergency Roofer Sandbach | 24/7 | Upgrade Roofs',
    description: '24/7 emergency roof repairs from our Sandbach base. Storm damage, leaks, fallen tiles. Call 01270 897606.',
    images: ['https://www.upgraderoofs.co.uk/images/6.jpeg'],
  },
  alternates: {
    canonical: 'https://www.upgraderoofs.co.uk/emergency-roofing',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function EmergencyRoofingPage() {
  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.upgraderoofs.co.uk' },
        { name: 'Emergency Roofing', url: 'https://www.upgraderoofs.co.uk/emergency-roofing' },
      ]} />
      <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-r from-red-900 via-red-800 to-brand-navy">
        <div className="container-custom relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium">
              <AlertTriangle className="w-4 h-4 text-brand-orange animate-pulse" />
              <span>24/7 Emergency Service</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Emergency Roofer in <span className="text-brand-orange">Sandbach</span> — 24/7
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl">
              Storm damage? Sudden leak? Based in Sandbach, we respond fast — usually on-site within 30 minutes. 24/7 emergency cover across Sandbach and all of Cheshire.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-8 h-14 animate-pulse" asChild>
                <TrackedPhoneLink href="tel:01270897606" placement="emergency_hero_mobile">
                  <Phone className="w-5 h-5 mr-2" />
                  Call: 01270 897 606
                </TrackedPhoneLink>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white !text-white hover:bg-white/10 hover:border-brand-orange font-bold px-8 h-14" asChild>
                <TrackedPhoneLink href="tel:01270897606" placement="emergency_hero_office">
                  <Phone className="w-5 h-5 mr-2" />
                  Office: 01270 897 606
                </TrackedPhoneLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Services */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
              24/7 Emergency Roofing Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              If you have storm damage or an active leak, our team is on standby. Based in Sandbach, we cover Crewe, Congleton, Middlewich, Nantwich, and all of Cheshire.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Storm Damage', desc: 'High winds, fallen trees, damaged tiles. We make your property safe and watertight fast.' },
              { title: 'Sudden Leaks', desc: 'Water coming through your ceiling? We find and fix the source immediately.' },
              { title: 'Missing Tiles', desc: 'Tiles blown off in bad weather. Emergency replacement to prevent water ingress.' },
              { title: 'Structural Damage', desc: 'Collapsed sections, damaged timbers. Emergency make-safe and temporary repairs.' },
              { title: 'Chimney Damage', desc: 'Fallen chimney pots, damaged stacks. Urgent repairs to prevent further damage.' },
              { title: 'Flat Roof Leaks', desc: 'Emergency flat roof repairs. Temporary waterproofing until permanent fix.' },
            ].map((service, i) => (
              <div key={i} className="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <Zap className="w-8 h-8 text-red-600 mb-3" />
                <h3 className="text-xl font-bold text-brand-navy mb-2">{service.title}</h3>
                <p className="text-gray-600 text-sm">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Call Us */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-6">
                Why Call Upgrade Roofs in an Emergency?
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Clock, title: 'Fast Response', desc: 'Based in Sandbach, we cover all of south and mid-Cheshire — typically on-site within 30 minutes of your call.' },
                  { icon: Shield, title: 'Make-Safe Guarantee', desc: 'We secure your property immediately to prevent further damage.' },
                  { icon: MapPin, title: 'Local Knowledge', desc: '25+ years serving Sandbach and Cheshire. We know local property types and common roofing issues.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-navy mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 bg-red-50 border-2 border-red-200 rounded-xl">
                <h3 className="text-lg font-bold text-brand-navy mb-2">What to Do Before We Arrive</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Move valuables away from the leak area</li>
                  <li>• Place buckets to catch dripping water</li>
                  <li>• Take photos for insurance if safe to do so</li>
                  <li>• Do NOT attempt to climb on the roof yourself</li>
                </ul>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-red-200">
              <h3 className="text-2xl font-bold text-brand-navy mb-4">Emergency Call-Out</h3>
              <p className="text-gray-600 mb-6">
                For immediate emergency assistance in Sandbach or anywhere in Cheshire, call our emergency line now.
              </p>
              <div className="space-y-4">
                <Button size="lg" className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold h-14 animate-pulse" asChild>
                  <TrackedPhoneLink href="tel:01270897606" placement="emergency_callout_mobile">
                    <Phone className="w-5 h-5 mr-2" />
                    Call: 01270 897 606
                  </TrackedPhoneLink>
                </Button>
                <Button size="lg" variant="outline" className="w-full border-2 border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white font-semibold h-14" asChild>
                  <TrackedPhoneLink href="tel:01270897606" placement="emergency_callout_office">
                    <Phone className="w-5 h-5 mr-2" />
                    Office: 01270 897 606
                  </TrackedPhoneLink>
                </Button>
              </div>
              <div className="mt-6">
                <Link href="/service-areas" className="inline-flex items-center gap-2 text-brand-orange font-semibold hover:underline text-sm">
                  <MapPin className="w-4 h-4" />
                  View all Cheshire service areas <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Reviews */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <h2 className="text-2xl font-bold text-brand-navy mb-6 text-center">Emergency Call-Out Reviews</h2>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { text: 'Called at 7pm on a Friday with water pouring through the ceiling. They were at our house within 40 minutes, had a tarp on before dark, and came back Monday to do the full repair. Absolute lifesavers.', name: 'James H.', location: 'Middlewich Road, Sandbach' },
              { text: 'Tree branch came through our roof in the storm. Upgrade Roofs made it safe that evening and handled everything with our insurance. Couldn\'t have asked for better service in a crisis.', name: 'Lisa & Pete C.', location: 'Wheelock, Sandbach' },
              { text: 'Woke up to a puddle in the hallway. Called the emergency line and they diagnosed a slipped valley tile within the hour. Quick fix, reasonable price, and proper follow-up visit a week later.', name: 'Tom B.', location: 'Crewe' },
            ].map((r, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex gap-1 mb-2">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-current" />)}</div>
                <p className="text-sm text-gray-700 italic mb-3">"{r.text}"</p>
                <p className="text-sm font-semibold text-brand-navy">{r.name}</p>
                <p className="text-xs text-gray-500">{r.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contextual Cross-Links */}
      <section className="py-10 bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto prose prose-lg text-gray-600 leading-relaxed">
            <p>
              Once the emergency is resolved, we can carry out permanent <Link href="/roof-repairs" className="text-brand-orange hover:underline font-medium">roof repairs</Link> or 
              advise on whether a full <Link href="/new-roofs" className="text-brand-orange hover:underline font-medium">new roof</Link> is the better long-term investment. 
              Find your local page: <Link href="/roofers-sandbach" className="text-brand-orange hover:underline font-medium">Sandbach</Link>, <Link href="/roofers-crewe" className="text-brand-orange hover:underline font-medium">Crewe</Link>, <Link href="/roofers-congleton" className="text-brand-orange hover:underline font-medium">Congleton</Link>, <Link href="/roofers-nantwich" className="text-brand-orange hover:underline font-medium">Nantwich</Link>, or <Link href="/roofers-middlewich" className="text-brand-orange hover:underline font-medium">Middlewich</Link>. We also provide insurance claim documentation and can liaise directly with your insurer. 
              For prevention advice, read our <Link href="/blog/emergency-roof-repairs" className="text-brand-orange hover:underline font-medium">emergency roof repairs guide</Link> and <Link href="/blog/roof-damage-signs" className="text-brand-orange hover:underline font-medium">how to spot roof damage early</Link>.
            </p>
          </div>
        </div>
      </section>

      <ServiceAreaLinks serviceName="Emergency Roofing" />

      {/* CTA */}
      <section className="section-padding bg-red-900 text-white">
        <div className="container-custom text-center">
          <AlertTriangle className="w-16 h-16 text-brand-orange mx-auto mb-6 animate-pulse" />
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Roofing Emergency in Sandbach?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Don't wait — call us now for immediate assistance in Sandbach and across Cheshire
          </p>
          <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-10 h-14 text-lg animate-pulse" asChild>
            <TrackedPhoneLink href="tel:01270897606" placement="emergency_bottom_cta">
              <Phone className="w-5 h-5 mr-2" />
              Call Now: 01270 897 606
            </TrackedPhoneLink>
          </Button>
        </div>
      </section>
    </div>
    </>
  );
}
