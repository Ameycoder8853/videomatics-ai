
'use client';

import { useState } from 'react';
import { VideoForm, type VideoFormValues } from '@/components/VideoForm';
import { RemotionPlayer } from '@/components/RemotionPlayer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Play, Image as ImageIcon } from 'lucide-react'; // Added ImageIcon
import { generateScriptAction, summarizeScriptAction, generateImageAction, generateAudioAction, generateCaptionsAction } from '@/app/actions'; // Server actions
import { useToast } from '@/hooks/use-toast';
import { handleClientSideRender } from '@/lib/remotion';
import type { CompositionProps } from '@/remotion/MyVideo';

interface GeneratedImageData { url: string; keywords: string; }
interface GeneratedAudioData { url: string; } // Stays placeholder
interface GeneratedCaptionData { url: string; content: string; } // Stays placeholder


export default function GeneratePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [script, setScript] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImageData | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<GeneratedAudioData | null>(null); // Stays placeholder
  const [generatedCaptions, setGeneratedCaptions] = useState<GeneratedCaptionData | null>(null); // Stays placeholder
  
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
      toast({ title: 'Generating script...', description: 'Hang tight, AI is crafting your narrative.' });
      const scriptResult = await generateScriptAction({ topic: data.topic, style: data.style, duration: data.duration });
      if (!scriptResult.script) throw new Error('Script generation failed');
      setScript(scriptResult.script);
      toast({ title: 'Script generated!', variant: 'default' });

      // 2. Summarize Script into Keywords (for image generation)
      toast({ title: 'Extracting keywords for visuals...' });
      const keywordsResult = await summarizeScriptAction({ script: scriptResult.script });
      if (!keywordsResult.keywords) throw new Error('Keyword generation failed');
      setKeywords(keywordsResult.keywords);
      toast({ title: 'Keywords extracted!', description: `Keywords: ${keywordsResult.keywords}` });

      // 3. Generate Image
      toast({ title: 'Generating image with AI...', description: 'This might take a few moments.' });
      const imageResult = await generateImageAction({ prompt: keywordsResult.keywords });
      if (!imageResult.imageUrl) throw new Error('Image generation failed');
      setGeneratedImage({ url: imageResult.imageUrl, keywords: keywordsResult.keywords });
      toast({ title: 'Image generated successfully!' });
      
      // 4. Placeholder for Audio Generation
      toast({ title: 'Preparing audio (placeholder)...' });
      // const audioResult = await generateAudioAction({ text: scriptResult.script }); // Kept as placeholder
      // if (!audioResult.audioUrl) throw new Error('Audio generation failed');
      // setGeneratedAudio({ url: audioResult.audioUrl });
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate work
      setGeneratedAudio({ url: '/placeholder-audio.mp3' }); // Using placeholder
      toast({ title: 'Audio ready (placeholder)!' });

      // 5. Placeholder for Captions Generation
      toast({ title: 'Preparing captions (placeholder)...' });
      // const captionsResult = await generateCaptionsAction({ audioUrl: audioResult.audioUrl }); // Kept as placeholder
      // if(!captionsResult.transcript) throw new Error('Captions generation failed');
      // setGeneratedCaptions({ url: captionsResult.captionsUrl, content: captionsResult.transcript});
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate work
      setGeneratedCaptions({ url: '/placeholder-captions.srt', content: 'This is a placeholder caption.' }); // Using placeholder
      toast({ title: 'Captions ready (placeholder)!' });

      // 6. Prepare props for Remotion player/renderer
      setRemotionProps({
        script: scriptResult.script,
        imageUri: imageResult.imageUrl, // Use REAL generated image URL
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
                    compositionId="MyVideo"
                    inputProps={remotionProps}
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
                <h3 className="font-semibold mb-2 font-headline flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5 text-accent" />
                  Generated Image:
                </h3>
                <div className="mt-2 flex justify-center">
                  <img 
                    src={generatedImage.url} 
                    alt="AI generated visual based on keywords" 
                    className="rounded-md max-w-full md:max-w-md max-h-[400px] object-contain shadow-lg" 
                    data-ai-hint={generatedImage.keywords}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
