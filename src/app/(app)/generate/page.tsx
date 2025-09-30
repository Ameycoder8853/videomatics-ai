
'use client';

import { useState } from 'react';
import { VideoForm } from '@/components/VideoForm';
import { AIAvatarForm } from '@/components/AIAvatarForm';
import { RemotionPlayer } from '@/components/RemotionPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Loader2, Film, AlertTriangle, Video, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleClientSideRender } from '@/lib/remotion';
import { myVideoSchema } from '@/remotion/MyVideo';
import { staticFile } from 'remotion';
import { GenerateResults } from '@/components/GenerateResults';
import { useVideoGeneration } from '@/hooks/use-video-generation';
import { useAvatarGenerationFlow } from '@/hooks/use-avatar-generation-flow';

export default function GeneratePage() {
  const { toast } = useToast();

  // State for Image Slideshow Videos
  const {
    isLoading: isSlideshowLoading,
    loadingStep: slideshowLoadingStep,
    scriptResult,
    generatedImages,
    generatedAudioUri,
    generatedCaptions,
    remotionProps,
    playerDurationInFrames,
    generateVideo: generateSlideshowVideo,
  } = useVideoGeneration();

  // State for AI Avatar Videos (New comprehensive flow)
  const {
    isLoading: isAvatarLoading,
    loadingStep: avatarLoadingStep,
    avatarScriptResult,
    avatarAudioUri,
    avatarCaptions,
    generatedAvatarVideoUrl,
    generateAvatarVideo,
  } = useAvatarGenerationFlow();

  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState<number | null>(null);

  const defaultPrimaryColor = myVideoSchema.shape.primaryColor.parse(undefined);
  const defaultSecondaryColor = myVideoSchema.shape.secondaryColor.parse(undefined);
  const defaultFontFamily = myVideoSchema.shape.fontFamily.parse(undefined);
  const defaultImageDurationInFramesHint = myVideoSchema.shape.imageDurationInFrames.parse(undefined);

  const onRenderVideo = async () => {
    if (!remotionProps) {
      toast({ title: 'Error', description: 'No slideshow data to render.', variant: 'destructive' });
      return;
    }
    setIsRendering(true);
    setRenderProgress(0);
    toast({ title: 'Rendering slideshow...', description: 'This might take a moment.'});
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

  const isLoading = isSlideshowLoading || isAvatarLoading;
  
  // Consolidate results for display
  const finalScriptResult = scriptResult || avatarScriptResult;
  const finalAudioUri = generatedAudioUri || avatarAudioUri; // avatarAudioUri will be null now
  const finalCaptions = generatedCaptions ?? avatarCaptions; // avatarCaptions will be null now


  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-headline font-bold">Create New Video</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Choose your video type and fill in the details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Video Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="slideshow" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="slideshow">
                  <ImageIcon className="mr-2 h-4 w-4" /> Slideshow
                </TabsTrigger>
                <TabsTrigger value="avatar">
                  <Video className="mr-2 h-4 w-4" /> Avatar
                </TabsTrigger>
              </TabsList>
              <TabsContent value="slideshow" className="mt-6">
                <CardDescription className="text-xs sm:text-sm mb-4">Describe your desired slideshow video.</CardDescription>
                <VideoForm
                  onSubmit={generateSlideshowVideo}
                  isLoading={isSlideshowLoading}
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
              </TabsContent>
              <TabsContent value="avatar" className="mt-6">
                 <CardDescription className="text-xs sm:text-sm mb-4">Describe the topic for your AI avatar video.</CardDescription>
                 <AIAvatarForm 
                    onSubmit={generateAvatarVideo}
                    isLoading={isAvatarLoading}
                 />
              </TabsContent>
            </Tabs>
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
                <p className="text-sm sm:text-base text-muted-foreground font-semibold">{slideshowLoadingStep || avatarLoadingStep || 'Generating...'}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2 text-center">AI generation can take some time. Please be patient.</p>
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
                    : 'Download Slideshow Video'}
                </Button>
              </>
            )}

            {!isLoading && generatedAvatarVideoUrl && (
              <>
                <div 
                  className="bg-muted rounded-lg overflow-hidden shadow-inner w-full max-w-sm mx-auto md:max-w-md" 
                  style={{ aspectRatio: '9/16' }}
                >
                  <video
                    src={generatedAvatarVideoUrl}
                    controls
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
                <Button asChild className="w-full">
                  <a href={generatedAvatarVideoUrl} download={`videomatics-avatar-${Date.now()}.mp4`}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Avatar Video
                  </a>
                </Button>
              </>
            )}
            
            {!isLoading && !remotionProps && !generatedAvatarVideoUrl && !finalScriptResult && ( 
                 <div className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-lg min-h-[250px] sm:min-h-[300px] bg-muted/50">
                    <Film className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-muted-foreground">Your video preview will appear here.</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-center">Fill a form and click "Generate".</p>
                 </div>
            )}

            {!isLoading && !remotionProps && !generatedAvatarVideoUrl && (finalScriptResult || finalAudioUri || finalCaptions) && ( 
                 <div className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed rounded-lg min-h-[250px] sm:min-h-[300px] bg-destructive/10 text-destructive-foreground">
                    <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 mb-3 sm:mb-4" />
                    <p className="font-semibold text-sm sm:text-base">Preview Unavailable</p>
                    <p className="text-xs sm:text-sm mt-1 text-center">Some assets might have failed to generate. Check results below.</p>
                 </div>
            )}

            <GenerateResults 
              scriptResult={finalScriptResult}
              generatedImages={generatedImages} // Only slideshows have images
              generatedAudioUri={finalAudioUri}
              generatedCaptions={finalCaptions}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
