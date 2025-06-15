
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Film, Loader2 } from "lucide-react";
import { DashboardList } from "@/components/DashboardList";
import { useAuth } from '@/contexts/AuthContext';
import { getUserVideos, VideoDocument } from '@/firebase/firestore';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<VideoDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getUserVideos(user.uid)
        .then(fetchedVideos => {
          setVideos(fetchedVideos.map(v => ({
            ...v,
            createdAt: v.createdAt instanceof Timestamp ? v.createdAt.toDate() : v.createdAt,
          })) as VideoDocument[]);
        })
        .catch(error => {
          console.error("Failed to fetch user videos:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!authLoading) { // If not auth loading and no user, clear videos and stop loading
      setVideos([]);
      setIsLoading(false);
    }
  }, [user, authLoading]);

  if (authLoading || (isLoading && user)) { // Show loading spinner if auth is loading OR if user exists and videos are loading
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground mt-4">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be handled by the redirect, but as a fallback:
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12">
        <p className="text-muted-foreground">Please log in to view your dashboard.</p>
         <Button asChild className="mt-4">
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-0"> {/* Added padding for mobile */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-headline font-bold">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage your AI-generated videos.</p>
        </div>
        <Link href="/generate" passHref>
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
            Create New Video
          </Button>
        </Link>
      </div>

      {videos.length > 0 ? (
        <DashboardList videos={videos} />
      ) : (
        <Card className="text-center py-10 sm:py-12">
          <CardHeader>
            <Film className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
            <CardTitle className="text-xl sm:text-2xl font-headline">No Videos Yet</CardTitle>
            <CardDescription className="text-sm sm:text-base">Start creating your first AI video masterpiece!</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/generate" passHref>
              <Button size="lg" className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                Generate Your First Video
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
