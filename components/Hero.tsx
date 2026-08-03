'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Shield, Award, Clock, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { QuoteForm } from '@/components/QuoteForm';
import { TrackedPhoneLink } from '@/components/TrackedPhoneLink';
import Link from 'next/link';
import Image from 'next/image';

const slides = [
  {
    image: '/images/6.jpeg',
    alt: 'Professional tile roof installation by Upgrade Roofs in Sandbach Cheshire',
    highlight: '25+ Years Local Experience',
    description: 'Based in Sandbach, serving Cheshire. CORC certified. £10M insured. Free quotes across CW11 and surrounding areas.',
  },
  {
    image: '/images/7.jpeg',
    alt: 'Welsh slate roof repair completed by expert roofers in Alsager Cheshire',
    highlight: 'Premium Tile & Slate Roofing',
    description: 'Authentic materials & traditional craftsmanship for weather-resistant roofing.',
  },
  {
    image: '/images/3.jpeg',
    alt: 'GRP fibreglass flat roof installation in Middlewich by Upgrade Roofs',
    highlight: 'Modern Flat Roofing Systems',
    description: 'EPDM rubber & GRP fibreglass with waterproof guarantees up to 20 years.',
  },
  {
    image: '/images/1.jpeg',
    alt: 'Emergency roof repair service in Cheshire by Upgrade Roofs',
    highlight: '24/7 Emergency Roof Repairs',
    description: 'Storm damage? Leaking roof? Our emergency team offers a fast response across Cheshire.',
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section className="relative min-h-[55vh] sm:min-h-[70vh] lg:min-h-[85vh] flex items-start sm:items-center justify-center overflow-hidden pt-12 sm:pt-0" style={{ contain: 'layout style paint' }}>
      {/* Render only current slide + next slide for transition */}
      {slides.map((slide, index) => {
        const isVisible = index === currentSlide;
        const isNext = index === (currentSlide + 1) % slides.length;
        
        if (!isVisible && !isNext) return null;
        
        return (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isVisible ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
            }`}
          >
            <div className="absolute inset-0">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                quality={index === 0 ? 30 : 25}
                sizes="100vw"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMiMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEQA/ANF6d1qC+1O5tIbWRFhRCXZgd25mHAx8wKKUqxNxJYBuf//Z"
                fetchPriority={index === 0 ? 'high' : 'auto'}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/75" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/70" />
            </div>
          </div>
        );
      })}


      <div className="container-custom relative z-10 pt-2 pb-8 sm:pt-4 sm:pb-16 md:pt-6 md:pb-20 lg:pt-8 lg:pb-24">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6 md:mb-8 rounded-full bg-white/15 sm:backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-medium tracking-wide fade-in-up">
            <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-orange" />
            <span className="whitespace-nowrap">Award-Winning Roofing Company 2024</span>
          </div>

          {/* STATIC H1 - CRITICAL FOR SEO */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 sm:mb-5 md:mb-6 text-balance leading-[1.1] tracking-tight px-4 sm:px-0 drop-shadow-2xl">
            Get Your{' '}
            <span className="text-brand-orange">Free Roof Inspection</span>
            <br />
            in Cheshire
          </h1>

          {/* High-urgency subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-brand-orange mb-6 sm:mb-8 md:mb-10 px-4 sm:px-0 drop-shadow-lg tracking-wide">
            We call you back within 10 minutes — guaranteed
          </p>

          {/* Dynamic Subheading Rotator */}
          <div className="relative h-24 sm:h-20 text-lg sm:text-xl text-white/90 mb-6 sm:mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed tracking-wide px-4 sm:px-0 drop-shadow-lg">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute w-full left-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <p className="font-semibold text-white">{slide.highlight}</p>
                <p className="text-sm sm:text-base text-white/80">{slide.description}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 mb-8 sm:mb-10 md:mb-12 justify-center max-w-md sm:max-w-none mx-auto sm:mx-0">
            <QuoteForm trigger={
              <Button
                size="lg"
                className="group relative bg-brand-orange hover:bg-brand-orange/95 text-white font-semibold px-8 sm:px-10 md:px-12 text-sm sm:text-base tracking-wide h-12 sm:h-14 md:h-16 overflow-hidden transition-all duration-500 hover:scale-[1.02] w-full sm:w-auto rounded-lg shadow-lg active:scale-95"
              >
                <span className="relative z-10">Get Your Free Quote</span>
              </Button>
            } />
            <Button
              size="lg"
              variant="outline"
              className="group border border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-semibold px-8 sm:px-10 md:px-12 text-sm sm:text-base tracking-wide h-12 sm:h-14 md:h-16 bg-white/10 transition-all duration-500 hover:scale-[1.02] w-full sm:w-auto rounded-lg active:scale-95"
              asChild
            >
              <Link href="/contact" className="flex items-center justify-center">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span>Book a Drone Inspection</span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="group border border-white/20 text-white hover:bg-white/10 hover:border-white/30 font-semibold px-8 sm:px-10 md:px-12 text-sm sm:text-base tracking-wide h-12 sm:h-14 md:h-16 bg-white/10 transition-all duration-500 hover:scale-[1.02] w-full sm:w-auto rounded-lg active:scale-95"
              asChild
            >
              <TrackedPhoneLink href="tel:01270897606" placement="homepage_hero" className="flex items-center justify-center">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                <span>Call 01270 897 606</span>
              </TrackedPhoneLink>
            </Button>
          </div>

          {/* Above-the-fold trust bar */}
          <div className="mb-8 sm:mb-10 md:mb-12 px-4 sm:px-0">
            <p className="inline-block text-white text-xs sm:text-sm font-semibold tracking-wide bg-white/10 border border-white/20 rounded-full px-4 sm:px-6 py-2 sm:py-2.5 backdrop-blur-sm">
              CORC Certified <span className="text-brand-orange mx-1">·</span> £10M Insured <span className="text-brand-orange mx-1">·</span> 10-Year Guarantee <span className="text-brand-orange mx-1">·</span> 5-Star Rated
            </p>
          </div>

          <div className="hidden sm:grid sm:grid-cols-3 gap-6 lg:gap-8 fade-in-up max-w-4xl mx-auto" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: Shield, label: 'Fully Insured', value: '£10M Cover' },
              { icon: Award, label: '5 Star Rated', value: 'Accredited' },
              { icon: Clock, label: '24/7 Emergency', value: 'Fast Response' },
            ].map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-3 p-4 sm:p-5 rounded-xl bg-white/10 border border-white/10 hover:bg-white/15 transition-all duration-500 group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-brand-orange/25 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 flex-shrink-0">
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 sm:text-left">
                  <p className="text-white text-xs sm:text-sm tracking-wide font-medium">{stat.label}</p>
                  <p className="text-white font-semibold text-sm sm:text-base mt-0.5">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 border border-white/20 items-center justify-center text-white hover:bg-white/25 transition-all duration-300 hover:scale-110 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/15 border border-white/20 items-center justify-center text-white hover:bg-white/25 transition-all duration-300 hover:scale-110 group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Progress indicators hidden on all breakpoints as requested */}
      <div className="hidden" />

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
    </section>
  );
}
