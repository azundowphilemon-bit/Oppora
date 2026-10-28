import type { Metadata } from 'next';
import './globals.css';
import { OpporaProvider } from '@/components/OpporaProvider';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { GlobalModals } from '@/components/GlobalModals';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oppora-pi.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Oppora — Opportunities, Housing & Community Across Ghana',
    template: '%s | Oppora Ghana',
  },
  description:
    'Connect across all 16 regions of Ghana with verified scholarships, jobs, internships, community-shared accommodation, free item give & exchange, and practical mentoring. 100% free, zero payment processing.',
  keywords: [
    'Ghana opportunities',
    'Ghana scholarships',
    'Accra internships',
    'Kumasi accommodation sharing',
    'North East Region Nalerigu Walewale Kpasenkpe',
    'community give and exchange Ghana',
    'career mentoring Ghana',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_GH',
    url: siteUrl,
    siteName: 'Oppora',
    title: 'Oppora — Opportunities, Housing & Community Across Ghana',
    description:
      'Trusted community platform connecting people across all 16 regions of Ghana with verified opportunities, housing, free item exchange, and mutual help.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Oppora',
    url: siteUrl,
    description:
      'Opportunities, Accommodation, Community Give & Exchange, and Community Help across Ghana and Africa.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-screen w-full max-w-[100vw] overflow-x-hidden flex flex-col bg-ivory-50 text-charcoal-900">
        <OpporaProvider>
          <Navbar />
          <main
            id="main-content"
            className="flex-1 w-full max-w-full px-3 sm:px-6 lg:px-10 py-6 sm:py-8"
          >
            {children}
          </main>
          <Footer />
          <GlobalModals />
        </OpporaProvider>
      </body>
    </html>
  );
}
