'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Phone,
  CheckCircle,
  Star,
  ArrowUp
} from 'lucide-react';
import { trackQuoteRequest, trackPhoneClick, trackWhatsAppClick, getGclid } from '@/lib/tracking';
import Image from 'next/image';
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { SectionHeader } from '@/components/SectionHeader';
import { HeroKicker } from '@/components/HeroKicker';
import { ReviewsSection } from '@/components/ReviewsSection';
import { CtaSubMessage } from '@/components/CtaSubMessage';

export default function SpecialOfferPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    postcode: '',
    email: '',
    roofType: '',
    serviceNeeded: '',
    message: '',
    sameDayCallback: false
  });
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call the API route to send email
      const response = await fetch('/api/send-special-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, gclid: getGclid(), turnstileToken, website: honeypot }),
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
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again or call us directly at 01270 897606');
      setIsSubmitting(false);
    }
  };

  const handlePhoneClick = () => {
    trackPhoneClick('special_offer');
  };

  const handleWhatsAppClick = () => {
    trackWhatsAppClick('special_offer');
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
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 mb-6 border-l-4 border-l-brand-navy">
                  <div className="text-2xl font-bold mb-2">
                    📞 01270 897606
                  </div>
                  <div className="text-lg opacity-90">
                    Prefer to talk? We'll answer straight away
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-brand-navy">
                    Book Your Free Roof Inspection
                  </h3>
                  <p className="text-gray-600">
                    Leave your details and we'll call you back within 10 minutes
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-brand-navy font-semibold text-sm">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="John Smith"
                      required
                      className="mt-2 h-12 text-base border-2 focus:border-brand-orange rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-brand-navy font-semibold text-sm">Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Your phone number"
                      required
                      className="mt-2 h-12 text-base border-2 focus:border-brand-orange rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="postcode" className="text-brand-navy font-semibold text-sm">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => setFormData({...formData, postcode: e.target.value})}
                    placeholder="CW1 0LX"
                    required
                    className="mt-2 h-12 text-base border-2 focus:border-brand-orange rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-brand-navy font-semibold text-sm">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@example.com"
                    autoComplete="email"
                    className="mt-2 h-12 text-base border-2 focus:border-brand-orange rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roofType" className="text-brand-navy font-semibold text-sm">Roof Type</Label>
                    <Select value={formData.roofType} onValueChange={(value) => setFormData({...formData, roofType: value})}>
                      <SelectTrigger className="mt-2 h-12 text-base border-2 rounded-xl">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tile">Tile Roof</SelectItem>
                        <SelectItem value="slate">Slate Roof</SelectItem>
                        <SelectItem value="flat">Flat Roof</SelectItem>
                        <SelectItem value="other">Other/Not Sure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="serviceNeeded" className="text-brand-navy font-semibold text-sm">Service Needed</Label>
                    <Select value={formData.serviceNeeded} onValueChange={(value) => setFormData({...formData, serviceNeeded: value})}>
                      <SelectTrigger className="mt-2 h-12 text-base border-2 rounded-xl">
                        <SelectValue placeholder="What you need" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leak-repair">Leak Repair</SelectItem>
                        <SelectItem value="new-roof">New Roof</SelectItem>
                        <SelectItem value="flat-roof">Flat Roof</SelectItem>
                        <SelectItem value="tile-replacement">Tile Replacement</SelectItem>
                        <SelectItem value="guttering">Guttering/Fascias</SelectItem>
                        <SelectItem value="general">General Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="message" className="text-brand-navy font-semibold text-sm">Your Project</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Tell us about your roofing project, including property type, approximate size, and any specific requirements..."
                    rows={4}
                    className="mt-2 text-base border-2 focus:border-brand-orange rounded-xl resize-none"
                  />
                </div>

                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
                  <Checkbox
                    id="callback"
                    checked={formData.sameDayCallback}
                    onCheckedChange={(checked) => setFormData({...formData, sameDayCallback: !!checked})}
                  />
                  <Label htmlFor="callback" className="text-brand-navy font-medium">
                    I'd like a same-day callback
                  </Label>
                </div>

                {/* Honeypot field · hidden from humans, visible to bots */}
                <div className="hidden" aria-hidden="true">
                  <Label htmlFor="offer-website">Website</Label>
                  <Input
                    id="offer-website"
                    type="text"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <TurnstileWidget onToken={setTurnstileToken} />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold py-4 text-xl h-16 rounded-xl border-l-4 border-l-brand-navy"
                >
                  <span className="!text-white">{isSubmitting ? 'Submitting...' : 'Request Callback'}</span>
                </Button>

                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  By submitting, you agree to be contacted about our services.<br />
                  No spam, unsubscribe anytime.
                </p>
              </form>

              {/* Review snippet under form */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 border-l-4 border-l-brand-navy">
                <div className="flex items-center justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-center text-gray-700 italic font-medium mb-2">
                  "Fast, friendly, and thorough. They found a slipped tile before it caused any real damage."
                </p>
                <p className="text-center text-sm text-gray-600 font-semibold">Kerry, Crewe</p>
              </div>
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
              <a
                href="tel:01270897606"
                onClick={handlePhoneClick}
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
              >
                Get a Free Quote
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Areas We Cover · matches every local keyword in the ad campaign */}
      <section className="py-10 bg-white border-b">
        <div className="container-custom">
          <SectionHeader
            kicker="Where we work"
            title={<>Roofing across <span className="text-brand-orange">Sandbach & Cheshire</span></>}
            subtitle="Based in Sandbach CW11, we cover the surrounding towns and villages"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
            {[
              { town: 'Sandbach', postcode: 'CW11', highlight: true },
              { town: 'Crewe', postcode: 'CW1–CW2' },
              { town: 'Congleton', postcode: 'CW12' },
              { town: 'Nantwich', postcode: 'CW5' },
              { town: 'Alsager', postcode: 'ST7' },
              { town: 'Middlewich', postcode: 'CW10' },
              { town: 'Northwich', postcode: 'CW8–CW9' },
              { town: 'Holmes Chapel', postcode: 'CW4' },
              { town: 'Macclesfield', postcode: 'SK10–SK11' },
              { town: 'Knutsford', postcode: 'WA16' },
            ].map(({ town, postcode, highlight }) => (
              <div
                key={town}
                className={`text-center py-3 px-2 rounded-xl border-2 ${
                  highlight
                    ? 'border-brand-orange bg-orange-50 font-bold text-brand-orange'
                    : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                <div className={`font-semibold text-sm ${highlight ? 'text-brand-orange' : 'text-brand-navy'}`}>{town}</div>
                <div className="text-xs text-gray-500 mt-0.5">{postcode}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-5">
            Don't see your area? Call <a href="tel:01270897606" onClick={handlePhoneClick} className="text-brand-orange font-semibold hover:underline">01270 897606</a> and we'll let you know.
          </p>
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
              <Button
                size="lg"
                className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-8 py-4"
                onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="!text-white">Book My Free Roof Check</span>
              </Button>
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="flex flex-col items-center gap-2">
              <Button
                size="lg"
                className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-8 py-4 text-lg"
                onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <span className="!text-white">Book My Free Inspection</span>
              </Button>
              <CtaSubMessage dark />
            </div>
            <a
              href="tel:01270897606"
              onClick={handlePhoneClick}
              className="border-2 border-white !text-white hover:bg-white/10 hover:border-brand-orange font-bold px-8 py-4 text-lg rounded-md flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span className="!text-white">Call Now</span>
            </a>
          </div>
        </div>
      </section>

      {/* Customer Reviews · reputationhub widget */}
      <ReviewsSection />

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t p-3">
        <div className="flex gap-2">
          <a
            href="tel:01270897606"
            onClick={handlePhoneClick}
            className="flex-1 bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold text-sm py-4 px-3 rounded-md text-center animate-pulse flex items-center justify-center"
          >
            📞 CALL NOW
          </a>
          <a
            href="https://wa.me/447379440583"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleWhatsAppClick}
            className="bg-green-500 hover:bg-green-600 !text-white font-bold px-3 py-4 text-xs whitespace-nowrap rounded-md flex items-center justify-center gap-1"
          >
            <span>💬</span>
            <span className="!text-white">WhatsApp</span>
          </a>
          <button
            onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-blue-500 hover:bg-blue-600 !text-white font-bold px-3 py-4 text-xs whitespace-nowrap rounded-md flex items-center justify-center gap-1"
          >
            <span>📝</span>
            <span className="!text-white">Quick Form</span>
          </button>
        </div>
      </div>

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-40 bg-brand-navy text-white p-3 rounded-full hover:bg-brand-navy/90 transition-all"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
