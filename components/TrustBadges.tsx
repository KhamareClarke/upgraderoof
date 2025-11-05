'use client';

import { Shield, Award, Star, CheckCircle } from 'lucide-react';

const badges = [
  {
    icon: Shield,
    title: 'Checkatrade',
    subtitle: 'Approved',
    description: 'Vetted & Verified',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: Award,
    title: 'Confederation of',
    subtitle: 'Roofing Contractors',
    description: 'Certified Member',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: Star,
    title: 'Google Reviews',
    subtitle: '5⭐ Rating',
    description: '50+ Reviews',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    icon: CheckCircle,
    title: 'Fully Insured',
    subtitle: '£10M Coverage',
    description: 'Public Liability',
    color: 'text-brand-orange',
    bgColor: 'bg-orange-50',
  },
];

export function TrustBadges() {
  return (
    <section className="py-12 bg-white">
      <div className="container-custom">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-4">
            Trusted & Accredited
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're proud to be recognized by leading industry bodies and trusted by hundreds of satisfied customers.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="group text-center p-6 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${badge.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <badge.icon className={`w-8 h-8 ${badge.color}`} />
              </div>
              <h3 className="font-semibold text-brand-navy text-sm mb-1">
                {badge.title}
              </h3>
              <p className="font-bold text-brand-navy text-sm mb-2">
                {badge.subtitle}
              </p>
              <p className="text-xs text-gray-500">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
