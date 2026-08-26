'use client';

import { BadgeCheck, HardHat, Star, ShieldCheck, FileBadge, Layers, Medal } from 'lucide-react';

const badges = [
  {
    icon: BadgeCheck,
    title: 'MyApproved',
    subtitle: 'Vetted & Verified',
    description: 'Approved',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: HardHat,
    title: 'Confederation of',
    subtitle: 'Roofing Contractors',
    description: 'Approved Member',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Star,
    title: 'Google Reviews',
    subtitle: '5★ · 50+ Reviews',
    description: 'Top Rated',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    icon: ShieldCheck,
    title: 'Fully Insured',
    subtitle: '£10M Public Liability',
    description: 'Protected',
    color: 'text-brand-orange',
    bgColor: 'bg-orange-50',
  },
  {
    icon: FileBadge,
    title: 'Insurance Backed',
    subtitle: 'Guarantee',
    description: 'IBG Protected',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Layers,
    title: 'Freefoam',
    subtitle: 'Approved Installer',
    description: 'Certified',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
  {
    icon: Medal,
    title: 'Marley',
    subtitle: 'Registered Installer',
    description: 'Certified',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
];

export function TrustBadges() {
  return (
    <section className="py-12 md:py-14 lg:py-16">
      <div className="container-custom">
        <div className="text-center mb-10 md:mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="h-px w-12 bg-gray-300" aria-hidden="true" />
            <span className="text-brand-orange font-semibold text-sm uppercase tracking-[0.2em]">Trusted & Accredited</span>
            <span className="h-px w-12 bg-gray-300" aria-hidden="true" />
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-navy mb-5 tracking-tight">
            Recognised by the Industry's Leading Bodies
          </h2>
          <p className="text-lg md:text-xl text-gray-600/80 max-w-3xl mx-auto leading-relaxed">
            Trusted, verified, and independently recognised across the roofing trade.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 md:gap-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="group relative text-center p-6 md:p-8 border border-gray-300 hover:border-brand-navy bg-white transition-colors duration-300"
            >
              <div className="absolute top-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-300 bg-brand-orange" aria-hidden="true" />
              <div className={`w-14 h-14 md:w-16 md:h-16 mx-auto mb-5 ${badge.bgColor} flex items-center justify-center transition-transform duration-500`}>
                <badge.icon className={`w-7 h-7 md:w-8 md:h-8 ${badge.color}`} />
              </div>
              <h3 className="font-semibold text-brand-navy/90 text-lg mb-1.5">
                {badge.title}
              </h3>
              <p className="font-bold text-brand-navy text-xl mb-2">
                {badge.subtitle}
              </p>
              <p className="text-base text-gray-600/70">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
