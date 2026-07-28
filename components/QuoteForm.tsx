'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase, type QuoteRequest } from '@/lib/supabase';
import { trackQuoteRequest, trackQuoteFormOpen, getGclid } from '@/lib/tracking';
import { Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export function QuoteForm({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<QuoteRequest>({
    name: '',
    email: '',
    phone: '',
    postcode: '',
    service_type: '',
    message: '',
  });

  const serviceTypes = [
    'Tile & Slate Roofs',
    'Flat Roofs',
    'Chimney Repairs',
    'Gutters & Fascias',
    'Skylights & Roof Windows',
    'Cladding Installations',
    'Emergency Repairs',
    'Other',
  ];

  const handleNextStep = () => {
    if (!formData.postcode || !formData.service_type) {
      setError('Please enter your postcode and select a service to continue.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handlePrevStep = () => {
    setStep(1);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', postcode: '', service_type: '', message: '' });
    setStep(1);
    setLoading(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      handleNextStep();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (!formData.name || !formData.email || !formData.phone) {
        setError('Please fill in your contact details.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, gclid: getGclid() }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      try {
        await supabase.from('quote_requests').insert([formData]);
      } catch (supabaseError) {
        console.warn('Failed to save to Supabase, but email was sent:', supabaseError);
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-brand-navy">Request a Free Quote</DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Start by telling us where you are and what you need.' : 'Just a few more details to get your quote.'}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-brand-navy mb-2">Quote Request Sent!</h3>
            <p className="text-gray-600">Thank you! We'll be in touch with your no-obligation quote shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in-0 duration-500">
                <div className="space-y-2">
                  <Label htmlFor="postcode">Your Postcode *</Label>
                  <Input
                    id="postcode"
                    value={formData.postcode}
                    onChange={(e) => handleChange('postcode', e.target.value)}
                    required
                    placeholder="e.g. CW11 4NE"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service Required *</Label>
                  <Select value={formData.service_type} onValueChange={(value) => handleChange('service_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={handleNextStep} className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white font-semibold">
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in-0 duration-500">
                <Button type="button" variant="ghost" onClick={handlePrevStep} className="text-sm text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required placeholder="John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} required placeholder="01270 123456" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Additional Details</Label>
                  <Textarea id="message" value={formData.message} onChange={(e) => handleChange('message', e.target.value)} placeholder="Tell us about your roofing project..." rows={3} />
                </div>
                <Button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</> : 'Submit Quote Request'}
                </Button>
              </div>
            )}

            {error && (
              <div className="flex items-start space-x-2 p-3 mt-4 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <p className="text-xs text-center text-gray-500 pt-2">
              By submitting this form, you agree to be contacted by Upgrade Roofs regarding your quote.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
