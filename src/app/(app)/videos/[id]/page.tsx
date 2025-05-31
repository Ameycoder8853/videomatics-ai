'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, Edit3, Trash2 } from 'lucide-react';
import { RemotionPlayer } from '@/components/RemotionPlayer'; // Placeholder
import { CompositionProps } from '@/remotion/MyVideo'; // Assuming MyVideoProps type from Remotion setup
import { useEffect, useState } from 'react';

// Mock video data structure
interface VideoDetails {
  id: string;
  title: string;
  description: string;
  videoUrl?: string; // This would be the Remotion composition or a rendered URL
  thumbnailUrl: string;
  createdAt: Date;
  script: string;
  imageUri: string;
  audioUri: string;
  captions: string;
  dataAiHint?: string;
}

// Mock fetch function
const fetchVideoDetails = async (id: string): Promise<VideoDetails | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  if (id === '1') {
    return {
      id: '1',
      title: 'My First AI Video',
      description: 'An amazing video generated entirely by AI!',
      thumbnailUrl: 'https://placehold.co/1280x720.png',
      createdAt: new Date(),
      script: "Scene 1: A vibrant abstract animation unfolds...",
      imageUri: "https://placehold.co/1080x1920.png",
      audioUri: "/placeholder-audio.mp3", // Make sure this path is valid or use a full URL
      captions: "This is a caption for the first video.",
      dataAiHint: "abstract animation"
    };
  }
  return null;
};


export default function VideoDetailPage() {
  const params = useParams();
  const videoId = params.id as string;
  const [video, setVideo] = useState<VideoDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (videoId) {
      fetchVideoDetails(videoId).then(data => {
        setVideo(data);
        setLoading(false);
      });
    }
  }, [videoId]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  }

  if (!video) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold">Video Not Found</h1>
        <p className="text-muted-foreground">The video you're looking for doesn't exist or has been moved.</p>
        <Button asChild className="mt-4">
          <Link href="/videos"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Videos</Link>
        </Button>
      </div>
    );
  }
  
  const remotionInputProps: CompositionProps = {
    script: video.script,
    imageUri: video.imageUri,
    audioUri: video.audioUri,
    captions: video.captions,
  };

  return (
    <div className="space-y-8">
      <Link href="/videos" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to My Videos
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">{video.title}</CardTitle>
          <CardDescription>Created on: {new Date(video.createdAt).toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-inner">
            {/* Replace with actual Remotion player or video element */}
            <RemotionPlayer
              compositionId="MyVideo"
              inputProps={remotionInputProps}
              controls
              style={{ width: '100%', height: '100%' }}
              data-ai-hint={video.dataAiHint || "video content"}
            />
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2 font-headline">Video Details</h3>
            <p className="text-sm text-muted-foreground">{video.description}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2 font-headline">Script</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{video.script}</p>
          </div>

          <div className="flex space-x-4 pt-4 border-t">
            <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Download Video</Button>
            <Button variant="outline" disabled><Edit3 className="mr-2 h-4 w-4" /> Edit (Coming Soon)</Button>
            <Button variant="destructive" disabled><Trash2 className="mr-2 h-4 w-4" /> Delete (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
