
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { generateAvatarVideoAction } from '@/app/actions';
import type { AIAvatarFormValues } from '@/components/AIAvatarForm';
import { createVideoPlaceholder, updateVideoDocument } from '@/firebase/firestore';
import { uploadDataUriToStorage } from '@/firebase/storage';

export const useAvatarVideoGeneration = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedAvatarVideoUrl, setGeneratedAvatarVideoUrl] = useState<string | null>(null);

  const resetState = () => {
    setIsLoading(false);
    setLoadingStep('');
    setGeneratedAvatarVideoUrl(null);
  };

  const generateAvatarVideo = async (data: AIAvatarFormValues & { script: string }) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in.', variant: 'destructive' });
      return;
    }

    resetState();
    setIsLoading(true);
    let videoId: string | null = null;

    try {
      setLoadingStep('Submitting video job...');
      toast({ title: 'Generating AI Avatar Video', description: 'This process can take several minutes. Please wait.' });

      videoId = await createVideoPlaceholder(user.uid);
      await updateVideoDocument(videoId, { title: 'AI Avatar Video (Processing)', topic: data.topic, status: 'processing' });

      const result = await generateAvatarVideoAction({
        script: data.script,
        avatarId: data.avatarId,
      });

      if (!result || !result.videoUrl) {
        throw new Error('AI video generation failed to return a video URL.');
      }
      
      setGeneratedAvatarVideoUrl(result.videoUrl);

      // Now we upload the HeyGen video to our own storage for persistence
      setLoadingStep('Saving video to cloud...');
      const videoDownloadUrl = await uploadDataUriToStorage(result.videoUrl, `ai-avatar-videos/${user.uid}/${videoId}/video.mp4`);

      await updateVideoDocument(videoId, {
        title: `AI Avatar: ${data.topic.substring(0, 30)}...`,
        status: 'completed',
        // We use 'audioUri' to store the final video URL for simplicity in the VideoDocument model
        audioUri: videoDownloadUrl, 
        totalDurationInFrames: 0, 
        imageDurationInFrames: 0,
        thumbnailUrl: 'https://placehold.co/300x200.png?text=Avatar+Video', 
      });

      toast({ title: 'Avatar Video Generated & Saved!', description: 'Your video is ready for preview and download.' });

    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred during avatar video generation.';
      toast({ title: 'Generation Failed', description: errorMessage, variant: 'destructive', duration: 15000 });
      if (videoId) {
        await updateVideoDocument(videoId, { status: 'failed', errorMessage });
      }
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return {
    isLoading,
    loadingStep,
    generatedAvatarVideoUrl,
    generateAvatarVideo,
  };
};

