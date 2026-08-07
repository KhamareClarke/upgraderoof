'use client';

import { useState } from 'react';
import { CheckCircle, Award, Shield, Home, Layers, Droplets, Zap, Wrench, ChevronDown } from 'lucide-react';

export function SEOAccordion() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-brand-orange/50"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-brand-orange" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold text-brand-navy">About Upgrade Roofs</h2>
              <p className="text-gray-600 text-sm mt-1">Learn more about our services and expertise</p>
            </div>
          </div>
          <ChevronDown 
            className={`w-6 h-6 text-brand-orange transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <div 
          className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-[5000px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}
        >
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="inline-block px-4 py-2 bg-brand-orange/10 rounded-full mb-4">
                <span className="text-brand-orange font-semibold text-sm">25+ Years of Excellence</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">
                Professional Roofing Services in <span className="text-brand-orange">Cheshire</span>
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Upgrade Roofs has been roofing homes across Cheshire for over 25 years. We're based in Sandbach on Crewe Road, so whether it's a roof in Congleton, Crewe, or Nantwich, we're usually only a short drive away.
              </p>
            </div>

            {/* Two Column Cards */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Expert Contractors Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-brand-orange" />
                  </div>
                  <h4 className="text-2xl font-bold text-brand-navy">Expert Roofing Contractors</h4>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  As CORC (Confederation of Roofing Contractors) certified professionals, our workmanship speaks for itself. Our team of skilled roofers specializes in tile and slate roofing, flat roof installations, chimney repairs, guttering, fascias, and emergency roof repairs.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  We carry £10 million public liability insurance and are fully qualified to work on both homes and commercial buildings — from minor roof repairs to complete roof replacements.
                </p>
              </div>

              {/* Why Choose Us Card */}
              <div className="bg-gradient-to-br from-brand-navy to-brand-navy/90 rounded-2xl shadow-lg p-8 text-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-brand-orange/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-brand-orange" />
                  </div>
                  <h4 className="text-2xl font-bold">Why Choose Upgrade Roofs?</h4>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">25+ Years Experience</strong> - Thousands of successful roofing projects completed across Cheshire</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">CORC Certified</strong> - Fully qualified and certified roofing contractors</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">£10M Insured</strong> - We're covered for whatever a job throws at us</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Free Quotes</strong> - No-obligation quotes with transparent pricing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">24/7 Emergency Service</strong> - Fast response for urgent roof repairs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-brand-orange flex-shrink-0 mt-0.5" />
                    <span><strong className="text-white">Local Roofers</strong> - Based in Sandbach, serving all of Cheshire</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Services Grid */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="text-center mb-10">
                <h4 className="text-3xl font-bold text-brand-navy mb-4">Our Roofing Services in Cheshire</h4>
                <p className="text-gray-600 max-w-3xl mx-auto">
                  From new roof installations to repairs and routine maintenance, we cover the full range of roofing work. Whether it's a job for your home or your business, you'll know exactly what's being done and what it costs.
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-brand-orange/50 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center mb-4">
                    <Home className="w-6 h-6 text-brand-orange" />
                  </div>
                  <h5 className="font-bold text-brand-navy mb-2 text-lg">Tile & Slate Roofing</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">Traditional and modern tile roofing, Welsh slate, concrete tiles, and clay tiles. Expert installation and repairs.</p>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-brand-orange/50 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center mb-4">
                    <Layers className="w-6 h-6 text-brand-orange" />
                  </div>
                  <h5 className="font-bold text-brand-navy mb-2 text-lg">Flat Roofing</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">EPDM rubber roofing, GRP fibreglass roofing, and felt roofing systems. Waterproof guarantees up to 20 years.</p>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-brand-orange/50 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-brand-orange" />
                  </div>
                  <h5 className="font-bold text-brand-navy mb-2 text-lg">Chimney Repairs</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">Chimney repointing, rebuilds, lead flashing, chimney pots, and stack repairs by experienced craftsmen.</p>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-brand-orange/50 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center mb-4">
                    <Droplets className="w-6 h-6 text-brand-orange" />
                  </div>
                  <h5 className="font-bold text-brand-navy mb-2 text-lg">Guttering & Fascias</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">UPVC guttering, fascias, soffits, and downpipes. Repairs, cleaning, and full replacements available.</p>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-brand-orange/50 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-brand-orange" />
                  </div>
                  <h5 className="font-bold text-brand-navy mb-2 text-lg">Emergency Repairs</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">24/7 emergency roofing service for storm damage, leaks, and urgent repairs across Cheshire.</p>
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-brand-orange/50 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center mb-4">
                    <Wrench className="w-6 h-6 text-brand-orange" />
                  </div>
                  <h5 className="font-bold text-brand-navy mb-2 text-lg">Roof Maintenance</h5>
                  <p className="text-gray-600 text-sm leading-relaxed">Regular inspections, moss removal, gutter cleaning, and preventative maintenance to extend roof life.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
