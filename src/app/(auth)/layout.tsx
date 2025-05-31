'use client';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter }_ from 'next/navigation'; // Corrected import
import { Gem } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter(); // Corrected usage

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }
  
  // If user is already logged in, they will be redirected by the useEffect.
  // Otherwise, show the auth form.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Link href="/" className="absolute top-8 left-8 flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
          <Gem className="h-8 w-8 text-primary" />
          <span className="font-bold font-headline text-2xl">VividVerse</span>
      </Link>
      <div className="w-full max-w-md">
        {children}
      </div>
      <footer className="absolute bottom-8 text-center text-muted-foreground text-sm">
        © {new Date().getFullYear()} VividVerse. Create with AI.
      </footer>
    </div>
  );
}
