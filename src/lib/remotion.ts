
'use client';

import { renderMedia, RenderMediaOnProgress } from '@remotion/renderer/client';
import { getCompositions, Composition as RemotionCompositionInfo } from 'remotion'; 
import type { CompositionProps } from '@/remotion/MyVideo'; 
import { RemotionRoot } from '@/remotion/Root'; 

interface RenderParams {
  compositionId: string;
  inputProps: CompositionProps; 
  onProgress?: RenderMediaOnProgress;
  totalDurationInFrames: number; // Add this to accept dynamic total duration
}

export const handleClientSideRender = async ({ compositionId, inputProps, onProgress, totalDurationInFrames }: RenderParams): Promise<void> => {
  try {
    const compositions = await getCompositions(RemotionRoot, {
      inputProps: inputProps, 
    });

    const compositionInfo = compositions.find((c) => c.id === compositionId);
    if (!compositionInfo) {
      throw new Error(`Composition with ID '${compositionId}' not found.`);
    }

    // The totalDurationInFrames is now passed directly, ensuring it matches player
    const finalDurationForRender = totalDurationInFrames;
    console.log("handleClientSideRender: Using passed totalDurationInFrames for render:", finalDurationForRender);

    console.log("Final input props for renderMedia:", inputProps);
    console.log("Final composition for renderMedia:", {
        ...compositionInfo,
        durationInFrames: finalDurationForRender, // Override with calculated total duration
        props: inputProps,
    });


    const blob = await renderMedia({
      composition: {
        ...compositionInfo,
        durationInFrames: finalDurationForRender, 
        props: inputProps, 
      },
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
    a.download = `${inputProps.title || compositionId}-${Date.now()}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('Error rendering video in browser:', error);
    throw error; 
  }
};
