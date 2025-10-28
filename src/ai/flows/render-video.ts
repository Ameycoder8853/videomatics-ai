
'use server';

/**
 * @fileOverview A flow to render a Remotion composition on Google Cloud Run.
 * 
 * - renderVideo - A function that handles the remote rendering process.
 * - RenderVideoInput - The input type for the renderVideo function.
 * - RenderVideoOutput - The return type for the renderVideo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { renderVideoOnCloudRun, getRenderProgress } from '@remotion/cloudrun';
import type { CompositionProps } from '@/remotion/MyVideo';
import { updateVideoDocument } from '@/firebase/firestore';

const RenderVideoInputSchema = z.object({
  videoId: z.string().describe('The ID of the video document in Firestore.'),
  compositionId: z.string().describe('The ID of the Remotion composition to render.'),
  inputProps: z.any().describe('The props to pass to the Remotion composition.'),
});
export type RenderVideoInput = z.infer<typeof RenderVideoInputSchema>;

const RenderVideoOutputSchema = z.object({
  renderId: z.string().describe('The ID of the render job.'),
  videoUrl: z.string().describe('The final URL of the rendered video.'),
});
export type RenderVideoOutput = z.infer<typeof RenderVideoOutputSchema>;

export async function renderVideo(input: RenderVideoInput): Promise<RenderVideoOutput> {
  return renderVideoFlow(input);
}

const renderVideoFlow = ai.defineFlow(
  {
    name: 'renderVideoFlow',
    inputSchema: RenderVideoInputSchema,
    outputSchema: RenderVideoOutputSchema,
  },
  async ({ videoId, compositionId, inputProps }) => {
    // Validate environment variables
    const projectId = process.env.REMOTION_GCP_PROJECT_ID;
    const region = process.env.REMOTION_GCP_REGION;
    const serviceAccount = process.env.REMOTION_GCP_SERVICE_ACCOUNT_EMAIL;
    const siteName = process.env.REMOTION_SITE_NAME;
    const bucketName = process.env.REMOTION_BUCKET_NAME;

    if (!projectId || !region || !serviceAccount || !siteName || !bucketName) {
      throw new Error('Required Remotion Google Cloud environment variables are not set.');
    }

    const { renderId, GCS_OUTPUT_LOCATION: gcsOutputLocation } = await renderVideoOnCloudRun({
      projectId: projectId,
      region: region,
      serviceAccount: serviceAccount,
      siteName: siteName,
      composition: compositionId as any,
      inputProps: inputProps as CompositionProps,
      codec: 'h264',
    });

    await updateVideoDocument(videoId, { renderId: renderId });

    // Poll for progress
    let progress = await getRenderProgress({
      renderId,
      projectId: projectId,
      region: region,
      serviceAccount: serviceAccount,
    });

    while (progress.overallProgress < 1 && !progress.fatalErrorEncountered) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
      progress = await getRenderProgress({
        renderId,
        projectId: projectId,
        region: region,
        serviceAccount: serviceAccount,
      });
    }

    if (progress.fatalErrorEncountered) {
      throw new Error(`Remotion render failed: ${progress.errors[0]?.message || 'Unknown error'}`);
    }

    if (!progress.outputFile) {
      throw new Error('Remotion render finished but did not return an output file URL.');
    }

    await updateVideoDocument(videoId, { renderUrl: progress.outputFile, status: 'completed' });

    return {
      renderId,
      videoUrl: progress.outputFile,
    };
  }
);
