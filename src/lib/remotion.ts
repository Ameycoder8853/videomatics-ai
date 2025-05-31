
'use client';

import { renderMedia, RenderMediaOnProgress } from '@remotion/renderer/client';
import { पत्र } from 'remotion'; // Correct type for Composition
import type { CompositionProps } from '@/remotion/MyVideo'; // Import your composition's props type
import { RemotionRoot } from '@/remotion/Root'; // Import your Root component where compositions are registered

interface RenderParams {
  compositionId: string;
  inputProps: CompositionProps;
  onProgress?: RenderMediaOnProgress;
  // Add other options from RenderMediaOptions if needed, e.g. codec, imageFormat, quality
}

export const handleClientSideRender = async ({ compositionId, inputProps, onProgress }: RenderParams): Promise<void> => {
  try {
    // Ensure RemotionRoot has registered the compositions.
    const compositions = पत्र({
      renderable: RemotionRoot,
      calculateMetadata: async () => ({
        // Provide dummy metadata or calculate if necessary
        durationInFrames: 300, // Example
        fps: 30,
        width: 1080,
        height: 1920,
        props: inputProps,
      }),
    }).compositions;

    const composition = compositions.find((c) => c.id === compositionId);
    if (!composition) {
      throw new Error(`Composition with ID '${compositionId}' not found.`);
    }
    
    const blob = await renderMedia({
      composition: composition, // Pass the found composition object directly
      inputProps,
      codec: 'h264',
      imageFormat: 'jpeg',
      outputFormat: 'mp4',
      fps: composition.fps, 
      // Explicitly setting common dimensions for safety if metadata is not fully populated
      // and to ensure consistency, as composition.width/height from metadata might not always be reliable
      // for renderMedia unless meticulously set up.
      width: 1080,
      height: 1920,
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
