
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { generateScriptAction, generateAudioAction, generateCaptionsAction, generateAvatarVideoAction } from '@/app/actions';
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
    const [avatarAudioUri, setAvatarAudioUri] = useState<string | null>(null);
    const [avatarCaptions, setAvatarCaptions] = useState<string | null>(null);
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
            // 1. Generate Script
            setLoadingStep('Generating script...');
            toast({ title: 'Generating script...', description: 'AI is crafting your narrative.' });
            const script = await generateScriptAction({
                topic: data.topic,
                style: 'explanatory', // Hardcoded style for avatar videos
                duration: data.duration,
            });
            if (!script || !script.scenes?.length) throw new Error('Script generation failed or returned no scenes.');
            setAvatarScriptResult(script);
            const fullScriptText = script.scenes.map(scene => scene.contentText).join(' ');

            // 2. Generate Audio
            setLoadingStep('Generating voiceover...');
            const { audioUrl: localAudioUri } = await generateAudioAction({ text: fullScriptText });
            setAvatarAudioUri(localAudioUri);
            toast({ title: 'Voiceover generated!' });

            // 3. Generate Captions
            setLoadingStep('Generating captions...');
            const { transcript: localCaptions } = await generateCaptionsAction({ audioDataUri: localAudioUri });
            setAvatarCaptions(localCaptions);
            if (localCaptions) toast({ title: 'Captions generated!' });

            // 4. Generate Avatar Video with HeyGen
            setLoadingStep('Generating avatar video...');
            toast({ title: 'Generating AI Avatar Video', description: 'This process can take several minutes. Please wait.' });
            const avatarResult = await generateAvatarVideoAction({
                script: fullScriptText,
                avatarId: data.avatarId,
            });
            if (!avatarResult || !avatarResult.videoUrl) {
                throw new Error('AI video generation failed to return a video URL.');
            }
            // This is the temporary URL from HeyGen
            setGeneratedAvatarVideoUrl(avatarResult.videoUrl);

            // 5. Upload all assets to Firebase Storage and save document
            setLoadingStep('Saving video to cloud...');
            videoId = await createVideoPlaceholder(user.uid);

            const audioDownloadUrl = await uploadDataUriToStorage(localAudioUri, `ai-avatar-files/${user.uid}/${videoId}/audio.wav`);
            const videoDownloadUrl = await uploadDataUriToStorage(avatarResult.videoUrl, `ai-avatar-files/${user.uid}/${videoId}/video.mp4`);
            
            const videoToSave: Partial<VideoDocument> = {
                userId: user.uid,
                title: script.title,
                topic: data.topic,
                scriptDetails: script,
                audioUri: audioDownloadUrl, // Our own stored audio
                // For avatar videos, 'imageUris' will store the final video URL.
                // This is a simplification to reuse the component structure.
                imageUris: [videoDownloadUrl], 
                captions: localCaptions,
                status: 'completed',
                thumbnailUrl: 'https://placehold.co/300x200.png?text=Avatar+Video',
                // These fields are not applicable to avatar videos but are required by the type
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
