'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface GalleryImage {
  src: string;
  alt: string;
  title: string;
  location: string;
  category: string;
}

const galleryImages: GalleryImage[] = [
  {
    src: '/images/1.jpeg',
    alt: 'Professional roof repair completed in Sandbach Cheshire by Upgrade Roofs',
    title: 'Roof Repair - Sandbach',
    location: 'Sandbach, CW11',
    category: 'Tile Roofs',
  },
  {
    src: '/images/2.jpeg',
    alt: 'EPDM flat roof installation on garage extension in Crewe',
    title: 'Flat Roof Installation - Crewe',
    location: 'Crewe, CW1',
    category: 'Flat Roofs',
  },
  {
    src: '/images/3.jpeg',
    alt: 'GRP fibreglass flat roof in Middlewich seamless waterproof finish',
    title: 'GRP Flat Roof - Middlewich',
    location: 'Middlewich, CW10',
    category: 'Flat Roofs',
  },
  {
    src: '/images/4.jpeg',
    alt: 'Chimney rebuild with lead flashing in Congleton heritage finish',
    title: 'Chimney Rebuild - Congleton',
    location: 'Congleton, CW12',
    category: 'Chimneys',
  },
  {
    src: '/images/5.jpeg',
    alt: 'Gutter and fascia replacement in Nantwich with leaf guards',
    title: 'Gutter Replacement - Nantwich',
    location: 'Nantwich, CW5',
    category: 'Gutters',
  },
  {
    src: '/images/6.jpeg',
    alt: 'Professional tile roof installation by Upgrade Roofs in Sandbach',
    title: 'Tile Roof Installation - Sandbach',
    location: 'Sandbach, CW11',
    category: 'Tile Roofs',
  },
  {
    src: '/images/7.jpeg',
    alt: 'Welsh slate roof repair in Alsager using reclaimed slates',
    title: 'Slate Roof Repair - Alsager',
    location: 'Alsager, ST7',
    category: 'Tile Roofs',
  },
  {
    src: '/images/8.jpeg',
    alt: 'Composite cladding installation on commercial property Crewe',
    title: 'Cladding Installation - Crewe',
    location: 'Crewe, CW2',
    category: 'Cladding',
  },
  {
    src: '/images/9.jpeg',
    alt: 'Emergency storm damage roof repair in Cheshire completed same day',
    title: 'Emergency Repair - Cheshire',
    location: 'Cheshire',
    category: 'Emergency',
  },
  {
    src: '/images/10.jpeg',
    alt: 'Velux skylight installation in Holmes Chapel loft conversion',
    title: 'Skylight Installation - Holmes Chapel',
    location: 'Holmes Chapel, CW4',
    category: 'Skylights',
  },
];

export function GallerySlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);
  const [slidesPerView, setSlidesPerView] = useState(4);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesPerView(1);
      } else if (window.innerWidth < 768) {
        setSlidesPerView(2);
      } else if (window.innerWidth < 1024) {
        setSlidesPerView(3);
      } else {
        setSlidesPerView(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, galleryImages.length - slidesPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  return (
    <section id="gallery" className="section-padding bg-brand-grey">
      <div className="container-custom">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="h-px w-8 sm:w-12 bg-brand-orange" aria-hidden="true" />
            <span className="text-brand-orange text-xs sm:text-sm font-semibold uppercase tracking-[0.2em]">Our Work</span>
            <span className="h-px w-8 sm:w-12 bg-brand-orange" aria-hidden="true" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-3 sm:mb-4 px-2">
            See the Quality for Yourself
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            From leaks to full roof replacements, see why locals across Cheshire trust Upgrade Roofs.
          </p>
          <div className="mt-6">
            <Link href="/#contact" className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base">
              Get a free quote for your project <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-brand-navy hover:bg-brand-orange hover:text-white transition-all duration-300 -ml-4 sm:-ml-6"
            aria-label="Previous images"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-brand-navy hover:bg-brand-orange hover:text-white transition-all duration-300 -mr-4 sm:-mr-6"
            aria-label="Next images"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Slider Container */}
          <div className="overflow-hidden mx-4 sm:mx-8">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ 
                transform: `translateX(-${currentIndex * (100 / slidesPerView)}%)`,
              }}
            >
              {galleryImages.map((image, index) => {
                // Only render images near the current view for performance
                const isNearView = index >= currentIndex - slidesPerView && index <= currentIndex + (slidesPerView * 2);
                
                return (
                <div
                  key={index}
                  className="flex-shrink-0 px-2"
                  style={{ width: `${100 / slidesPerView}%` }}
                >
                  <article
                    className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => setLightboxImage(image)}
                    itemScope
                    itemType="https://schema.org/ImageObject"
                  >
                    <meta itemProp="name" content={image.title} />
                    <meta itemProp="contentLocation" content={image.location} />
                    
                    <div className="aspect-[4/3] overflow-hidden bg-gray-200 relative">
                      {isNearView ? (
                        <Image
                          src={image.src}
                          alt={image.alt}
                          title={image.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          loading="lazy"
                          quality={50}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMiMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEQA/ANF6d1qC+1O5tIbWRFhRCXZgd25mHAx8wKKUqxNxJYBuf//Z"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 animate-pulse" />
                      )}
                    </div>
                    
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/90 p-2 rounded-full">
                        <ZoomIn className="w-4 h-4 text-brand-navy" />
                      </div>
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                        <span className="inline-block px-2 py-0.5 bg-brand-orange text-white text-[10px] sm:text-xs rounded-full mb-1">
                          {image.location}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          {image.title}
                        </h3>
                      </div>
                    </div>
                  </article>
                </div>
              );
              })}
            </div>
          </div>

        </div>
      </div>

      <div className="text-center mt-10">
        <Link href="/#contact" className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base">
          Get a free quote for your project <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-brand-orange transition-colors z-10"
            onClick={() => setLightboxImage(null)}
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div 
            className="max-w-5xl w-full bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[70vh]">
              <Image
                src={lightboxImage.src}
                alt={lightboxImage.alt}
                title={lightboxImage.title}
                fill
                sizes="100vw"
                quality={85}
                className="object-contain bg-gray-100"
              />
            </div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-brand-orange text-white text-xs rounded-full">
                  {lightboxImage.location}
                </span>
                <span className="px-3 py-1 bg-brand-navy/10 text-brand-navy text-xs rounded-full">
                  {lightboxImage.category}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-brand-navy">
                {lightboxImage.title}
              </h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
