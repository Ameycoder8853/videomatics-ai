
'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardListSkeleton } from '@/components/DashboardList';

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
    // If we are loading, or if we have finished loading but have no user yet (and will redirect),
    // show a skeleton loader. This prevents a flash of nothing or a full page loader.
    if (loading || !user) {
      // Use a generic but representative skeleton. The dashboard skeleton is a good fit.
      return <DashboardListSkeleton />;
    }
    
    // Only render the page content if we have a user.
    if (user) {
      return <PageTransition pathname={pathname}>{children}</PageTransition>;
    }

    return null; // Should be unreachable if logic is correct
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6 sm:py-8">
        {renderContent()}
      </main>
      <footer className="py-6 text-center text-muted-foreground text-sm border-t">
        © {new Date().getFullYear()} Videomatics AI. All rights reserved.
      </footer>
    </div>
  );
}
