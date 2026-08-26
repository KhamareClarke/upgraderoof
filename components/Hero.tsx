'use client';

import { Button } from '@/components/ui/button';
import { Phone, ArrowRight } from 'lucide-react';
import { QuoteForm } from '@/components/QuoteForm';
import { TrackedPhoneLink } from '@/components/TrackedPhoneLink';

export function Hero() {
  return (
    <section className="relative min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden pt-16 pb-20 bg-brand-navy" style={{ contain: 'layout style paint' }}>
      <div className="container-custom relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6 fade-in-up">
            <span className="h-px w-8 sm:w-12 bg-brand-orange" aria-hidden="true" />
            <span className="text-brand-orange text-xs sm:text-sm font-semibold uppercase tracking-[0.2em]">Est. Sandbach, Cheshire</span>
            <span className="h-px w-8 sm:w-12 bg-brand-orange" aria-hidden="true" />
          </div>

          {/* STATIC H1 - CRITICAL FOR SEO */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-5 text-balance leading-[1.1] tracking-tight px-4 sm:px-0 drop-shadow-2xl">
            Get Your{' '}
            <span className="text-brand-orange">Free Roof Inspection</span>
            <br />
            in Cheshire
          </h1>

          {/* High-urgency subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl font-semibold text-brand-orange mb-10 px-4 sm:px-0 drop-shadow-lg tracking-wide leading-snug">
            We call you back within 10 minutes
            <br />
            <span className="text-white">guaranteed</span>
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto px-4 sm:px-0">
            <QuoteForm trigger={
              <Button
                size="lg"
                className="group relative bg-brand-orange hover:bg-brand-navy-light text-white font-semibold px-8 sm:px-9 md:px-10 text-sm sm:text-base tracking-wide h-12 sm:h-14 md:h-16 rounded-lg shadow-lg shadow-black/20 ring-1 ring-white/10 transition-colors duration-300 w-full sm:w-auto inline-flex items-center gap-2.5"
              >
                Get Your Free Quote
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            } />
            <TrackedPhoneLink
              href="tel:01270897606"
              placement="homepage_hero"
              className="group inline-flex items-center justify-center gap-2.5 h-12 sm:h-14 md:h-16 px-6 text-white font-semibold text-sm sm:text-base tracking-wide transition-colors duration-300"
            >
              <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/30 text-white group-hover:border-brand-orange group-hover:text-brand-orange transition-colors duration-300">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <span className="text-left leading-tight">
                <span className="block text-xs text-white/60 group-hover:text-white/80 transition-colors">Call us direct</span>
                <span className="block">01270 897 606</span>
              </span>
            </TrackedPhoneLink>
          </div>
        </div>
      </div>
    </section>
  );
}
