import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { QuoteForm } from '@/components/QuoteForm';
import Image from 'next/image';

export function WhyChooseUs() {
  const benefits = [
    'Realistic pricing with no hidden costs',
    'Highly professional and courteous team',
    'Over 25 years of industry experience',
    'All work fully guaranteed',
    'Direct contact with your dedicated roofer',
  ];

  return (
    <section id="about" className="section-padding bg-gradient-to-b from-gray-50 to-gray-100/50">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
          <div className="relative h-[320px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-lg bg-gray-200">
            <Image
              src="/images/2.jpeg"
              alt="Upgrade Roofs professional roofers installing gutters and fascias in Cheshire"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              loading="lazy"
              quality={60}
              className="object-cover scale-125"
              style={{ objectPosition: 'center center' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-medium">
              <span>Why Cheshire Homeowners Choose Us</span>
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-brand-navy mb-5 sm:mb-6 tracking-tight leading-tight">
              Quality You Can See. A Team You Can Trust.
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-600/80 mb-6 sm:mb-8 leading-relaxed">
              We're committed to quality, transparency, and customer satisfaction on every job we take on — across Cheshire and the North West.
            </p>

            <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 sm:space-x-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-brand-orange rounded-full flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" strokeWidth={2.5} />
                  </div>
                  <p className="text-xl sm:text-2xl text-gray-700/90">{benefit}</p>
                </div>
              ))}
            </div>

            <QuoteForm trigger={
              <Button
                size="lg"
                className="bg-brand-orange hover:bg-brand-orange/95 text-white font-semibold px-8 sm:px-10 text-sm sm:text-base tracking-wide w-full sm:w-auto transition-all duration-500"
              >
                Book Your Free Quote
              </Button>
            } />
            
            <div className="mt-6 flex items-center gap-2 text-gray-600">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-semibold">5.0 Stars</span>
              <span>·</span>
              <span>50+ Google Reviews</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
