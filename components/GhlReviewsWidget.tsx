'use client';

import Script from 'next/script';

const WIDGET_SRC =
  'https://reputationhub.site/reputation/widgets/review_widget/Lk9anvdNEEpmFiRndNJk?widgetId=69b5695b24ab18f7cd169219';
const WIDGET_SCRIPT = 'https://reputationhub.site/reputation/assets/review-widget.js';

/**
 * Live Google reviews widget for Upgrade Roofs.
 * Renders GHL's reputation iframe (real Google review snippet) inside a
 * fixed, scrollable box. Loads the companion widget script React-safely.
 */
export function GhlReviewsWidget() {
  return (
    <div className="w-full">
      <iframe
        className="lc_reviews_widget block w-full min-w-full h-[500px] sm:h-[520px] border border-gray-200 border-l-4 border-l-brand-navy bg-white"
        src={WIDGET_SRC}
        frameBorder="0"
        scrolling="no"
        loading="lazy"
        title="Upgrade Roofs Google reviews"
      />
      <Script src={WIDGET_SCRIPT} strategy="afterInteractive" />
    </div>
  );
}
