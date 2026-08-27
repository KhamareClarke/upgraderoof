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
  MessageCircle, 
  CheckCircle, 
  Star, 
  Shield,
  Clock,
  ArrowUp
} from 'lucide-react';
import { trackQuoteRequest, trackPhoneClick, trackWhatsAppClick, getGclid } from '@/lib/tracking';
import Image from 'next/image';
import { TurnstileWidget } from '@/components/TurnstileWidget';
import { AuthorityBar } from '@/components/AuthorityBar';
import { SectionHeader } from '@/components/SectionHeader';
import { HeroKicker } from '@/components/HeroKicker';
import { ReviewsSection } from '@/components/ReviewsSection';

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
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!mounted) return;
    
    const targetDate = new Date('2026-07-31T23:59:59');
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mounted]);

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
            {/* Left Column - Headlines */}
            <div className="text-white space-y-4">
              <HeroKicker light>Free Roof Inspection · Sandbach & Cheshire</HeroKicker>

              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Roof Leak or Damage in<br />
                  <span className="text-brand-orange">Sandbach, Crewe,</span><br />
                  <span className="text-brand-orange">Congleton or Cheshire?</span><br />
                  <span className="text-3xl md:text-4xl">We'll Inspect It Free.</span>
                </h1>
                
                <div className="bg-white/10 backdrop-blur-sm border border-brand-orange/40 border-l-4 border-l-brand-orange p-8 text-center">
                  <div className="text-4xl md:text-5xl font-bold text-brand-orange mb-3">
                    📞 01270 897606
                  </div>
                  <div className="text-xl font-semibold">
                    We Answer in 30 Seconds!
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-xl font-semibold text-brand-orange">
                  Emergency Repairs • Leaks • New Roofs • Flat Roofs
                </p>
                <ul className="text-base text-white/90 space-y-1">
                  <li>✓ CORC certified · properly qualified roofers</li>
                  <li>✓ £10M public liability insurance</li>
                  <li>✓ 10-year workmanship guarantee on all work</li>
                  <li>✓ Free written quote · no obligation, no pressure</li>
                  <li>✓ Based in Sandbach · fast across all of Cheshire</li>
                </ul>
              </div>

              {/* Call-First CTAs */}
              <div className="space-y-3 pt-2">
                <a
                  href="tel:01270897606"
                  onClick={handlePhoneClick}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-8 py-6 text-2xl rounded-xl border-l-4 border-l-brand-navy flex items-center justify-center gap-3 transition-colors"
                >
                  <Phone className="w-8 h-8" />
                  <span className="!text-white">CALL NOW: 01270 897606</span>
                </a>
                
                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="https://wa.me/447379440583"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleWhatsAppClick}
                    className="border-2 border-white !text-white hover:bg-white/10 hover:border-brand-orange font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="!text-white">WhatsApp</span>
                  </a>
                  <button
                    onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="border-2 border-white !text-white hover:bg-white/10 hover:border-brand-orange font-bold py-4 rounded-xl transition-colors"
                  >
                    <span className="!text-white">📝 Quick Form</span>
                  </button>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                <div className="text-center">
                  <Shield className="w-8 h-8 text-brand-orange mx-auto mb-2" />
                  <div className="text-sm font-semibold">Fully Insured</div>
                </div>
                <div className="text-center">
                  <Star className="w-8 h-8 text-yellow-400 fill-current mx-auto mb-2" />
                  <div className="text-sm font-semibold">5★ Google Rating</div>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 text-brand-orange mx-auto mb-2" />
                  <div className="text-sm font-semibold">Same Day Response</div>
                </div>
              </div>
            </div>

            {/* Right Column - Clean Form */}
            <div className="bg-white p-8 border border-gray-200 border-l-4 border-l-brand-navy">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 mb-6 border-l-4 border-l-brand-navy">
                  <div className="text-2xl font-bold mb-2">
                    📞 Call Now: 01270 897606
                  </div>
                  <div className="text-lg opacity-90">
                    We answer in 30 seconds · instant quote
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-brand-navy">
                    Book Your Free Roof Inspection
                  </h3>
                  <p className="text-gray-600">
                    We'll call you back within 10 minutes to confirm
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
                  "Fast, friendly, and professional. The inspection was thorough and found issues early."
                </p>
                <p className="text-center text-sm text-gray-600 font-semibold">– Kerry, Crewe</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <AuthorityBar />

      {/* Areas We Cover · matches every local keyword in the ad campaign */}
      <section className="py-10 bg-white border-b">
        <div className="container-custom">
          <SectionHeader
            kicker="Coverage"
            title={<>Serving Sandbach & <span className="text-brand-orange">All Surrounding Areas</span></>}
            subtitle="Based in Sandbach CW11 · covering every corner of Cheshire within 30 minutes"
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
            Don't see your area? <a href="tel:01270897606" onClick={handlePhoneClick} className="text-brand-orange font-semibold hover:underline">Call 01270 897606</a> · we likely cover you.
          </p>
        </div>
      </section>

      {/* What Inspection Covers */}
      <section className="section-padding bg-brand-grey">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <SectionHeader
              kicker="Our Inspection"
              title="What Your Free Inspection Covers"
            />
            <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-8">
              {[
                'Full roof structure check · tiles, slates, ridges',
                'Lead flashing & valley condition',
                'Gutters, fascias & soffits',
                'Chimney pointing & flashings',
                'Flat roof membranes (if applicable)',
                'Written condition report with photos',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            <Button 
              size="lg" 
              className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-8 py-4"
              onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="!text-white">Book My Free Roof Check</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Scarcity & Urgency */}
      <section className="py-12 bg-gradient-to-r from-red-600 to-brand-orange text-white">
        <div className="container-custom text-center">
          <SectionHeader
            dark
            kicker="Limited Time Offer"
            title="Free Roof Inspection · Offer Ends 31st July 2026"
            subtitle="Book before the deadline. No cost, no obligation · just an expert roof check and honest advice."
          />
          
          {/* Countdown Timer */}
          <div className="flex justify-center gap-4 mb-8">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="bg-white/20 rounded-lg p-4 min-w-[80px]">
                <div className="text-2xl font-bold">{value.toString().padStart(2, '0')}</div>
                <div className="text-sm capitalize">{unit}</div>
              </div>
            ))}
          </div>

          <Button
            size="lg"
            className="bg-white !text-brand-orange hover:bg-gray-100 font-bold px-8 py-4 text-lg"
            onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <span className="!text-brand-orange">Book My Free Inspection</span>
          </Button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-gradient-to-r from-brand-navy to-brand-navy/90 text-white">
        <div className="container-custom text-center">
          <SectionHeader
            dark
            kicker="Free Inspection"
            title="Ready to Get Your Roof Checked for Free?"
            subtitle="Don't wait until leaks become damage. We'll call you within 10 minutes to confirm your booking."
          />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-8 py-4 text-lg"
              onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <span className="!text-white">Book My Free Inspection</span>
            </Button>
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
