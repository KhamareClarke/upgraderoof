'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function Analytics() {
  useEffect(() => {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Track page views
    const handleRouteChange = () => {
      if (typeof window.gtag !== 'undefined') {
        window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || 'GA_MEASUREMENT_ID', {
          page_location: window.location.href,
          page_title: document.title,
        });
      }
    };

    // Track initial page load
    handleRouteChange();

    // Track route changes (for SPA navigation)
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <>
      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || 'GA_MEASUREMENT_ID'}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || 'GA_MEASUREMENT_ID'}', {
            page_location: window.location.href,
            page_title: document.title,
            send_page_view: true
          });
        `}
      </Script>

      {/* Facebook Pixel */}
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID || 'FB_PIXEL_ID'}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* Microsoft Clarity */}
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID || 'CLARITY_ID'}");
        `}
      </Script>
    </>
  );
}

// Event tracking utilities
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: window.location.pathname,
      ...parameters,
    });
  }
};

export const trackConversion = (conversionType: 'quote_request' | 'phone_call' | 'contact_form', value?: number) => {
  if (typeof window !== 'undefined') {
    // Google Analytics conversion
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: process.env.NEXT_PUBLIC_GA_CONVERSION_ID,
        event_category: 'conversion',
        event_label: conversionType,
        value: value || 0,
        currency: 'GBP',
      });
    }

    // Facebook Pixel conversion
    if (typeof (window as any).fbq !== 'undefined') {
      (window as any).fbq('track', 'Lead', {
        content_category: conversionType,
        value: value || 0,
        currency: 'GBP',
      });
    }
  }
};

export const trackPhoneCall = () => {
  trackConversion('phone_call');
  trackEvent('phone_call_clicked', {
    event_category: 'contact',
    event_label: 'phone_number_click',
  });
};

export const trackQuoteRequest = () => {
  trackConversion('quote_request');
  trackEvent('quote_form_submitted', {
    event_category: 'lead_generation',
    event_label: 'quote_request_form',
  });
};

export const trackContactForm = () => {
  trackConversion('contact_form');
  trackEvent('contact_form_submitted', {
    event_category: 'lead_generation',
    event_label: 'contact_form',
  });
};
