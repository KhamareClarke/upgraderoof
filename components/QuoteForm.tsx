'use client';

import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase, type QuoteRequest } from '@/lib/supabase';
import { trackQuoteRequest, trackQuoteFormOpen, getGclid } from '@/lib/tracking';
import { CircleCheck as CheckCircle2 } from 'lucide-react';
import { LeadFormWizard } from '@/components/LeadFormWizard';

export function QuoteForm({ trigger }: { trigger?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: Record<string, string>, extra: { turnstileToken: string; honeypot: string }) => {
    const formData: QuoteRequest = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      postcode: values.postcode,
      service_type: values.service_type,
      message: values.message,
      roof_type: values.roof_type,
    };

    const response = await fetch('/api/send-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, gclid: getGclid(), turnstileToken: extra.turnstileToken, website: extra.honeypot }),
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

    setTimeout(() => {
      setOpen(false);
      setTimeout(() => setSuccess(false), 500);
    }, 3000);
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto rounded-3xl border border-brand-navy/20 p-8">
        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-brand-navy mb-2">Request Received!</h3>
            <p className="text-gray-600">Thank you. We'll call you back within 10 minutes.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <DialogHeader className="space-y-1">
                <DialogTitle className="text-2xl font-bold text-brand-navy text-center">Get Your Free Roof Inspection</DialogTitle>
                <DialogDescription className="text-center text-gray-600">
                  We'll call you back within 10 minutes to confirm
                </DialogDescription>
              </DialogHeader>
            </div>

            <LeadFormWizard
              config={{
                onSubmit: handleSubmit,
                submitLabel: 'Request Callback',
                headingStep1: 'Project & Contact Basics',
                subStep1: 'Tell us what you need and how to reach you.',
                headingStep2: 'Location & Final Confirmation',
                subStep2: 'Add your postcode and we will do the rest.',
                fieldKeys: {
                  serviceNeeded: 'service_type',
                  roofType: 'roof_type',
                  message: 'message',
                },
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
