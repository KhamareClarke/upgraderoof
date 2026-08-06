'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, ZoomIn } from 'lucide-react';

interface GalleryImage {
  id: number;
  image_url: string;
  title: string;
  description: string;
  category: string;
  location: string;
  alt: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    image_url: '/images/1.jpeg',
    title: 'Complete Roof Replacement in Sandbach',
    description: 'Full tile roof replacement on a detached property. New breathable membrane, battens, and Marley Modern tiles installed.',
    category: 'tile-roofs',
    location: 'Sandbach, CW11',
    alt: 'Professional tile roof replacement completed in Sandbach Cheshire showing new Marley Modern tiles',
  },
  {
    id: 2,
    image_url: '/images/2.jpeg',
    title: 'Flat Roof Installation in Crewe',
    description: 'EPDM rubber flat roof installation on garage extension. 20-year guarantee provided.',
    category: 'flat-roofs',
    location: 'Crewe, CW1',
    alt: 'EPDM rubber flat roof installation on garage in Crewe with 20 year guarantee',
  },
  {
    id: 3,
    image_url: '/images/3.jpeg',
    title: 'GRP Fibreglass Flat Roof in Middlewich',
    description: 'Seamless GRP fibreglass flat roof system. Completely waterproof with no joints or seams.',
    category: 'flat-roofs',
    location: 'Middlewich, CW10',
    alt: 'GRP fibreglass flat roof installation in Middlewich showing seamless waterproof finish',
  },
  {
    id: 4,
    image_url: '/images/4.jpeg',
    title: 'Chimney Rebuild in Congleton',
    description: 'Full chimney stack rebuild with new lead flashing and cowl installation. Heritage-style finish.',
    category: 'chimneys',
    location: 'Congleton, CW12',
    alt: 'Chimney stack rebuild in Congleton with new lead flashing and heritage finish',
  },
  {
    id: 5,
    image_url: '/images/5.jpeg',
    title: 'Gutter Replacement in Nantwich',
    description: 'Complete gutter and fascia replacement. New uPVC guttering with leaf guards installed.',
    category: 'gutters',
    location: 'Nantwich, CW5',
    alt: 'New uPVC gutter and fascia replacement in Nantwich with leaf guard protection',
  },
  {
    id: 6,
    image_url: '/images/6.jpeg',
    title: 'Velux Skylight Installation in Holmes Chapel',
    description: 'Two Velux skylights installed in loft conversion. Includes flashing kit and blackout blinds.',
    category: 'skylights',
    location: 'Holmes Chapel, CW4',
    alt: 'Velux skylight installation in Holmes Chapel loft conversion with blackout blinds',
  },
  {
    id: 7,
    image_url: '/images/7.jpeg',
    title: 'Slate Roof Repair in Alsager',
    description: 'Welsh slate roof repair and restoration. Matching reclaimed slates used for seamless finish.',
    category: 'tile-roofs',
    location: 'Alsager, ST7',
    alt: 'Welsh slate roof repair in Alsager using reclaimed slates for authentic finish',
  },
  {
    id: 8,
    image_url: '/images/8.jpeg',
    title: 'Cladding Installation in Crewe',
    description: 'Modern composite cladding installation on commercial property. Low maintenance and durable.',
    category: 'cladding',
    location: 'Crewe, CW2',
    alt: 'Modern composite cladding installation on commercial property in Crewe',
  },
  {
    id: 9,
    image_url: '/images/9.jpeg',
    title: 'Emergency Roof Repair in Sandbach',
    description: 'Storm damage repair completed within 24 hours. Temporary weatherproofing followed by permanent fix.',
    category: 'tile-roofs',
    location: 'Sandbach, CW11',
    alt: 'Emergency storm damage roof repair in Sandbach completed within 24 hours',
  },
  {
    id: 10,
    image_url: '/images/10.jpeg',
    title: 'Lead Valley Repair in Nantwich',
    description: 'Traditional lead valley replacement on period property. Code 5 lead used throughout.',
    category: 'tile-roofs',
    location: 'Nantwich, CW5',
    alt: 'Traditional lead valley replacement on period property in Nantwich using Code 5 lead',
  },
];

export function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  const categories = [
    { value: 'all', label: 'All Projects' },
    { value: 'tile-roofs', label: 'Tile Roofs' },
    { value: 'flat-roofs', label: 'Flat Roofs' },
    { value: 'chimneys', label: 'Chimneys' },
    { value: 'gutters', label: 'Gutters' },
    { value: 'skylights', label: 'Skylights' },
    { value: 'cladding', label: 'Cladding' },
  ];

  const filteredImages = selectedCategory === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.category === selectedCategory);

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

        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              className={`text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 h-8 sm:h-9 md:h-10 ${selectedCategory === category.value ? 'bg-brand-orange hover:bg-brand-orange/90' : 'border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white'}`}
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {filteredImages.map((image) => (
            <article
              key={image.id}
              className="group relative overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              onClick={() => setLightboxImage(image)}
              itemScope
              itemType="https://schema.org/ImageObject"
            >
              <meta itemProp="name" content={image.title} />
              <meta itemProp="description" content={image.description} />
              <meta itemProp="contentLocation" content={image.location} />
              
              <div className="aspect-[4/3] overflow-hidden bg-gray-200">
                <img
                  src={image.image_url}
                  alt={image.alt}
                  title={image.title}
                  loading="lazy"
                  itemProp="contentUrl"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-white/90 p-2 rounded-full">
                  <ZoomIn className="w-5 h-5 text-brand-navy" />
                </div>
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 lg:p-6">
                  <span className="inline-block px-2 py-1 bg-brand-orange text-white text-[10px] sm:text-xs rounded-full mb-2">
                    {image.location}
                  </span>
                  <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2 break-words">
                    {image.title}
                  </h3>
                  <p className="text-white/90 text-[10px] sm:text-xs md:text-sm line-clamp-2">
                    {image.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-8 sm:py-10 md:py-12 px-4">
            <p className="text-sm sm:text-base text-gray-600">No projects found in this category.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-brand-orange transition-colors"
            onClick={() => setLightboxImage(null)}
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div 
            className="max-w-5xl w-full bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.image_url}
              alt={lightboxImage.alt}
              title={lightboxImage.title}
              className="w-full max-h-[70vh] object-contain bg-gray-100"
            />
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-brand-orange text-white text-xs rounded-full">
                  {lightboxImage.location}
                </span>
                <span className="px-3 py-1 bg-brand-navy/10 text-brand-navy text-xs rounded-full capitalize">
                  {lightboxImage.category.replace('-', ' ')}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-brand-navy mb-2">
                {lightboxImage.title}
              </h3>
              <p className="text-gray-600">
                {lightboxImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
