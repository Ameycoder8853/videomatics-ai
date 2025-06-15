
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Gem, PlayCircle, BrainCircuit, Image as ImageIcon, Mic2, Palette, Zap, Film } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-purple-50 dark:via-purple-900/20 to-background p-6 text-center">
      <main className="container mx-auto px-4 py-8 md:py-16">
        <header className="mb-12 md:mb-20">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <Gem className="h-12 w-12 md:h-16 md:w-16 text-primary" />
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-primary">VividVerse</h1>
          </div>
          <p className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto">
            Unleash your creativity. Generate stunning videos with the power of AI – from script to final cut, all in your browser.
          </p>
        </header>

        <section id="features" className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-10 text-center">Features That Shine</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BrainCircuit className="h-10 w-10 text-accent" />}
              title="AI Scripting"
              description="Craft compelling narratives based on your topic, style, and desired length."
            />
            <FeatureCard
              icon={<ImageIcon className="h-10 w-10 text-accent" />}
              title="Visual Generation"
              description="Bring your script to life with AI-generated images that match your story."
            />
            <FeatureCard
              icon={<Mic2 className="h-10 w-10 text-accent" />}
              title="AI Voiceovers"
              description="Add professional voiceovers using advanced text-to-speech technology."
            />
            <FeatureCard
              icon={<Palette className="h-10 w-10 text-accent" />}
              title="Easy Customization"
              description="Tailor colors, fonts, and pacing to match your brand or vision."
            />
          </div>
        </section>

        <section id="how-it-works" className="mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-10 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              step="1"
              title="Describe Your Video"
              description="Provide a topic, choose a style, and set your desired video length and pace."
              icon={<Zap className="w-8 h-8 text-primary" />}
            />
            <StepCard
              step="2"
              title="AI Generates Assets"
              description="Our AI crafts a script, generates visuals, and creates a voiceover for your story."
              icon={<Film className="w-8 h-8 text-primary" />}
            />
            <StepCard
              step="3"
              title="Preview & Download"
              description="Review your AI-generated video, make tweaks if needed, and download your masterpiece."
              icon={<PlayCircle className="w-8 h-8 text-primary" />}
            />
          </div>
        </section>

        <div className="space-y-6 text-center">
          <Link href="/signup" passHref>
            <Button size="lg" className="w-full sm:w-auto px-10 py-6 text-lg bg-primary hover:bg-primary/90 shadow-lg transform hover:scale-105 transition-transform">
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
      </main>
      
      <footer className="py-8 text-center text-muted-foreground text-sm w-full border-t mt-12 md:mt-20">
        © {new Date().getFullYear()} VividVerse. Create with AI.
      </footer>
    </div>
  );
}

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <Card className="bg-card/80 dark:bg-card/50 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 text-center transform hover:-translate-y-1">
    <div className="flex justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-headline font-semibold mb-2 text-card-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </Card>
);

const StepCard: React.FC<{ step: string, title: string, description: string, icon: React.ReactNode }> = ({ step, title, description, icon }) => (
  <div className="flex flex-col items-center p-6 bg-card/50 dark:bg-card/30 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <div className="text-sm font-bold text-primary mb-1">STEP {step}</div>
    <h3 className="text-lg font-semibold mb-2 text-card-foreground">{title}</h3>
    <p className="text-xs text-center text-muted-foreground">{description}</p>
  </div>
);
