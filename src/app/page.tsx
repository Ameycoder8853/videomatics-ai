'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Gem, PlayCircle, BrainCircuit, Image as ImageIcon, Mic2 } from 'lucide-react'; // Renamed Image to ImageIcon

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      }
      // If not logged in, stay on this page or explicitly redirect to login if desired.
      // For now, this page will serve as the landing page if not logged in.
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  // If user is logged in, they will be redirected by useEffect. Show landing content if not.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-purple-100 dark:to-purple-900 p-6 text-center">
      <header className="mb-12">
        <div className="flex justify-center items-center space-x-3 mb-6">
          <Gem className="h-16 w-16 text-primary" />
          <h1 className="text-6xl font-headline font-bold text-primary">VividVerse</h1>
        </div>
        <p className="text-2xl text-foreground/80 max-w-2xl mx-auto">
          Unleash your creativity. Generate stunning videos with the power of AI – from script to final cut, all in your browser.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
        <div className="bg-card p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
          <BrainCircuit className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-headline font-semibold mb-2">AI Scripting</h3>
          <p className="text-sm text-muted-foreground">Craft compelling narratives based on your topic, style, and desired length.</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
          <ImageIcon className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-headline font-semibold mb-2">Visual Generation</h3>
          <p className="text-sm text-muted-foreground">Bring your script to life with AI-generated images that match your story.</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-300">
          <Mic2 className="h-12 w-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-headline font-semibold mb-2">Voice & Captions</h3>
          <p className="text-sm text-muted-foreground">Add professional voiceovers and accurate captions effortlessly.</p>
        </div>
      </div>

      <div className="space-y-4">
        <Link href="/signup" passHref>
          <Button size="lg" className="w-64 text-lg bg-primary hover:bg-primary/90 shadow-lg transform hover:scale-105 transition-transform">
            Get Started Free
            <PlayCircle className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline font-medium">
            Log In
          </Link>
        </p>
      </div>
      
      <footer className="absolute bottom-8 text-center text-muted-foreground text-sm w-full">
        © {new Date().getFullYear()} VividVerse. Create with AI.
      </footer>
    </div>
  );
}
