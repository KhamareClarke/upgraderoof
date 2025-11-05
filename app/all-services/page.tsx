import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Home, 
  Wrench, 
  Shield, 
  Zap, 
  Droplets, 
  Sun, 
  Building,
  Phone,
  ArrowRight,
  MapPin,
  Star
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'All Roofing Services | Cheshire & Staffordshire | Upgrade Roofing',
  description: 'Complete roofing services across Cheshire & Staffordshire. Roof repairs, installations, flat roofing, guttering, skylights & more. Free quotes available.',
  keywords: [
    'roofing services Cheshire',
    'roofing services Staffordshire', 
    'roof repairs Stoke-on-Trent',
    'flat roofing contractors',
    'tile roof specialists',
    'guttering services',
    'skylight installation',
    'cladding contractors',
    'chimney repairs'
  ],
};

const services = [
  {
    id: 'roof-repairs',
    title: 'Roof Repairs',
    icon: Wrench,
    description: 'Emergency and planned roof repairs for all roof types',
    features: [
      'Emergency leak repairs',
      'Storm damage restoration', 
      'Tile & slate replacement',
      'Flashing repairs',
      'Insurance work'
    ],
    locations: [
      'Roof repairs Stoke-on-Trent',
      'Roof repairs Cheshire', 
      'Roof repairs Staffordshire',
      'Emergency roof repairs near me'
    ],
    link: '/services/roof-repairs',
    color: 'bg-red-500',
    urgent: true
  },
  {
    id: 'tile-slate-roofing',
    title: 'Tile & Slate Roofing',
    icon: Home,
    description: 'Traditional and modern tile & slate roofing solutions',
    features: [
      'Clay tile installation',
      'Natural slate roofing',
      'Concrete tile systems',
      'Heritage roof restoration',
      '50+ year lifespan'
    ],
    locations: [
      'Tile roofs Stoke-on-Trent',
      'Slate roofing Cheshire',
      'Tile roofing Staffordshire', 
      'Traditional roofing contractors'
    ],
    link: '/services/tile-slate-roofing',
    color: 'bg-blue-500'
  },
  {
    id: 'flat-roofing',
    title: 'Flat Roofing',
    icon: Shield,
    description: 'Modern flat roofing systems with superior waterproofing',
    features: [
      'EPDM rubber roofing',
      'GRP fibreglass systems',
      'Felt roofing',
      'Green roof systems',
      '20-30 year guarantees'
    ],
    locations: [
      'Flat roofing Stoke-on-Trent',
      'Flat roofing Cheshire',
      'EPDM roofing Staffordshire',
      'Flat roof specialists near me'
    ],
    link: '/services/flat-roofing',
    color: 'bg-green-500'
  },
  {
    id: 'guttering-fascias',
    title: 'Guttering & Fascias',
    icon: Droplets,
    description: 'Complete guttering systems and fascia board services',
    features: [
      'UPVC guttering',
      'Cast iron gutters',
      'Fascia board replacement',
      'Soffit installation',
      'Gutter cleaning'
    ],
    locations: [
      'Guttering Stoke-on-Trent',
      'Guttering Cheshire',
      'Fascia repairs Staffordshire',
      'Gutter installation near me'
    ],
    link: '/services/gutters-fascias',
    color: 'bg-cyan-500'
  },
  {
    id: 'skylights-roof-windows',
    title: 'Skylights & Roof Windows',
    icon: Sun,
    description: 'Natural light solutions with professional installation',
    features: [
      'Velux roof windows',
      'Skylight installation',
      'Roof light repairs',
      'Electric opening systems',
      'Blinds & accessories'
    ],
    locations: [
      'Skylight installation Stoke-on-Trent',
      'Roof windows Cheshire',
      'Velux windows Staffordshire',
      'Skylight repairs near me'
    ],
    link: '/services/skylights-roof-windows',
    color: 'bg-yellow-500'
  },
  {
    id: 'chimney-repairs',
    title: 'Chimney Repairs',
    icon: Zap,
    description: 'Professional chimney maintenance and restoration',
    features: [
      'Chimney rebuilding',
      'Pointing & repointing',
      'Chimney stack repairs',
      'Lead work',
      'Chimney pot replacement'
    ],
    locations: [
      'Chimney repairs Stoke-on-Trent',
      'Chimney repairs Cheshire',
      'Chimney specialists Staffordshire',
      'Chimney restoration near me'
    ],
    link: '/services/chimney-repairs',
    color: 'bg-orange-500'
  },
  {
    id: 'cladding',
    title: 'Cladding Installation',
    icon: Building,
    description: 'Modern and traditional cladding solutions',
    features: [
      'Wall cladding systems',
      'Roof cladding',
      'Timber cladding',
      'Metal cladding',
      'Cladding repairs'
    ],
    locations: [
      'Cladding Stoke-on-Trent',
      'Cladding Cheshire',
      'Wall cladding Staffordshire',
      'Cladding contractors near me'
    ],
    link: '/services/cladding',
    color: 'bg-purple-500'
  }
];

