import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function VideoTestimonials() {
  return (
    <section id="reviews" className="section-padding bg-white">
      <div className="container-custom">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-3 sm:mb-4 px-2">
            See Our Roofing in Action
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            From leaks to full roof replacements, see why locals trust Upgrade Roofs.
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-10 sm:mb-12 md:mb-16 px-2">
          <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
            <video
              className="w-full h-full object-cover"
              controls
              preload="metadata"
              poster="/images/7.jpeg"
            >
              <source src="/upgraderoofs.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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
