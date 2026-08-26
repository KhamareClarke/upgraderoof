import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { TrackedPhoneLink } from '@/components/TrackedPhoneLink';

export function CTABanner() {
  return (
    <section className="relative py-12 sm:py-14 md:py-16 overflow-hidden bg-brand-navy">

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-5 md:mb-6">
            Got a Roof Leak or Need Urgent Repairs?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-8 sm:mb-9 md:mb-10">
            Our team is on call around the clock. Fast, reliable roofing help across Cheshire and the North West, whenever you need it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button
              size="lg"
              className="group bg-brand-orange hover:bg-brand-navy-light text-white font-semibold px-7 sm:px-8 h-12 sm:h-14 md:h-14 rounded-lg shadow-lg shadow-black/20 ring-1 ring-white/10 transition-colors duration-300 w-full sm:w-auto inline-flex items-center gap-2.5"
              asChild
            >
              <TrackedPhoneLink href="tel:01270897606" placement="cta_banner_book" className="text-white flex items-center justify-center gap-2.5">
                Call Now for a Free Quote
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
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
