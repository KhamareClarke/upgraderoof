import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Home, 
  Wrench, 
  Shield, 
  Zap, 
  Droplets, 
  Sun, 
  Building,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

const quickServices = [
  {
    title: 'Emergency Roof Repairs',
    icon: Wrench,
    link: '/services/roof-repairs',
    keywords: ['roof repairs Stoke-on-Trent', 'emergency roof repairs', 'roof leak repairs'],
    urgent: true,
    color: 'bg-red-500'
  },
  {
    title: 'Tile & Slate Roofing',
    icon: Home,
    link: '/services/tile-slate-roofing',
    keywords: ['tile roofs Cheshire', 'slate roofing Staffordshire', 'traditional roofing'],
    color: 'bg-blue-500'
  },
  {
    title: 'Flat Roofing',
    icon: Shield,
    link: '/services/flat-roofing',
    keywords: ['flat roofing Stoke-on-Trent', 'EPDM roofing', 'flat roof specialists'],
    color: 'bg-green-500'
  },
  {
    title: 'Guttering & Fascias',
    icon: Droplets,
    link: '/services/gutters-fascias',
    keywords: ['guttering Cheshire', 'fascia repairs', 'gutter installation'],
    color: 'bg-cyan-500'
  },
  {
    title: 'Skylights & Windows',
    icon: Sun,
    link: '/services/skylights-roof-windows',
    keywords: ['skylight installation', 'Velux windows', 'roof windows'],
    color: 'bg-yellow-500'
  },
  {
    title: 'Chimney Repairs',
    icon: Zap,
    link: '/services/chimney-repairs',
    keywords: ['chimney repairs Staffordshire', 'chimney restoration', 'pointing'],
    color: 'bg-orange-500'
  },
  {
    title: 'Cladding',
    icon: Building,
    link: '/services/cladding',
    keywords: ['cladding Stoke-on-Trent', 'wall cladding', 'external cladding'],
    color: 'bg-purple-500'
  }
];

interface ServiceQuickAccessProps {
  variant?: 'grid' | 'list' | 'compact';
  showKeywords?: boolean;
  title?: string;
  description?: string;
}

export function ServiceQuickAccess({ 
  variant = 'grid', 
  showKeywords = true,
  title = "Our Services",
  description = "Professional roofing services across Cheshire & Staffordshire"
}: ServiceQuickAccessProps) {
  
  if (variant === 'compact') {
    return (
      <div className="bg-brand-grey p-6 rounded-xl">
        <h3 className="font-bold text-brand-navy mb-4">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quickServices.map((service) => (
            <Button
              key={service.title}
              variant="outline"
              size="sm"
              className="justify-start text-xs"
              asChild
            >
              <Link href={service.link}>
                <service.icon className="w-3 h-3 mr-1" />
                {service.title.split(' ')[0]}
              </Link>
            </Button>
          ))}
        </div>
        <div className="mt-4">
          <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white" asChild>
            <Link href="/all-services">
              View All Services
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-brand-navy mb-2">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
        
        <div className="space-y-3">
          {quickServices.map((service) => (
            <div key={service.title} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${service.color} flex items-center justify-center`}>
                  <service.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-navy">{service.title}</h3>
                  {showKeywords && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {service.keywords.slice(0, 2).map((keyword, idx) => (
                        <span key={idx} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white" asChild>
                <Link href={service.link}>
                  View
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" asChild>
            <Link href="/all-services">
              View Complete Service List
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Default grid variant
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-brand-navy mb-4">{title}</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">{description}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickServices.map((service) => (
          <Card key={service.title} className={`hover-lift transition-all duration-300 ${service.urgent ? 'ring-2 ring-red-500' : ''}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${service.color} flex items-center justify-center`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-brand-navy">{service.title}</CardTitle>
                  {service.urgent && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">
                      24/7 Emergency
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {showKeywords && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-brand-navy mb-2">Local Keywords:</h4>
                  <div className="flex flex-wrap gap-1">
                    {service.keywords.map((keyword, idx) => (
                      <span key={idx} className="px-2 py-1 bg-brand-grey text-brand-navy text-xs rounded-md border">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <Button className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold" asChild>
                <Link href={service.link}>
                  View Service Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button size="lg" className="bg-brand-navy hover:bg-brand-navy/90 text-white font-bold px-8 py-4" asChild>
          <Link href="/all-services">
            View All Services & Keywords
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Location-specific service keywords for easy reference
export const locationKeywords = {
  cheshire: [
    'roofing services Cheshire',
    'roof repairs Cheshire', 
    'flat roofing Cheshire',
    'tile roofs Cheshire',
    'guttering Cheshire',
    'skylight installation Cheshire',
    'chimney repairs Cheshire',
    'cladding Cheshire'
  ],
  staffordshire: [
    'roofing services Staffordshire',
    'roof repairs Staffordshire',
    'flat roofing Staffordshire', 
    'tile roofs Staffordshire',
    'guttering Staffordshire',
    'skylight installation Staffordshire',
    'chimney repairs Staffordshire',
    'cladding Staffordshire'
  ],
  stokeOnTrent: [
    'roofing company Stoke-on-Trent',
    'roof repairs Stoke-on-Trent',
    'flat roofing Stoke-on-Trent',
    'tile roofs Stoke-on-Trent', 
    'guttering Stoke-on-Trent',
    'skylight installation Stoke-on-Trent',
    'chimney repairs Stoke-on-Trent',
    'cladding Stoke-on-Trent'
  ]
};
