import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Real-Time Geo-Sync',
  description: 'Synchronize map movements between Tracker and Tracked in real-time',
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
