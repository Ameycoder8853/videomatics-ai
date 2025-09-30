
'use server';

/**
 * @fileOverview Generates a video from text using an AI avatar.
 *
 * - generateAvatarVideo - A function that handles the avatar video generation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { createHeyGenVideo } from '@/lib/heygen';

const GenerateAvatarVideoInputSchema = z.object({
  script: z.string().describe('The text script for the avatar to speak.'),
  avatarId: z.string().optional().describe('The ID of the avatar to use.'),
});
export type GenerateAvatarVideoInput = z.infer<typeof GenerateAvatarVideoInputSchema>;

const GenerateAvatarVideoOutputSchema = z.object({
  videoUrl: z.string().describe('The URL of the generated avatar video.'),
});
export type GenerateAvatarVideoOutput = z.infer<typeof GenerateAvatarVideoOutputSchema>;

export async function generateAvatarVideo(input: GenerateAvatarVideoInput): Promise<GenerateAvatarVideoOutput> {
  // We check for the key here to fail early before even starting the flow.
  const heygenApiKey = process.env.HEYGEN_API_KEY;
  if (!heygenApiKey) {
    throw new Error('HEYGEN_API_KEY is not set in environment variables.');
  }
  return generateAvatarVideoFlow(input);
}

const generateAvatarVideoFlow = ai.defineFlow(
  {
    name: 'generateAvatarVideoFlow',
    inputSchema: GenerateAvatarVideoInputSchema,
    outputSchema: GenerateAvatarVideoOutputSchema,
  },
  async (input) => {
    
    // Get the API key from environment variables within the flow.
    const heygenApiKey = process.env.HEYGEN_API_KEY;
    if (!heygenApiKey) {
      // This check is redundant due to the one in the wrapper, but it's good practice for the flow itself.
      throw new Error('HEYGEN_API_KEY is not set in environment variables.');
    }

    // Ensure a default avatarId is used if none is provided.
    // This was the source of the "Bad Request" error.
    const avatarIdToUse = input.avatarId || 'aadhya_public-en-IN';

    // Call the HeyGen video creation function and correctly pass the apiKey.
    const videoUrl = await createHeyGenVideo(input.script, avatarIdToUse, heygenApiKey);

    if (!videoUrl) {
        throw new Error('Failed to generate video or retrieve video URL from HeyGen.');
    }

    return { videoUrl };
  }
);
