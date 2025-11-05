'use client';

import { useEffect, useState } from 'react';
import { supabase, type GalleryImage } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { GalleryImageSkeleton } from '@/components/LoadingSkeletons';

export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { value: 'all', label: 'All Projects' },
    { value: 'tile-roofs', label: 'Tile Roofs' },
    { value: 'flat-roofs', label: 'Flat Roofs' },
    { value: 'chimneys', label: 'Chimneys' },
    { value: 'gutters', label: 'Gutters' },
    { value: 'skylights', label: 'Skylights' },
    { value: 'cladding', label: 'Cladding' },
  ];

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter(img => img.category === selectedCategory);

  return (
    <section id="gallery" className="section-padding bg-brand-grey">
      <div className="container-custom">
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-3 sm:mb-4 px-2">
            Our Recent Projects
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Take a look at some of our completed roofing projects across Cheshire and the North West.
            Quality workmanship you can trust.
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

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {[...Array(6)].map((_, i) => (
              <GalleryImageSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {filteredImages.map((image) => (
              <div
                key={image.id}
                className="group relative overflow-hidden rounded-lg sm:rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="aspect-[4/3] overflow-hidden bg-gray-200">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 lg:p-6">
                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-1 sm:mb-2 break-words">{image.title}</h3>
                    {image.description && (
                      <p className="text-white/90 text-[10px] sm:text-xs md:text-sm line-clamp-2">{image.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredImages.length === 0 && !loading && (
          <div className="text-center py-8 sm:py-10 md:py-12 px-4">
            <p className="text-sm sm:text-base text-gray-600">No projects found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}