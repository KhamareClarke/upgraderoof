import { Button } from '@/components/ui/button';
import { Phone, Clock } from 'lucide-react';
import { TrackedPhoneLink } from '@/components/TrackedPhoneLink';

export function CTABanner() {
  return (
    <section className="relative py-6 sm:py-8 md:py-10 overflow-hidden" style={{ backgroundColor: '#0a1628' }}>

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6">
            Got a Roof Leak or Need Urgent Repairs?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-7 md:mb-8">
            Our team is on call around the clock. Fast, reliable roofing help across Cheshire and the North West — whenever you need it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6 sm:px-7 md:px-8 text-base sm:text-lg h-12 sm:h-14 md:h-14 w-full sm:w-auto"
              asChild
            >
              <TrackedPhoneLink href="tel:01270897606" placement="cta_banner_book" className="text-white flex items-center justify-center">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Book Now
              </TrackedPhoneLink>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white !text-white bg-transparent hover:bg-white hover:!text-brand-navy font-semibold px-6 sm:px-7 md:px-8 text-base sm:text-lg h-12 sm:h-14 md:h-14 w-full sm:w-auto"
              asChild
            >
              <TrackedPhoneLink href="tel:01270897606" placement="cta_banner_emergency" className="!text-white hover:!text-brand-navy flex items-center justify-center">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Emergency Call 24/7
              </TrackedPhoneLink>
            </Button>
          </div>

          <div className="mt-6 sm:mt-7 md:mt-8 flex justify-center items-center text-white">
            <TrackedPhoneLink href="tel:01270897606" placement="cta_banner_landline" className="text-lg sm:text-xl md:text-2xl font-bold hover:text-brand-orange transition-colors">
              01270 897 606
            </TrackedPhoneLink>
          </div>
        </div>
      </div>
    </section>
  );
}
