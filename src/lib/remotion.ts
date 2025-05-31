
'use client';

import { renderMedia, RenderMediaOnProgress } from '@remotion/renderer/client';
import { getCompositions, Composition as RemotionCompositionInfo } from 'remotion'; 
import type { CompositionProps } from '@/remotion/MyVideo'; 
import { RemotionRoot } from '@/remotion/Root'; 

interface RenderParams {
  compositionId: string;
  inputProps: CompositionProps; 
  onProgress?: RenderMediaOnProgress;
}

export const handleClientSideRender = async ({ compositionId, inputProps, onProgress }: RenderParams): Promise<void> => {
  try {
    const compositions = await getCompositions(RemotionRoot, {
      inputProps: inputProps, 
    });

    const compositionInfo = compositions.find((c) => c.id === compositionId);
    if (!compositionInfo) {
      throw new Error(`Composition with ID '${compositionId}' not found.`);
    }

    // Calculate dynamic total duration for rendering based on inputProps
    // This should match how it's calculated for the player in generate/page.tsx
    let actualTotalDurationInFrames = compositionInfo.durationInFrames; // Fallback to composition default
    
    if (inputProps.audioUri && typeof window !== 'undefined') {
        // Attempt to measure audio for accurate duration, similar to generate page
        // This is a simplified version, assumes audioUri is a data URI or resolvable URL
        try {
            const audio = new Audio(inputProps.audioUri);
            await new Promise<void>((resolve, reject) => {
                audio.onloadedmetadata = () => {
                    actualTotalDurationInFrames = Math.ceil(audio.duration * (compositionInfo.fps || 30));
                    console.log("handleClientSideRender: Measured audio, total render duration frames:", actualTotalDurationInFrames);
                    resolve();
                };
                audio.onerror = () => {
                    console.warn("handleClientSideRender: Could not load audio metadata for duration calculation during render. Using composition default.");
                    resolve(); // Resolve anyway to not block rendering, will use default.
                };
                 // Timeout if metadata doesn't load quickly
                setTimeout(() => {
                    console.warn("handleClientSideRender: Audio metadata load timeout. Using composition default duration.");
                    resolve();
                }, 5000); // 5 second timeout
            });
        } catch (e) {
            console.warn("handleClientSideRender: Error in audio duration measurement during render:", e);
        }
    } else if (inputProps.sceneTexts && inputProps.imageDurationInFrames) {
        // Fallback if audioUri is not available or in non-browser (should not happen for client render)
        actualTotalDurationInFrames = inputProps.sceneTexts.length * inputProps.imageDurationInFrames;
        console.log("handleClientSideRender: Calculated from scenes, total render duration frames:", actualTotalDurationInFrames);
    }


    console.log("Final input props for renderMedia:", inputProps);
    console.log("Final composition for renderMedia:", {
        ...compositionInfo,
        durationInFrames: actualTotalDurationInFrames, // Override with calculated total duration
        props: inputProps,
    });


    const blob = await renderMedia({
      composition: {
        ...compositionInfo,
        durationInFrames: actualTotalDurationInFrames, // Crucial: Use the dynamically calculated total duration
        props: inputProps, // Pass the full inputProps, including dynamic imageDurationInFrames (scene duration)
      },
      // inputProps: inputProps, // Already part of composition.props
      codec: 'h264',
      imageFormat: 'jpeg',
      outputFormat: 'mp4',
      fps: compositionInfo.fps || 30, 
      width: compositionInfo.width, 
      height: compositionInfo.height, 
      onProgress,
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${compositionId}-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error rendering video in browser:', error);
    throw error; 
  }
};
