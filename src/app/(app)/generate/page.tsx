
'use client';

import { useState } from 'react';
import { VideoForm, type VideoFormValues } from '@/components/VideoForm';
import { RemotionPlayer } from '@/components/RemotionPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Play, Image as ImageIcon, FileText, Palette, TypeIcon, ClockIcon, Mic, FileWarning, Film } from 'lucide-react';
import { generateScriptAction, generateImagesAction, generateAudioAction, generateCaptionsAction } from '@/app/actions';
import type { GenerateVideoScriptOutput, Scene } from '@/ai/flows/generate-video-script';
import { useToast } from '@/hooks/use-toast';
import { handleClientSideRender } from '@/lib/remotion';
import type { CompositionProps } from '@/remotion/MyVideo';
import { myVideoSchema } from '@/remotion/MyVideo';

export default function GeneratePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [scriptResult, setScriptResult] = useState<GenerateVideoScriptOutput | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [generatedAudioUri, setGeneratedAudioUri] = useState<string | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [remotionProps, setRemotionProps] = useState<CompositionProps | null>(null);
  const [playerDuration, setPlayerDuration] = useState<number>(300); // Default player duration

  const defaultPrimaryColor = myVideoSchema.shape.primaryColor.parse(undefined);
  const defaultSecondaryColor = myVideoSchema.shape.secondaryColor.parse(undefined);
  const defaultFontFamily = myVideoSchema.shape.fontFamily.parse(undefined);
  const defaultImageDurationInFrames = myVideoSchema.shape.imageDurationInFrames.parse(undefined);

  const handleFormSubmit = async (data: VideoFormValues) => {
    setIsLoading(true);
    setScriptResult(null);
    setGeneratedImages(null);
    setGeneratedAudioUri(null);
    setGeneratedCaptions(null);
    setRemotionProps(null);
    // Estimate duration based on up to 15 scenes (max for "long" duration)
    const estimatedMaxScenes = 15;
    const imageDurationInFrames = data.imageDurationInFrames || defaultImageDurationInFrames;
    setPlayerDuration(estimatedMaxScenes * imageDurationInFrames);

    let currentScript: GenerateVideoScriptOutput | null = null;
    let currentImageUrls: string[] = [];
    let currentAudioUri: string | null = null;
    let currentCaptions: string | null = null;

    try {
      // 1. Generate Script
      setLoadingStep('Generating script...');
      toast({ title: 'Generating script...', description: 'AI is crafting your narrative and visual cues.' });
      const imageDurationInSeconds = Math.round(imageDurationInFrames / 30); // Assuming 30 FPS

      currentScript = await generateScriptAction({
        topic: data.topic,
        style: data.style,
        duration: data.duration,
        imageDurationInSeconds,
      });

      if (!currentScript || !currentScript.scenes || currentScript.scenes.length === 0) {
        throw new Error('Script generation failed or returned no scenes.');
      }
      setScriptResult(currentScript);
      toast({ title: 'Script generated!', description: `"${currentScript.title}" with ${currentScript.scenes.length} scenes.` });

      // 2. Generate Multiple Images from scene prompts
      const imagePrompts = currentScript.scenes.map(scene => scene.imagePrompt);
      if (imagePrompts.length === 0) throw new Error('No image prompts found in the script.');

      setLoadingStep(`Generating ${imagePrompts.length} images...`);
      toast({ title: `Generating ${imagePrompts.length} images...`, description: 'This might take a few moments.' });
      const imagesResult = await generateImagesAction({ prompts: imagePrompts });
      if (!imagesResult.imageUrls || imagesResult.imageUrls.length === 0) {
        throw new Error('Image generation failed or returned no images.');
      }
      currentImageUrls = imagesResult.imageUrls;
      setGeneratedImages(currentImageUrls);
      toast({ title: `${currentImageUrls.length} Images generated successfully!` });
      
      // 3. Generate Audio from script
      const fullScriptText = currentScript.scenes.map(scene => scene.contentText).join(' ');
      if (!fullScriptText.trim()) throw new Error('Script content is empty, cannot generate audio.');

      setLoadingStep('Generating voiceover audio...');
      toast({ title: 'Generating voiceover audio...', description: 'Using ElevenLabs for narration.' });
      const audioResult = await generateAudioAction({ text: fullScriptText });
      if (!audioResult.audioUrl) {
        throw new Error('Audio generation failed or returned no audio URL.');
      }
      currentAudioUri = audioResult.audioUrl;
      setGeneratedAudioUri(currentAudioUri);
      toast({ title: 'Voiceover audio generated!' });

      // 4. Generate Captions from audio
      setLoadingStep('Generating captions...');
      toast({ title: 'Generating captions...', description: 'Using AssemblyAI for transcription.' });
      const captionsResult = await generateCaptionsAction({ audioDataUri: currentAudioUri });
      if (!captionsResult.transcript) {
        throw new Error('Caption generation failed or returned no transcript.');
      }
      currentCaptions = captionsResult.transcript;
      setGeneratedCaptions(currentCaptions);
      toast({ title: 'Captions generated!' });


      // Prepare props for Remotion player/renderer
      const sceneTexts = currentScript.scenes.map(scene => scene.contentText);

      const currentRemotionProps: CompositionProps = {
        title: currentScript.title,
        sceneTexts: sceneTexts,
        imageUris: currentImageUrls,
        audioUri: currentAudioUri, 
        musicUri: '/placeholder-music.mp3', 
        captions: currentCaptions,
        primaryColor: data.primaryColor || defaultPrimaryColor,
        secondaryColor: data.secondaryColor || defaultSecondaryColor,
        fontFamily: data.fontFamily || defaultFontFamily,
        imageDurationInFrames: imageDurationInFrames,
      };
      setRemotionProps(currentRemotionProps);

      // Calculate player duration based on the actual number of generated images/scenes
      const newPlayerDuration = currentScript.scenes.length * imageDurationInFrames;
      setPlayerDuration(newPlayerDuration);

    } catch (error: any) {
      console.error('Video generation process failed:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'An error occurred during the generation process.',
        variant: 'destructive',
      });
       setRemotionProps(null); // Clear props on error to hide player
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
        inputProps: remotionProps,
      });
      toast({ title: 'Video Rendered!', description: 'Your download should start automatically.' });
    } catch (error: any) {
      console.error('Rendering failed:', error);
      toast({ title: 'Render Failed', description: error.message, variant: 'destructive'});
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Create New Video</h1>
        <p className="text-muted-foreground">Fill in the details to generate your AI video.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Video Settings</CardTitle>
            <CardDescription>Describe your desired video.</CardDescription>
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
                imageDurationInFrames: defaultImageDurationInFrames,
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Preview & Results</CardTitle>
            <CardDescription>Generated content and video preview will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg min-h-[300px]">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground font-semibold">{loadingStep || 'Generating video assets...'}</p>
                <p className="text-sm text-muted-foreground mt-2">Script, images, audio, and captions generation can take some time.</p>
              </div>
            )}

            {!isLoading && remotionProps && (
              <>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-inner w-full max-w-[320px] mx-auto" style={{ aspectRatio: '9/16', height: 'auto' }}>
                   <RemotionPlayer
                    key={JSON.stringify(remotionProps) + playerDuration} 
                    compositionId="MyVideo"
                    inputProps={remotionProps}
                    controls
                    style={{ width: '100%', height: '100%' }}
                    durationInFrames={playerDuration} // Use dynamic duration
                    fps={30} // Standard FPS
                    loop
                  />
                </div>
                <Button onClick={onRenderVideo} disabled={isRendering || !remotionProps} className="w-full">
                  {isRendering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {isRendering ? 'Rendering...' : 'Download Video'}
                </Button>
              </>
            )}

            {!isLoading && !remotionProps && !scriptResult && ( // Initial empty state
                 <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg min-h-[300px] bg-muted/50">
                    <Film className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Your video preview will appear here once generated.</p>
                    <p className="text-sm text-muted-foreground mt-1">Fill the form and click "Generate Video Content".</p>
                 </div>
            )}

            {!isLoading && !remotionProps && scriptResult && ( // Error state or cleared props
                 <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg min-h-[300px] bg-destructive/10 text-destructive-foreground">
                    <FileWarning className="h-16 w-16 mb-4" />
                    <p className="font-semibold">Preview Unavailable</p>
                    <p className="text-sm mt-1">Video assets might have failed to generate. Check results below.</p>
                 </div>
            )}


            {scriptResult && (
              <Card className="bg-card/70">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-headline flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-accent" />
                    Generated Script: {scriptResult.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3 max-h-60 overflow-y-auto">
                  {scriptResult.scenes.map((scene, index) => (
                    <div key={index} className="p-3 border rounded-md bg-background/50 shadow-sm">
                      <h4 className="font-semibold text-primary">Scene {index + 1}</h4>
                      <p className="mt-1"><strong className="font-medium text-muted-foreground">Visual:</strong> {scene.imagePrompt}</p>
                      <p className="mt-1"><strong className="font-medium text-muted-foreground">Text:</strong> {scene.contentText}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

             {generatedImages && generatedImages.length > 0 && (
              <Card className="bg-card/70">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl font-headline flex items-center">
                        <ImageIcon className="mr-2 h-5 w-5 text-accent" />
                        Generated Images ({generatedImages.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {generatedImages.map((imgUrl, index) => (
                        <div key={index} className="relative aspect-[9/16] rounded-md overflow-hidden shadow-lg">
                        <img
                            src={imgUrl}
                            alt={`AI generated visual scene ${index + 1}`}
                            className="absolute inset-0 w-full h-full object-cover"
                             data-ai-hint={scriptResult?.scenes[index]?.imagePrompt.substring(0,50) || "generated image"}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">Scene {index + 1}</div>
                        </div>
                    ))}
                    </div>
                </CardContent>
              </Card>
            )}
            {generatedAudioUri && (
                <Card className="bg-card/70">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-headline flex items-center">
                            <Mic className="mr-2 h-5 w-5 text-accent" />
                            Generated Voiceover
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <audio controls src={generatedAudioUri} className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                        <p className="text-xs text-muted-foreground mt-2">Voiceover generated by ElevenLabs.</p>
                    </CardContent>
                </Card>
            )}
             {generatedCaptions && (
                <Card className="bg-card/70">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-headline flex items-center">
                            <TypeIcon className="mr-2 h-5 w-5 text-accent" />
                            Generated Transcript
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm max-h-40 overflow-y-auto">
                        <p className="whitespace-pre-wrap">{generatedCaptions}</p>
                        <p className="text-xs text-muted-foreground mt-2">Transcript generated by AssemblyAI.</p>
                    </CardContent>
                </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
