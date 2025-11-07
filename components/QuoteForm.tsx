'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase, type QuoteRequest } from '@/lib/supabase';
import { Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.phone || !formData.postcode || !formData.service_type) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }

      // Call the API route to send email
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      // Also save to Supabase for backup (optional, won't fail if Supabase is down)
      try {
        await supabase
          .from('quote_requests')
          .insert([formData]);
      } catch (supabaseError) {
        console.warn('Failed to save to Supabase, but email was sent:', supabaseError);
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        postcode: '',
        service_type: '',
        message: '',
      });

      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      // Catch any unexpected errors
      console.error('Error submitting quote request:', err);
      setError(err.message || 'An unexpected error occurred. Please try again or call us directly at 07379 440583.');
      setLoading(false);
    }
  };

  const handleChange = (field: keyof QuoteRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            Fill in your details and we'll get back to you within 24 hours with a no-obligation quote.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-brand-navy mb-2">Quote Request Sent!</h3>
            <p className="text-gray-600">Thank you for your request. We'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                placeholder="01270 123456"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode *</Label>
              <Input
                id="postcode"
                value={formData.postcode}
                onChange={(e) => handleChange('postcode', e.target.value)}
                required
                placeholder="CW1 2XX"
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

            <div className="space-y-2">
              <Label htmlFor="message">Additional Details</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Tell us about your roofing project..."
                rows={4}
              />
            </div>

            {error && (
              <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              By submitting this form, you agree to be contacted by Upgrade Roofing Solutions regarding your quote.
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}