
'use client';

import Link from 'next/link';
import Image from 'next/image'; 
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, PlayCircle, AlertTriangle, Clock, ServerCrash } from 'lucide-react';
import type { VideoDocument } from '@/firebase/firestore'; 
import { Skeleton } from '@/components/ui/skeleton';

interface DisplayVideo extends Omit<VideoDocument, 'createdAt' | 'scriptDetails' | 'imageUris' | 'audioUri' | 'captions' | 'musicUri' | 'primaryColor' | 'secondaryColor' | 'fontFamily' | 'imageDurationInFrames' | 'totalDurationInFrames'> {
  id: string; 
  title: string;
  thumbnailUrl?: string; 
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date; 
  dataAiHint?: string; 
}

interface DashboardListProps {
  videos: DisplayVideo[];
}

export function DashboardList({ videos }: DashboardListProps) {
  const getStatusBadgeVariant = (status: DisplayVideo['status']) => {
    switch (status) {
      case 'completed':
        return 'default'; 
      case 'processing':
        return 'secondary'; 
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: DisplayVideo['status']) => {
    switch (status) {
      case 'completed':
        return <PlayCircle className="mr-1 h-3 w-3" />;
      case 'processing':
        return <Clock className="mr-1 h-3 w-3 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="mr-1 h-3 w-3" />;
      default:
        return <ServerCrash className="mr-1 h-3 w-3" />; 
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <Card 
            key={video.id} 
            className="flex flex-col overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-card hover:scale-[1.03] dark:hover:border-primary/50"
        >
          <CardHeader className="p-0 relative">
            <Link href={`/videos/${video.id}`} passHref>
              <div className="aspect-video w-full relative cursor-pointer group">
                <Image
                  src={video.thumbnailUrl || "https://placehold.co/300x200.png"}
                  alt={video.title || 'Video thumbnail'}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:opacity-80 transition-opacity duration-300"
                  data-ai-hint={video.dataAiHint || "video thumbnail"}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <PlayCircle className="h-12 w-12 text-white" />
                </div>
              </div>
            </Link>
          </CardHeader>
          <CardContent className="p-4 flex-grow">
            <CardTitle className="text-lg font-headline mb-1 truncate text-card-foreground">
              <Link href={`/videos/${video.id}`} className="hover:text-primary transition-colors">
                {video.title || "Untitled Video"}
              </Link>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mb-2">
              Created: {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'N/A'}
            </CardDescription>
            <Badge variant={getStatusBadgeVariant(video.status)} className="text-xs capitalize flex items-center w-fit">
              {getStatusIcon(video.status)}
              {video.status || "unknown"}
            </Badge>
          </CardContent>
          <CardFooter className="p-4 border-t bg-muted/20 dark:bg-card-foreground/5">
            <div className="flex w-full justify-between items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/videos/${video.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> View
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}


export function DashboardListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="flex flex-col overflow-hidden">
          <CardHeader className="p-0 relative">
             <Skeleton className="aspect-video w-full" />
          </CardHeader>
          <CardContent className="p-4 flex-grow space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-1/4 rounded-full" />
          </CardContent>
          <CardFooter className="p-4 border-t bg-muted/20 dark:bg-card-foreground/5">
            <Skeleton className="h-9 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
