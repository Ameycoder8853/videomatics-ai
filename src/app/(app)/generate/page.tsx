
'use client';

import { useState, useEffect } from 'react';
import { VideoForm, type VideoFormValues } from '@/components/VideoForm';
import { RemotionPlayer } from '@/components/RemotionPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Play, Image as ImageIcon, FileText, Palette, TypeIcon, ClockIcon, Mic, FileWarning, Film, AlertTriangle, Save } from 'lucide-react';
import { generateScriptAction, generateImagesAction, generateAudioAction, generateCaptionsAction } from '@/app/actions';
import type { GenerateVideoScriptOutput, Scene } from '@/ai/flows/generate-video-script';
import { useToast } from '@/hooks/use-toast';
import { handleClientSideRender } from '@/lib/remotion';
import type { CompositionProps } from '@/remotion/MyVideo';
import { myVideoSchema } from '@/remotion/MyVideo';
import { staticFile } from 'remotion';
import { useAuth } from '@/contexts/AuthContext';
import { createVideoPlaceholder, updateVideoDocument, VideoDocument } from '@/firebase/firestore';
import { uploadDataUriToStorage } from '@/firebase/storage';


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
        console.warn("Audio metadata load timeout or invalid duration. Defaulting.");
        resolve(30); // Fallback duration
        audio.onerror = null; // Clean up to prevent late firing
        audio.onloadedmetadata = null;
      }
    }, 5000); 

    audio.onloadedmetadata = () => {
      clearTimeout(timer);
      resolve(audio.duration);
    };
    audio.onerror = (e) => {
      clearTimeout(timer);
      console.error("Error loading audio metadata:", e);
      reject(new Error('Failed to load audio metadata.'));
    };
  });
};


