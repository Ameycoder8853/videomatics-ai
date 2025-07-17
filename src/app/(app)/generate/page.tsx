
'use client';

import { useState } from 'react';
import { VideoForm, type VideoFormValues } from '@/components/VideoForm';
import { RemotionPlayer } from '@/components/RemotionPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Play, Film, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleClientSideRender } from '@/lib/remotion';
import { myVideoSchema } from '@/remotion/MyVideo';
import { staticFile } from 'remotion';
import { GenerateResults } from '@/components/GenerateResults';
import { useVideoGeneration } from '@/hooks/use-video-generation';


export default function GeneratePage() {
  const { toast } = useToast();
  const {
    isLoading,
    loadingStep,
    scriptResult,
    generatedImages,
    generatedAudioUri,
    generatedCaptions,
    remotionProps,
    playerDurationInFrames,
    generateVideo,
  } = useVideoGeneration();

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<number | null>(null);

  const defaultPrimaryColor = myVideoSchema.shape.primaryColor.parse(undefined);
  const defaultSecondaryColor = myVideoSchema.shape.secondaryColor.parse(undefined);
  const defaultFontFamily = myVideoSchema.shape.fontFamily.parse(undefined);
  const defaultImageDurationInFramesHint = myVideoSchema.shape.imageDurationInFrames.parse(undefined);

  const onRenderVideo = async () => {
    if (!remotionProps) {
      toast({ title: 'Error', description: 'No video data to render.', variant: 'destructive' });
      return;
    }
    setIsRendering(true);
    setRenderProgress(0);
    toast({ title: 'Rendering video...', description: 'This might take a moment.'});
    try {
      await handleClientSideRender({
        compositionId: 'MyVideo',
        inputProps: { ...remotionProps },
        onProgress: ({ progress }) => setRenderProgress(progress),
        totalDurationInFrames: playerDurationInFrames,
      });
      toast({ title: 'Video Rendered!', description: 'Download should start automatically.' });
    } catch (error: any) {
      toast({ title: 'Render Failed', description: error.message, variant: 'destructive'});
    } finally {
      setIsRendering(false);
      setRenderProgress(null);
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
              onSubmit={generateVideo}
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
                <div 
                  className="bg-muted rounded-lg overflow-hidden shadow-inner w-full max-w-sm mx-auto md:max-w-md bg-cover bg-center" 
                  style={{ 
                    aspectRatio: '9/16', 
                    height: 'auto',
                    backgroundImage: `url(${remotionProps.imageUris?.[0]})`
                  }}
                >
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
                  {isRendering 
                    ? `Rendering... ${renderProgress !== null ? `${Math.round(renderProgress * 100)}%` : ''}` 
                    : 'Download Video'}
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

            <GenerateResults 
              scriptResult={scriptResult}
              generatedImages={generatedImages}
              generatedAudioUri={generatedAudioUri}
              generatedCaptions={generatedCaptions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
