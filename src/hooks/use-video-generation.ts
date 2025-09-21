
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { generateScriptAction, generateImagesAction, generateAudioAction, generateCaptionsAction } from '@/app/actions';
import type { GenerateVideoScriptOutput } from '@/ai/flows/generate-video-script';
import type { CompositionProps } from '@/remotion/MyVideo';
import { myVideoSchema } from '@/remotion/MyVideo';
import { staticFile } from 'remotion';
import { createVideoPlaceholder, updateVideoDocument, VideoDocument } from '@/firebase/firestore';
import { uploadDataUriToStorage } from '@/firebase/storage';
import type { VideoFormValues } from '@/components/VideoForm';

const getAudioDuration = (audioDataUri: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve(30); 
      return;
    }
    const audio = new Audio();
    audio.src = audioDataUri;
    const timer = setTimeout(() => {
      if (audio.readyState === 0 || isNaN(audio.duration)) {
        console.warn("Audio metadata loading timed out. Falling back to default duration.");
        resolve(30);
        audio.onerror = null;
        audio.onloadedmetadata = null;
      }
    }, 5000); 

    audio.onloadedmetadata = () => {
      clearTimeout(timer);
      resolve(audio.duration);
    };
    audio.onerror = (e) => {
      clearTimeout(timer);
      console.error("Failed to load audio metadata:", e);
      reject(new Error('Failed to load audio metadata.'));
    };
  });
};

