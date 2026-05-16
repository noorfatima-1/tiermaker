import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TierMaker - Realtime Collaborative Tier Rankings',
  description:
    'Create and share tier lists in realtime. Collaborate with others to rank items using drag-and-drop.',
  keywords: ['tier maker', 'tier list', 'ranking', 'collaborative', 'realtime'],
  openGraph: {
    title: 'TierMaker - Realtime Collaborative Tier Rankings',
    description: 'Create and share tier lists in realtime with drag-and-drop.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
