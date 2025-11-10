import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us | Elite Roofing Cheshire - Get Free Quote',
  description: 'Contact Elite Roofing Cheshire for free quotes and roofing advice. Call 07379 440583 or email. Serving Cheshire and surrounding areas. Fast response guaranteed.',
  keywords: 'contact roofer Cheshire, roofing quote, roofing enquiry, Cheshire roofing contact',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[300px] sm:h-[350px] md:h-[400px] flex items-center justify-center overflow-hidden px-4">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-navy/70" />
        </div>

        <div className="container-custom relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium">
            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Get In Touch</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-2">Contact Us</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-2">
            We're here to help with all your roofing needs
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-4 sm:mb-6">Get a Free Quote</h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6 sm:mb-8">
                Fill out the form below and we'll get back to you within 24 hours with a detailed quote for your roofing project. All quotes are completely free and come with no obligation.
              </p>

              <ContactForm />
            </div>

            <div className="space-y-6 sm:space-y-8 order-1 lg:order-2">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-brand-navy mb-4 sm:mb-6">Contact Information</h3>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-brand-navy mb-1 sm:mb-2">Phone</h4>
                      <a href="tel:01270897606" className="text-sm sm:text-base text-gray-600 hover:text-brand-orange block break-all sm:break-normal">
                        01270 897 606
                      </a>
                      <a href="tel:07379440583" className="text-sm sm:text-base text-gray-600 hover:text-brand-orange block break-all sm:break-normal mt-1">
                        07379 440 583
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-brand-navy mb-1 sm:mb-2">Email</h4>
                      <a href="mailto:upgradehomeimp@yahoo.com" className="text-sm sm:text-base text-gray-600 hover:text-brand-orange break-all sm:break-normal">
                        upgradehomeimp@yahoo.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-brand-navy mb-1 sm:mb-2">Address</h4>
                      <p className="text-sm sm:text-base text-gray-600">
                        1 Hutchins Close<br />
                        Middlewich, Cheshire<br />
                        CW10 0EX<br />
                        United Kingdom
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-brand-navy mb-1 sm:mb-2">Opening Hours</h4>
                      <div className="text-sm sm:text-base text-gray-600 space-y-1">
                        <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                        <p>Saturday: 9:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                        <p className="text-brand-orange font-medium mt-2">24/7 Emergency Services Available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-brand-grey p-4 sm:p-6 rounded-2xl">
                <h4 className="font-semibold text-sm sm:text-base text-brand-navy mb-3 sm:mb-4">Areas We Serve</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-gray-600 text-xs sm:text-sm">
                  {[
                    'Sandbach',
                    'Crewe',
                    'Congleton',
                    'Nantwich',
                    'Alsager',
                    'Haslington',
                    'Middlewich',
                    'Holmes Chapel',
                  ].map((area, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-orange flex-shrink-0"></div>
                      <span className="break-words">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-brand-grey">
        <div className="container-custom">
          <div className="bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Emergency Roofing Services</h2>
            <p className="text-sm sm:text-base md:text-lg text-white/90 mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
              Storm damage? Leak? We offer 24/7 emergency roofing services across Cheshire
            </p>
            <a href="tel:07379440583" className="inline-block w-full sm:w-auto">
              <button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold px-6 sm:px-8 md:px-10 h-12 sm:h-14 text-base sm:text-lg rounded-md transition-colors w-full sm:w-auto">
                <span className="hidden sm:inline">Call Now: </span>07379 440 583
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
