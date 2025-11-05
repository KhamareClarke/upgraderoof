'use client';

import { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { VideoTestimonials } from '@/components/VideoTestimonials';
import { supabase, type Testimonial } from '@/lib/supabase';
import { ReviewCardSkeleton } from '@/components/LoadingSkeletons';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-2">4.9 out of 5 Stars</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">Based on 127+ customer reviews</p>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-10 sm:mb-12 md:mb-16">
              {[...Array(6)].map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 sm:py-10 md:py-12 px-4">
              <p className="text-sm sm:text-base md:text-lg text-gray-600">No reviews available yet.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-10 sm:mb-12 md:mb-16">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-brand-orange text-brand-orange" />
                  ))}
                </div>

                <Quote className="w-6 h-6 sm:w-8 sm:h-8 text-brand-orange/20 mb-2" />

                <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 sm:mb-4 break-words">{review.text}</p>

                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  <p className="font-semibold text-sm sm:text-base text-brand-navy">{review.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{review.location}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{new Date(review.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
          )}

          <VideoTestimonials />
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white">
        <div className="container-custom text-center px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Join Our Happy Customers</h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Experience the quality and service that earns us 5-star reviews
          </p>
          <a href="/#contact" className="inline-block w-full sm:w-auto max-w-xs sm:max-w-none mx-auto">
            <button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6 sm:px-8 md:px-10 h-12 sm:h-14 text-base sm:text-lg rounded-md transition-colors w-full sm:w-auto">
              Get Free Quote
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}
