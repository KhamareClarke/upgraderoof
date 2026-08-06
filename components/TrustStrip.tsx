import { Award, Shield, ShieldCheck, Star, Clock } from 'lucide-react';

export function TrustStrip() {
  const accreditations = [
    {
      name: 'MyApproved',
      icon: ShieldCheck,
      subtitle: 'Vetted & Verified',
    },
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
    <section className="py-8 sm:py-10 md:py-12 border-b border-gray-200/40">
      <div className="container-custom">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-16">
          {/* Mobile-only items (moved from hero) */}
          {mobileExtras.map((accreditation, index) => {
            const Icon = accreditation.icon;
            return (
              <div key={`m-${index}`} className="flex sm:hidden flex-col items-center text-center min-w-0 flex-1" style={{ minWidth: '100px', maxWidth: '150px' }}>
                <div className="w-12 h-12 bg-brand-orange/8 rounded-full flex items-center justify-center mb-2">
                  <Icon className="w-6 h-6 text-brand-orange" />
                </div>
                <p className="text-xs font-semibold text-brand-navy/90 break-words">{accreditation.name}</p>
                <p className="text-[11px] text-gray-600/70 break-words">{accreditation.subtitle}</p>
              </div>
            );
          })}
          {accreditations.map((accreditation, index) => {
            const Icon = accreditation.icon;
            return (
              <div key={index} className="hidden sm:flex flex-col items-center text-center min-w-0 flex-1 sm:flex-none" style={{ minWidth: '120px', maxWidth: '160px' }}>
                <div className="w-14 h-14 bg-brand-orange/8 rounded-full flex items-center justify-center mb-3">
                  <Icon className="w-7 h-7 text-brand-orange" />
                </div>
                <p className="text-sm font-semibold text-brand-navy/90 break-words">{accreditation.name}</p>
                <p className="text-xs text-gray-600/70 break-words mt-0.5">{accreditation.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
