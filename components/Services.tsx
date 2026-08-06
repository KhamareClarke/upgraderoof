import { Button } from '@/components/ui/button';
import { Chrome as Home, Layers, Flame, Droplets, Sun, Square, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Services() {
  const services = [
    {
      title: 'Tile & Slate Roofs',
      description: 'Expert installation and repair of traditional tile and slate roofing. Weather-resistant, durable, and designed to enhance the look of your home for decades to come.',
      icon: Home,
      image: '/images/6.jpeg',
      alt: 'Professional tile and slate roof installation in Cheshire',
      gradient: 'from-blue-500/20 to-purple-500/20',
      href: '/services/tile-slate-roofing',
    },
    {
      title: 'Flat Roofs',
      description: 'Modern flat roofing solutions with superior waterproofing. The ideal choice for extensions, garages, and commercial properties.',
      icon: Layers,
      image: '/images/3.jpeg',
      alt: 'EPDM and GRP flat roof installation Cheshire',
      gradient: 'from-cyan-500/20 to-blue-500/20',
      href: '/services/flat-roofing',
    },
    {
      title: 'Chimney Repairs',
      description: 'Professional chimney maintenance and repair, from repointing to full rebuilds. We keep your chimney safe, functional, and watertight.',
      icon: Flame,
      image: '/images/1.jpeg',
      alt: 'Chimney repair and repointing service Cheshire',
      gradient: 'from-orange-500/20 to-red-500/20',
      href: '/services/chimney-repairs',
    },
    {
      title: 'Gutters & Fascias',
      description: 'Complete gutter and fascia installation, repair, and maintenance. Quality materials fitted properly to protect your property from water damage.',
      icon: Droplets,
      image: '/images/2.jpeg',
      alt: 'Gutter and fascia installation Cheshire',
      gradient: 'from-teal-500/20 to-cyan-500/20',
      href: '/services/gutters-fascias',
    },
    {
      title: 'Skylights & Roof Windows',
      description: 'Bring natural light into your home with professionally installed skylights and roof windows. Expert fitting and weatherproofing guaranteed.',
      icon: Sun,
      image: '/images/10.jpeg',
      alt: 'Velux skylight and roof window installation Cheshire',
      gradient: 'from-yellow-500/20 to-orange-500/20',
      href: '/services/skylights-roof-windows',
    },
    {
      title: 'Cladding Installations',
      description: "Transform your property's exterior with modern, weather-resistant cladding installed to the highest standards.",
      icon: Square,
      image: '/images/4.jpeg',
      alt: 'External wall cladding installation Cheshire',
      gradient: 'from-slate-500/20 to-gray-500/20',
      href: '/services/cladding',
    },
  ];

  return (
    <section id="services" className="section-padding bg-white relative overflow-hidden">
      <div className="container-custom relative">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-brand-orange/10 rounded-full mb-4">
            <span className="text-brand-orange font-semibold text-sm">Our Roofing Services</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-brand-navy mb-6">
            Every Roofing Need. <span className="text-brand-orange">One Trusted Team.</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From minor repairs to complete roof replacements, we deliver comprehensive roofing solutions
            tailored to your property — using premium materials and cutting-edge techniques.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-200 hover:border-brand-orange/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                    quality={60}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/50 to-transparent" />

                  <div className="absolute top-4 right-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-orange/10 backdrop-blur-sm flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">{service.title}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <Link href={service.href}>
                    <Button
                      variant="ghost"
                      className="group/btn w-full justify-between text-brand-navy hover:text-brand-orange hover:bg-transparent font-semibold transition-all"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-6 sm:p-8 rounded-2xl bg-brand-navy text-white w-full sm:w-auto shadow-lg">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-brand-orange/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-brand-orange" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <p className="text-white text-sm tracking-wide mb-1 font-medium">Need a custom solution?</p>
              <p className="text-lg sm:text-xl font-bold">We've got you covered!</p>
            </div>
            <Button
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold w-full sm:w-auto transition-all"
              asChild
            >
              <Link href="/contact" className="flex items-center justify-center">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
