'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import Link from 'next/link';

export function VideoTestimonials() {
  const testimonials = [
    {
      name: 'Sarah Thompson',
      location: 'Sandbach, Cheshire',
      rating: 5,
      text: 'Absolutely brilliant service from start to finish. The team was professional, tidy, and completed our roof replacement ahead of schedule. Highly recommended!',
    },
    {
      name: 'Michael Davies',
      location: 'Crewe, Cheshire',
      rating: 5,
      text: 'Had our flat roof repaired and the quality of work is outstanding. Fair pricing and excellent communication throughout the project.',
    },
    {
      name: 'Jennifer Walsh',
      location: 'Congleton, Cheshire',
      rating: 5,
      text: 'Called them out for an emergency leak repair. They arrived quickly and fixed the problem efficiently. Very honest and reliable company.',
    },
  ];

  return (
    <section id="reviews" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-3 sm:mb-4 px-2">
            See Our Roofing in Action
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            From leaks to full roof replacements, see why locals trust Upgrade Roofing Solutions.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-10 sm:mb-12 md:mb-16 px-2">
          <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-gray-900 cursor-pointer group">
            <img
              src="/images/7.jpeg"
              alt="Watch our roofing video"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <a
                href="https://www.youtube.com/watch?time_continue=12&v=UGOVxAZTwxA&embeds_referring_euri=https%3A%2F%2Fwww.upgraderoofs.co.uk%2F&source_ve_path=MjM4NTE"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-brand-orange rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-orange/90 transition-colors shadow-2xl"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="w-0 h-0 border-t-[8px] sm:border-t-[10px] md:border-t-[12px] border-t-transparent border-l-[14px] sm:border-l-[16px] md:border-l-[20px] border-l-white border-b-[8px] sm:border-b-[10px] md:border-b-[12px] border-b-transparent ml-0.5 sm:ml-1" />
              </a>
            </div>
            <a
              href="https://www.youtube.com/watch?time_continue=12&v=UGOVxAZTwxA&embeds_referring_euri=https%3A%2F%2Fwww.upgraderoofs.co.uk%2F&source_ve_path=MjM4NTE"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute inset-0"
              aria-label="Watch our roofing video on YouTube"
            />
          </div>
        </div>

        <div className="mb-8 sm:mb-10 md:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <div className="flex space-x-0.5 sm:space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-brand-navy">5.0 Stars on Google</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative hover:shadow-lg transition-shadow">
                <CardContent className="pt-4 sm:pt-5 md:pt-6 p-4 sm:p-5 md:p-6">
                  <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-brand-orange/20 mb-3 sm:mb-4" />
                  <div className="flex mb-2 sm:mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">{testimonial.text}</p>
                  <div>
                    <p className="font-semibold text-sm sm:text-base text-brand-navy">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white"
            asChild
          >
            <Link href="/reviews">
              Read More Reviews
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}