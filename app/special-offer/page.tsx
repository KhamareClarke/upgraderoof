'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Phone,
  CheckCircle,
  ArrowUp,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { trackQuoteRequest, trackPhoneClick, getGclid } from '@/lib/tracking';
import Image from 'next/image';
import Link from 'next/link';
import { LeadFormWizard } from '@/components/LeadFormWizard';
import { QuoteForm } from '@/components/QuoteForm';
import { SectionHeader } from '@/components/SectionHeader';
import { HeroKicker } from '@/components/HeroKicker';
import { ReviewsSection } from '@/components/ReviewsSection';
import { CtaSubMessage } from '@/components/CtaSubMessage';
import { FAQ } from '@/components/FAQ';

export default function SpecialOfferPage() {
  const [mounted, setMounted] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll functionality
  useEffect(() => {
    if (!mounted) return;
    
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (values: Record<string, string>, extra: { turnstileToken: string; honeypot: string }) => {
    const formData = {
      name: values.name,
      phone: values.phone,
      postcode: values.postcode,
      email: values.email,
      roofType: values.roofType,
      serviceNeeded: values.serviceNeeded,
      message: values.message,
      sameDayCallback: values.sameDayCallback === 'yes',
    };

    const response = await fetch('/api/send-special-offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, gclid: getGclid(), turnstileToken: extra.turnstileToken, website: extra.honeypot }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to submit form');
    }

    // Track only after confirmed success
    trackQuoteRequest({
      service_type: formData.serviceNeeded || formData.roofType,
      postcode: formData.postcode,
    });

    // Redirect to thank you page on success
    window.location.href = '/thank-you';
  };

  const handlePhoneClick = () => {
    trackPhoneClick('special_offer');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-8 md:pt-12">
        <div className="absolute inset-0">
          <Image
            src="/images/6.jpeg"
            alt="Professional roof inspection Sandbach Cheshire"
            fill
            className="object-cover scale-110"
            priority
            quality={85}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy/90 via-brand-navy/80 to-brand-navy/70" />
        </div>

        <div className="container-custom relative z-10 py-4 md:py-6">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Headlines (mirrors homepage hero) */}
            <div className="text-white space-y-6">
              <HeroKicker light>Est. Sandbach, Cheshire</HeroKicker>

              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
                Get Your{' '}
                <span className="text-brand-orange">Free Roof Inspection</span>
                <br />
                in Cheshire
              </h1>

              <p className="text-lg md:text-xl font-semibold text-brand-orange leading-snug">
                We call you back within 10 minutes
                <br />
                <span className="text-white">guaranteed</span>
              </p>

            </div>

            {/* Right Column - Clean Form */}
            <div className="bg-white p-8 border border-gray-200 border-l-4 border-l-brand-navy">
              <div className="text-center mb-8">
                <a
                  href="tel:01270897606"
                  onClick={handlePhoneClick}
                  className="block w-full border-2 border-brand-navy p-5 mb-6 text-center hover:border-brand-orange transition-colors"
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange">
                    Call us direct
                  </span>
                  <span className="block mt-1 text-2xl font-bold text-brand-navy">
                    01270 897 606
                  </span>
                  <span className="block mt-1 text-sm text-gray-600">
                    We answer straight away
                  </span>
                </a>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-brand-navy">
                    Book Your Free Roof Inspection
                  </h3>
                  <p className="text-gray-600">
                    Leave your details and we'll call you back within 10 minutes
                  </p>
                </div>
              </div>

              <LeadFormWizard
                config={{
                  onSubmit: handleSubmit,
                  submitLabel: 'Request Callback',
                  headingStep1: 'Project & Contact Basics',
                  subStep1: 'Tell us what you need and how to reach you.',
                  headingStep2: 'Location & Final Confirmation',
                  subStep2: 'Add your postcode and any project details.',
                  extraStep2: (values, update) => (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-300 border-l-4 border-l-brand-orange rounded-md">
                      <Checkbox
                        checked={values.sameDayCallback === 'yes'}
                        onCheckedChange={(checked) => update('sameDayCallback', checked ? 'yes' : '')}
                      />
                      <Label className="text-brand-navy font-medium">
                        I'd like a same-day callback
                      </Label>
                    </div>
                  ),
                  validate: (values) => {
                    const email = values.email?.trim() ?? '';
                    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
                    return null;
                  },
                }}
              />

              <p className="mt-6 text-xs text-gray-500 text-center leading-relaxed">
                By submitting, you agree to be contacted about our services.<br />
                No spam, unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges · matches homepage accreditation section */}
      <section className="border-b border-gray-200 bg-white">
        <div className="container-custom">
          <div className="py-10 sm:py-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-4">
                <span className="h-px w-8 sm:w-12 bg-brand-orange" aria-hidden="true" />
                <span className="text-brand-orange text-xs sm:text-sm font-semibold uppercase tracking-[0.2em]">Accredited &amp; Insured</span>
                <span className="h-px w-8 sm:w-12 bg-brand-orange" aria-hidden="true" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-4">
                Trusted &amp; Approved
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Recognised by leading industry bodies and trusted by thousands of customers
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 items-center">
              {[
                { src: '/images/corc_logo-1024x549.webp', alt: 'CORC certified member logo', width: 1024, height: 549, label: 'CORC Certified', meta: 'Approved member', priority: true },
                { src: '/images/badge-light@2x.png', alt: 'MyApproved verified member badge', width: 760, height: 284, label: '£10M Insured', meta: 'Public liability cover', priority: false },
                { src: '/images/badge-light@2x.png', alt: 'Insurance Backed Guarantee badge', width: 760, height: 284, label: 'IBG Guarantee', meta: 'Insurance-backed work', priority: false },
                { src: '/images/Google-Review-Emblem-500x281.png', alt: 'Google reviews emblem with 5 star rating', width: 500, height: 281, label: '5-Star Rated', meta: 'Google · MyApproved verified', priority: false },
              ].map((item, index) => (
                <div key={index} className="group flex flex-col items-center text-center">
                  <div className="relative w-full max-w-[190px] h-24 flex items-center justify-center bg-white border border-gray-200 rounded-lg shadow-sm p-3 transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      width={item.width}
                      height={item.height}
                      className="w-full h-full object-contain"
                      priority={item.priority}
                    />
                  </div>
                  <p className="mt-5 text-sm sm:text-base font-bold text-brand-navy tracking-wide">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-snug">{item.meta}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <QuoteForm
                trigger={
                  <span className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base cursor-pointer">
                    Get a Free Quote
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Local Service Areas · Internal Linking Hub (matches homepage) */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-8 sm:w-12 bg-brand-orange" aria-hidden="true" />
              <span className="text-brand-orange text-xs sm:text-sm font-semibold uppercase tracking-[0.2em]">Where We Work</span>
              <span className="h-px w-8 sm:w-12 bg-brand-orange" aria-hidden="true" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-navy mb-3">
              Roofing Services Across <span className="text-brand-orange">Cheshire</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Based in Sandbach, we serve homeowners and businesses throughout south and mid-Cheshire.
            </p>
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-white border border-gray-300 border-t-2 border-t-brand-orange">
              <MapPin className="w-5 h-5 text-brand-orange" />
              <span className="text-sm font-semibold text-brand-navy">
                Looking for{' '}
                <Link href="/roofers-sandbach" className="text-brand-orange hover:underline font-bold">
                  roofers in Sandbach
                </Link>
                ? We're based on Crewe Road, CW11 4NE
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {[
              { name: 'Roofers Sandbach', href: '/roofers-sandbach' },
              { name: 'Roofers Crewe', href: '/roofers-crewe' },
              { name: 'Roofers Middlewich', href: '/roofers-middlewich' },
              { name: 'Roofers Congleton', href: '/roofers-congleton' },
              { name: 'Roofers Nantwich', href: '/roofers-nantwich' },
              { name: 'Roofers Alsager', href: '/roofers-alsager' },
              { name: 'Roofers Holmes Chapel', href: '/roofers-holmes-chapel' },
              { name: 'All Service Areas', href: '/service-areas' },
            ].map((area, i) => (
              <Link key={i} href={area.href} className="group flex items-center gap-2 p-4 bg-white border border-gray-300 hover:border-brand-navy transition-colors">
                <MapPin className="w-4 h-4 text-brand-orange flex-shrink-0" />
                <span className="text-sm font-semibold text-brand-navy group-hover:text-brand-orange transition-colors">{area.name}</span>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <QuoteForm
              trigger={
                <span className="inline-flex items-center justify-center gap-2.5 bg-brand-orange hover:bg-brand-navy-light text-white font-semibold px-7 sm:px-8 h-12 sm:h-14 rounded-lg shadow-lg shadow-black/20 ring-1 ring-white/10 transition-colors duration-300 cursor-pointer">
                  Request a Free Quote
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300" />
                </span>
              }
            />
          </div>
        </div>
      </section>

      {/* What Inspection Covers */}
      <section className="section-padding bg-brand-grey">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              kicker="What to expect"
              title="What Your Free Roof Check Covers"
            />
            <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-8">
              {[
                'Tiles, slates and ridges checked for cracks or movement',
                'Lead flashing and valley condition',
                'Gutters, fascias and soffits',
                'Chimney pointing and flashings',
                'Flat roof covering, if you have one',
                'A written report with photos, so you can see for yourself',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center gap-2">
              <QuoteForm
                trigger={
                  <Button
                    size="lg"
                    className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-8 py-4"
                  >
                    <span className="!text-white">Book My Free Roof Check</span>
                  </Button>
                }
              />
              <CtaSubMessage />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-gradient-to-r from-brand-navy to-brand-navy/90 text-white">
        <div className="container-custom text-center">
          <SectionHeader
            dark
            kicker="Free roof check"
            title="Want Your Roof Looked At?"
            subtitle="Leave your details and we'll get back to you within 10 minutes."
          />
          
          <div className="flex flex-col items-center gap-2">
            <QuoteForm
              trigger={
                <Button
                  size="lg"
                  className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-8 py-4 text-lg"
                >
                  <span className="!text-white">Book My Free Inspection</span>
                </Button>
              }
            />
            <CtaSubMessage dark />
          </div>
        </div>
      </section>

      {/* Customer Reviews · reputationhub widget */}
      <ReviewsSection reviewCta="quote" />

      {/* FAQ · cloned from homepage, styled to match this page */}
      <FAQ />

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-40 bg-brand-navy text-white p-3 rounded hover:bg-brand-navy/90 transition-all"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
