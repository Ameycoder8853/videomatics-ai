
import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext'; 
import { Toaster } from '@/components/ui/toaster';
import { Navbar } from '@/components/Navbar'; // Import Navbar here for pages outside (app)

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VividVerse - AI Video Generation',
  description: 'Create stunning videos with AI using VividVerse.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased bg-background text-foreground transition-colors duration-300">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/*
              The Navbar component is now part of the (app) layout and also explicitly included 
              in other top-level page layouts if needed, or managed directly by individual pages.
              For dashboard/page.tsx and other top-level pages not under (app) layout,
              they will need to include Navbar themselves or this RootLayout needs to change.
              For simplicity, I'll make pages like dashboard include it.
              Actually, a better pattern for pages not using a specific group layout (like (app) or (auth))
              is to have a RootLayout structure that includes elements common to *all* pages,
              like Navbar and Footer, if they are truly global.
              Let's add Navbar here for pages like the new /dashboard.
            */}
            <div className="min-h-screen flex flex-col">
              <Navbar /> {/* Navbar for all pages including the new /dashboard and potentially others */}
              <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
                 {children}
              </main>
              {/* Footer could also be here if it's global and not part of (app) or (auth) specific footers */}
               <footer className="py-6 text-center text-muted-foreground text-sm border-t mt-auto">
                © {new Date().getFullYear()} VividVerse. All rights reserved.
              </footer>
            </div>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
