import { ArrowRight } from 'lucide-react';
import { GOOGLE_REVIEW_URL } from '@/lib/contact';
import { GhlReviewsWidget } from '@/components/GhlReviewsWidget';
import { QuoteForm } from '@/components/QuoteForm';

/**
 * Customer-reviews section: "Customer Reviews" kicker, reputationhub live
 * review widget, and a "Leave us a review" action. `reviewCta="quote"` swaps
 * the Google-review link for the quote modal; the default keeps the Google link.
 */
export function ReviewsSection({ reviewCta = 'google' }: { reviewCta?: 'google' | 'quote' }) {
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-8 sm:w-12 bg-brand-orange" aria-hidden="true" />
            <span className="text-brand-orange text-xs sm:text-sm font-semibold uppercase tracking-[0.2em]">Customer Reviews</span>
            <span className="h-px w-8 sm:w-12 bg-brand-orange" aria-hidden="true" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          <GhlReviewsWidget />
        </div>
        <div className="text-center mt-10">
          {reviewCta === 'quote' ? (
            <QuoteForm
              trigger={
                <span className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-brand-orange/90 cursor-pointer">
                  Request a Free Quote <ArrowRight className="w-4 h-4" />
                </span>
              }
            />
          ) : (
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-orange px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-brand-orange/90"
            >
              Leave us a review <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
