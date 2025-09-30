
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
    const heygenApiKey = process.env.HEYGEN_API_KEY;
    if (!heygenApiKey) {
      throw new Error('HEYGEN_API_KEY is not set in environment variables.');
    }

    // Ensure a default avatarId is used if none is provided.
    // This was the source of the "Bad Request" error.
    const avatarIdToUse = input.avatarId || 'aadhya_public-en-IN';

    const videoUrl = await createHeyGenVideo(input.script, avatarIdToUse, heygenApiKey);

    if (!videoUrl) {
        throw new Error('Failed to generate video or retrieve video URL from HeyGen.');
    }

    return { videoUrl };
  }
);
