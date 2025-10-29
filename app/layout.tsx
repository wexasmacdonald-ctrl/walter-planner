import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Address Manager',
  description: 'Paste and manage Canadian addresses in one place.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen">
          <header className="border-b border-blue-100 bg-white/90 shadow-sm backdrop-blur">
            <div className="mx-auto flex max-w-4xl flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Link href="/" className="text-2xl font-semibold text-sky-900">
                  Address Manager
                </Link>
                <p className="text-sm text-sky-700">Quick tools for routes and client addresses.</p>
              </div>
              <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
                <Link
                  href="/clients"
                  className="rounded-full bg-sky-100 px-4 py-2 text-sky-900 transition hover:bg-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                >
                  Clients
                </Link>
                <Link
                  href="/admin"
                  className="rounded-full bg-sky-100 px-4 py-2 text-sky-900 transition hover:bg-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                >
                  Admin
                </Link>
                <Link
                  href="/developer"
                  className="rounded-full bg-sky-100 px-4 py-2 text-sky-900 transition hover:bg-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                >
                  Developer
                </Link>
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-4xl px-6 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
