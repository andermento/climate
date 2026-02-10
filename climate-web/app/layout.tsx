import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Climate Data Explorer',
  description: 'Explore 272 years of global climate data (1743-2015). Visualize temperature trends, compare countries, and discover climate patterns.',
  keywords: ['climate', 'temperature', 'global warming', 'data visualization', 'weather history'],
  authors: [{ name: 'Anderson XN' }],
  openGraph: {
    title: 'Climate Data Explorer',
    description: 'Explore 272 years of global climate data',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-text min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
