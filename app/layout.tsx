import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // 1. Import the font
import './globals.css';

// 2. Configure the font
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Paisley Project Tracker',
  description: 'Scope and Agreement Tracking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* 3. Apply the font class to the body */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}