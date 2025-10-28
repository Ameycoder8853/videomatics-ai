
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, Trash2, Loader2, AlertTriangle, FileTextIcon, Film, Server } from 'lucide-react';
import { RemotionPlayer } from '@/components/RemotionPlayer';
import type { CompositionProps } from '@/remotion/MyVideo';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { VideoDetailSkeleton } from '@/components/VideoDetailSkeleton';
import { VideoConfiguration } from '@/components/VideoConfiguration';
import { useVideoDetail } from '@/hooks/use-video-detail';
import { Progress } from '@/components/ui/progress';

export default function VideoDetailPage() {
  const router = useRouter();
  const { 
    video, 
    isLoading, 
    isError, 
    isRendering, 
    renderProgress, 
    deleteMutation,
    handleCloudRender, 
    handleDeleteVideo 
  } = useVideoDetail();

  if (isLoading) {
    return <VideoDetailSkeleton />;
  }

  if (isError || !video) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-destructive mb-4" />
        <h1 className="text-xl sm:text-2xl font-bold">Video Not Found</h1>
        <p className="text-sm sm:text-base text-muted-foreground">The video you're looking for doesn't exist or has been moved.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
    );
  }
  
  const remotionPlayerProps: CompositionProps = {
    title: video.scriptDetails?.title || video.title,
    sceneTexts: video.scriptDetails?.scenes.map(s => s.contentText) || [],
    imageUris: video.imageUris || [],
    audioUri: video.audioUri,
    musicUri: video.musicUri,
    captions: video.captions,
    primaryColor: video.primaryColor,
    secondaryColor: video.secondaryColor,
    fontFamily: video.fontFamily,
    imageDurationInFrames: video.imageDurationInFrames,
  };

  const thumbnailUrl = video.thumbnailUrl || video.imageUris?.[0] || 'https://placehold.co/300x200.png';

  const renderDownloadButton = () => {
    if (video.renderUrl) {
      return (
        <Button asChild size="sm" className="w-full sm:w-auto">
          <a href={video.renderUrl} target="_blank" download>
            <Download className="mr-2 h-4 w-4" /> Download Rendered Video
          </a>
        </Button>
      );
    }
    return (
       <Button onClick={handleCloudRender} disabled={isRendering || video.status !== 'completed'} variant="outline" size="sm" className="w-full sm:w-auto">
          {isRendering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Server className="mr-2 h-4 w-4" />}
          {isRendering ? `Rendering...` : 'Render on Cloud'}
      </Button>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <Link href="/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>

      <Card className="shadow-lg">
        <CardHeader className="border-b p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
            <div className="flex-grow">
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-headline leading-tight">{video.title || "Untitled Video"}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Created on: {new Date(video.createdAt).toLocaleDateString()}
              </CardDescription>
              <Badge variant={video.status === 'completed' ? 'default' : video.status === 'failed' ? 'destructive' : 'secondary'} className="mt-2 text-xs capitalize">
                {video.status}
              </Badge>
              {video.status === 'failed' && video.errorMessage && (
                <p className="text-xs text-destructive mt-1">Error: {video.errorMessage}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                {renderDownloadButton()}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleteMutation.isPending} size="sm" className="w-full sm:w-auto">
                      {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the video titled "{video.title || 'this video'}" and all its assets from storage.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteVideo} className="bg-destructive hover:bg-destructive/90">
                        Confirm Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-4 sm:pt-6 p-4 sm:p-6">
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
             {isRendering && renderProgress !== null && (
              <div className="mb-4">
                <p className="text-sm font-medium text-center mb-2">Cloud Rendering Progress: {Math.round(renderProgress * 100)}%</p>
                <Progress value={renderProgress * 100} className="w-full h-3" />
              </div>
            )}
            <div 
              className="bg-muted rounded-lg overflow-hidden shadow-inner w-full max-w-[280px] mx-auto bg-cover bg-center"
              style={{ aspectRatio: '9/16' }}
            >
              {video.status === 'completed' && video.scriptDetails ? (
                  <RemotionPlayer
                      key={video.id + (video.audioUri || '') + video.totalDurationInFrames} 
                      compositionId="MyVideo"
                      inputProps={remotionPlayerProps}
                      controls
                      style={{ width: '100%', height: '100%' }}
                      durationInFrames={video.totalDurationInFrames}
                      fps={30}
                      loop
                      poster={thumbnailUrl}
                      data-ai-hint={video.scriptDetails?.scenes[0]?.imagePrompt || "video content"}
                  />
              ) : (
                  <div 
                      className="w-full h-full flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm p-4" 
                      style={{ 
                          backgroundImage: `url(${thumbnailUrl})`, 
                          backgroundSize: 'cover', 
                          backgroundPosition: 'center' 
                      }}
                  >
                      <div className="w-full h-full flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                          <Film className="h-16 w-16 sm:h-24 sm:w-24 text-white/80 mb-4"/>
                          <p className="text-sm sm:text-base text-white text-center font-semibold">Video Preview Unavailable</p>
                          <p className="text-xs sm:text-sm text-white/80 capitalize">Status: {video.status}</p>
                      </div>
                  </div>
              )}
            </div>

            {video.scriptDetails && (
              <div>
                <h3 className="font-semibold text-lg sm:text-xl mb-2 sm:mb-3 font-headline flex items-center"><FileTextIcon className="mr-2 h-5 w-5 text-accent"/>Script</h3>
                <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto p-2 sm:p-3 bg-muted/30 rounded-md border">
                    {video.scriptDetails.scenes.map((scene, index) => (
                        <div key={index} className="p-2 sm:p-3 border rounded-md bg-background shadow-sm">
                        <h4 className="font-semibold text-primary text-sm">Scene {index + 1}</h4>
                        <p className="mt-1 text-xs sm:text-sm"><strong className="font-medium text-muted-foreground">Visual:</strong> {scene.imagePrompt}</p>
                        <p className="mt-1 text-xs sm:text-sm"><strong className="font-medium text-muted-foreground">Text:</strong> {scene.contentText}</p>
                        </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-1 space-y-3 sm:space-y-4">
            <VideoConfiguration video={video} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
