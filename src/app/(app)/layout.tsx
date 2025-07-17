
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PageTransition = ({ children, pathname }: { children: ReactNode, pathname: string }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full min-h-[calc(100vh-15rem)]">
          <Loader2 className="animate-spin rounded-full h-16 w-16 text-primary" />
        </div>
      );
    }
    if (user) {
      return <PageTransition pathname={pathname}>{children}</PageTransition>;
    }
    return null; // Don't render anything if no user and not loading (will be redirected)
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        {renderContent()}
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm border-t">
        © {new Date().getFullYear()} VividVerse. All rights reserved.
      </footer>
    </div>
  );
}
