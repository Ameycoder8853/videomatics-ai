
'use client';

import { useQuery } from '@tanstack/react-query';
import Link from "next/link";
import { PlusCircle, Film, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardList, DashboardListSkeleton } from "@/components/DashboardList";
import { useAuth } from '@/contexts/AuthContext';
import { getUserVideos, type VideoDocument } from '@/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: videos, isLoading, isError, error } = useQuery({
    queryKey: ['userVideos', user?.uid],
    queryFn: async () => {
        if (!user) return [];
        const fetchedVideos = await getUserVideos(user.uid);
        // Ensure createdAt is always a Date object for consistent handling
        return fetchedVideos.map(v => ({
            ...v,
            createdAt: v.createdAt instanceof Timestamp ? v.createdAt.toDate() : new Date(v.createdAt as any),
        })) as VideoDocument[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry for specific Firestore permission errors
      if (error.code === 'failed-precondition') return false;
      return failureCount < 2;
    },
    onError: (err: any) => {
      toast({
        title: "Could Not Fetch Videos",
        description: err.message || "A database index may be required. Check browser console for a link.",
        variant: "destructive",
        duration: 10000
      });
    }
  });

  const renderContent = () => {
    if (isLoading) {
      return <DashboardListSkeleton />;
    }

    if (isError) {
      return (
        <Card className="text-center py-10 sm:py-12 bg-destructive/10 border-destructive/30">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="text-xl sm:text-2xl text-destructive-foreground">Failed to Load Videos</CardTitle>
            <CardDescription className="text-destructive-foreground/80">
              {error?.message || "There was an issue fetching your videos. Please try again later."}
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }
    
    if (videos && videos.length > 0) {
      return <DashboardList videos={videos} />;
    }

    return (
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
    );
  };

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

      {renderContent()}
    </div>
  );
}
