'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Phone, 
  MessageCircle, 
  CheckCircle, 
  Star, 
  Shield, 
  Award, 
  Clock,
  ArrowUp
} from 'lucide-react';
import { trackConversion, trackEvent } from '@/components/Analytics';
import Image from 'next/image';

export default function SpecialOfferPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    postcode: '',
    roofType: '',
    serviceNeeded: '',
    sameDayCallback: false
  });
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
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    
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
    
    trackConversion('quote_request', 150);
    trackEvent('special_offer_form_submitted');
    
    try {
      // Call the API route to send email
      const response = await fetch('/api/send-special-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      // Redirect to thank you page on success
      window.location.href = '/thank-you';
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again or call us directly at 01270 897606');
      setIsSubmitting(false);
    }
  };

  const handlePhoneClick = () => {
    trackEvent('phone_call_clicked', { source: 'special_offer' });
  };

  const handleWhatsAppClick = () => {
    trackEvent('whatsapp_clicked', { source: 'special_offer' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-start justify-center overflow-hidden pt-8 md:pt-12">
        <div className="absolute inset-0">
          <Image
            src="/images/6.jpeg"
            alt="Professional roof inspection Cheshire Staffordshire"
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
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-orange text-white font-bold animate-pulse">
                <Award className="w-5 h-5" />
                <span className="text-lg">LIMITED TIME OFFER</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  <span className="text-brand-orange">CALL NOW</span><br />
                  for Your FREE Roof Inspection!
                </h1>
                
                <div className="bg-white/10 backdrop-blur-sm border-2 border-brand-orange rounded-2xl p-8 text-center">
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
                  Emergency Roof Repairs • Leak Fixes • New Roofs
                </p>
                <p className="text-lg text-white/90">
                  25+ Years Experience • FREE Same-Day Quotes
                </p>
                <p className="text-lg text-white/80">
                  Serving Cheshire & Staffordshire
                </p>
              </div>

              {/* Call-First CTAs */}
              <div className="space-y-3 pt-2">
                <a
                  href="tel:01270897606"
                  onClick={handlePhoneClick}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold px-8 py-6 text-2xl rounded-xl shadow-2xl flex items-center justify-center gap-3 transition-colors"
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
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 mb-6">
                  <div className="text-2xl font-bold mb-2">
                    📞 FASTEST: Call 01270 897606
                  </div>
                  <div className="text-lg opacity-90">
                    Instant quote in 2 minutes!
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-brand-navy">
                    Or Request a Callback
                  </h3>
                  <p className="text-gray-600">
                    We'll call you within 10 minutes
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
                      placeholder="07379 440583"
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

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold py-4 text-xl h-16 rounded-xl shadow-lg"
                >
                  <span className="!text-white">{isSubmitting ? 'Submitting...' : 'Request Callback'}</span>
                </Button>

                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  By submitting, you agree to be contacted about our services.<br />
                  No spam, unsubscribe anytime.
                </p>
              </form>

              {/* Review snippet under form */}
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl">
                <div className="flex items-center justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-center text-gray-700 italic font-medium mb-2">
                  "Fast, friendly, and professional. The inspection was thorough — found issues early."
                </p>
                <p className="text-center text-sm text-gray-600 font-semibold">– Kerry, Crewe</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 bg-white border-b">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm font-semibold">Checkatrade</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-sm font-semibold">CORC Certified</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-sm font-semibold">Google 5★</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm font-semibold">£10M Insured</p>
            </div>
          </div>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 font-medium">
              Fully insured up to £10M | CORC Certified | Over 25 Years Experience
            </p>
          </div>
        </div>
      </section>

      {/* New Mid-Page Section */}
      <section className="section-padding bg-brand-grey">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-6">
              Got a Leak or Need a New Roof? We'll Identify the Problem — Fast.
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
              Whether it's a small leak or a full roof replacement, our inspection includes a detailed condition report 
              and a no-obligation repair plan tailored for your home.
            </p>
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
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ⏰ Limited Time Offer - Act Fast!
          </h2>
          <p className="text-lg mb-6">
            Only 5 free inspections left this week - Offer ends Sunday
          </p>
          
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
            <span className="!text-brand-orange">Claim Your Spot Now</span>
          </Button>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-gradient-to-r from-brand-navy to-brand-navy/90 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Your Roof Checked for Free?
          </h2>
          <p className="text-xl mb-2 max-w-2xl mx-auto">
            Don't wait until leaks become damage.
          </p>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white/80">
            We'll call you within 10 minutes to confirm your booking.
          </p>
          
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

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t shadow-lg p-3">
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
          className="fixed bottom-20 right-4 z-40 bg-brand-navy text-white p-3 rounded-full shadow-lg hover:bg-brand-navy/90 transition-all"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
