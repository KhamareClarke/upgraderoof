'use client';

import { Button } from '@/components/ui/button';
import { Chrome as Home, Layers, Flame, Droplets, Sun, Square, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function Services() {
  const services = [
    {
      title: 'Tile & Slate Roofs',
      description: 'Expert installation and repair of traditional tile and slate roofing. Weather resistant, durable, and aesthetically pleasing for your home.',
      icon: Home,
      image: '/images/6.jpeg',
      gradient: 'from-blue-500/20 to-purple-500/20',
      href: '/services/tile-slate-roofing',
    },
    {
      title: 'Flat Roofs',
      description: 'Modern flat roofing solutions with superior waterproofing. Perfect for extensions, garages, and commercial properties.',
      icon: Layers,
      image: '/images/3.jpeg',
      gradient: 'from-cyan-500/20 to-blue-500/20',
      href: '/services/flat-roofing',
    },
    {
      title: 'Chimney Repairs',
      description: 'Professional chimney maintenance and repair services. From repointing to full rebuilds, we keep your chimney safe and functional.',
      icon: Flame,
      image: '/images/1.jpeg',
      gradient: 'from-orange-500/20 to-red-500/20',
      href: '/services/chimney-repairs',
    },
    {
      title: 'Gutters & Fascias',
      description: 'Complete gutter and fascia installation, repair, and maintenance. Protect your property from water damage with quality materials.',
      icon: Droplets,
      image: '/images/2.jpeg',
      gradient: 'from-teal-500/20 to-cyan-500/20',
      href: '/services/gutters-fascias',
    },
    {
      title: 'Skylights & Roof Windows',
      description: 'Bring natural light into your home with professionally installed skylights and roof windows. Expert fitting and weatherproofing guaranteed.',
      icon: Sun,
      image: '/images/10.jpeg',
      gradient: 'from-yellow-500/20 to-orange-500/20',
      href: '/services/skylights-roof-windows',
    },
    {
      title: 'Cladding Installations',
      description: 'Transform your property with modern cladding solutions. Weather-resistant materials installed to the highest standards.',
      icon: Square,
      image: '/images/4.jpeg',
      gradient: 'from-slate-500/20 to-gray-500/20',
      href: '/services/cladding',
    },
  ];

  return (
    <section id="services" className="section-padding bg-gradient-to-b from-white via-brand-grey to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(244,91,46,0.05),transparent_50%)]" />

      <div className="container-custom relative">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs sm:text-sm font-medium">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Premium Services</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy mb-4 sm:mb-6 px-2">
            Our Roofing <span className="text-brand-orange">Services</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            From minor repairs to complete roof replacements, we provide comprehensive roofing solutions
            tailored to your needs with cutting-edge techniques and premium materials.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl bg-white border border-gray-200 hover:border-brand-orange/50 transition-all duration-500 hover:shadow-2xl hover:shadow-brand-orange/10 hover:-translate-y-2"
              >
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${service.image})` }}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-60`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/50 to-transparent" />

                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-14 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1">{service.title}</h3>
                  </div>
                </div>

                <div className="p-4 sm:p-5 md:p-6">
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6 line-clamp-3">
                    {service.description}
                  </p>

                  <Link href={service.href}>
                    <Button
                      variant="ghost"
                      className="group/btn w-full justify-between text-brand-navy hover:text-brand-orange hover:bg-brand-orange/5 font-semibold transition-all duration-300"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>

                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-orange to-orange-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </div>
            );
          })}
        </div>

        <div className="mt-10 sm:mt-12 md:mt-16 text-center px-2">
          <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-navy to-brand-navy/90 text-white w-full sm:w-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg sm:rounded-xl bg-brand-orange/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-brand-orange" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <p className="text-white/80 text-xs sm:text-sm mb-0.5 sm:mb-1">Need a custom solution?</p>
              <p className="text-base sm:text-lg md:text-xl font-bold">We've got you covered!</p>
            </div>
            <Button
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold w-full sm:w-auto sm:ml-4 text-sm sm:text-base"
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