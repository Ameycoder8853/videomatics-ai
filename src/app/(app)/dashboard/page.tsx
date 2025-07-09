
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Film, Loader2 } from "lucide-react";
import { DashboardList } from "@/components/DashboardList";
import { useAuth } from '@/contexts/AuthContext';
import { getUserVideos, VideoDocument } from '@/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user } = useAuth(); // The (app) layout ensures the user is available
  const [videos, setVideos] = useState<VideoDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // The AppLayout handles the case where the user is not logged in.
    if (user) {
      setIsLoading(true);
      getUserVideos(user.uid)
        .then(fetchedVideos => {
          // The data is now pre-sorted by the Firestore query.
          setVideos(fetchedVideos.map(v => ({
            ...v,
            createdAt: v.createdAt instanceof Timestamp ? v.createdAt.toDate() : new Date(v.createdAt as any),
          })) as VideoDocument[]);
        })
        .catch(error => {
          toast({
            title: "Could Not Fetch Videos",
            description: "A database index may be required. Please check the browser console for an error link to create it in Firebase.",
            variant: "destructive",
            duration: 10000
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your videos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
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
