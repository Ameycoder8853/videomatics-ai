
'use client';

import { useQuery } from '@tanstack/react-query';
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardList, DashboardListSkeleton } from "@/components/DashboardList";
import { useAuth } from '@/contexts/AuthContext';
import { getUserVideos, type VideoDocument } from '@/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { DashboardErrorState } from '@/components/DashboardErrorState';
import { DashboardEmptyState } from '@/components/DashboardEmptyState';

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
      return <DashboardErrorState error={error} />;
    }
    
    if (videos && videos.length > 0) {
      return <DashboardList videos={videos} />;
    }

    return <DashboardEmptyState />;
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
