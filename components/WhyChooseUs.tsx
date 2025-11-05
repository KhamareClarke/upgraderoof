import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { QuoteForm } from '@/components/QuoteForm';

export function WhyChooseUs() {
  const benefits = [
    'Realistic pricing with no hidden costs',
    'Highly professional and courteous team',
    'Over 25 years of industry experience',
    'All work fully guaranteed',
    'Direct contact with your dedicated roofer',
  ];

  return (
    <section id="about" className="section-padding bg-brand-grey">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
          <div className="relative h-[250px] sm:h-[300px] md:h-[400px] lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-gray-200">
            <img
              src="/images/2.jpeg"
              alt="Professional roofing team at work"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 to-transparent" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-4 sm:mb-6">
              Why Choose Upgrade Roofing Solutions?
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8">
              We pride ourselves on delivering exceptional roofing services across Cheshire and the North West.
              Our commitment to quality, transparency, and customer satisfaction sets us apart.
            </p>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-brand-orange rounded-full flex items-center justify-center mt-0.5 sm:mt-1">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" strokeWidth={3} />
                  </div>
                  <p className="text-sm sm:text-base md:text-lg text-gray-700">{benefit}</p>
                </div>
              ))}
            </div>

            <QuoteForm trigger={
              <Button
                size="lg"
                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6 sm:px-8 text-sm sm:text-base w-full sm:w-auto"
              >
                Book Your Free Quote
              </Button>
            } />
          </div>
        </div>
      </div>
    </section>
  );
}