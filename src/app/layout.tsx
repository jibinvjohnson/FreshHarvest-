import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'FreshHarvest — Local Farmer Market DBMS',
  description: 'College DBMS Project: Harvest Promise, Fair Pre-Order Allocation, and Surplus Rescue',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#fbf9f4] text-stone-900 antialiased font-sans flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          <Header />
          <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
