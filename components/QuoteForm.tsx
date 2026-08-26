'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase, type QuoteRequest } from '@/lib/supabase';
import { trackQuoteRequest, trackQuoteFormOpen, getGclid } from '@/lib/tracking';
import { Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Star } from 'lucide-react';
import { TurnstileWidget } from '@/components/TurnstileWidget';

export function QuoteForm({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<QuoteRequest>({
    name: '',
    email: '',
    phone: '',
    postcode: '',
    service_type: '',
    message: '',
    roof_type: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', postcode: '', service_type: '', message: '', roof_type: '' });
    setTurnstileToken('');
    setLoading(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      if (!formData.name || !formData.phone || !formData.postcode) {
        setError('Please fill in your name, phone number and postcode.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, gclid: getGclid(), turnstileToken, website: honeypot }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send request');
      }

      try {
        await supabase.from('quote_requests').insert([formData]);
      } catch (supabaseError) {
        console.warn('Failed to save to Supabase, but request was sent:', supabaseError);
      }

      trackQuoteRequest({
        service_type: formData.service_type,
        postcode: formData.postcode,
      });

      setSuccess(true);
      resetForm();

      setTimeout(() => {
        setOpen(false);
        setTimeout(() => setSuccess(false), 500);
      }, 3000);
    } catch (err: any) {
      console.error('Error submitting quote request:', err);
      setError(err.message || 'An unexpected error occurred. Please try again or call us directly at 01270 897606.');
      setLoading(false);
    }
  };

  const handleChange = (field: keyof QuoteRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => { if (newOpen) trackQuoteFormOpen(); setOpen(newOpen); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold">
            Get a Free Quote
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl border border-gray-200 p-8">
        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-brand-navy mb-2">Request Received!</h3>
            <p className="text-gray-600">Thank you! We'll call you back within 10 minutes.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-5 mb-5">
                <div className="text-xl font-bold mb-1">📞 Call Now: 01270 897606</div>
                <div className="text-sm opacity-90">We answer in 30 seconds with an instant quote</div>
              </div>
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-2xl font-bold text-brand-navy text-center">Get Your Free Roof Inspection</DialogTitle>
                <DialogDescription className="text-center text-gray-600">
                  We'll call you back within 10 minutes to confirm
                </DialogDescription>
              </DialogHeader>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-brand-navy font-semibold text-sm">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  placeholder="John Smith"
                  autoComplete="name"
                  className="mt-2 h-12 text-base border-2 focus:border-brand-orange rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-brand-navy font-semibold text-sm">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  required
                  placeholder="01270 123456"
                  autoComplete="tel"
                  className="mt-2 h-12 text-base border-2 focus:border-brand-orange rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="postcode" className="text-brand-navy font-semibold text-sm">Your Postcode *</Label>
                <Input
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) => handleChange('postcode', e.target.value)}
                  required
                  placeholder="e.g. CW11 4NE"
                  autoComplete="postal-code"
                  className="mt-2 h-12 text-base border-2 focus:border-brand-orange rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-brand-navy font-semibold text-sm">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john@example.com"
                  autoComplete="email"
                  className="mt-2 h-12 text-base border-2 focus:border-brand-orange rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="roof_type" className="text-brand-navy font-semibold text-sm">Roof Type</Label>
                  <Select value={formData.roof_type} onValueChange={(value) => handleChange('roof_type', value)}>
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
                  <Label htmlFor="service_type" className="text-brand-navy font-semibold text-sm">Service Needed</Label>
                  <Select value={formData.service_type} onValueChange={(value) => handleChange('service_type', value)}>
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
                  value={formData.message || ''}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Tell us about your roofing project, including property type, approximate size, and any specific requirements..."
                  rows={4}
                  className="mt-2 text-base border-2 focus:border-brand-orange rounded-xl resize-none"
                />
              </div>

              {/* Honeypot field — hidden from humans, visible to bots */}
              <div className="hidden" aria-hidden="true">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
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
                disabled={loading}
                className="w-full bg-brand-orange hover:bg-brand-orange/90 !text-white font-bold py-4 text-xl h-16 rounded-xl shadow-lg"
              >
                <span className="!text-white">{loading ? 'Submitting...' : 'Request Callback'}</span>
              </Button>

              <p className="text-xs text-center text-gray-600">
                ✓ Free inspection · ✓ No obligation · ✓ 10-min callback
              </p>

              {error && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                By submitting, you agree to be contacted about our services.<br />
                No spam, unsubscribe anytime.
              </p>
            </form>

            {/* Review snippet under form */}
            <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-2xl">
              <div className="flex items-center justify-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-center text-gray-700 italic font-medium text-sm mb-1">
                "Fast, friendly, and professional. The inspection was thorough and found issues early."
              </p>
              <p className="text-center text-xs text-gray-600 font-semibold">Kerry, Crewe</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
