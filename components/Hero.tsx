'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Shield, Award, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { QuoteForm } from '@/components/QuoteForm';
import Link from 'next/link';

const slides = [
  {
    image: '/images/6.jpeg',
    gradient: 'from-brand-navy/90 via-brand-navy/70 to-brand-orange/20',
    title: 'Premium Roofing',
    highlight: 'Excellence',
    subtitle: 'For Your Home',
    description: '25+ years of craftsmanship. Premium materials. Guaranteed results. Your roof deserves the best.',
  },
  {
    image: '/images/7.jpeg',
    gradient: 'from-blue-900/90 via-slate-800/70 to-orange-500/20',
    title: 'Expert Tile &',
    highlight: 'Slate Roofing',
    subtitle: 'Traditional Craftsmanship',
    description: 'Authentic materials. Timeless beauty. Weather-resistant durability that stands the test of time.',
  },
  {
    image: '/images/3.jpeg',
    gradient: 'from-slate-900/90 via-gray-800/70 to-cyan-500/20',
    title: 'Modern Flat',
    highlight: 'Roof Systems',
    subtitle: 'Innovation Meets Quality',
    description: 'Advanced waterproofing. Energy efficient solutions. Perfect for contemporary extensions and conversions.',
  },
  {
    image: '/images/1.jpeg',
    gradient: 'from-orange-900/90 via-red-900/70 to-yellow-500/20',
    title: 'Professional',
    highlight: 'Chimney Work',
    subtitle: 'Safety & Restoration',
    description: 'Expert repairs. Complete rebuilds. Maintaining the character and safety of your property.',
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  useEffect(() => {
    const nextSlideIndex = (currentSlide + 1) % slides.length;
    const img = new Image();
    img.src = slides[nextSlideIndex].image;
  }, [currentSlide]);

  const nextSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsAutoPlaying(false);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentSlide(index);
  };

  return (
    <section className="relative min-h-screen flex items-start sm:items-center justify-center overflow-hidden pt-8 sm:pt-0">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center scale-110 animate-slow-zoom"
            style={{
              backgroundImage: `url(${slide.image})`,
              animationDelay: `${index * 0.5}s`,
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} animate-gradient`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(244,91,46,0.08),transparent_55%)]" />
          </div>
        </div>
      ))}

      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />

      <div className="container-custom relative z-10 pt-4 pb-4 sm:pt-12 sm:pb-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 mb-0.5 sm:mb-2 md:mb-4 lg:mb-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium fade-in-up">
            <Award className="w-3 h-3 sm:w-4 sm:h-4 text-brand-orange" />
            <span className="whitespace-nowrap">Award-Winning Roofing Company 2024</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-1 sm:mb-3 md:mb-4 lg:mb-6 text-balance leading-[1.1] fade-in-up px-4 sm:px-0">
            {slides[currentSlide].title}{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-brand-orange to-orange-400 bg-clip-text text-transparent">
                {slides[currentSlide].highlight}
              </span>
              <span className="absolute bottom-2 left-0 w-full h-3 bg-brand-orange/30 blur-lg"></span>
            </span>
            <br />
            {slides[currentSlide].subtitle}
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 mb-2 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10 max-w-2xl mx-auto leading-relaxed slide-in-right px-4 sm:px-0">
            {slides[currentSlide].description}
          </p>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 mb-2 sm:mb-6 md:mb-8 lg:mb-12 scale-in justify-center max-w-md sm:max-w-none mx-auto sm:mx-0">
            <QuoteForm trigger={
              <Button
                size="lg"
                className="group relative bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6 sm:px-6 md:px-8 lg:px-10 text-base sm:text-base md:text-lg h-12 sm:h-12 md:h-14 lg:h-16 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-brand-orange/50 w-full sm:w-auto rounded-lg sm:rounded-md shadow-lg sm:shadow-xl active:scale-95"
              >
                <span className="relative z-10">Get Free Quote</span>
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-brand-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            } />
            <Button
              size="lg"
              variant="outline"
              className="group border-2 border-white/40 text-white hover:bg-white hover:text-brand-navy font-semibold px-6 sm:px-6 md:px-8 lg:px-10 text-base sm:text-base md:text-lg h-12 sm:h-12 md:h-14 lg:h-16 backdrop-blur-sm bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-xl w-full sm:w-auto rounded-lg sm:rounded-md shadow-lg sm:shadow-md active:scale-95"
              asChild
            >
              <Link href="/contact" className="flex items-center justify-center">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-pulse flex-shrink-0" />
                <span>Drone Inspection</span>
              </Link>
            </Button>
          </div>

          <div className="hidden sm:grid sm:grid-cols-3 gap-4 sm:gap-6 fade-in-up max-w-3xl mx-auto" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: Shield, label: 'Fully Insured', value: '£10M Cover' },
              { icon: Award, label: 'Accredited', value: '5 Star Rated' },
              { icon: Clock, label: 'Fast Response', value: '24/7 Emergency' },
            ].map((stat, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-brand-orange/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                {/* Tablet/Desktop: original badge label + value */}
                <div className="min-w-0 sm:text-left">
                  <p className="text-white/70 text-xs sm:text-sm">{stat.label}</p>
                  <p className="text-white font-semibold text-base sm:text-lg">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={prevSlide}
        className="hidden md:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-1 transition-transform" />
      </button>

      <button
        onClick={nextSlide}
        className="hidden md:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 group"
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