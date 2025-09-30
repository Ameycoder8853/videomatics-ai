
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { generateScriptAction, generateAvatarVideoAction } from '@/app/actions';
import type { GenerateVideoScriptOutput } from '@/ai/flows/generate-video-script';
import type { AIAvatarFormValues } from '@/components/AIAvatarForm';
import { createVideoPlaceholder, updateVideoDocument, VideoDocument } from '@/firebase/firestore';
import { uploadDataUriToStorage } from '@/firebase/storage';

export const useAvatarGenerationFlow = () => {
    const { toast } = useToast();
    const { user } = useAuth();
    
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    
    // State for generated assets
    const [avatarScriptResult, setAvatarScriptResult] = useState<GenerateVideoScriptOutput | null>(null);
    const [avatarAudioUri, setAvatarAudioUri] = useState<string | null>(null); // This will no longer be used
    const [avatarCaptions, setAvatarCaptions] = useState<string | null>(null); // This will no longer be used
    const [generatedAvatarVideoUrl, setGeneratedAvatarVideoUrl] = useState<string | null>(null);

    const resetState = () => {
        setIsLoading(false);
        setLoadingStep('');
        setAvatarScriptResult(null);
        setAvatarAudioUri(null);
        setAvatarCaptions(null);
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
            // Step 1: Generate Script from Topic
            setLoadingStep('Generating script...');
            toast({ title: 'Generating script...', description: 'AI is crafting your narrative.' });
            const script = await generateScriptAction({
                topic: data.topic,
                style: 'explanatory', // Style for avatar videos
                duration: data.duration,
            });
            if (!script || !script.scenes?.length) throw new Error('Script generation failed or returned no scenes.');
            setAvatarScriptResult(script);
            const fullScriptText = script.scenes.map(scene => scene.contentText).join(' ');

            // Step 2: Generate Avatar Video with HeyGen (video + audio)
            setLoadingStep('Generating avatar video...');
            toast({ title: 'Generating AI Avatar Video', description: 'This process can take several minutes. Please wait.' });
            const avatarResult = await generateAvatarVideoAction({
                script: fullScriptText,
                avatarId: data.avatarId,
            });
            if (!avatarResult || !avatarResult.videoUrl) {
                throw new Error('AI video generation failed to return a video URL.');
            }
            // This is the temporary URL from HeyGen, which we will display for preview
            setGeneratedAvatarVideoUrl(avatarResult.videoUrl);

            // Step 3: Upload final video to Firebase and save document
            setLoadingStep('Saving video to cloud...');
            videoId = await createVideoPlaceholder(user.uid);

            const videoDownloadUrl = await uploadDataUriToStorage(avatarResult.videoUrl, `ai-avatar-files/${user.uid}/${videoId}/video.mp4`);
            
            const videoToSave: Partial<VideoDocument> = {
                userId: user.uid,
                title: script.title,
                topic: data.topic,
                scriptDetails: script,
                // audioUri is no longer a separate asset, but we can store the main video URL here if needed or leave empty.
                // Let's keep imageUris as the primary store for the final video asset.
                audioUri: '', 
                imageUris: [videoDownloadUrl], 
                captions: '', // No separate captions generated
                status: 'completed',
                thumbnailUrl: 'https://placehold.co/300x200.png?text=Avatar+Video',
                // Fields below are not applicable to avatar videos but are required by the type
                primaryColor: '#000000',
                secondaryColor: '#FFFFFF',
                fontFamily: 'sans-serif',
                imageDurationInFrames: 0,
                totalDurationInFrames: 0,
            };

            await updateVideoDocument(videoId, videoToSave);
            toast({ title: 'Avatar Video Saved!', description: 'Your video is now on your dashboard.' });

        } catch (error: any) {
            const errorMessage = error.message || 'An unknown error occurred during avatar video generation.';
            toast({ title: 'Generation Failed', description: errorMessage, variant: 'destructive', duration: 15000 });
            if (videoId) {
                await updateVideoDocument(videoId, { status: 'failed', errorMessage });
            }
            // Clear the final video URL on failure so the preview doesn't show a broken link
            setGeneratedAvatarVideoUrl(null);
        } finally {
            setIsLoading(false);
            setLoadingStep('');
        }
    };

    return {
        isLoading,
        loadingStep,
        avatarScriptResult,
        avatarAudioUri,
        avatarCaptions,
        generatedAvatarVideoUrl,
        generateAvatarVideo,
    };
};
