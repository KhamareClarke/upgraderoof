'use client';

import { Star } from 'lucide-react';
import Link from 'next/link';
import { GhlReviewsWidget } from '@/components/GhlReviewsWidget';

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[300px] sm:h-[350px] md:h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-navy/70" />
        </div>

        <div className="container-custom relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
            <span>5 Star Rated</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-2">Customer Reviews</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-2">
            See what our customers say about our roofing services
          </p>
        </div>
      </section>

      <section className="section-padding bg-brand-grey">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2">
            <div className="flex items-center justify-center gap-1 sm:gap-2 mb-3 sm:mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 fill-brand-orange text-brand-orange" />
              ))}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-2">Rated 5 Stars by Our Customers</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">Live reviews pulled straight from Google</p>
          </div>

          <GhlReviewsWidget />
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white">
        <div className="container-custom text-center px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Join Our Happy Customers</h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Experience the quality and service that earns us 5-star reviews
          </p>
          <a href="/#contact" className="inline-block w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
            <button className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-6 sm:px-8 md:px-10 h-12 sm:h-14 text-base sm:text-lg rounded-md transition-colors w-full sm:w-auto">
              Get Free Quote
            </button>
          </a>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <Link href="/roofers-sandbach" className="text-white/70 hover:text-white transition-colors">Roofers Sandbach</Link>
            <span className="text-white/30">·</span>
            <Link href="/roof-repairs" className="text-white/70 hover:text-white transition-colors">Roof Repairs</Link>
            <span className="text-white/30">·</span>
            <Link href="/new-roofs" className="text-white/70 hover:text-white transition-colors">New Roofs</Link>
            <span className="text-white/30">·</span>
            <Link href="/emergency-roofing" className="text-white/70 hover:text-white transition-colors">Emergency Roofing</Link>
            <span className="text-white/30">·</span>
            <Link href="/services" className="text-white/70 hover:text-white transition-colors">All Services</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
