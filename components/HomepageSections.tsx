'use client';

import dynamic from 'next/dynamic';

const GoogleReviewsCarousel = dynamic(() => import('./GoogleReviewsCarousel').then(m => m.GoogleReviewsCarousel));
const GallerySlider = dynamic(() => import('./GallerySlider').then(m => m.GallerySlider));
const FAQ = dynamic(() => import('./FAQ').then(m => m.FAQ));
const EnhancedContactSection = dynamic(() => import('./EnhancedContactSection').then(m => m.EnhancedContactSection));
const SEOAccordion = dynamic(() => import('./SEOAccordion').then(m => m.SEOAccordion));

export function ReviewsBlock() {
  return (
    <>
      <GoogleReviewsCarousel />
    </>
  );
}

export function GalleryBlock() {
  return <GallerySlider />;
}

export function FAQBlock() {
  return <FAQ />;
}

export function ContactBlock() {
  return <EnhancedContactSection />;
}

export function SEOBlock() {
  return <SEOAccordion />;
}
