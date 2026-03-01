import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SidebarLatestNews } from '@/components/SidebarLatestNews';

export const metadata: Metadata = {
  title: 'باماخبر | اخبار محلات کشور',
  description: 'پایگاه خبری باماخبر - پوشش اخبار محلات و مناطق کشور',
  metadataBase: new URL('https://bamakhabar.com'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa">
      <body className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col lg:flex-row gap-6 container-custom py-4 sm:py-6">
          <div className="flex-1 min-w-0">{children}</div>
          <SidebarLatestNews />
        </div>
        <Footer />
      </body>
    </html>
  );
}
