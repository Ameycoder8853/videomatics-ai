
'use client';

import { useState } from 'react';
import { VideoForm, type VideoFormValues } from '@/components/VideoForm';
import { RemotionPlayer } from '@/components/RemotionPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Play, Image as ImageIcon } from 'lucide-react';
import { generateScriptAction, summarizeScriptAction, generateImagesAction } from '@/app/actions'; // Updated to generateImagesAction
import { useToast } from '@/hooks/use-toast';
import { handleClientSideRender } from '@/lib/remotion';
import type { CompositionProps } from '@/remotion/MyVideo';
import { myVideoSchema } from '@/remotion/MyVideo'; // Import schema for default values

interface GeneratedImageData { url: string; keywords: string; } // For displaying one image, if needed. Could be an array.

export default function GeneratePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null); // Stores array of image URLs
  const [currentKeywordsForDisplay, setCurrentKeywordsForDisplay] = useState<string | null>(null);


  const [isRendering, setIsRendering] = useState(false);
  const [remotionProps, setRemotionProps] = useState<CompositionProps | null>(null);
  const [playerDuration, setPlayerDuration] = useState<number>(300); // Default player duration

  // Get default values from Zod schema
  const defaultPrimaryColor = myVideoSchema.shape.primaryColor.parse(undefined).toString();
  const defaultSecondaryColor = myVideoSchema.shape.secondaryColor.parse(undefined).toString();
  const defaultFontFamily = myVideoSchema.shape.fontFamily.parse(undefined);
  const defaultImageDurationInFrames = myVideoSchema.shape.imageDurationInFrames.parse(undefined);


  const handleFormSubmit = async (data: VideoFormValues) => {
    setIsLoading(true);
    setScript(null);
    setKeywords(null);
    setGeneratedImages(null);
    setCurrentKeywordsForDisplay(null);
    setRemotionProps(null);
    setPlayerDuration(myVideoSchema.shape.imageDurationInFrames.parse(undefined) * 3); // Initial sensible default for 3 images

    try {
      // 1. Generate Script
      toast({ title: 'Generating script...', description: 'Hang tight, AI is crafting your narrative.' });
      const scriptResult = await generateScriptAction({ topic: data.topic, style: data.style, duration: data.duration });
      if (!scriptResult.script) throw new Error('Script generation failed');
      setScript(scriptResult.script);
      toast({ title: 'Script generated!', variant: 'default' });

      // 2. Summarize Script into Keywords
      toast({ title: 'Extracting keywords for visuals...' });
      const keywordsResult = await summarizeScriptAction({ script: scriptResult.script });
      if (!keywordsResult.keywords) throw new Error('Keyword generation failed');
      setKeywords(keywordsResult.keywords);
      setCurrentKeywordsForDisplay(keywordsResult.keywords);
      toast({ title: 'Keywords extracted!', description: `Keywords: ${keywordsResult.keywords}` });

      // 3. Generate Multiple Images
      toast({ title: 'Generating images with AI...', description: 'This might take a few moments for all images.' });
      const imagesResult = await generateImagesAction({ prompt: keywordsResult.keywords, numberOfImages: 3 }); // Request 3 images
      if (!imagesResult.imageUrls || imagesResult.imageUrls.length === 0) throw new Error('Image generation failed or returned no images');
      setGeneratedImages(imagesResult.imageUrls);
      toast({ title: `${imagesResult.imageUrls.length} Images generated successfully!` });

      // Prepare props for Remotion player/renderer
      const currentRemotionProps: CompositionProps = {
        script: scriptResult.script,
        imageUris: imagesResult.imageUrls,
        audioUri: '/placeholder-audio.mp3', // Main voiceover placeholder
        musicUri: '/placeholder-music.mp3', // Background music placeholder
        captions: scriptResult.script,
        primaryColor: myVideoSchema.shape.primaryColor.parse(data.primaryColor || defaultPrimaryColor),
        secondaryColor: myVideoSchema.shape.secondaryColor.parse(data.secondaryColor || defaultSecondaryColor),
        fontFamily: data.fontFamily || defaultFontFamily,
        imageDurationInFrames: data.imageDurationInFrames || defaultImageDurationInFrames,
      };
      setRemotionProps(currentRemotionProps);

      // Update player duration
      const newPlayerDuration = currentRemotionProps.imageUris.length * currentRemotionProps.imageDurationInFrames;
      setPlayerDuration(newPlayerDuration);


    } catch (error: any) {
      console.error('Video generation process failed:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'An error occurred during the generation process.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
        // Pass the dynamically calculated duration to the renderer
        // Note: handleClientSideRender needs to be adapted if it doesn't accept duration override
        // For now, assuming composition internally calculates its duration or uses a fixed one from its definition
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
            {/* Pass default values to VideoForm, it expects them in VideoFormValues format */}
            <VideoForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              defaultValues={{
                topic: '', // Default topic or load from somewhere
                style: '', // Default style
                duration: '', // Default duration category
                primaryColor: defaultPrimaryColor,
                secondaryColor: defaultSecondaryColor,
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
                <p className="text-muted-foreground">Generating video assets... Please wait.</p>
              </div>
            )}

            {!isLoading && remotionProps && (
              <>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-inner w-full max-w-[320px] mx-auto" style={{ aspectRatio: '9/16', height: 'auto' }}> {/* Portrait aspect ratio for player */}
                   <RemotionPlayer
                    compositionId="MyVideo"
                    inputProps={remotionProps}
                    controls
                    style={{ width: '100%', height: '100%' }}
                    durationInFrames={playerDuration} // Use dynamic duration for the player
                    loop
                  />
                </div>
                <Button onClick={onRenderVideo} disabled={isRendering || !remotionProps} className="w-full">
                  {isRendering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  {isRendering ? 'Rendering...' : 'Download Video'}
                </Button>
              </>
            )}

            {!isLoading && !remotionProps && (
                 <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg min-h-[300px] bg-muted/50">
                    <Play className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Your video preview will appear here once generated.</p>
                 </div>
            )}

            {script && (
              <div className="p-4 border rounded-md bg-card">
                <h3 className="font-semibold mb-2 font-headline">Generated Script:</h3>
                <p className="text-sm whitespace-pre-wrap">{script}</p>
              </div>
            )}
            {keywords && (
              <div className="p-4 border rounded-md bg-card">
                <h3 className="font-semibold mb-2 font-headline">Generated Keywords:</h3>
                <p className="text-sm">{keywords}</p>
              </div>
            )}
             {generatedImages && generatedImages.length > 0 && (
              <div className="p-4 border rounded-md bg-card">
                <h3 className="font-semibold mb-2 font-headline flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5 text-accent" />
                  Generated Images ({generatedImages.length}):
                </h3>
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {generatedImages.map((imgUrl, index) => (
                    <img
                      key={index}
                      src={imgUrl}
                      alt={`AI generated visual scene ${index + 1}`}
                      className="rounded-md w-full h-auto object-contain shadow-lg aspect-[9/16]"
                      data-ai-hint={currentKeywordsForDisplay || "generated image"}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
