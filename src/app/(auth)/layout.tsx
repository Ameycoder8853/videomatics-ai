
'use client';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation'; 
import { Gem, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter(); 

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin rounded-full h-16 w-16 text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link href="/" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
            <Gem className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
            <span className="font-bold font-headline text-xl sm:text-2xl">VividVerse</span>
        </Link>
      </div>
      <div className="w-full max-w-sm sm:max-w-md">
        {children}
      </div>
      {/* Footer is now part of RootLayout for global consistency 
      <footer className="absolute bottom-6 sm:bottom-8 text-center text-muted-foreground text-xs sm:text-sm">
        © {new Date().getFullYear()} VividVerse. Create with AI.
      </footer>
      */}
    </div>
  );
}
