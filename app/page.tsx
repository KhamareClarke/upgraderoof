import { Hero } from '@/components/Hero';
import { TrustStrip } from '@/components/TrustStrip';
import { TrustBadges } from '@/components/TrustBadges';
import { Services } from '@/components/Services';
import { WhyChooseUs } from '@/components/WhyChooseUs';
import { GoogleReviewsCarousel } from '@/components/GoogleReviewsCarousel';
import { VideoTestimonials } from '@/components/VideoTestimonials';
import { Gallery } from '@/components/Gallery';
import { FAQ } from '@/components/FAQ';
import { CTABanner } from '@/components/CTABanner';
import { EnhancedContactSection } from '@/components/EnhancedContactSection';

export default function Home() {
  return (
    <>
      <section id="hero">
        <Hero />
      </section>
      <TrustStrip />
      <TrustBadges />
      <section id="services">
        <Services />
      </section>
      <section id="about">
        <WhyChooseUs />
      </section>
      <GoogleReviewsCarousel />
      <VideoTestimonials />
      <section id="gallery">
        <Gallery />
      </section>
      <FAQ />
      <CTABanner />
      <section id="contact">
        <EnhancedContactSection />
      </section>
    </>
  );
}
