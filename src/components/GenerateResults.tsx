
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image as ImageIcon, FileText, Mic, TypeIcon } from 'lucide-react';
import type { GenerateVideoScriptOutput } from '@/ai/flows/generate-video-script';

interface GenerateResultsProps {
  scriptResult: GenerateVideoScriptOutput | null;
  generatedImages: string[] | null;
  generatedAudioUri: string | null;
  generatedCaptions: string | null;
}

export function GenerateResults({
  scriptResult,
  generatedImages,
  generatedAudioUri,
  generatedCaptions,
}: GenerateResultsProps) {
  if (!scriptResult && !generatedImages && !generatedAudioUri && generatedCaptions === null) {
    return null;
  }

  return (
    <>
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
    </>
  );
}
