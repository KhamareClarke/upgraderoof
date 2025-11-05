'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How much does a new roof cost in Cheshire?',
    answer: 'Roof costs vary depending on size, materials, and complexity. A typical terraced house roof replacement ranges from £5,000-£8,000, while larger detached properties can cost £8,000-£15,000+. We provide free, detailed quotes with no hidden costs.'
  },
  {
    question: 'How long does a roof replacement take?',
    answer: 'Most residential roof replacements take 3-7 days depending on size and weather. Smaller repairs can often be completed in 1-2 days. We provide a detailed timeline during your free consultation.'
  },
  {
    question: 'Do you offer emergency roofing services?',
    answer: 'Yes, we provide 24/7 emergency roofing services throughout Cheshire. Call 07379 440583 for immediate assistance with leaks, storm damage, or urgent repairs.'
  },
  {
    question: 'What areas of Cheshire do you cover?',
    answer: 'We cover all of Cheshire including Sandbach, Crewe, Congleton, Nantwich, Middlewich, Alsager, Holmes Chapel, and surrounding areas throughout the North West.'
  },
  {
    question: 'What warranty do you offer on roofing work?',
    answer: 'We provide a comprehensive 10-year guarantee on all workmanship, backed by manufacturer warranties on materials. All work is fully insured with £10M public liability coverage.'
  },
  {
    question: 'Can you match existing tiles for repairs?',
    answer: 'Yes, we have extensive experience sourcing matching tiles for repairs, including reclaimed tiles for older properties. We always aim to match your existing roof as closely as possible.'
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs sm:text-sm font-medium">
              <HelpCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Common Questions</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-3 sm:mb-4 px-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 px-4">
              Find answers to common roofing questions. Can''t find what you''re looking for? Contact us directly.
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
              href="tel:07379440583"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-2.5 sm:py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base"
            >
              Call Us: 07379 440583
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
