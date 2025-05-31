
'use client';

import Link from 'next/link';
import Image from 'next/image'; // Using next/image
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit3, Trash2, PlayCircle, AlertTriangle, Clock, ServerCrash } from 'lucide-react';
import type { VideoDocument } from '@/firebase/firestore'; // Assuming this interface exists
import { Timestamp } from 'firebase/firestore';

// Interface for videos passed to this component
// Ensure createdAt is Date for consistent formatting
interface DisplayVideo extends Omit<VideoDocument, 'createdAt' | 'scriptDetails' | 'imageUris' | 'audioUri' | 'captions' | 'musicUri' | 'primaryColor' | 'secondaryColor' | 'fontFamily' | 'imageDurationInFrames' | 'totalDurationInFrames'> {
  id: string; // Ensure id is always present
  title: string;
  thumbnailUrl?: string; // Can be optional if some videos don't have it
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date; // For display
  dataAiHint?: string; // For placeholder image hints
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
        return <ServerCrash className="mr-1 h-3 w-3" />; // For pending or other unknown states
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <Card key={video.id} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
          <CardHeader className="p-0 relative">
            <Link href={`/videos/${video.id}`} passHref>
              <div className="aspect-video w-full relative cursor-pointer group">
                <Image
                  src={video.thumbnailUrl || "https://placehold.co/300x200.png"}
                  alt={video.title || 'Video thumbnail'}
                  layout="fill"
                  objectFit="cover"
                  className="group-hover:opacity-80 transition-opacity"
                  data-ai-hint={video.dataAiHint || "video thumbnail"}
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
          <CardFooter className="p-4 border-t bg-muted/20">
            <div className="flex w-full justify-between items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/videos/${video.id}`}>
                  <Eye className="mr-2 h-4 w-4" /> View
                </Link>
              </Button>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" disabled> {/* Edit disabled */}
                  <Edit3 className="h-4 w-4" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" disabled> {/* Delete disabled */}
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

