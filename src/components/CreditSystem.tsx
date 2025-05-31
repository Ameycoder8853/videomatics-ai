'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Coins, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// import { db } from '@/firebase/config'; // Assuming db is exported from your Firebase config
// import { doc, getDoc, onSnapshot } from 'firebase/firestore'; // For real-time updates

// Mock user credits data structure
interface UserCredits {
  current: number;
  max: number; // e.g., monthly limit or total purchased
}

// Mock function to fetch user credits
const fetchUserCredits = async (userId: string): Promise<UserCredits> => {
  // In a real app, fetch this from Firestore
  console.log('Fetching credits for user:', userId);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  return { current: 75, max: 100 }; // Mock data
};

export function CreditSystem() {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      // Real-time listener (example)
      // const userCreditsRef = doc(db, 'userCredits', user.uid);
      // const unsubscribe = onSnapshot(userCreditsRef, (docSnap) => {
      //   if (docSnap.exists()) {
      //     setCredits(docSnap.data() as UserCredits);
      //   } else {
      //     // Handle case where user has no credits document yet
      //     setCredits({ current: 0, max: 10 }); // Default starter credits
      //   }
      //   setLoading(false);
      // });
      // return () => unsubscribe();

      // Fallback to one-time fetch if real-time is not set up
      fetchUserCredits(user.uid).then(data => {
        setCredits(data);
        setLoading(false);
      }).catch(err => {
        console.error("Failed to fetch credits:", err);
        setLoading(false);
      });

    } else {
      setCredits(null);
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <Coins className="h-5 w-5 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading credits...</span>
      </div>
    );
  }

  if (!user || !credits) {
    return null; // Or show a "Login to see credits" message
  }

  const percentage = credits.max > 0 ? (credits.current / credits.max) * 100 : 0;

  return (
    <Card className="w-full max-w-xs shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-headline flex items-center">
          <Coins className="mr-2 h-5 w-5 text-primary" />
          Your Credits
        </CardTitle>
        <CardDescription>Credits are used for generating videos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <span className="text-3xl font-bold">{credits.current}</span>
          <span className="text-sm text-muted-foreground"> / {credits.max}</span>
        </div>
        <Progress value={percentage} aria-label={`${credits.current} out of ${credits.max} credits used`} className="h-3" />
        <Button className="w-full" variant="outline" size="sm" disabled> {/* Payment disabled for now */}
          <PlusCircle className="mr-2 h-4 w-4" />
          Add More Credits
        </Button>
        <p className="text-xs text-center text-muted-foreground">
          (Razorpay integration coming soon)
        </p>
      </CardContent>
    </Card>
  );
}
