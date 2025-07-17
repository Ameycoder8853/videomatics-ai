
'use client';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation'; 
import { Gem, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter(); 
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // If the user is authenticated, show a loader while we redirect to the dashboard.
  // This prevents the login/signup form from briefly flashing before the redirect happens.
  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="animate-spin rounded-full h-16 w-16 text-primary" />
        </div>
      </div>
    );
  }

  // If loading is finished and there's no user, or if we are still loading,
  // render the children (login/signup page) immediately for a faster perceived load.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link href="/" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
            <Gem className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <span className="font-bold font-headline text-xl sm:text-2xl">Videomatics AI</span>
        </Link>
      </div>
      <div className="w-full max-w-sm sm:max-w-md">
          <AnimatePresence mode="wait">
              <motion.div
                  key={pathname}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                  {children}
              </motion.div>
          </AnimatePresence>
      </div>
    </div>
  );
}
