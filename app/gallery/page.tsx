import type { Metadata } from 'next';
import { Filter } from 'lucide-react';
import { Gallery as GalleryComponent } from '@/components/Gallery';

export const metadata: Metadata = {
  title: 'Roofing Gallery | Elite Roofing Cheshire - Completed Projects',
  description: 'View our portfolio of completed roofing projects across Cheshire. Tile roofs, flat roofs, chimneys, and more. Quality workmanship showcase.',
  keywords: 'roofing gallery, completed projects, roofing portfolio, Cheshire roofing examples',
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative h-[300px] sm:h-[350px] md:h-[400px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-brand-navy via-brand-navy/90 to-brand-navy/70" />
        </div>

        <div className="container-custom relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 mb-3 sm:mb-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm font-medium">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Our Work</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 px-2">Project Gallery</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto px-2">
            Explore our completed roofing projects across Cheshire
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-8 sm:mb-10 md:mb-12 px-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-navy mb-3 sm:mb-4">
              Our <span className="text-brand-orange">Portfolio</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              Browse through our extensive portfolio of roofing projects showcasing quality craftsmanship
            </p>
          </div>

          <GalleryComponent />
        </div>
      </section>
    </div>
  );
}
