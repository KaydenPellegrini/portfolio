import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
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

export const metadata: Metadata = {
  title: 'Kayden Pellegrini | Power BI & Full-Stack Developer',
  description: 'Power BI / Power Platform specialist transitioning to modern full-stack development with Next.js, React, TypeScript, and Node.js.',
  icons: {
    icon: '/favicon.ico', // we'll add a real one in step 3
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}
        <Analytics />
      </body>
    </html>
  );
}