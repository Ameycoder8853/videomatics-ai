
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { renderVideoAction } from '@/app/actions';
import { getVideoDocument, deleteVideoAndAssets, updateVideoDocument, type VideoDocument } from '@/firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Timestamp } from 'firebase/firestore';
import type { CompositionProps } from '@/remotion/MyVideo';
import { getRenderProgress } from '@remotion/cloudrun';


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

  const cloudRenderMutation = useMutation({
    mutationFn: async (videoToRender: VideoDocument) => {
      if (!videoToRender.id || !videoToRender.scriptDetails) {
        throw new Error("Video data is incomplete for rendering.");
      }

      const remotionPropsForRender: CompositionProps = {
        title: videoToRender.scriptDetails.title,
        sceneTexts: videoToRender.scriptDetails.scenes.map(s => s.contentText),
        imageUris: videoToRender.imageUris,
        audioUri: videoToRender.audioUri,
        musicUri: videoToRender.musicUri,
        captions: videoToRender.captions,
        primaryColor: videoToRender.primaryColor,
        secondaryColor: videoToRender.secondaryColor,
        fontFamily: videoToRender.fontFamily,
        imageDurationInFrames: videoToRender.imageDurationInFrames,
      };

      const result = await renderVideoAction({
        videoId: videoToRender.id,
        compositionId: 'MyVideo',
        inputProps: remotionPropsForRender,
      });

      return result;
    },
    onMutate: () => {
      setIsRendering(true);
      setRenderProgress(0);
      toast({ title: 'Cloud Render Started', description: 'Your video is being rendered on the server. This may take a few minutes.' });
    },
    onSuccess: async (data, videoToRender) => {
      await updateVideoDocument(videoToRender.id!, { renderId: data.renderId, renderUrl: data.videoUrl });
      queryClient.invalidateQueries({ queryKey: ['video', videoToRender.id] });
      toast({ title: 'Render Complete!', description: 'Your video has been successfully rendered.' });
      setIsRendering(false);
      setRenderProgress(1); // Set to 100% on success
    },
    onError: (error: any) => {
      toast({ title: 'Render Failed', description: error.message, variant: 'destructive', duration: 10000 });
      setIsRendering(false);
      setRenderProgress(null);
    },
  });


  const handleCloudRender = async () => {
    if (!video) return;

    if (video.renderUrl) {
      window.open(video.renderUrl, '_blank');
      return;
    }

    cloudRenderMutation.mutate(video);
  };

  const handleDeleteVideo = () => {
      if (!video) return;
      deleteMutation.mutate(video);
  };

  return {
    video,
    isLoading,
    isError,
    isRendering: cloudRenderMutation.isPending || isRendering,
    renderProgress,
    deleteMutation,
    handleCloudRender,
    handleDeleteVideo,
  };
};
