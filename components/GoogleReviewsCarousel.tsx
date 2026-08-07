'use client';

import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GhlReviewsWidget } from '@/components/GhlReviewsWidget';

export function GoogleReviewsCarousel() {
  return (
    <section className="section-padding bg-gradient-to-br from-orange-50 via-amber-50/30 to-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-medium">
            <Star className="w-4 h-4 fill-current" />
            <span>What Our Customers Say</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            Don't Just Take Our Word For It
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Here's what our satisfied customers across Cheshire have to say about our roofing services.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <GhlReviewsWidget />
        </div>

        <div className="text-center mt-8">
          <Button
            variant="outline"
            className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white"
            asChild
          >
            <a 
              href="https://www.google.com/search?q=upgrade+roofing+cheshire+reviews" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View All Google Reviews →
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
