'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Film } from "lucide-react";
import { DashboardList } from "@/components/DashboardList"; // Assuming this component will be created

export default function DashboardPage() {
  // Mock data for now, replace with actual data fetching
  const mockVideos = [
    { id: '1', title: 'My First AI Video', thumbnailUrl: 'https://placehold.co/300x200.png', status: 'completed', createdAt: new Date() , dataAiHint: "abstract animation" },
    { id: '2', title: 'Tech Product Demo', thumbnailUrl: 'https://placehold.co/300x200.png', status: 'processing', createdAt: new Date() , dataAiHint: "technology interface"},
    { id: '3', title: 'Travel Vlog Intro', thumbnailUrl: 'https://placehold.co/300x200.png', status: 'failed', createdAt: new Date(), dataAiHint: "travel landscape" },
  ];

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

      {mockVideos.length > 0 ? (
        <DashboardList videos={mockVideos} />
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
