'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Star } from 'lucide-react';
import { trackQuoteRequest, getGclid, getSubmitStamp } from '@/lib/tracking';

/**
 * Inline lead-capture form styled on the special-offer page's right-column
 * card, but posting to /api/send-quote so town-page leads keep the
 * `quote_form` source and existing GHL tags. Used by AreaPageTemplate so all
 * roofers-* pages get the high-converting embedded form instead of a popup.
 */
export function InlineLeadForm({ town }: { town: string }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    postcode: '',
    roofType: '',
    serviceNeeded: '',
    sameDayCallback: false,
  });
  const [honeypot, setHoneypot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          postcode: formData.postcode,
          service_type: formData.serviceNeeded || formData.roofType || undefined,
          message: [
            formData.roofType ? `Roof type: ${formData.roofType}` : '',
            formData.sameDayCallback ? 'Same-day callback requested' : '',
            `Source: roofers-${town.toLowerCase()} page`,
          ].filter(Boolean).join('\n'),
          gclid: getGclid(),
          website: honeypot,
          _ts: getSubmitStamp(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      trackQuoteRequest({
        service_type: formData.serviceNeeded || formData.roofType,
        postcode: formData.postcode,
      });

      window.location.href = '/thank-you';
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again or call us directly at 01270 897606');
      setIsSubmitting(false);
    }
  };

  return (
    <div id="inline-lead-form" className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 mb-6">
          <div className="text-2xl font-bold mb-2">📞 Call Now: 01270 897606</div>
          <div className="text-lg opacity-90">We answer in 30 seconds — instant quote</div>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-brand-navy">Book Your Free Roof Inspection</h3>
          <p className="text-gray-600">We'll call you back within 10 minutes to confirm</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`ilf-name-${town}`} className="text-brand-navy font-semibold text-sm">Name *</Label>
            <Input
              id={`ilf-name-${town}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Smith"
              required
              autoComplete="name"
              className="mt-2 h-12 text-base border-2 focus:border-brand-orange rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor={`ilf-phone-${town}`} className="text-brand-navy font-semibold text-sm">Phone *</Label>
            <Input
              id={`ilf-phone-${town}`}
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Your phone number"
              required
              autoComplete="tel"
              className="mt-2 h-12 text-base border-2 focus:border-brand-orange rounded-xl"
            />
          </div>
        </div>

        <div>
          <Label htmlFor={`ilf-postcode-${town}`} className="text-brand-navy font-semibold text-sm">Postcode *</Label>
          <Input
            id={`ilf-postcode-${town}`}
            value={formData.postcode}
            onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
            placeholder="CW1 0LX"
            required
            autoComplete="postal-code"
            className="mt-2 h-12 text-base border-2 focus:border-brand-orange rounded-xl"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-brand-navy font-semibold text-sm">Roof Type</Label>
            <Select value={formData.roofType} onValueChange={(value) => setFormData({ ...formData, roofType: value })}>
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
            <Label className="text-brand-navy font-semibold text-sm">Service Needed</Label>
            <Select value={formData.serviceNeeded} onValueChange={(value) => setFormData({ ...formData, serviceNeeded: value })}>
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
            id={`ilf-callback-${town}`}
            checked={formData.sameDayCallback}
            onCheckedChange={(checked) => setFormData({ ...formData, sameDayCallback: !!checked })}
          />
          <Label htmlFor={`ilf-callback-${town}`} className="text-brand-navy font-medium">
            I'd like a same-day callback
          </Label>
        </div>

        {/* Honeypot field — hidden from humans, visible to bots */}
        <div className="hidden" aria-hidden="true">
          <Label htmlFor={`ilf-website-${town}`}>Website</Label>
          <Input
            id={`ilf-website-${town}`}
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
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
          "Fast, friendly, and professional. The inspection was thorough and found issues early."
        </p>
        <p className="text-center text-sm text-gray-600 font-semibold">– Kerry, Crewe</p>
      </div>
    </div>
  );
}
