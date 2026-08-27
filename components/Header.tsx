'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuoteForm } from '@/components/QuoteForm';
import { CtaSubMessage } from '@/components/CtaSubMessage';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ignoreHoverRef = useRef(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickOutsideEnabledRef = useRef(false);
  const useClickOnlyRef = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!clickOutsideEnabledRef.current) return;
      
      const target = event.target as HTMLElement;
      const dropdown = target.closest('.services-dropdown');
      if (!dropdown) {
        setServicesOpen(false);
        clickOutsideEnabledRef.current = false;
      }
    };

    if (servicesOpen) {
      // Add delay to prevent immediate close on the same click that opened it
      const timeoutId = setTimeout(() => {
        clickOutsideEnabledRef.current = true;
        document.addEventListener('click', handleClickOutside, true);
      }, 200);
      return () => {
        clearTimeout(timeoutId);
        clickOutsideEnabledRef.current = false;
        document.removeEventListener('click', handleClickOutside, true);
      };
    } else {
      clickOutsideEnabledRef.current = false;
    }
  }, [servicesOpen]);

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Scroll spy functionality
  useEffect(() => {
    if (!mounted) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50);

      // Only run scroll spy on home page
      if (window.location.pathname !== '/') return;

      const sections = ['hero', 'services', 'about', 'gallery', 'reviews', 'contact'];
      const sectionElements = sections.map(id => document.getElementById(id)).filter(Boolean);
      
      let currentSection = 'home';
      
      for (const element of sectionElements) {
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = element.id === 'hero' ? 'home' : element.id;
            break;
          }
        }
      }
      
      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [mounted]);

  const services = [
    { name: 'All Services', href: '/services' },
    { name: 'Tile & Slate Roofs', href: '/services/tile-slate-roofing' },
    { name: 'Flat Roofs', href: '/services/flat-roofing' },
    { name: 'Chimney Repairs', href: '/services/chimney-repairs' },
    { name: 'Gutters & Fascias', href: '/services/gutters-fascias' },
    { name: 'Skylights & Windows', href: '/services/skylights-roof-windows' },
    { name: 'Cladding', href: '/services/cladding' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200/40 shadow-sm">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-20 lg:h-22">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/upgrade_logo.png"
              alt="Upgrade Roofs - Professional Roofers Cheshire"
              width={72}
              height={72}
              className="w-16 h-16 lg:w-18 lg:h-18 object-contain transition-all duration-300"
              priority
            />
          </Link>

          <div className="hidden lg:flex items-center space-x-10 xl:space-x-12">
            <Link 
              href="/" 
              className={`transition-colors duration-300 font-medium text-sm tracking-wide ${
                activeSection === 'home' 
                  ? 'text-brand-orange' 
                  : 'text-brand-navy/80 hover:text-brand-orange'
              }`}
            >
              <span className="text-base">Home</span>
            </Link>
            <Link 
              href="/about" 
              className={`transition-colors duration-300 font-medium text-sm tracking-wide ${
                activeSection === 'about' 
                  ? 'text-brand-orange' 
                  : 'text-brand-navy/80 hover:text-brand-orange'
              }`}
            >
              <span className="text-base">About</span>
            </Link>

            <div
              className="relative services-dropdown"
              onMouseEnter={() => {
                if (!useClickOnlyRef.current) {
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = null;
                  }
                  setServicesOpen(true);
                }
              }}
              onMouseLeave={() => {
                if (!useClickOnlyRef.current && !ignoreHoverRef.current) {
                  hoverTimeoutRef.current = setTimeout(() => {
                    setServicesOpen(false);
                  }, 200);
                }
              }}
            >
              <button
                type="button"
                className="flex items-center space-x-1 text-brand-navy/80 hover:text-brand-orange transition-colors duration-300 font-medium text-base tracking-wide"
                onClick={(e) => {
                  e.stopPropagation();
                  
                  // Switch to click-only mode after first click
                  useClickOnlyRef.current = true;
                  
                  // Clear any pending hover timeout
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = null;
                  }
                  
                  // Toggle dropdown
                  setServicesOpen((prev) => !prev);
                }}
              >
                <span>Services</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${servicesOpen ? 'rotate-180' : ''}`} />
              </button>

              {servicesOpen && (
                <div
                  className="absolute top-full left-0 mt-3 w-72 bg-white rounded-xl shadow-lg border border-gray-100/50 py-3 z-50"
                  onMouseEnter={() => {
                    if (hoverTimeoutRef.current) {
                      clearTimeout(hoverTimeoutRef.current);
                      hoverTimeoutRef.current = null;
                    }
                    if (!useClickOnlyRef.current) {
                      setServicesOpen(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (!useClickOnlyRef.current) {
                      hoverTimeoutRef.current = setTimeout(() => {
                        setServicesOpen(false);
                      }, 200);
                    }
                  }}
                >
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      className="block px-5 py-3.5 text-sm text-brand-navy/80 hover:bg-brand-grey hover:text-brand-orange transition-all duration-200"
                      onClick={() => setServicesOpen(false)}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link 
              href="/gallery" 
              className={`transition-colors duration-300 font-medium text-sm tracking-wide ${
                activeSection === 'gallery' 
                  ? 'text-brand-orange' 
                  : 'text-brand-navy/80 hover:text-brand-orange'
              }`}
            >
              <span className="text-base">Gallery</span>
            </Link>
            <Link href="/blog" className="text-brand-navy/80 hover:text-brand-orange transition-colors duration-300 font-medium text-base tracking-wide">
              <span className="text-base">Blog</span>
            </Link>
            <Link 
              href="/reviews" 
              className={`transition-colors duration-300 font-medium text-sm tracking-wide ${
                activeSection === 'reviews' 
                  ? 'text-brand-orange' 
                  : 'text-brand-navy/80 hover:text-brand-orange'
              }`}
            >
              <span className="text-base">Reviews</span>
            </Link>
            <Link 
              href="/contact" 
              className={`transition-colors duration-300 font-medium text-sm tracking-wide ${
                activeSection === 'contact' 
                  ? 'text-brand-orange' 
                  : 'text-brand-navy/80 hover:text-brand-orange'
              }`}
            >
              <span className="text-base">Contact</span>
            </Link>

            <QuoteForm />
          </div>

          <button
            className="lg:hidden text-brand-navy"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-6 space-y-5 border-t border-gray-100/50">
            <Link
              href="/"
              className="block text-brand-navy/80 hover:text-brand-orange transition-colors duration-300 font-medium text-base tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block text-brand-navy/80 hover:text-brand-orange transition-colors duration-300 font-medium text-base tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="space-y-2">
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="flex items-center justify-between text-brand-navy/80 hover:text-brand-orange transition-colors duration-300 font-medium text-base tracking-wide w-full"
              >
                <span>Services</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${mobileServicesOpen ? 'rotate-180' : ''}`} />
              </button>
              {mobileServicesOpen && (
                <div className="pl-4 space-y-4 pt-3">
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      className="block text-base text-brand-navy/80 hover:text-brand-orange transition-colors duration-200 py-1"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setMobileServicesOpen(false);
                      }}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/gallery"
              className="block text-brand-navy/80 hover:text-brand-orange transition-colors duration-300 font-medium text-base tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/blog"
              className="block text-brand-navy/80 hover:text-brand-orange transition-colors duration-300 font-medium text-base tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/reviews"
              className="block text-brand-navy/80 hover:text-brand-orange transition-colors duration-300 font-medium text-base tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              Reviews
            </Link>
            <Link
              href="/contact"
              className="block text-brand-navy/80 hover:text-brand-orange transition-colors duration-300 font-medium text-base tracking-wide"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <QuoteForm trigger={
              <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold w-full">
                Get a Free Quote
              </Button>
            } />
            <CtaSubMessage />
          </div>
        )}
      </nav>
    </header>
  );
}
