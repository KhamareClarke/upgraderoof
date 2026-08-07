import type { Metadata } from 'next';
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema';
import { Shield, Award, Users, Clock, CheckCircle, Target, Heart, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { QuoteForm } from '@/components/QuoteForm';

export const metadata: Metadata = {
  title: 'About Us | Upgrade Roofs | 25+ Years Experience',
  description: 'Upgrade Roofs: Award-winning roofing company with 25+ years experience in Cheshire. CORC certified, £10M insured, 5 star rated. Meet our expert team. Call 01270 897606.',
  keywords: 'about Upgrade Roofs, Cheshire roofing company, roofing contractors Cheshire, experienced roofers, accredited roofing, CORC certified roofers',
  openGraph: {
    title: 'About Upgrade Roofs | 25+ Years Experience',
    description: 'Award-winning roofing company. 25+ years experience, CORC certified, £10M insured.',
    url: 'https://www.upgraderoofs.co.uk/about',
    siteName: 'Upgrade Roofs',
    images: [
      {
        url: 'https://www.upgraderoofs.co.uk/images/1.jpeg',
        width: 1200,
        height: 630,
        alt: 'About Upgrade Roofs — Professional Roofers in Cheshire',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Upgrade Roofs',
    description: '25+ years of roofing excellence. Meet our expert team.',
    images: ['https://www.upgraderoofs.co.uk/images/1.jpeg'],
  },
  alternates: {
    canonical: 'https://www.upgraderoofs.co.uk/about',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Quality Craftsmanship',
      description: 'Every project receives meticulous attention to detail and superior workmanship.',
      color: 'blue',
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your satisfaction is our priority. We listen, advise, and deliver beyond expectations.',
      color: 'red',
    },
    {
      icon: CheckCircle,
      title: 'Reliability',
      description: 'We turn up on time, work efficiently, and complete projects as promised.',
      color: 'green',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We use modern techniques and materials that deliver lasting results.',
      color: 'yellow',
    },
  ];

  const achievements = [
    { number: '25+', label: 'Years Experience' },
    { number: '5000+', label: 'Projects Completed' },
    { number: '4.9', label: 'Average Rating' },
    { number: '10', label: 'Year Guarantee' },
  ];

  return (
    <>
      <BreadcrumbSchema items={[
        { name: 'Home', url: 'https://www.upgraderoofs.co.uk' },
        { name: 'About', url: 'https://www.upgraderoofs.co.uk/about' },
      ]} />
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
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Meet Our Team</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-2">About Us</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-2">
            Local roofers protecting Cheshire homes since 1999
          </p>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-b from-white to-brand-grey">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs sm:text-sm font-medium">
                <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Our Story</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-4 sm:mb-6">
                Delivering durable roofing across Cheshire since 1999
              </h2>
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                <p>
                  Founded in 1999, Upgrade Roofs has grown from a small family business to become one of the most trusted roofing companies in the region. Our journey has been built on a simple principle: deliver exceptional quality and service on every single project.
                </p>
                <p>
                  With over 25 years of experience, we've seen the roofing industry evolve, and we've evolved with it. From traditional tile and slate work to modern flat roofing systems, we combine traditional craftsmanship with modern techniques and materials.
                </p>
                <p>
                  Today, our team of skilled professionals continues to uphold the values that have made us successful: integrity, quality, and customer satisfaction. We're not just roofers; we're your partners in protecting your most valuable investment.
                </p>
              </div>
            </div>

            <div className="relative order-1 lg:order-2">
              <div className="aspect-square rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-gray-200">
                <img
                  src="https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Roofing team at work"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-brand-orange text-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-xl max-w-[150px] sm:max-w-[200px]">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1">25+</div>
                <div className="text-xs sm:text-sm font-medium">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-brand-grey">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-3 sm:mb-4">Why Choose Us?</h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              We're committed to delivering exceptional roofing services that stand the test of time
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-10 sm:mb-12 md:mb-16">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-${value.color}-500/10 flex items-center justify-center mb-3 sm:mb-4`}>
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 text-${value.color}-500`} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-brand-navy mb-2">{value.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-center shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-orange mb-1 sm:mb-2">
                  {achievement.number}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-center">
            <div className="space-y-4 sm:space-y-5 md:space-y-6 order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy">Our Accreditations</h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                We maintain the highest industry standards through continuous training and certification. Our team is fully qualified, insured, and committed to delivering work that exceeds expectations.
              </p>
              <div className="space-y-2 sm:space-y-3">
                {[
                  'Fully Insured (£10M Public Liability)',
                ].map((cert, index) => (
                  <div key={index} className="flex items-start gap-2 sm:gap-3">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-700 break-words">{cert}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 order-1 lg:order-2">
              <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-lg bg-gray-200">
                <img
                  src="https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Roofing work in progress"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-lg mt-4 sm:mt-6 md:mt-8 bg-gray-200">
                <img
                  src="https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Quality roofing materials"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white">
        <div className="container-custom text-center px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Ready to Work With Us?</h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Get a free, no-obligation quote for your roofing project today
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <QuoteForm trigger={
              <Button size="lg" className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-6 sm:px-8 md:px-10 h-12 sm:h-13 md:h-14 text-base sm:text-lg w-full sm:w-auto">
                Get Free Quote
              </Button>
            } />
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white !text-white bg-transparent hover:bg-white hover:!text-brand-navy font-semibold px-6 sm:px-8 md:px-10 h-12 sm:h-13 md:h-14 text-base sm:text-lg w-full sm:w-auto"
              asChild
            >
              <Link href="/services" className="!text-white hover:!text-brand-navy flex items-center justify-center">
                View Services
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
