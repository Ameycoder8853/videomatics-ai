
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Film, Loader2 } from "lucide-react";
import { DashboardList } from "@/components/DashboardList";
import { useAuth } from '@/contexts/AuthContext';
import { getUserVideos, VideoDocument } from '@/firebase/firestore';

export default function DashboardPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<VideoDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      getUserVideos(user.uid)
        .then(fetchedVideos => {
          setVideos(fetchedVideos.map(v => ({
            ...v,
            // Ensure createdAt is a Date object if it's a Firestore Timestamp
            createdAt: v.createdAt instanceof Timestamp ? v.createdAt.toDate() : v.createdAt,
          })) as unknown as VideoDocument[]); // Casting because mapping might change type slightly
        })
        .catch(error => {
          console.error("Failed to fetch user videos:", error);
          // Optionally show a toast error
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setVideos([]);
      setIsLoading(false);
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-headline font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your AI-generated videos.</p>
        </div>
        <Link href="/generate" passHref>
          <Button>
            <PlusCircle className="mr-2 h-5 w-5" />
            Create New Video
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Loading your videos...</p>
        </div>
      ) : videos.length > 0 ? (
        // Assuming DashboardList expects `thumbnailUrl` and handles `createdAt` as Date
        // Also casting to any for DashboardList props until its types are fully aligned
        <DashboardList videos={videos as any[]} />
      ) : (
        <Card className="text-center py-12">
          <CardHeader>
            <Film className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <CardTitle className="text-2xl font-headline">No Videos Yet</CardTitle>
            <CardDescription>Start creating your first AI video masterpiece!</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/generate" passHref>
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" />
                Generate Your First Video
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
       {/* Placeholder for CreditSystem component */}
       {/* <CreditSystem /> */}
    </div>
  );
}
