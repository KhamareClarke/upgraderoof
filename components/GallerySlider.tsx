'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import Image from 'next/image';

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
  {
    src: '/images/IMG-20240916-WA0000.jpg',
    alt: 'Roofing project completed by Upgrade Roofs in Cheshire',
    title: 'Roofing Project - Cheshire',
    location: 'Cheshire',
    category: 'Tile Roofs',
  },
  {
    src: '/images/IMG-20241030-WA0000.jpg',
    alt: 'Professional roofing work in progress Sandbach',
    title: 'Roof Work - Sandbach',
    location: 'Sandbach, CW11',
    category: 'Tile Roofs',
  },
  {
    src: '/images/IMG-20241108-WA0004.jpg',
    alt: 'Completed roof installation Crewe area',
    title: 'Roof Installation - Crewe',
    location: 'Crewe, CW1',
    category: 'Tile Roofs',
  },
  {
    src: '/images/IMG-20241115-WA0003.jpg',
    alt: 'Quality roofing craftsmanship Middlewich',
    title: 'Quality Roofing - Middlewich',
    location: 'Middlewich, CW10',
    category: 'Tile Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.52_1947b559.jpg',
    alt: 'Roof repair project Congleton professional finish',
    title: 'Roof Repair - Congleton',
    location: 'Congleton, CW12',
    category: 'Repairs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.52_25d5767d.jpg',
    alt: 'Flat roof waterproofing Nantwich',
    title: 'Flat Roof - Nantwich',
    location: 'Nantwich, CW5',
    category: 'Flat Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.52_3070e212.jpg',
    alt: 'Tile roof restoration Holmes Chapel',
    title: 'Tile Restoration - Holmes Chapel',
    location: 'Holmes Chapel, CW4',
    category: 'Tile Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.52_4b1b18d7.jpg',
    alt: 'Chimney repointing and repair Alsager',
    title: 'Chimney Repair - Alsager',
    location: 'Alsager, ST7',
    category: 'Chimneys',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.52_980ddb1b.jpg',
    alt: 'Gutter cleaning and maintenance Sandbach',
    title: 'Gutter Maintenance - Sandbach',
    location: 'Sandbach, CW11',
    category: 'Gutters',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.52_e8fdd95f.jpg',
    alt: 'Professional roofing team at work Crewe',
    title: 'Roofing Team - Crewe',
    location: 'Crewe, CW1',
    category: 'Tile Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.52_e9aca2cc.jpg',
    alt: 'Roof inspection and assessment Middlewich',
    title: 'Roof Inspection - Middlewich',
    location: 'Middlewich, CW10',
    category: 'Inspections',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.53_003d3c21.jpg',
    alt: 'Lead flashing installation Congleton',
    title: 'Lead Work - Congleton',
    location: 'Congleton, CW12',
    category: 'Lead Work',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.53_6336d6af.jpg',
    alt: 'Fascia and soffit replacement Nantwich',
    title: 'Fascias - Nantwich',
    location: 'Nantwich, CW5',
    category: 'Gutters',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.53_6be5d9aa.jpg',
    alt: 'Complete roof replacement Holmes Chapel',
    title: 'Roof Replacement - Holmes Chapel',
    location: 'Holmes Chapel, CW4',
    category: 'Tile Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.53_c118c125.jpg',
    alt: 'Storm damage repair Alsager emergency service',
    title: 'Storm Repair - Alsager',
    location: 'Alsager, ST7',
    category: 'Emergency',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.53_dbf84946.jpg',
    alt: 'Slate roof maintenance Sandbach',
    title: 'Slate Maintenance - Sandbach',
    location: 'Sandbach, CW11',
    category: 'Tile Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.54_8a48077e.jpg',
    alt: 'Roof valley repair Crewe lead work',
    title: 'Valley Repair - Crewe',
    location: 'Crewe, CW1',
    category: 'Lead Work',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.54_a038d68f.jpg',
    alt: 'Flat roof repair Middlewich EPDM',
    title: 'Flat Roof Repair - Middlewich',
    location: 'Middlewich, CW10',
    category: 'Flat Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.54_ab257b7f.jpg',
    alt: 'Roof tile replacement Congleton',
    title: 'Tile Replacement - Congleton',
    location: 'Congleton, CW12',
    category: 'Tile Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.54_cbd4d281.jpg',
    alt: 'Chimney cowl installation Nantwich',
    title: 'Chimney Cowl - Nantwich',
    location: 'Nantwich, CW5',
    category: 'Chimneys',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.54_e3f2bc59.jpg',
    alt: 'Roofing materials quality workmanship Holmes Chapel',
    title: 'Quality Materials - Holmes Chapel',
    location: 'Holmes Chapel, CW4',
    category: 'Tile Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.55_1e294251.jpg',
    alt: 'Roof ridge repair Alsager',
    title: 'Ridge Repair - Alsager',
    location: 'Alsager, ST7',
    category: 'Repairs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.55_581ab1f8.jpg',
    alt: 'Gutter downpipe installation Sandbach',
    title: 'Downpipes - Sandbach',
    location: 'Sandbach, CW11',
    category: 'Gutters',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.55_6a3edf83.jpg',
    alt: 'Roof flashing repair Crewe waterproofing',
    title: 'Flashing Repair - Crewe',
    location: 'Crewe, CW1',
    category: 'Lead Work',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.55_929330ef.jpg',
    alt: 'Professional roofing service Middlewich',
    title: 'Professional Service - Middlewich',
    location: 'Middlewich, CW10',
    category: 'Tile Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.56_420e66d1.jpg',
    alt: 'Roof ventilation installation Congleton',
    title: 'Ventilation - Congleton',
    location: 'Congleton, CW12',
    category: 'Tile Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.56_5a14b8eb.jpg',
    alt: 'Moss removal and roof cleaning Nantwich',
    title: 'Roof Cleaning - Nantwich',
    location: 'Nantwich, CW5',
    category: 'Maintenance',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.56_848eb65d.jpg',
    alt: 'Roof inspection drone survey Holmes Chapel',
    title: 'Drone Survey - Holmes Chapel',
    location: 'Holmes Chapel, CW4',
    category: 'Inspections',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.56_c8ad1c5f.jpg',
    alt: 'Completed roofing project Alsager satisfied customer',
    title: 'Completed Project - Alsager',
    location: 'Alsager, ST7',
    category: 'Tile Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.57_2a6462b1.jpg',
    alt: 'Roof repair in progress Sandbach',
    title: 'Repair in Progress - Sandbach',
    location: 'Sandbach, CW11',
    category: 'Repairs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.57_2c9b3b50.jpg',
    alt: 'Quality roofing finish Crewe',
    title: 'Quality Finish - Crewe',
    location: 'Crewe, CW1',
    category: 'Tile Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.57_51667db9.jpg',
    alt: 'Roofing expertise Middlewich',
    title: 'Expert Work - Middlewich',
    location: 'Middlewich, CW10',
    category: 'Tile Roofs',
  },
  {
    src: '/images/WhatsApp Image 2024-12-09 at 21.50.57_a3a65185.jpg',
    alt: 'Professional roofing Congleton Cheshire',
    title: 'Professional Roofing - Congleton',
    location: 'Congleton, CW12',
    category: 'Tile Roofs',
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
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-3 sm:mb-4 px-2">
            See the Quality for Yourself
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            From leaks to full roof replacements — see why locals across Cheshire trust Upgrade Roofs.
          </p>
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

          {/* Progress Dots */}
          <div className="flex justify-center gap-1.5 mt-6">
            {Array.from({ length: Math.ceil(galleryImages.length / slidesPerView) }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index * slidesPerView)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / slidesPerView) === index
                    ? 'bg-brand-orange w-6'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide group ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Image Count */}
        <p className="text-center text-sm text-gray-500 mt-4">
          Showing {galleryImages.length} completed projects across Cheshire
        </p>
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
