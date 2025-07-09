
'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Download, Trash2, Loader2, AlertTriangle, Info, Image as ImageIcon, FileTextIcon, PaletteIcon, TypeIcon as FontIcon, ClockIcon, MusicIcon, Film } from 'lucide-react';
import { RemotionPlayer } from '@/components/RemotionPlayer';
import type { CompositionProps } from '@/remotion/MyVideo';
import { useEffect, useState } from 'react';
import { getVideoDocument, VideoDocument, deleteVideoAndAssets } from '@/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { handleClientSideRender } from '@/lib/remotion';
import { Timestamp } from 'firebase/firestore';
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


export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const videoId = params.id as string;
  
  const [video, setVideo] = useState<VideoDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRendering, setIsRendering] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (videoId) {
      setLoading(true);
      getVideoDocument(videoId).then(data => {
        if (data) {
          setVideo({
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt as any), // Ensure Date
          } as VideoDocument); 
        } else {
          setVideo(null);
        }
        setLoading(false);
      }).catch(err => {
        toast({ title: "Error", description: "Could not fetch video details.", variant: "destructive"});
        setLoading(false);
      });
    }
  }, [videoId, toast]);

  const onRenderVideo = async () => {
    if (!video || !video.scriptDetails) {
      toast({ title: 'Error', description: 'Video data or script details missing for rendering.', variant: 'destructive' });
      return;
    }
    setIsRendering(true);
    toast({ title: 'Rendering video...', description: 'This might take a moment.'});
    try {
      const remotionPropsForRender: CompositionProps = {
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
      await handleClientSideRender({
        compositionId: 'MyVideo',
        inputProps: remotionPropsForRender,
        totalDurationInFrames: video.totalDurationInFrames, // Pass total duration
      });
      toast({ title: 'Video Rendered!', description: 'Your download should start automatically.' });
    } catch (error: any) {
      toast({ title: 'Render Failed', description: error.message, variant: 'destructive'});
    } finally {
      setIsRendering(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!video || !video.id || !user) return;
    if (video.userId !== user.uid) {
        toast({ title: "Unauthorized", description: "You can only delete your own videos.", variant: "destructive" });
        return;
    }
    setIsDeleting(true);
    toast({title: "Deleting video and associated assets..."});
    try {
        await deleteVideoAndAssets(video);
        toast({ title: "Video Deleted", description: `"${video.title}" has been removed.`, variant: "default" });
        router.push('/dashboard');
    } catch (error: any) {
        toast({ title: "Deletion Failed", description: error.message, variant: "destructive" });
    } finally {
        setIsDeleting(false);
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-primary" /></div>;
  }

  if (!video) {
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
                <Button onClick={onRenderVideo} disabled={isRendering || video.status !== 'completed'} variant="outline" size="sm" className="w-full sm:w-auto">
                    {isRendering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    {isRendering ? 'Rendering...' : 'Download'}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={isDeleting} size="sm" className="w-full sm:w-auto">
                      {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
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
            <div className="bg-muted rounded-lg overflow-hidden shadow-inner w-full max-w-sm mx-auto md:max-w-md" style={{aspectRatio: '9/16'}}>
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
                        data-ai-hint={video.scriptDetails?.scenes[0]?.imagePrompt || "video content"}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-muted-foreground/10 p-4">
                        <Film className="h-16 w-16 sm:h-24 sm:w-24 text-muted-foreground/50 mb-4"/>
                        <p className="text-sm sm:text-base text-muted-foreground text-center">Video preview unavailable.</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Status: {video.status}</p>
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
            <h3 className="font-semibold text-lg sm:text-xl font-headline flex items-center"><Info className="mr-2 h-5 w-5 text-accent"/>Video Configuration</h3>
            
            <dl className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground flex items-center"><ClockIcon className="mr-1.5 h-4 w-4"/>Total Duration:</dt>
                <dd>{(video.totalDurationInFrames / 30).toFixed(1)}s</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground flex items-center"><ClockIcon className="mr-1.5 h-4 w-4"/>Duration/Scene:</dt>
                <dd>{(video.imageDurationInFrames / 30).toFixed(1)}s</dd>
              </div>
               <div className="flex justify-between">
                <dt className="text-muted-foreground flex items-center"><ImageIcon className="mr-1.5 h-4 w-4"/>Scenes/Images:</dt>
                <dd>{video.scriptDetails?.scenes?.length || video.imageUris?.length || 0}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground flex items-center"><PaletteIcon className="mr-1.5 h-4 w-4"/>Primary Color:</dt>
                <dd><div className="w-4 h-4 rounded border" style={{backgroundColor: video.primaryColor}}></div></dd>
              </div>
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground flex items-center"><PaletteIcon className="mr-1.5 h-4 w-4" style={{opacity:0.6}}/>Secondary Color:</dt>
                <dd><div className="w-4 h-4 rounded border" style={{backgroundColor: video.secondaryColor}}></div></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground flex items-center"><FontIcon className="mr-1.5 h-4 w-4"/>Font Family:</dt>
                <dd className="truncate max-w-[100px] sm:max-w-[150px]">{video.fontFamily.split(',')[0]}</dd>
              </div>
              {video.musicUri && video.musicUri !== 'NO_MUSIC_SELECTED' && (
                <div className="flex justify-between">
                    <dt className="text-muted-foreground flex items-center"><MusicIcon className="mr-1.5 h-4 w-4"/>Music:</dt>
                    <dd className="truncate max-w-[100px] sm:max-w-[150px]">{video.musicUri.substring(video.musicUri.lastIndexOf('/') + 1)}</dd>
                </div>
              )}
            </dl>

            {video.imageUris && video.imageUris.length > 0 && (
                 <div className="mt-3 sm:mt-4">
                    <h4 className="font-semibold text-md sm:text-lg mb-2 font-headline flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-accent"/>Generated Images</h4>
                    <div className="grid grid-cols-2 gap-2 max-h-48 sm:max-h-60 overflow-y-auto">
                        {video.imageUris.map((imgUrl, index) => (
                            <div key={index} className="relative aspect-[9/16] rounded-md overflow-hidden shadow">
                                <img src={imgUrl} alt={`Scene ${index + 1}`} className="absolute inset-0 w-full h-full object-cover"/>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {video.audioUri && (
                <div className="mt-3 sm:mt-4">
                    <h4 className="font-semibold text-md sm:text-lg mb-2 font-headline">Voiceover</h4>
                    <audio controls src={video.audioUri} className="w-full">Your browser does not support audio.</audio>
                </div>
            )}
            {video.captions && (
                <div className="mt-3 sm:mt-4">
                    <h4 className="font-semibold text-md sm:text-lg mb-2 font-headline">Transcript</h4>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap p-2 border rounded-md max-h-32 sm:max-h-40 overflow-y-auto">{video.captions}</p>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
