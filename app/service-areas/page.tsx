import type { Metadata } from 'next';
import { MapPin, Phone, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Roofing Service Areas | Stoke-on-Trent & Staffordshire Coverage',
  description: 'Professional roofing services across Stoke-on-Trent, Newcastle-under-Lyme, Stafford, Stone, Leek & all Staffordshire. Free quotes, 24/7 emergency service.',
  keywords: 'roofing service areas, roofers Stoke-on-Trent, roofing Staffordshire, Newcastle-under-Lyme roofers, Stafford roofing, Stone roofers',
  openGraph: {
    title: 'Roofing Service Areas | Stoke-on-Trent & Staffordshire',
    description: 'Professional roofing services across Staffordshire. Emergency repairs, installations, maintenance.',
    type: 'website',
  },
};

const serviceAreas = [
  {
    name: 'Stoke-on-Trent',
    description: 'Our main service area covering all districts including Hanley, Burslem, Tunstall, Longton, Fenton, and Stoke.',
    services: ['Emergency Roof Repairs', 'Flat Roofing', 'Tile & Slate Roofs', 'Guttering', 'Storm Damage'],
    population: '250,000+',
    responseTime: '30 minutes',
    featured: true
  },
  {
    name: 'Newcastle-under-Lyme',
    description: 'Comprehensive roofing services for Newcastle-under-Lyme and surrounding villages.',
    services: ['Roof Installations', 'Chimney Repairs', 'Fascia & Soffits', 'Skylights'],
    population: '75,000+',
    responseTime: '45 minutes'
  },
  {
    name: 'Stafford',
    description: 'Professional roofing contractors serving Stafford town and rural areas.',
    services: ['Commercial Roofing', 'Residential Repairs', 'Maintenance', 'Insurance Work'],
    population: '70,000+',
    responseTime: '60 minutes'
  },
  {
    name: 'Stone',
    description: 'Expert roofing services for Stone, including heritage and conservation work.',
    services: ['Heritage Roofing', 'Natural Slate', 'Clay Tiles', 'Lead Work'],
    population: '16,000+',
    responseTime: '45 minutes'
  },
  {
    name: 'Leek',
    description: 'Roofing specialists serving Leek and the Staffordshire Moorlands.',
    services: ['Moorland Weather Protection', 'Storm Resistant Roofing', 'Traditional Materials'],
    population: '20,000+',
    responseTime: '60 minutes'
  },
  {
    name: 'Cheadle',
    description: 'Quality roofing services for Cheadle and surrounding Staffordshire villages.',
    services: ['Village Roofing', 'Cottage Repairs', 'Modern Extensions', 'Period Properties'],
    population: '12,000+',
    responseTime: '50 minutes'
  },
  {
    name: 'Biddulph',
    description: 'Reliable roofing contractors for Biddulph and the surrounding moorland areas.',
    services: ['Weather Resistant Systems', 'Emergency Repairs', 'Maintenance Programs'],
    population: '20,000+',
    responseTime: '55 minutes'
  },
  {
    name: 'Kidsgrove',
    description: 'Professional roofing services for Kidsgrove, on the Staffordshire-Cheshire border.',
    services: ['Cross-Border Service', 'All Roofing Types', 'Quick Response'],
    population: '24,000+',
    responseTime: '40 minutes'
  }
];

export default function ServiceAreasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-grey to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-brand-navy via-brand-navy/95 to-brand-orange/20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
              <MapPin className="w-4 h-4 text-brand-orange" />
              <span>Serving Staffordshire</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Professional Roofing Services Across 
              <span className="text-brand-orange"> Stoke-on-Trent & Staffordshire</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              With over 25 years of experience, we provide comprehensive roofing services throughout Staffordshire. 
              Emergency repairs, installations, and maintenance with rapid response times.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-8 py-4">
                <Phone className="w-5 h-5 mr-2" />
                Call 01782 123456
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-brand-navy font-semibold px-8 py-4" asChild>
                <Link href="/contact">Get Free Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Map */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
              Our Service Coverage Area
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide professional roofing services across a 25-mile radius from our Stoke-on-Trent base, 
              covering all major towns and villages in Staffordshire.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d76832.89194948935!2d-2.2813!3d53.0273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487a4c5b7c4b0b0b%3A0x0!2sStoke-on-Trent%2C%20UK!5e0!3m2!1sen!2suk!4v1699000000000!5m2!1sen!2suk"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Upgrade Roofing Service Area - Staffordshire"
                />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-brand-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy mb-2">25-Mile Service Radius</h3>
                  <p className="text-gray-600">Complete coverage of Staffordshire and surrounding areas with guaranteed response times.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy mb-2">Rapid Response Times</h3>
                  <p className="text-gray-600">Emergency callouts within 30-60 minutes depending on location. 24/7 availability.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy mb-2">Local Knowledge</h3>
                  <p className="text-gray-600">Deep understanding of local weather conditions, building styles, and planning requirements.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas Grid */}
      <section className="section-padding bg-brand-grey">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
              Areas We Serve
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional roofing services across all major towns and villages in Staffordshire.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceAreas.map((area, index) => (
              <Card key={index} className={`hover-lift transition-all duration-300 ${area.featured ? 'ring-2 ring-brand-orange' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-brand-navy">{area.name}</CardTitle>
                    {area.featured && (
                      <span className="px-2 py-1 bg-brand-orange text-white text-xs font-semibold rounded-full">
                        Main Area
                      </span>
                    )}
                  </div>
                  <CardDescription className="text-gray-600">
                    Population: {area.population} • Response: {area.responseTime}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{area.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-brand-navy text-sm">Services Available:</h4>
                    <div className="flex flex-wrap gap-1">
                      {area.services.map((service, serviceIndex) => (
                        <span key={serviceIndex} className="px-2 py-1 bg-brand-grey text-brand-navy text-xs rounded-md border">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white" asChild>
                      <Link href="/contact">Get Quote for {area.name}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="bg-gradient-to-r from-brand-navy to-brand-navy/90 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Don't See Your Area Listed?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We may still be able to help! Contact us to discuss your roofing needs and we'll let you know if we can provide service in your area.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-8 py-4">
                <Phone className="w-5 h-5 mr-2" />
                Call 01782 123456
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-brand-navy font-semibold px-8 py-4" asChild>
                <Link href="/contact">Request Service Area Check</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
