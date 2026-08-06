'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { trackPhoneClick } from '@/lib/tracking';

const faqs = [
  {
    question: 'How much does a new roof cost in Cheshire?',
    answer: "Every roof is different, so costs vary depending on size, materials, and the scope of work involved. We provide free, no-obligation quotes with transparent, itemised pricing — no hidden costs, no surprises."
  },
  {
    question: 'How long does a roof replacement take?',
    answer: "Timelines depend on the size and complexity of your roof. We'll give you a clear schedule before any work begins and keep you informed throughout the project."
  },
  {
    question: 'Do you offer emergency roofing services?',
    answer: 'Yes. We offer a 24/7 emergency call-out service across Cheshire and the North West. If you have an urgent leak or storm damage, call us now on 01270 897 606.'
  },
  {
    question: 'What areas of Cheshire do you cover?',
    answer: "We cover Sandbach, Crewe, Middlewich, Congleton, Alsager, Nantwich, Holmes Chapel, and the surrounding areas throughout Cheshire. Give us a call if you're unsure whether we cover your location."
  },
  {
    question: 'What warranty do you offer on roofing work?',
    answer: "All our work is fully guaranteed and we offer Insurance Backed Guarantees for added peace of mind. We'll walk you through the details before any work starts."
  },
  {
    question: 'Can you match existing tiles for repairs?',
    answer: "Yes — tile and slate matching is part of the service. We'll do our best to source materials that blend with your existing roof so repairs are as seamless as possible."
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs sm:text-sm font-medium">
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Frequently Asked Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-3 sm:mb-4 px-2">
              Got Questions? We've Got Answers.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 px-4">
              Can't find what you're looking for? Contact us directly — we're always happy to help.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:border-brand-orange/50 transition-colors"
              >
                <button
                  className="w-full px-4 py-4 sm:px-5 sm:py-5 md:px-6 text-left flex items-center justify-between gap-3 sm:gap-4 group"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-semibold text-brand-navy text-sm sm:text-base md:text-lg group-hover:text-brand-orange transition-colors text-left pr-2">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-brand-orange flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  id={`faq-answer-${index}`}
                  className={`px-4 sm:px-5 md:px-6 overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'pb-4 sm:pb-5 max-h-96' : 'max-h-0'
                  }`}
                  aria-hidden={openIndex !== index}
                >
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 md:mt-12 text-center">
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Still have questions?</p>
            <a
              href="tel:01270897606"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
              onClick={() => trackPhoneClick('faq_section')}
            >
              Call Us: 01270 897 606
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
