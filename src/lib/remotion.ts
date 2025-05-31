
'use client';

import { renderMedia, RenderMediaOnProgress } from '@remotion/renderer/client';
import { getCompositions } from 'remotion'; // Correct import for discovering compositions
import type { CompositionProps } from '@/remotion/MyVideo'; // Import your composition's props type
import { RemotionRoot } from '@/remotion/Root'; // Import your Root component where compositions are registered

interface RenderParams {
  compositionId: string;
  inputProps: CompositionProps; // This should be the fully resolved props
  onProgress?: RenderMediaOnProgress;
  // Add other options from RenderMediaOptions if needed, e.g. codec, imageFormat, quality
}

export const handleClientSideRender = async ({ compositionId, inputProps, onProgress }: RenderParams): Promise<void> => {
  try {
    // The getCompositions function needs the input props to correctly calculate metadata like duration.
    const compositions = getCompositions(RemotionRoot, {
      inputProps: inputProps, // Pass the actual inputProps here
    });

    const compositionInfo = compositions.find((c) => c.id === compositionId);
    if (!compositionInfo) {
      throw new Error(`Composition with ID '${compositionId}' not found.`);
    }

    // Calculate dynamic duration based on inputProps
    const numberOfScenes = inputProps.sceneTexts?.length || inputProps.imageUris?.length || 1;
    const durationPerScene = inputProps.imageDurationInFrames || 120; // Default to 120 frames if not specified
    const actualDurationInFrames = numberOfScenes * durationPerScene;
    const actualFps = 30; // Assuming consistent FPS for the composition

    console.log("Calculated duration for renderMedia:", actualDurationInFrames, "frames");
    console.log("Number of scenes:", numberOfScenes, "Duration per scene:", durationPerScene, "frames");
    console.log("Input props for renderMedia:", inputProps);


    const blob = await renderMedia({
      // Pass the Composition object obtained from getCompositions.
      // Override its durationInFrames with our dynamically calculated one.
      composition: {
        ...compositionInfo,
        durationInFrames: actualDurationInFrames, 
        props: inputProps, 
      },
      inputProps: inputProps, // renderMedia also expects inputProps separately
      codec: 'h264',
      imageFormat: 'jpeg',
      outputFormat: 'mp4',
      fps: actualFps, // Use the defined FPS
      width: compositionInfo.width, 
      height: compositionInfo.height, 
      onProgress,
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${compositionId}-${Date.now()}.mp4`;
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error rendering video in browser:', error);
    throw error; // Re-throw to be caught by the caller
  }
};
