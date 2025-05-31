'use client';

import { renderMedia, RenderMediaOnProgress } from '@remotion/renderer/client';
import { पत्र } from 'remotion'; // Correct type for Composition
import type { CompositionProps } from '@/remotion/MyVideo'; // Import your composition's props type
import { RemotionRoot } from '@/remotion/Root'; // Import your Root component where compositions are registered
import {truthy} from '@remotion/utils';

interface RenderParams {
  compositionId: string;
  inputProps: CompositionProps;
  onProgress?: RenderMediaOnProgress;
  // Add other options from RenderMediaOptions if needed, e.g. codec, imageFormat, quality
}

export const handleClientSideRender = async ({ compositionId, inputProps, onProgress }: RenderParams): Promise<void> => {
  try {
    // Ensure RemotionRoot has registered the compositions.
    // This might not be strictly necessary if Player is already initializing Root,
    // but explicit registration is safer for standalone rendering.
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
      // Instead of composition, pass the component directly
      // This requires that your RemotionRoot is structured to allow access to composition components,
      // or you import the specific composition component here.
      // For simplicity with renderMedia on client, it's often easier to have a direct component reference.
      // However, the user provided `composition: 'MyVideo'`, implying usage of composition ID.
      // To use composition ID, `getCompositions` from `@remotion/renderer/client` should be used
      // after RemotionRoot is somehow initialized/imported.
      // Let's adjust to use the 'composition' object found above.

      composition: truthy(composition), // Pass the found composition object
      inputProps,
      codec: 'h264',
      imageFormat: 'jpeg',
      // type: 'mp4', // 'type' is deprecated, use 'outputFormat'
      outputFormat: 'mp4',
      fps: composition.fps, // Use fps from composition metadata
      // width: composition.width, // Use width from composition metadata
      // height: composition.height, // Use height from composition metadata
      // The above width/height might be an issue if not set directly in composition metadata for renderMedia
      // Explicitly setting common dimensions for safety if metadata is not fully populated
      width: 1080,
      height: 1920,
      onProgress,
      // downloadScope: 'unrestricted', // if you need to download across origins
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

// Note: Ensure `remotion/Root.tsx` is correctly set up to register all compositions.
// The `getCompositions` function might be needed if dynamic lookup is preferred over direct component import.
// For `renderMedia` to work with `composition: compositionObject`, the `compositionObject` needs to be
// obtained from `getCompositions` after Remotion has initialized.
// The above `पत्र` approach might be more aligned with server-side metadata calculation.
// A simpler client-side approach might involve directly passing the component to `renderMedia`.
// Example:
// import { MyVideoComposition } from '@/remotion/MyVideo';
// const blob = await renderMedia({ component: MyVideoComposition, inputProps, ... });
// The current implementation attempts to use the composition ID as requested.