const serviceAreas = [
  'Stoke-on-Trent', 'Newcastle-under-Lyme', 'Stafford', 'Stone', 'Leek', 
  'Cheadle', 'Biddulph', 'Kidsgrove', 'Alsager', 'Congleton', 'Crewe',
  'Macclesfield', 'Sandbach', 'Middlewich', 'Nantwich'
];

export default function AllServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-grey to-white">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-brand-navy via-brand-navy/95 to-brand-orange/20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium">
              <Star className="w-4 h-4 text-brand-orange" />
              <span>Complete Roofing Solutions</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              All Roofing Services for 
              <span className="text-brand-orange"> Cheshire & Staffordshire</span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Professional roofing services across Stoke-on-Trent, Cheshire, and Staffordshire. 
              25+ years experience, fully insured, free quotes available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-8 py-4" asChild>
                <a href="tel:01782123456">
                  <Phone className="w-5 h-5 mr-2" />
                  Call 01782 123456
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-brand-navy font-semibold px-8 py-4" asChild>
                <Link href="/special-offer">Get Free Quote</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
              Our Complete Range of Roofing Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From emergency repairs to complete installations, we provide comprehensive roofing solutions 
              for residential and commercial properties.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={service.id} className={`hover-lift transition-all duration-300 ${service.urgent ? 'ring-2 ring-red-500' : ''}`}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center`}>
                      <service.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-brand-navy">{service.title}</CardTitle>
                      {service.urgent && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                          24/7 Emergency
                        </span>
                      )}
                    </div>
                  </div>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-brand-navy text-sm mb-2">Services Include:</h4>
                      <ul className="text-sm space-y-1">
                        {service.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-brand-orange rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-brand-navy text-sm mb-2">Local Keywords:</h4>
                      <div className="flex flex-wrap gap-1">
                        {service.locations.slice(0, 2).map((location, idx) => (
                          <span key={idx} className="px-2 py-1 bg-brand-grey text-brand-navy text-xs rounded-md border">
                            {location}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex gap-2">
                        <Button className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" asChild>
                          <Link href={service.link}>
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white" asChild>
                          <a href="tel:01782123456">Call</a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Access Links */}
      <section className="section-padding bg-brand-navy text-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Quick Access Links
            </h2>
            <p className="text-xl text-white/90">
              Direct links to all our service pages for easy navigation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((service) => (
              <Button
                key={service.id}
                variant="outline"
                className="border-white/30 text-white hover:bg-white hover:text-brand-navy font-semibold p-4 h-auto justify-start"
                asChild
              >
                <Link href={service.link} className="flex items-center gap-3">
                  <service.icon className="w-5 h-5" />
                  <span>{service.title}</span>
                </Link>
              </Button>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-8 py-4" asChild>
              <Link href="/special-offer">
                Get FREE Roof Inspection
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
              Areas We Serve
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional roofing services across Cheshire, Staffordshire, and surrounding areas
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-brand-navy mb-6">
                <MapPin className="w-6 h-6 text-brand-orange inline mr-2" />
                Cheshire & Staffordshire Coverage
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {serviceAreas.map((area, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-brand-grey rounded-lg">
                    <div className="w-2 h-2 bg-brand-orange rounded-full"></div>
                    <span className="text-sm font-medium text-brand-navy">{area}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" asChild>
                  <Link href="/service-areas">
                    View All Service Areas
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="aspect-video rounded-2xl overflow-hidden shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d153665.78389!2d-2.3813!3d53.0273!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487a4c5b7c4b0b0b%3A0x0!2sStoke-on-Trent%2C%20UK!5e0!3m2!1sen!2suk!4v1699000000000!5m2!1sen!2suk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Upgrade Roofing Service Coverage - Cheshire & Staffordshire"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="section-padding bg-gradient-to-r from-brand-orange to-brand-orange/90 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need Any of These Services?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get in touch today for a free quote. All work comes with our comprehensive guarantee.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-brand-orange hover:bg-gray-100 font-bold px-8 py-4" asChild>
              <a href="tel:01782123456">
                <Phone className="w-5 h-5 mr-2" />
                Call 01782 123456
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-brand-orange font-bold px-8 py-4" asChild>
              <Link href="/contact">Get Free Quote</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
