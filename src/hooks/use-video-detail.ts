
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { handleClientSideRender } from '@/lib/remotion';
import { getVideoDocument, deleteVideoAndAssets, type VideoDocument } from '@/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';
import type { CompositionProps } from '@/remotion/MyVideo';

export const useVideoDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoId = params.id as string;
  
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<number | null>(null);

  const { data: video, isLoading, isError } = useQuery({
    queryKey: ['video', videoId],
    queryFn: async (): Promise<VideoDocument | null> => {
      if (!videoId) return null;
      const data = await getVideoDocument(videoId);
      if (!data) throw new Error("Video not found.");
      return {
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt as any),
      } as VideoDocument;
    },
    enabled: !!videoId,
    staleTime: 1000 * 60 * 5,
    retry: false,
    onError: (err: any) => {
        toast({ title: "Error", description: err.message || "Could not fetch video details.", variant: "destructive"});
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (videoToDelete: VideoDocument) => {
        if (!videoToDelete.id || !user || videoToDelete.userId !== user.uid) {
            throw new Error("Unauthorized or invalid video data for deletion.");
        }
        return deleteVideoAndAssets(videoToDelete);
    },
    onSuccess: (_, deletedVideo) => {
        toast({ title: "Video Deleted", description: `"${deletedVideo.title}" has been removed.` });
        queryClient.invalidateQueries({ queryKey: ['userVideos'] });
        queryClient.removeQueries({ queryKey: ['video', deletedVideo.id] });
        router.push('/dashboard');
    },
    onError: (error: any) => {
        toast({ title: "Deletion Failed", description: error.message, variant: "destructive" });
    },
  });

  const onRenderVideo = async () => {
    if (!video || !video.scriptDetails) {
      toast({ title: 'Error', description: 'Video data or script details missing for rendering.', variant: 'destructive' });
      return;
    }
    setIsRendering(true);
    setRenderProgress(0);
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
        onProgress: ({ progress }) => setRenderProgress(progress),
        totalDurationInFrames: video.totalDurationInFrames,
      });
      toast({ title: 'Video Rendered!', description: 'Your download should start automatically.' });
    } catch (error: any) {
      toast({ title: 'Render Failed', description: error.message, variant: 'destructive'});
    } finally {
      setIsRendering(false);
      setRenderProgress(null);
    }
  };

  const handleDeleteVideo = () => {
      if (!video) return;
      deleteMutation.mutate(video);
  };

  return {
    video,
    isLoading,
    isError,
    isRendering,
    renderProgress,
    deleteMutation,
    onRenderVideo,
    handleDeleteVideo,
  };
};