export const useVideoGeneration = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  
  const [scriptResult, setScriptResult] = useState<GenerateVideoScriptOutput | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [generatedAudioUri, setGeneratedAudioUri] = useState<string | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<string | null>(null);
  
  const [remotionProps, setRemotionProps] = useState<CompositionProps | null>(null);
  const [playerDurationInFrames, setPlayerDurationInFrames] = useState<number>(300);

  const defaultImageDurationInFramesHint = myVideoSchema.shape.imageDurationInFrames.parse(undefined);

  const resetState = () => {
    setIsLoading(false);
    setLoadingStep('');
    setScriptResult(null);
    setGeneratedImages(null);
    setGeneratedAudioUri(null);
    setGeneratedCaptions(null);
    setRemotionProps(null);
    setPlayerDurationInFrames(300);
  };

  const generateVideo = async (data: VideoFormValues) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to generate videos.', variant: 'destructive' });
      return;
    }
    
    resetState();
    setIsLoading(true);

    let videoId: string | null = null;
    let currentScript: GenerateVideoScriptOutput | null = null;
    
    try {
      // 1. Generate Script
      setLoadingStep('Generating script...');
      toast({ title: 'Generating script...', description: 'AI is crafting your narrative.' });
      const imageDurationInSecondsHint = Math.round((data.imageDurationInFrames || defaultImageDurationInFramesHint) / 30);
      currentScript = await generateScriptAction({
        topic: data.topic, style: data.style, duration: data.duration, imageDurationInSeconds: imageDurationInSecondsHint,
      });
      if (!currentScript || !currentScript.scenes?.length) throw new Error('Script generation failed or returned no scenes.');
      setScriptResult(currentScript);
      toast({ title: 'Script generated!', description: `"${currentScript.title}" with ${currentScript.scenes.length} scenes.` });

      // 2. Generate Audio
      setLoadingStep('Generating voiceover...');
      const fullScriptText = currentScript.scenes.map(scene => scene.contentText).join(' ');
      if (!fullScriptText.trim()) throw new Error('Script content is empty, cannot generate audio.');
      const { audioUrl: localAudioUri } = await generateAudioAction({ text: fullScriptText });
      setGeneratedAudioUri(localAudioUri);
      toast({ title: 'Voiceover generated!' });

      // 3. Calculate Durations
      setLoadingStep('Analyzing audio...');
      let actualAudioDurationInSeconds = 30;
      try {
        actualAudioDurationInSeconds = await getAudioDuration(localAudioUri);
      } catch (audioError) {
        toast({title: "Audio Duration Warning", description: "Using estimated timing. Video sync might be affected.", variant: "default"});
      }
      const totalVideoDurationInFramesCalculated = Math.ceil(actualAudioDurationInSeconds * 30);
      const finalSceneDurationInFrames = Math.max(30, Math.ceil(totalVideoDurationInFramesCalculated / currentScript.scenes.length));
      setPlayerDurationInFrames(totalVideoDurationInFramesCalculated);
      
      // 4. Generate Captions
      setLoadingStep('Generating captions...');
      const { transcript: localCaptions } = await generateCaptionsAction({ audioDataUri: localAudioUri });
      setGeneratedCaptions(localCaptions);
      if (localCaptions) toast({ title: 'Captions generated!' });

      // 5. Generate Images
      setLoadingStep(`Generating ${currentScript.scenes.length} images...`);
      const imagePrompts = currentScript.scenes.map(scene => scene.imagePrompt);
      const { imageUrls: localImageUris } = await generateImagesAction({ prompts: imagePrompts });
      setGeneratedImages(localImageUris);
      toast({ title: `${localImageUris.length} Images generated!` });
      
      // 6. Prepare Remotion Props
      const currentRemotionProps: CompositionProps = {
        title: currentScript.title,
        sceneTexts: currentScript.scenes.map(s => s.contentText),
        imageUris: localImageUris,
        audioUri: localAudioUri,
        musicUri: data.musicUri === 'NO_MUSIC_SELECTED' ? undefined : (data.musicUri || staticFile('placeholder-music.mp3')),
        captions: localCaptions,
        primaryColor: data.primaryColor || myVideoSchema.shape.primaryColor.parse(undefined),
        secondaryColor: data.secondaryColor || myVideoSchema.shape.secondaryColor.parse(undefined),
        fontFamily: data.fontFamily || myVideoSchema.shape.fontFamily.parse(undefined),
        imageDurationInFrames: finalSceneDurationInFrames,
      };
      setRemotionProps(currentRemotionProps);

      // 7. Save to Firebase
      setLoadingStep('Saving video...');
      videoId = await createVideoPlaceholder(user.uid);
      
      setLoadingStep('Uploading voiceover...');
      const audioDownloadUrl = await uploadDataUriToStorage(localAudioUri, `ai-short-video-files/${user.uid}/${videoId}/audio.wav`);
      
      const imageDownloadUrls: string[] = [];
      for (let i = 0; i < localImageUris.length; i++) {
        setLoadingStep(`Uploading image ${i + 1} of ${localImageUris.length}...`);
        const downloadUrl = localImageUris[i].startsWith('data:image')
          ? await uploadDataUriToStorage(localImageUris[i], `ai-short-video-files/${user.uid}/${videoId}/image_${i}.png`)
          : localImageUris[i];
        imageDownloadUrls.push(downloadUrl);
      }
      
      setLoadingStep('Finalizing...');
      const videoToSave: Partial<VideoDocument> = {
        userId: user.uid, title: currentScript.title, topic: data.topic, style: data.style, durationCategory: data.duration,
        scriptDetails: currentScript, imageUris: imageDownloadUrls, audioUri: audioDownloadUrl, captions: localCaptions,
        musicUri: currentRemotionProps.musicUri, primaryColor: currentRemotionProps.primaryColor,
        secondaryColor: currentRemotionProps.secondaryColor, fontFamily: currentRemotionProps.fontFamily,
        imageDurationInFrames: finalSceneDurationInFrames, totalDurationInFrames: totalVideoDurationInFramesCalculated,
        status: 'completed', 
        thumbnailUrl: imageDownloadUrls.find(url => url.startsWith('https')) || localImageUris.find(url => url.startsWith('data:image')) || 'https://placehold.co/300x200.png',
      };
      
      await updateVideoDocument(videoId, videoToSave);
      toast({ title: 'Video Saved!', description: 'Your video is now available on your dashboard.' });

    } catch (error: any) {
      let errorMessage = error.message || 'An unknown error occurred.';
      if (error.code?.startsWith('storage/')) {
        errorMessage = `Firebase Storage Error: ${error.message}. Please check your Storage Security Rules.`;
      }
      toast({ title: 'Generation Failed', description: errorMessage, variant: 'destructive', duration: 15000 });
       if (videoId && user) {
        await updateVideoDocument(videoId, { status: 'failed', errorMessage: errorMessage });
      }
       setRemotionProps(null); 
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return {
    isLoading,
    loadingStep,
    scriptResult,
    generatedImages,
    generatedAudioUri,
    generatedCaptions,
    remotionProps,
    playerDurationInFrames,
    generateVideo,
  };
};
