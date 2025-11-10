'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { supabase, type ContactMessage } from '@/lib/supabase';

type ContactMessage = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  MessageCircle 
} from 'lucide-react';

export function EnhancedContactSection() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<ContactMessage>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.subject.trim()) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      errors.message = 'Message must be at least 10 characters long';
    }
    
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Call the API route to send email
      const response = await fetch('/api/send-contact', {
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
        const { supabase } = await import('@/lib/supabase');
        await supabase
          .from('contact_messages')
          .insert([formData]);
      } catch (supabaseError) {
        console.warn('Failed to save to Supabase, but email was sent:', supabaseError);
      }

      setSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setValidationErrors({});

      setTimeout(() => {
        setSuccess(false);
      }, 8000);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again or call us directly at 01270 897606');
      console.error('Error submitting contact message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ContactMessage, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <section className="section-padding bg-gradient-to-br from-brand-grey to-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
            Get In Touch
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ready to start your roofing project? Contact us for a free, no-obligation quote.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <Card className="w-full shadow-xl border-0 hover-lift">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-brand-navy">Send Us a Message</CardTitle>
              <CardDescription className="text-base">
                Fill out the form below and we'll get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-navy mb-2">Message Sent Successfully!</h3>
                  <p className="text-gray-600 mb-4">
                    Thank you for contacting us. We'll review your message and get back to you within 24 hours.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setSuccess(false)}
                      className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white"
                    >
                      Send Another Message
                    </Button>
                    <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
                      <a href="tel:07379440583">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-sm font-medium">
                        Full Name *
                      </Label>
                      <Input
                        id="contact-name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="John Smith"
                        className={`transition-colors ${
                          validationErrors.name ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {validationErrors.name && (
                        <p className="text-sm text-red-600">{validationErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-email" className="text-sm font-medium">
                        Email Address *
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="john@example.com"
                        className={`transition-colors ${
                          validationErrors.email ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {validationErrors.email && (
                        <p className="text-sm text-red-600">{validationErrors.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone" className="text-sm font-medium">
                        Phone Number
                      </Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="01270 123456"
                        className={`transition-colors ${
                          validationErrors.phone ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {validationErrors.phone && (
                        <p className="text-sm text-red-600">{validationErrors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-subject" className="text-sm font-medium">
                        Subject *
                      </Label>
                      <Input
                        id="contact-subject"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        placeholder="Roof repair enquiry"
                        className={`transition-colors ${
                          validationErrors.subject ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {validationErrors.subject && (
                        <p className="text-sm text-red-600">{validationErrors.subject}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message" className="text-sm font-medium">
                      Your Message *
                    </Label>
                    <Textarea
                      id="contact-message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Tell us about your roofing project, including property type, approximate size, and any specific requirements..."
                      rows={5}
                      className={`resize-none transition-colors ${
                        validationErrors.message ? 'border-red-500 focus:ring-red-500' : ''
                      }`}
                    />
                    {validationErrors.message && (
                      <p className="text-sm text-red-600">{validationErrors.message}</p>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold h-12 transition-all duration-300 hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Contact Information & Map */}
          <div className="space-y-8">
            {/* Contact Cards */}
            <div className="grid gap-6">
              <Card className="hover-lift border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-brand-orange" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-navy mb-2">Call Us</h3>
                      <p className="text-gray-600 mb-2">Get immediate assistance</p>
                      <a 
                        href="tel:07379440583" 
                        className="text-brand-orange font-semibold hover:underline"
                      >
                        07379 440583
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-navy mb-2">WhatsApp</h3>
                      <p className="text-gray-600 mb-2">Quick messaging</p>
                      <a 
                        href="https://wa.me/447379440583" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-500 font-semibold hover:underline"
                      >
                        Message Us
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-navy mb-2">Email</h3>
                      <p className="text-gray-600 mb-2">Send us an email</p>
                      <a 
                        href="mailto:upgradehomeimp@yahoo.com" 
                        className="text-blue-500 font-semibold hover:underline"
                      >
                        upgradehomeimp@yahoo.com
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover-lift border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-brand-navy mb-2">Business Hours</h3>
                      <div className="text-gray-600 space-y-1">
                        <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
                        <p>Saturday: 9:00 AM - 4:00 PM</p>
                        <p>Sunday: Emergency only</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Area Map */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-brand-navy">
                  <MapPin className="w-5 h-5 text-brand-orange" />
                  Service Area
                </CardTitle>
                <CardDescription>
                  We serve Cheshire and surrounding areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d76832.89194948935!2d-2.4738!3d53.1365!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487a4c5b7c4b0b0b%3A0x0!2sCheshire%2C%20UK!5e0!3m2!1sen!2suk!4v1699000000000!5m2!1sen!2suk"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Upgrade Roofing Service Area - Cheshire"
                  />
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-medium text-brand-navy mb-2">Areas we cover:</p>
                  <p>Sandbach, Crewe, Congleton, Nantwich, Middlewich, Alsager, Holmes Chapel, and surrounding areas throughout Cheshire.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
