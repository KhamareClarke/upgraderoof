import { Award, Shield, ShieldCheck, Star, Clock } from 'lucide-react';

export function TrustStrip() {
  const accreditations = [
    {
      name: 'Google Reviews',
      icon: Star,
      subtitle: '5 Star Rated',
    },
    {
      name: 'Confederation of Roofing Contractors',
      icon: Award,
      subtitle: 'Approved Member',
    },
    {
      name: 'Insurance Backed Guarantee',
      icon: ShieldCheck,
      subtitle: 'IBG Protected',
    },
    {
      name: 'Freefoam',
      icon: Award,
      subtitle: 'Approved Installer',
    },
    {
      name: 'Marley',
      icon: Award,
      subtitle: 'Registered Installer',
    },
  ];

  // Mobile-only extras moved from hero badges
  const mobileExtras = [
    { name: 'Fully Insured', subtitle: '£10M Cover', icon: Shield },
    { name: 'Accredited', subtitle: '5 Star Rated', icon: Award },
    { name: 'Fast Response', subtitle: '24/7 Emergency', icon: Clock },
  ];

  return (
    <section className="bg-brand-grey py-6 sm:py-8 border-y border-gray-200">
      <div className="container-custom">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Mobile-only items (moved from hero) */}
          {mobileExtras.map((accreditation, index) => {
            const Icon = accreditation.icon;
            return (
              <div key={`m-${index}`} className="flex sm:hidden flex-col items-center text-center min-w-0 flex-1" style={{ minWidth: '100px', maxWidth: '150px' }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-orange/10 rounded-full flex items-center justify-center mb-1.5 sm:mb-2">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-brand-navy break-words">{accreditation.name}</p>
                <p className="text-[10px] sm:text-xs text-gray-600 break-words">{accreditation.subtitle}</p>
              </div>
            );
          })}
          {accreditations.map((accreditation, index) => {
            const Icon = accreditation.icon;
            return (
              <div key={index} className="hidden sm:flex flex-col items-center text-center min-w-0 flex-1 sm:flex-none" style={{ minWidth: '100px', maxWidth: '150px' }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-orange/10 rounded-full flex items-center justify-center mb-1.5 sm:mb-2">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-brand-navy break-words">{accreditation.name}</p>
                <p className="text-[10px] sm:text-xs text-gray-600 break-words">{accreditation.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}