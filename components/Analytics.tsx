'use client';

/**
 * Analytics — TAG INITIALIZATION ONLY
 *
 * Loads: Google Consent Mode V2 → GTM → GA4 (direct) → Google Ads global site tag
 *
 * GTM  : GTM-5LMDG3F7
 * GA4  : G-7V452FMYFY
 * Ads  : AW-8479028400
 *
 * Conversion events are pushed to window.dataLayer from lib/tracking.ts.
 * GTM listens for those events and fires GA4 event tags + Ads conversion tags.
 */

import React from 'react';
import Script from 'next/script';
import { captureClickIds } from '@/lib/tracking';

const GTM_ID         = process.env.NEXT_PUBLIC_GTM_ID         || 'GTM-5LMDG3F7';
const GA4_ID         = process.env.NEXT_PUBLIC_GA4_ID         || 'G-7V452FMYFY';
const GADS_ID        = process.env.NEXT_PUBLIC_GADS_ID        || 'AW-8479028400';
const GADS_CONV_ID   = process.env.NEXT_PUBLIC_GADS_CONV_ID   || 'AW-17763560213';
// Low-value engagement-click conversion action (phone/WhatsApp taps). Falls
// back to the lead-form ID until a dedicated action exists in Google Ads.
const GADS_CLICK_CONV_ID = process.env.NEXT_PUBLIC_GADS_CLICK_CONV_ID || GADS_CONV_ID;

export function Analytics() {
  // Capture gclid/gbraid/wbraid from the landing URL into localStorage so
  // form submissions can attach it for Google Ads offline conversions.
  React.useEffect(() => {
    captureClickIds();
  }, []);

  return (
    <>
      {/* ── 1. Google Consent Mode V2 ─────────────────────────────────────
          Must fire synchronously BEFORE any tags to comply with EU/UK consent
          requirements. All ad/analytics storage defaults to denied until a
          consent signal is received (e.g. via a cookie banner updating consent). */}
      <Script id="google-consent-mode" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}

          gtag('consent', 'default', {
            'ad_storage':             'denied',
            'ad_user_data':           'denied',
            'ad_personalization':     'denied',
            'analytics_storage':      'denied',
            'functionality_storage':  'granted',
            'personalization_storage':'denied',
            'security_storage':       'granted',
            'wait_for_update':        500
          });

          gtag('set', 'url_passthrough',   true);
          gtag('set', 'ads_data_redaction', true);
        `}
      </Script>

      {/* ── 2. Google Tag Manager ─────────────────────────────────────────
          Primary container. All GA4 event tags and Ads conversion tags should
          be configured inside GTM and fired from dataLayer events. */}
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${GTM_ID}');
        `}
      </Script>

      {/* ── 3. GA4 direct config tag ─────────────────────────────────────
          Belt-and-braces: fires GA4 page_view even if GTM is blocked or
          misconfigured. GTM's GA4 tags will deduplicate automatically. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA4_ID}', {
            page_path: window.location.pathname,
            send_page_view: true,
            transport_url: 'https://www.google-analytics.com',
            first_party_collection: true
          });
        `}
      </Script>

      {/* ── 4. Google Ads global site tag ────────────────────────────────
          Two configs:
          - AW-8479028400 : account-level (remarketing, call extensions)
          - AW-17763560213: conversion tag for "Submit lead forms" — Google
            matches this against the /special-offer URL pattern automatically,
            no event snippet or conversion label required. */}
      <Script id="google-ads-config" strategy="afterInteractive">
        {`
          gtag('config', '${GADS_ID}');
          gtag('config', '${GADS_CONV_ID}');
          gtag('config', '${GADS_CLICK_CONV_ID}');
        `}
      </Script>
    </>
  );
}
