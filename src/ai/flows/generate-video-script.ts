// src/ai/flows/generate-video-script.ts
'use server';

/**
 * @fileOverview Generates a video script based on a topic, style, and duration.
 *
 * - generateVideoScript - A function that generates a video script.
 * - GenerateVideoScriptInput - The input type for the generateVideoScript function.
 * - GenerateVideoScriptOutput - The return type for the generateVideoScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateVideoScriptInputSchema = z.object({
  topic: z.string().describe('The topic of the video.'),
  style: z.string().optional().describe('The style of the video (e.g., educational, funny, corporate).'),
  duration: z.string().optional().describe('The desired duration of the video (e.g., short, medium, long).'),
});
export type GenerateVideoScriptInput = z.infer<typeof GenerateVideoScriptInputSchema>;

const GenerateVideoScriptOutputSchema = z.object({
  script: z.string().describe('The generated video script.'),
});
export type GenerateVideoScriptOutput = z.infer<typeof GenerateVideoScriptOutputSchema>;

export async function generateVideoScript(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
  return generateVideoScriptFlow(input);
}

const generateVideoScriptPrompt = ai.definePrompt({
  name: 'generateVideoScriptPrompt',
  input: {schema: GenerateVideoScriptInputSchema},
  output: {schema: GenerateVideoScriptOutputSchema},
  prompt: `You are a video script writer. Generate a video script based on the given topic, style, and duration.

Topic: {{{topic}}}
Style: {{{style}}}
Duration: {{{duration}}}

Script:`, //Handlebars syntax
});

const generateVideoScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptFlow',
    inputSchema: GenerateVideoScriptInputSchema,
    outputSchema: GenerateVideoScriptOutputSchema,
  },
  async input => {
    const {output} = await generateVideoScriptPrompt(input);
    return output!;
  }
);
