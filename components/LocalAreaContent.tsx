'use client';

import { MapPin, Home, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface LocalAreaContentProps {
  town: string;
  postcode: string;
  population?: string;
  description: string;
  neighborhoods: string[];
  roofingChallenges: string[];
  commonRoofTypes: string[];
  nearbyAreas: { name: string; href: string }[];
}

export function LocalAreaContent({
  town,
  postcode,
  population,
  description,
  neighborhoods,
  roofingChallenges,
  commonRoofTypes,
  nearbyAreas,
}: LocalAreaContentProps) {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-medium">
              <MapPin className="w-4 h-4" />
              <span>Local Roofing Experts</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">
              Professional Roofing Services in {town}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-brand-orange" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy">Areas We Cover in {town}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {neighborhoods.map((area, index) => (
                  <span key={index} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-gray-200">
                    {area}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Postcode areas: {postcode} {population && `• Population: ~${population}`}
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-brand-orange" />
                </div>
                <h3 className="text-xl font-bold text-brand-navy">Local Roofing Challenges</h3>
              </div>
              <ul className="space-y-2">
                {roofingChallenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-orange flex-shrink-0 mt-1" />
                    <span className="text-gray-700 text-sm">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-brand-navy/5 p-6 rounded-xl mb-12">
            <h3 className="text-xl font-bold text-brand-navy mb-4">Common Roof Types in {town}</h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {commonRoofTypes.map((type, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-100">
                  <p className="font-medium text-brand-navy">{type}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-brand-navy mb-4">
              Also Serving Nearby Areas
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {nearbyAreas.map((area, index) => (
                <Link
                  key={index}
                  href={area.href}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:border-brand-orange hover:text-brand-orange transition-colors"
                >
                  {area.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
