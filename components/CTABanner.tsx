import { Button } from '@/components/ui/button';
import { Phone, Clock } from 'lucide-react';

export function CTABanner() {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
      <img
        src="/images/6.jpeg"
        alt="Roofing services background"
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-brand-navy/90" />

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6">
            Do You Have a Roof Leak or Need Urgent Repairs?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-7 md:mb-8">
            Call our experts today for fast, reliable service across Cheshire and the North West.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6 sm:px-7 md:px-8 text-base sm:text-lg h-12 sm:h-14 md:h-14 w-full sm:w-auto"
              asChild
            >
              <a href="tel:07379440583" className="text-white flex items-center justify-center">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Book Now
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white !text-white bg-transparent hover:bg-white hover:!text-brand-navy font-semibold px-6 sm:px-7 md:px-8 text-base sm:text-lg h-12 sm:h-14 md:h-14 w-full sm:w-auto"
              asChild
            >
              <a href="tel:07379440583" className="!text-white hover:!text-brand-navy flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Emergency Call 24/7
              </a>
            </Button>
          </div>

          <div className="mt-6 sm:mt-7 md:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center text-white">
            <a href="tel:01270897606" className="text-lg sm:text-xl md:text-2xl font-bold hover:text-brand-orange transition-colors break-all sm:break-normal">
              01270 897 606
            </a>
            <span className="hidden sm:inline text-white/50">|</span>
            <a href="tel:07379440583" className="text-lg sm:text-xl md:text-2xl font-bold hover:text-brand-orange transition-colors break-all sm:break-normal">
              07379 440 583
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}