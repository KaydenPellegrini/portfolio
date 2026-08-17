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

const description =
  'Data engineer and AI systems developer in Johannesburg. I build data pipelines and models with dbt and SQL, LLM tooling connected to business systems through Model Context Protocol, and the internal applications and reporting that operations runs on.';

export const metadata: Metadata = {
  metadataBase: new URL(contact.website),
  title: 'Kayden Pellegrini | Data Engineer & AI Systems Developer',
  description,
  openGraph: {
    title: 'Kayden Pellegrini | Data Engineer & AI Systems Developer',
    description,
    type: 'profile',
    url: contact.website,
  },
  icons: {
    icon: '/favicon.ico',
  },
};

/** Person structured data, built from the same profile source as the site copy. */
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
  sameAs: [contact.github, contact.linkedin],
  knowsAbout: [
    'Data engineering',
    'dbt',
    'SQL',
    'Python',
    'Model Context Protocol',
    'Large language model tooling',
    'Power Platform',
    'Power BI',
    'RFID systems',
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
