'use client';

import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const reviews = [
  {
    id: 1,
    name: 'Sarah Johnson',
    location: 'Sandbach, Cheshire',
    rating: 5,
    date: '2 weeks ago',
    text: 'Outstanding service from start to finish. The team replaced our entire roof with beautiful slate tiles. Professional, punctual, and the quality is exceptional. Highly recommend!',
    avatar: 'SJ'
  },
  {
    id: 2,
    name: 'Michael Thompson',
    location: 'Crewe, Cheshire',
    rating: 5,
    date: '1 month ago',
    text: 'Emergency roof repair during the storms. They came out the same day and fixed the leak perfectly. Fair pricing and excellent workmanship. Will definitely use again.',
    avatar: 'MT'
  },
  {
    id: 3,
    name: 'Emma Davis',
    location: 'Middlewich, Cheshire',
    rating: 5,
    date: '3 weeks ago',
    text: 'Fantastic job on our flat roof extension. Clean, efficient work and the team cleaned up perfectly afterwards. The 10-year guarantee gives us complete peace of mind.',
    avatar: 'ED'
  },
  {
    id: 4,
    name: 'Robert Wilson',
    location: 'Congleton, Cheshire',
    rating: 5,
    date: '1 week ago',
    text: 'Professional chimney rebuild after storm damage. Excellent communication throughout and the finished work is superb. These guys really know their trade.',
    avatar: 'RW'
  },
  {
    id: 5,
    name: 'Lisa Parker',
    location: 'Alsager, Cheshire',
    rating: 5,
    date: '2 months ago',
    text: 'Complete gutter and fascia replacement. The team was courteous, efficient, and the results are perfect. Great value for money and outstanding customer service.',
    avatar: 'LP'
  }
];

export function GoogleReviewsCarousel() {
  const [currentReview, setCurrentReview] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextReview = () => {
    setIsAutoPlaying(false);
    setCurrentReview((prev) => (prev + 1) % reviews.length);
  };

  const prevReview = () => {
    setIsAutoPlaying(false);
    setCurrentReview((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goToReview = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentReview(index);
  };

  return (
    <section className="section-padding bg-gradient-to-br from-brand-grey to-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-medium">
            <Star className="w-4 h-4 fill-current" />
            <span>5.0 Google Rating</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our satisfied customers have to say about our roofing services.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="relative h-80 md:h-64">
              {reviews.map((review, index) => (
                <div
                  key={review.id}
                  className={`absolute inset-0 transition-all duration-500 ${
                    index === currentReview 
                      ? 'opacity-100 translate-x-0' 
                      : index < currentReview 
                        ? 'opacity-0 -translate-x-full' 
                        : 'opacity-0 translate-x-full'
                  }`}
                >
                  <div className="p-8 md:p-12 h-full flex flex-col justify-center">
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    
                    <Quote className="w-8 h-8 text-brand-orange/20 mb-4" />
                    
                    <p className="text-gray-700 text-lg leading-relaxed mb-6 flex-1">
                      "{review.text}"
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold">
                        {review.avatar}
                      </div>
                      <div>
                        <h4 className="font-semibold text-brand-navy">{review.name}</h4>
                        <p className="text-sm text-gray-500">{review.location} • {review.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={prevReview}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={nextReview}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-white hover:scale-110 transition-all duration-300 shadow-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="flex justify-center gap-2 mt-6">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => goToReview(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentReview 
                    ? 'bg-brand-orange scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
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
              View All Google Reviews
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
