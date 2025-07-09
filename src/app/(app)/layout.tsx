'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth is resolved and there's no user, redirect to login.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // We render the main layout shell immediately.
  // The content area will show a loader if auth is pending or the user is not yet available.
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        {loading || !user ? (
          <div className="flex items-center justify-center h-full min-h-[calc(100vh-15rem)]">
            <Loader2 className="animate-spin rounded-full h-16 w-16 text-primary" />
          </div>
        ) : (
          children
        )}
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm border-t">
        © {new Date().getFullYear()} VividVerse. All rights reserved.
      </footer>
      <Toaster />
    </div>
  );
}
