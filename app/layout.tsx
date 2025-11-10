import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { StructuredData } from './structured-data';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppButton } from '@/components/WhatsAppButton';
import { ScrollToTop } from '@/components/ScrollToTop';
import { MobileContactBar } from '@/components/MobileContactBar';
import { PerformanceOptimizations } from '@/components/PerformanceOptimizations';
import { Analytics } from '@/components/Analytics';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Professional Roofing Company Stoke-on-Trent | Upgrade Roofing',
  description: 'Expert roofing services in Stoke-on-Trent & Staffordshire. Roof repairs, installations & replacements. 25+ years experience. Free quotes. Call 01782 123456',
  icons: {
    icon: '/images/upgrade_logo.jpeg',
    shortcut: '/images/upgrade_logo.jpeg',
    apple: '/images/upgrade_logo.jpeg',
  },
  keywords: [
    'roofing company Stoke-on-Trent',
    'roof repairs Staffordshire', 
    'flat roofing Stoke-on-Trent',
    'tile roofs Staffordshire',
    'guttering Stoke-on-Trent',
    'emergency roof repairs',
    'roofing contractors near me',
    'skylight installation',
    'cladding Staffordshire',
    'roof replacement',
    'commercial roofing'
  ],
  authors: [{ name: 'Upgrade Roofing Solutions' }],
  creator: 'Upgrade Roofing Solutions',
  publisher: 'Upgrade Roofing Solutions',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://upgrade-main.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Professional Roofing Company Stoke-on-Trent | Upgrade Roofing',
    description: 'Expert roofing services in Stoke-on-Trent & Staffordshire. Roof repairs, installations & replacements. 25+ years experience. Free quotes.',
    url: 'https://upgrade-main.vercel.app',
    siteName: 'Upgrade Roofing Solutions',
    images: [
      {
        url: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1200',
        width: 1200,
        height: 630,
        alt: 'Professional Roofing Services Stoke-on-Trent - Upgrade Roofing',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Roofing Company Stoke-on-Trent | Upgrade Roofing',
    description: 'Expert roofing services in Stoke-on-Trent & Staffordshire. 25+ years experience. Free quotes.',
    images: ['https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={poppins.variable}>
      <head>
        <StructuredData />
        <link rel="icon" href="/images/upgrade_logo.jpeg" type="image/jpeg" />
        <link rel="shortcut icon" href="/images/upgrade_logo.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/upgrade_logo.jpeg" />
        <link
          rel="preload"
          as="image"
          href="https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1280&h=800"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F45B2E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Upgrade Roofing" />
      </head>
      <body className="font-sans antialiased">
        <Analytics />
        <PerformanceOptimizations />
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
        <MobileContactBar />
        <ScrollToTop />
      </body>
    </html>
  );
}
