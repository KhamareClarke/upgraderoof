'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase, type ContactMessage } from '@/lib/supabase';
import { trackContactForm, getGclid } from '@/lib/tracking';
import { Loader as Loader2, CircleCheck as CheckCircle2, CircleAlert as AlertCircle } from 'lucide-react';
import { TurnstileWidget } from '@/components/TurnstileWidget';

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ContactMessage>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    roof_type: '',
    service_needed: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Call the API route to send email
      const response = await fetch('/api/send-contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, gclid: getGclid(), turnstileToken, website: honeypot }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      // Also save to Supabase for backup (optional, won't fail if Supabase is down)
      try {
        await supabase
          .from('contact_messages')
          .insert([formData]);
      } catch (supabaseError) {
        console.warn('Failed to save to Supabase, but email was sent:', supabaseError);
      }

      // Track only after confirmed success — capture subject before reset
      trackContactForm({ subject: formData.subject });

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        roof_type: '',
        service_needed: '',
      });
      setTurnstileToken('');

      setTimeout(() => {
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again or call us directly at 01270 897606');
      console.error('Error submitting contact message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ContactMessage, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl">Send Us a Message</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Fill out the form below and we'll get back to you within 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
                {success ? (
                  <div className="py-6 sm:py-8 text-center px-4">
                    <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-lg sm:text-xl font-semibold text-brand-navy mb-2">Message Sent!</h3>
                    <p className="text-sm sm:text-base text-gray-600">Thank you for contacting us. We'll be in touch soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name" className="text-sm sm:text-base">Full Name *</Label>
                        <Input
                          id="contact-name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          required
                          placeholder="John Smith"
                          className="text-sm sm:text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact-email" className="text-sm sm:text-base">Email Address *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          required
                          placeholder="john@example.com"
                          className="text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone" className="text-sm sm:text-base">Phone Number</Label>
                        <Input
                          id="contact-phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="01270 123456"
                          className="text-sm sm:text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contact-subject" className="text-sm sm:text-base">Subject *</Label>
                        <Input
                          id="contact-subject"
                          value={formData.subject}
                          onChange={(e) => handleChange('subject', e.target.value)}
                          required
                          placeholder="Roof repair enquiry"
                          className="text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-roof-type" className="text-sm sm:text-base">Roof Type</Label>
                        <Select value={formData.roof_type} onValueChange={(value) => handleChange('roof_type', value)}>
                          <SelectTrigger className="text-sm sm:text-base">
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
                      <div className="space-y-2">
                        <Label htmlFor="contact-service-needed" className="text-sm sm:text-base">Service Needed</Label>
                        <Select value={formData.service_needed} onValueChange={(value) => handleChange('service_needed', value)}>
                          <SelectTrigger className="text-sm sm:text-base">
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

                    <div className="space-y-2">
                      <Label htmlFor="contact-message" className="text-sm sm:text-base">Your Message *</Label>
                      <Textarea
                        id="contact-message"
                        value={formData.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        required
                        placeholder="Tell us about your roofing project, including property type, approximate size, and any specific requirements..."
                        rows={5}
                        className="text-sm sm:text-base resize-none"
                      />
                    </div>

                    {/* Honeypot field — hidden from humans, visible to bots */}
                    <div className="hidden" aria-hidden="true">
                      <Label htmlFor="contact-website">Website</Label>
                      <Input
                        id="contact-website"
                        type="text"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    <TurnstileWidget onToken={setTurnstileToken} />

                    {error && (
                      <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs sm:text-sm text-red-800 break-words">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold text-sm sm:text-base h-11 sm:h-12"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </Button>
                  </form>
                )}
      </CardContent>
    </Card>
  );
}
