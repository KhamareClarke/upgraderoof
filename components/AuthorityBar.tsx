import { Medal, ShieldCheck, CheckCircle, Star } from 'lucide-react';

const AUTHORITY = [
  { icon: Medal, label: 'CORC Certified' },
  { icon: ShieldCheck, label: '£10M Public Liability Insured' },
  { icon: CheckCircle, label: 'IBG Insurance-Backed Guarantee' },
  { icon: Star, label: '5-Star Google · MyApproved Verified' },
] as const;

/**
 * Unified trust/authority bar. One bordered strip reused across
 * templates and area pages so accreditation signals stay consistent.
 */
export function AuthorityBar() {
  return (
    <section className="bg-gray-50 py-6 border-b border-gray-200">
      <div className="container-custom">
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-sm text-gray-700">
          {AUTHORITY.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-brand-orange" />
                <span className="font-semibold">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
