'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Shield } from 'lucide-react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consentChoice = localStorage.getItem('cookie_consent');
    if (!consentChoice) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Apply saved preferences
      const savedPrefs = JSON.parse(consentChoice);
      updateConsent(savedPrefs.analytics, savedPrefs.advertising);
    }
  }, []);

  const updateConsent = (analytics: boolean, advertising: boolean) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': advertising ? 'granted' : 'denied',
        'ad_user_data': advertising ? 'granted' : 'denied',
        'ad_personalization': advertising ? 'granted' : 'denied',
        'analytics_storage': analytics ? 'granted' : 'denied',
      });
    }
  };

  const acceptAll = () => {
    const prefs = { analytics: true, advertising: true };
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    updateConsent(true, true);
    setShowBanner(false);
  };

  const rejectAll = () => {
    const prefs = { analytics: false, advertising: false };
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    updateConsent(false, false);
    setShowBanner(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    updateConsent(preferences.analytics, preferences.advertising);
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Main Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 bg-white border-t border-gray-200 shadow-2xl animate-slide-up">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-5 h-5 text-brand-orange" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">We value your privacy</p>
                <p className="text-sm text-gray-600">
                  We use cookies to enhance your browsing experience, serve personalised ads or content, and analyse our traffic. 
                  By clicking "Accept All", you consent to our use of cookies.{' '}
                  <a href="/privacy" className="text-brand-orange hover:underline">Read our Privacy Policy</a>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              <button
                onClick={() => setShowPreferences(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Customise
              </button>
              <button
                onClick={rejectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="px-6 py-2 text-sm font-medium text-white bg-brand-orange hover:bg-brand-orange/90 rounded-lg transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-brand-orange" />
                  <p className="text-xl font-bold text-gray-900">Cookie Preferences</p>
                </div>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Essential Cookies */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">Essential Cookies</p>
                  <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    Always Active
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies are necessary for the website to function and cannot be switched off. 
                  They are usually only set in response to actions made by you such as setting your privacy preferences.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">Analytics Cookies</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. 
                  They help us know which pages are the most and least popular.
                </p>
              </div>

              {/* Advertising Cookies */}
              <div className="p-4 border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">Advertising Cookies</p>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.advertising}
                      onChange={(e) => setPreferences({ ...preferences, advertising: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-orange/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-600">
                  These cookies may be set through our site by our advertising partners. 
                  They may be used to build a profile of your interests and show you relevant adverts on other sites.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={rejectAll}
                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={savePreferences}
                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-brand-orange hover:bg-brand-orange/90 rounded-xl transition-colors"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
