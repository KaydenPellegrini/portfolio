import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { contact, identity } from '@/data/cv/profile';
import './globals.css'; // keep this if you have global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

// Recruiters search on role names, so "Data Engineer" and "Power Platform" are
// both in the title. The card image comes from src/app/opengraph-image.tsx.
const title = 'Kayden Pellegrini | Data Engineer, Power Platform and AI Systems';
const description =
  'Data engineer in Johannesburg working across Dataverse, Power Platform, Power BI and Sage, with LLM tooling connected to live business systems through Model Context Protocol.';

export const metadata: Metadata = {
  metadataBase: new URL(contact.website),
  title,
  description,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title,
    description,
    type: 'profile',
    url: contact.website,
    siteName: 'kayden.co.za',
    locale: 'en_ZA',
    firstName: 'Kayden',
    lastName: 'Pellegrini',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

/** Person structured data, built from the same facts as the site and the CV. */
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: identity.name,
  jobTitle: identity.title,
  url: contact.website,
  email: `mailto:${contact.email}`,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Johannesburg',
    addressRegion: 'Gauteng',
    addressCountry: 'ZA',
  },
  nationality: [
    { '@type': 'Country', name: 'Italy' },
    { '@type': 'Country', name: 'South Africa' },
  ],
  sameAs: [contact.github, contact.linkedin],
  knowsAbout: [
    'Data engineering',
    'Data modelling',
    'SQL',
    'Python',
    'dbt',
    'Dataverse',
    'Power Platform',
    'Power BI',
    'Model Context Protocol',
    'RFID',
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reading the per-request nonce set in src/proxy.ts is what opts these pages
  // into dynamic rendering, which is what lets Next stamp the same nonce onto
  // its own inline bootstrap scripts. Without it the strict CSP blocks them and
  // nothing on the page hydrates.
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
