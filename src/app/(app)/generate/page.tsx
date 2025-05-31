'use client';

import { useState } from 'react';
import { VideoForm, type VideoFormValues } from '@/components/VideoForm';
import { RemotionPlayer } from '@/components/RemotionPlayer'; // Assuming this component will be created
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Play } from 'lucide-react';
import { generateScriptAction, summarizeScriptAction } from '@/app/actions'; // Server actions
import { useToast } from '@/hooks/use-toast';
import { handleClientSideRender } from '@/lib/remotion'; // Client-side render function
import type { CompositionProps } from '@/remotion/MyVideo'; // Import MyVideoProps

// Placeholder data types for other AI generation steps
interface GeneratedImageData { url: string; keywords: string; }
interface GeneratedAudioData { url: string; }
interface GeneratedCaptionData { url: string; content: string; }


export default function GeneratePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImageData | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudioData | null>(null);
  const [generatedCaptions, setGeneratedCaptions] = useState<GeneratedCaptionData | null>(null);
  
  const [isRendering, setIsRendering] = useState(false);
  const [remotionProps, setRemotionProps] = useState<CompositionProps | null>(null);


  const handleFormSubmit = async (data: VideoFormValues) => {
    setIsLoading(true);
    setScript(null);
    setKeywords(null);
    setGeneratedImage(null);
    setGeneratedAudio(null);
    setGeneratedCaptions(null);
    setRemotionProps(null);

    try {
      // 1. Generate Script
      toast({ title: 'Generating script...', description: 'Hang tight, AI is working its magic.' });
      const scriptResult = await generateScriptAction({ topic: data.topic, style: data.style, duration: data.duration });
      if (!scriptResult.script) throw new Error('Script generation failed');
      setScript(scriptResult.script);
      toast({ title: 'Script generated!', variant: 'default' });

      // 2. Summarize Script into Keywords (for image generation)
      toast({ title: 'Generating keywords for images...' });
      const keywordsResult = await summarizeScriptAction({ script: scriptResult.script });
      if (!keywordsResult.keywords) throw new Error('Keyword generation failed');
      setKeywords(keywordsResult.keywords);
      toast({ title: 'Keywords generated!', description: `Keywords: ${keywordsResult.keywords}` });

      // Placeholder for Image Generation
      // TODO: Implement actual image generation call (e.g., using Replicate)
      // For now, using a placeholder image and the generated keywords
      toast({ title: 'Generating image (placeholder)...' });
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const placeholderImageUrl = `https://placehold.co/1080x1920.png`; // Placeholder for SDXL image
      setGeneratedImage({ url: placeholderImageUrl, keywords: keywordsResult.keywords });
      toast({ title: 'Image generated (placeholder)!' });
      
      // Placeholder for Audio Generation
      // TODO: Implement actual audio generation (e.g., ElevenLabs)
      toast({ title: 'Generating audio (placeholder)...' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In a real scenario, you'd upload a silent audio or generated audio and get a URL
      setGeneratedAudio({ url: '/placeholder-audio.mp3' }); // This needs to be a valid path or URL
      toast({ title: 'Audio generated (placeholder)!' });

      // Placeholder for Captions Generation
      // TODO: Implement actual captions generation (e.g., AssemblyAI)
      toast({ title: 'Generating captions (placeholder)...' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGeneratedCaptions({ url: '/placeholder-captions.srt', content: 'This is a placeholder caption.' });
      toast({ title: 'Captions generated (placeholder)!' });

      // Prepare props for Remotion player/renderer
      setRemotionProps({
        script: scriptResult.script,
        imageUri: placeholderImageUrl, // Use placeholder image
        audioUri: '/placeholder-audio.mp3', // Use placeholder audio
        captions: 'This is a placeholder caption.', // Use placeholder caption
      });

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
        compositionId: 'MyVideo', // Ensure this matches your Remotion composition ID
        inputProps: remotionProps,
        // Other render options as needed
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
            <VideoForm onSubmit={handleFormSubmit} isLoading={isLoading} />
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
                <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-inner">
                   <RemotionPlayer
                    compositionId="MyVideo" // Must match a registered composition
                    inputProps={remotionProps}
                    // Adjust controls, width, height as needed for your layout
                    controls
                    style={{ width: '100%', height: '100%' }}
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
             {generatedImage && (
              <div className="p-4 border rounded-md bg-card">
                <h3 className="font-semibold mb-2 font-headline">Generated Image (Placeholder):</h3>
                <img src={generatedImage.url} alt="Generated visual" className="rounded-md max-w-xs mx-auto" data-ai-hint={generatedImage.keywords}/>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
