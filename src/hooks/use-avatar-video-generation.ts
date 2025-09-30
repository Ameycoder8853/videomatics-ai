
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { generateAvatarVideoAction } from '@/app/actions';
import type { AIAvatarFormValues } from '@/components/AIAvatarForm';
import { createVideoPlaceholder, updateVideoDocument } from '@/firebase/firestore';

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

  const generateAvatarVideo = async (data: AIAvatarFormValues) => {
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

      // Create a placeholder in Firestore first
      videoId = await createVideoPlaceholder(user.uid);
      await updateVideoDocument(videoId, { title: 'AI Avatar Video (Processing)', topic: 'AI Avatar' });

      const result = await generateAvatarVideoAction({
        script: data.script,
        avatarId: data.avatarId,
      });

      if (!result || !result.videoUrl) {
        throw new Error('AI video generation failed to return a video URL.');
      }
      
      setGeneratedAvatarVideoUrl(result.videoUrl);

      // Final update to Firestore document
      await updateVideoDocument(videoId, {
        title: `AI Avatar: ${data.script.substring(0, 30)}...`,
        status: 'completed',
        // In a real scenario, we'd upload this to our own storage, but for now we'll link to HeyGen's URL
        // This is not ideal for long-term storage as the URL may expire.
        audioUri: result.videoUrl, // Re-using field for simplicity
        totalDurationInFrames: 0, // Not applicable
        imageDurationInFrames: 0, // Not applicable
        thumbnailUrl: 'https://placehold.co/300x200.png?text=Avatar+Video',
      });

      toast({ title: 'Avatar Video Generated!', description: 'Your video is ready for preview and download.' });

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

