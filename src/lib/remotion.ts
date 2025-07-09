
'use client';

import { renderMedia, RenderMediaOnProgress } from '@remotion/renderer/client';
import type { CompositionProps } from '@/remotion/MyVideo';
import { MyVideoComposition, myVideoSchema } from '@/remotion/MyVideo'; // Import component and schema directly

interface RenderParams {
  compositionId: string;
  inputProps: CompositionProps;
  onProgress?: RenderMediaOnProgress;
  totalDurationInFrames: number;
}

export const handleClientSideRender = async ({
  compositionId,
  inputProps,
  onProgress,
  totalDurationInFrames,
}: RenderParams): Promise<void> => {
  try {
    // Instead of calling getCompositions, we manually construct the composition object.
    // This avoids using a Node.js-specific function in the browser.
    if (compositionId !== 'MyVideo') {
      throw new Error(
        `This renderer is configured only for 'MyVideo', not '${compositionId}'.`
      );
    }

    const compositionToRender = {
      id: compositionId,
      component: MyVideoComposition,
      durationInFrames: totalDurationInFrames,
      fps: 30, // As defined in RemotionRoot
      width: 1080, // As defined in RemotionRoot
      height: 1920, // As defined in RemotionRoot
      schema: myVideoSchema,
      props: inputProps,
    };

    const blob = await renderMedia({
      composition: compositionToRender,
      codec: 'h264',
      imageFormat: 'jpeg',
      outputFormat: 'mp4',
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
    throw error;
  }
};
