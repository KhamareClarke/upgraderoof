'use client';

import dynamic from 'next/dynamic';
import { FAQ } from './FAQ';

const GoogleReviewsCarousel = dynamic(() => import('./GoogleReviewsCarousel').then(m => m.GoogleReviewsCarousel));
const GallerySlider = dynamic(() => import('./GallerySlider').then(m => m.GallerySlider));
const EnhancedContactSection = dynamic(() => import('./EnhancedContactSection').then(m => m.EnhancedContactSection));

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