export default function GeneratePage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [scriptResult, setScriptResult] = useState<GenerateVideoScriptOutput | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [generatedAudioUri, setGeneratedAudioUri] = useState<string | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [remotionProps, setRemotionProps] = useState<CompositionProps | null>(null);
  const [playerDurationInFrames, setPlayerDurationInFrames] = useState<number>(300); 
  const [formValues, setFormValues] = useState<VideoFormValues | null>(null); 

  const defaultPrimaryColor = myVideoSchema.shape.primaryColor.parse(undefined);
  const defaultSecondaryColor = myVideoSchema.shape.secondaryColor.parse(undefined);
  const defaultFontFamily = myVideoSchema.shape.fontFamily.parse(undefined);
  const defaultImageDurationInFramesHint = myVideoSchema.shape.imageDurationInFrames.parse(undefined);

  const handleFormSubmit = async (data: VideoFormValues) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to generate videos.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setScriptResult(null);
    setGeneratedImages(null);
    setGeneratedAudioUri(null);
    setGeneratedCaptions(null);
    setRemotionProps(null);
    setFormValues(data); 
    setPlayerDurationInFrames(300); 

    let videoId: string | null = null;
    let currentScript: GenerateVideoScriptOutput | null = null;
    let localImageUris: string[] = [];
    let localAudioUri: string | null = null;
    let localCaptions: string | null = null;
    let finalSceneDurationInFrames = data.imageDurationInFrames || defaultImageDurationInFramesHint;
    let totalVideoDurationInFramesCalculated = 300;

    try {
      setLoadingStep('Generating script...');
      toast({ title: 'Generating script...', description: 'AI is crafting your narrative.' });
      const imageDurationInSecondsHint = Math.round((data.imageDurationInFrames || defaultImageDurationInFramesHint) / 30);

      currentScript = await generateScriptAction({
        topic: data.topic,
        style: data.style,
        duration: data.duration,
        imageDurationInSeconds: imageDurationInSecondsHint,
      });

      if (!currentScript || !currentScript.scenes || currentScript.scenes.length === 0) {
        throw new Error('Script generation failed or returned no scenes.');
      }
      setScriptResult(currentScript);
      toast({ title: 'Script generated!', description: `"${currentScript.title}" with ${currentScript.scenes.length} scenes.` });

      const fullScriptText = currentScript.scenes.map(scene => scene.contentText).join(' ');
      if (!fullScriptText.trim()) throw new Error('Script content is empty, cannot generate audio.');

      setLoadingStep('Generating voiceover audio...');
      toast({ title: 'Generating voiceover...', description: 'Using Google AI.' });
      const audioResult = await generateAudioAction({ text: fullScriptText });
      if (!audioResult.audioUrl) throw new Error('Audio generation failed.');
      localAudioUri = audioResult.audioUrl;
      setGeneratedAudioUri(localAudioUri);
      toast({ title: 'Voiceover audio generated!' });

      setLoadingStep('Measuring audio duration...');
      toast({ title: 'Analyzing audio...', description: 'Calculating video timing.'});
      let actualAudioDurationInSeconds = 30; // Default
      try {
        actualAudioDurationInSeconds = await getAudioDuration(localAudioUri);
      } catch (audioError: any) {
        console.warn("Could not measure audio duration:", audioError.message);
        toast({title: "Audio Duration Warning", description: "Using estimated timing. Video sync might be affected.", variant: "destructive"});
      }
      
      totalVideoDurationInFramesCalculated = Math.ceil(actualAudioDurationInSeconds * 30);
      finalSceneDurationInFrames = Math.max(30, Math.ceil(totalVideoDurationInFramesCalculated / currentScript.scenes.length));
      setPlayerDurationInFrames(totalVideoDurationInFramesCalculated); // Update player duration
      toast({ title: 'Video timing set!', description: `Video: ${actualAudioDurationInSeconds.toFixed(1)}s. Scenes: ${currentScript.scenes.length} x ~${(finalSceneDurationInFrames/30).toFixed(1)}s.` });
      
      setLoadingStep('Generating captions...');
      toast({ title: 'Generating captions...', description: 'Using AssemblyAI.' });
      const captionsResult = await generateCaptionsAction({ audioDataUri: localAudioUri });
      localCaptions = captionsResult.transcript;
      setGeneratedCaptions(localCaptions);
      if (localCaptions) {
        toast({ title: 'Captions generated!' });
      } else {
        toast({ title: 'Captions Skipped', description: 'AssemblyAI API key not configured.', variant: 'default' });
      }

      const imagePrompts = currentScript.scenes.map(scene => scene.imagePrompt);
      if (imagePrompts.length === 0) throw new Error('No image prompts in script.');

      setLoadingStep(`Generating ${imagePrompts.length} images...`);
      toast({ title: `Generating ${imagePrompts.length} images...`, description: 'This may take moments.' });
      const imagesResult = await generateImagesAction({ prompts: imagePrompts });
      if (!imagesResult.imageUrls || imagesResult.imageUrls.length !== imagePrompts.length) {
        localImageUris = imagesResult.imageUrls || [];
        while (localImageUris.length < imagePrompts.length) {
            localImageUris.push('https://placehold.co/1080x1920.png?text=Image+Missing');
        }
        toast({ title: 'Image Generation Incomplete', description: 'Some images may be placeholders.', variant: 'destructive' });
      } else {
        localImageUris = imagesResult.imageUrls;
        toast({ title: `${localImageUris.length} Images generated!` });
      }
      setGeneratedImages(localImageUris);
      
      const currentRemotionProps: CompositionProps = {
        title: currentScript.title,
        sceneTexts: currentScript.scenes.map(scene => scene.contentText),
        imageUris: localImageUris,
        audioUri: localAudioUri,
        musicUri: data.musicUri === 'NO_MUSIC_SELECTED' ? undefined : (data.musicUri || staticFile('placeholder-music.mp3')),
        captions: localCaptions,
        primaryColor: data.primaryColor || defaultPrimaryColor,
        secondaryColor: data.secondaryColor || defaultSecondaryColor,
        fontFamily: data.fontFamily || defaultFontFamily,
        imageDurationInFrames: finalSceneDurationInFrames,
      };
      setRemotionProps(currentRemotionProps);

      // === Asset Upload and Final Firestore Save ===
      setLoadingStep('Saving video...');
      toast({ title: 'Saving video...', description: 'Creating video record...' });
      videoId = await createVideoPlaceholder(user.uid);
      
      let audioDownloadUrl = '';
      if (localAudioUri) {
          setLoadingStep('Uploading voiceover...');
          toast({ title: 'Uploading voiceover...' });
          audioDownloadUrl = await uploadDataUriToStorage(localAudioUri, `ai-short-video-files/${user.uid}/${videoId}/audio.wav`);
      }
      
      const imageDownloadUrls: string[] = [];
      const generatedImageUris = localImageUris.filter(uri => uri.startsWith('data:image'));
      let uploadedCount = 0;

      for (let i = 0; i < localImageUris.length; i++) {
        const uri = localImageUris[i];
        if (uri.startsWith('data:image')) {
          uploadedCount++;
          setLoadingStep(`Uploading image ${uploadedCount} of ${generatedImageUris.length}...`);
          toast({ title: `Uploading image ${uploadedCount} of ${generatedImageUris.length}...` });
          const downloadUrl = await uploadDataUriToStorage(uri, `ai-short-video-files/${user.uid}/${videoId}/image_${i}.png`);
          imageDownloadUrls.push(downloadUrl);
        } else {
          imageDownloadUrls.push(uri); // Keep placeholder URL as-is
        }
      }
      
      setLoadingStep('Finalizing video details...');
      toast({ title: 'Finalizing video details...' });
      
      const videoToSave: Partial<VideoDocument> = {
        userId: user.uid,
        title: currentScript.title || data.topic,
        topic: data.topic,
        style: data.style,
        durationCategory: data.duration,
        scriptDetails: currentScript,
        imageUris: imageDownloadUrls,
        audioUri: audioDownloadUrl,
        captions: localCaptions,
        musicUri: currentRemotionProps.musicUri,
        primaryColor: currentRemotionProps.primaryColor.toString(),
        secondaryColor: currentRemotionProps.secondaryColor.toString(),
        fontFamily: currentRemotionProps.fontFamily,
        imageDurationInFrames: finalSceneDurationInFrames,
        totalDurationInFrames: totalVideoDurationInFramesCalculated,
        status: 'completed',
        thumbnailUrl: imageDownloadUrls.find(url => url.startsWith('https')) || 'https://placehold.co/300x200.png',
      };
      
      await updateVideoDocument(videoId, videoToSave);
      toast({ title: 'Video Saved!', description: 'Your video is now available on your dashboard.' });

    } catch (error: any) {
      console.error('Video generation process failed:', error);
      let errorMessage = error.message || 'An unknown error occurred.';
      
      // Check for specific Firebase Storage error codes
      if (error.code === 'storage/unauthorized' || error.code === 'storage/object-not-found' || error.code === 'storage/unknown') {
        errorMessage = `Firebase Storage Error: ${error.message}. Please check your Storage Security Rules in the Firebase Console. They must allow writes for authenticated users to the 'ai-short-video-files/{userId}' path.`;
      }

      toast({
        title: 'Generation Failed',
        description: errorMessage,
        variant: 'destructive',
        duration: 15000, // Give more time to read a complex error
      });

       if (videoId && user) {
        try {
          await updateVideoDocument(videoId, {
            status: 'failed',
            errorMessage: errorMessage,
          });
          toast({
            title: 'Update',
            description: 'Video status set to "failed" in dashboard.',
          });
        } catch (updateError) {
          console.error("Failed to update video status to 'failed':", updateError);
        }
      }
       setRemotionProps(null); 
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const onRenderVideo = async () => {
    if (!remotionProps) {
      toast({ title: 'Error', description: 'No video data to render.', variant: 'destructive' });
      return;
    }
    setIsRendering(true);
    toast({ title: 'Rendering video...', description: 'This might take a moment.'});
    try {
      await handleClientSideRender({
        compositionId: 'MyVideo',
        inputProps: { 
            ...remotionProps,
        },
        // Pass the calculated total duration here for the renderer
        totalDurationInFrames: playerDurationInFrames,
      });
      toast({ title: 'Video Rendered!', description: 'Download should start automatically.' });
    } catch (error: any) {
      console.error('Rendering failed:', error);
      toast({ title: 'Render Failed', description: error.message, variant: 'destructive'});
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-headline font-bold">Create New Video</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Fill in the details to generate your AI video.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Video Settings</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Describe your desired video.</CardDescription>
          </CardHeader>
          <CardContent>
            <VideoForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              defaultValues={{
                topic: 'A short interesting historical story',
                style: 'cinematic',
                duration: 'long', 
                primaryColor: defaultPrimaryColor.toString(),
                secondaryColor: defaultSecondaryColor.toString(),
                fontFamily: defaultFontFamily,
                imageDurationInFrames: defaultImageDurationInFramesHint,
                musicUri: staticFile('placeholder-music.mp3')
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Preview & Results</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Generated content and video preview will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-lg min-h-[250px] sm:min-h-[300px]">
                <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-muted-foreground font-semibold">{loadingStep || 'Generating...'}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 text-center">Script, audio, captions, and images can take time.</p>
              </div>
            )}

            {!isLoading && remotionProps && (
              <>
                <div className="bg-muted rounded-lg overflow-hidden shadow-inner w-full max-w-[280px] sm:max-w-[320px] mx-auto" style={{ aspectRatio: '9/16', height: 'auto' }}>
                   <RemotionPlayer
                    key={JSON.stringify(remotionProps) + playerDurationInFrames} 
                    compositionId="MyVideo"
                    inputProps={remotionProps}
                    controls
                    style={{ width: '100%', height: '100%' }}
                    durationInFrames={playerDurationInFrames}
                    fps={30} 
                    loop
                  />
                </div>
                <Button onClick={onRenderVideo} disabled={isRendering || !remotionProps} className="w-full">
                  {isRendering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {isRendering ? 'Rendering...' : 'Download Video'}
                </Button>
              </>
            )}

            {!isLoading && !remotionProps && !scriptResult && ( 
                 <div className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-lg min-h-[250px] sm:min-h-[300px] bg-muted/50">
                    <Film className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-muted-foreground">Your video preview will appear here.</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">Fill form and click "Generate Video Content".</p>
                 </div>
            )}

            {!isLoading && !remotionProps && scriptResult && ( 
                 <div className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-lg min-h-[250px] sm:min-h-[300px] bg-destructive/10 text-destructive-foreground">
                    <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 mb-3 sm:mb-4" />
                    <p className="font-semibold text-sm sm:text-base">Preview Unavailable</p>
                    <p className="text-xs sm:text-sm mt-1 text-center">Assets might have failed to generate. Check results below or console.</p>
                 </div>
            )}


            {scriptResult && (
              <Card className="bg-card/70">
                <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                  <CardTitle className="text-md sm:text-xl font-headline flex items-center">
                    <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                    Script: {scriptResult.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs sm:text-sm space-y-2 sm:space-y-3 max-h-60 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
                  {scriptResult.scenes.map((scene, index) => (
                    <div key={index} className="p-2 sm:p-3 border rounded-md bg-background/50 shadow-sm">
                      <h4 className="font-semibold text-primary text-sm">Scene {index + 1}</h4>
                      <p className="mt-1"><strong className="font-medium text-muted-foreground">Visual:</strong> {scene.imagePrompt}</p>
                      <p className="mt-1"><strong className="font-medium text-muted-foreground">Text:</strong> {scene.contentText}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

             {generatedImages && generatedImages.length > 0 && (
              <Card className="bg-card/70">
                <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                    <CardTitle className="text-md sm:text-xl font-headline flex items-center">
                        <ImageIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                        Images ({generatedImages.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                    <div className="mt-2 grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {generatedImages.map((imgUrl, index) => (
                        <div key={index} className="relative aspect-[9/16] rounded-md overflow-hidden shadow-lg">
                        <img
                            src={imgUrl}
                            alt={`AI generated visual scene ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                             data-ai-hint={scriptResult?.scenes[index]?.imagePrompt.substring(0,50) || "generated image"}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[0.6rem] xs:text-xs p-1 text-center truncate">Scene {index + 1}</div>
                        </div>
                    ))}
                    </div>
                </CardContent>
              </Card>
            )}
            {generatedAudioUri && (
                <Card className="bg-card/70">
                    <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                        <CardTitle className="text-md sm:text-xl font-headline flex items-center">
                            <Mic className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                            Voiceover
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                        <audio controls src={generatedAudioUri} className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                        <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Voiceover by Google AI.</p>
                    </CardContent>
                </Card>
            )}
             {generatedCaptions !== null && (
                <Card className="bg-card/70">
                    <CardHeader className="pb-2 px-4 pt-4 sm:px-6 sm:pt-6">
                        <CardTitle className="text-md sm:text-xl font-headline flex items-center">
                            <TypeIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                            Transcript
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs sm:text-sm max-h-40 overflow-y-auto px-4 pb-4 sm:px-6 sm:pb-6">
                        {generatedCaptions ? (
                            <>
                                <p className="whitespace-pre-wrap">{generatedCaptions}</p>
                                <p className="text-xs text-muted-foreground mt-1 sm:mt-2">Transcript by AssemblyAI.</p>
                            </>
                        ) : (
                            <p className="text-muted-foreground">Captions were skipped (API key may be missing).</p>
                        )}
                    </CardContent>
                </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
