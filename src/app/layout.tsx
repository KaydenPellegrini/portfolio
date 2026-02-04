import type { Metadata } from 'next';
import './globals.css'; // keep this if you have global styles

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}