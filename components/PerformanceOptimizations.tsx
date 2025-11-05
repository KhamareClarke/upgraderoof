'use client';

import { useEffect } from 'react';

export function PerformanceOptimizations() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      // Preload hero images
      const heroImages = [
        '/images/6.jpeg',
        '/images/7.jpeg',
        '/images/3.jpeg',
        '/images/1.jpeg'
      ];

      heroImages.forEach((src, index) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        if (index === 0) (link as any).fetchPriority = 'high';
        document.head.appendChild(link);
      });

      // Preload critical fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.as = 'font';
      fontLink.type = 'font/woff2';
      fontLink.href = 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2';
      fontLink.crossOrigin = 'anonymous';
      document.head.appendChild(fontLink);
    };

    // Lazy load non-critical images
    const lazyLoadImages = () => {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              observer.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    };

    // Optimize third-party scripts
    const optimizeThirdPartyScripts = () => {
      // Delay non-critical scripts
      const delayedScripts = [
        'https://www.googletagmanager.com/gtag/js',
        'https://connect.facebook.net/en_US/fbevents.js'
      ];

      setTimeout(() => {
        delayedScripts.forEach(src => {
          const script = document.createElement('script');
          script.src = src;
          script.async = true;
          document.head.appendChild(script);
        });
      }, 3000);
    };

    // Reduce layout shift
    const reduceLayoutShift = () => {
      // Add aspect ratio containers for images
      document.querySelectorAll('img:not([width]):not([height])').forEach(img => {
        const wrapper = document.createElement('div');
        wrapper.style.aspectRatio = '16/9';
        wrapper.style.overflow = 'hidden';
        img.parentNode?.insertBefore(wrapper, img);
        wrapper.appendChild(img);
      });
    };

    // Service Worker registration for caching
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        try {
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registered successfully');
        } catch (error) {
          console.log('Service Worker registration failed:', error);
        }
      }
    };

    // Critical resource hints
    const addResourceHints = () => {
      // DNS prefetch for external domains
      const domains = [
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'images.pexels.com',
        'www.google.com'
      ];

      domains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
      });

      // Preconnect to critical origins
      const preconnectLink = document.createElement('link');
      preconnectLink.rel = 'preconnect';
      preconnectLink.href = 'https://fonts.gstatic.com';
      preconnectLink.crossOrigin = 'anonymous';
      document.head.appendChild(preconnectLink);
    };

    // Initialize optimizations
    preloadCriticalResources();
    lazyLoadImages();
    optimizeThirdPartyScripts();
    reduceLayoutShift();
    registerServiceWorker();
    addResourceHints();

    // Performance monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        // Log Core Web Vitals
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          console.log('Performance Metrics:', {
            FCP: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
            LCP: navigation.loadEventEnd - navigation.loadEventStart,
            CLS: 0, // Would need additional measurement
            FID: 0, // Would need additional measurement
            TTFB: navigation.responseStart - navigation.requestStart
          });
        }, 1000);
      });
    }

  }, []);

  return null; // This component doesn't render anything
}

// Utility function to create optimized image URLs
export const getOptimizedImageUrl = (
  src: string, 
  width: number, 
  height?: number, 
  quality: number = 85
): string => {
  // For Pexels images, add optimization parameters
  if (src.includes('pexels.com')) {
    const url = new URL(src);
    url.searchParams.set('auto', 'compress');
    url.searchParams.set('cs', 'tinysrgb');
    url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    return url.toString();
  }
  
  // For local images, return as-is (Next.js Image component will handle optimization)
  return src;
};

// Critical CSS inlining utility
export const inlineCriticalCSS = () => {
  const criticalCSS = `
    .hero-section { min-height: 100vh; }
    .fade-in-up { animation: fadeInUp 0.6s ease-out; }
    .container-custom { max-width: 1280px; margin: 0 auto; padding: 0 1rem; }
    @media (min-width: 640px) { .container-custom { padding: 0 1.5rem; } }
    @media (min-width: 1024px) { .container-custom { padding: 0 2rem; } }
  `;

  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.appendChild(style);
  }
};
