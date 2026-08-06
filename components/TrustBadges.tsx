'use client';

import { Shield, Award, Star, CheckCircle } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'MyApproved',
    subtitle: 'Vetted & Verified',
    description: 'Approved',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Award,
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
    icon: CheckCircle,
    title: 'Fully Insured',
    subtitle: '£10M Public Liability',
    description: 'Protected',
    color: 'text-brand-orange',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Shield,
    title: 'Insurance Backed',
    subtitle: 'Guarantee',
    description: 'IBG Protected',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: CheckCircle,
    title: 'Freefoam',
    subtitle: 'Approved Installer',
    description: 'Certified',
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
  {
    icon: Award,
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
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brand-navy mb-5 tracking-tight">
            Trusted & Accredited
          </h2>
          <p className="text-lg md:text-xl text-gray-600/80 max-w-3xl mx-auto leading-relaxed">
            Trusted, verified, and recognised by the industry's leading bodies.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 md:gap-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="group text-center p-6 md:p-8 rounded-2xl border border-gray-200/60 hover:border-gray-300 hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
            >
              <div className={`w-16 h-16 md:w-18 md:h-18 mx-auto mb-5 rounded-full ${badge.bgColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-500`}>
                <badge.icon className={`w-8 h-8 md:w-9 md:h-9 ${badge.color}`} />
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
