// SummarizeScriptIntoKeywords.ts
'use server';
/**
 * @fileOverview A flow that summarizes a video script into keywords.
 *
 * - summarizeScriptIntoKeywords - A function that summarizes the script into keywords.
 * - SummarizeScriptInput - The input type for the summarizeScriptIntoKeywords function.
 * - SummarizeScriptOutput - The return type for the summarizeScriptIntoKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeScriptInputSchema = z.object({
  script: z.string().describe('The video script to summarize.'),
});

export type SummarizeScriptInput = z.infer<typeof SummarizeScriptInputSchema>;

const SummarizeScriptOutputSchema = z.object({
  keywords: z
    .string()
    .describe('A comma-separated list of keywords derived from the script.'),
});

export type SummarizeScriptOutput = z.infer<typeof SummarizeScriptOutputSchema>;

export async function summarizeScriptIntoKeywords(
  input: SummarizeScriptInput
): Promise<SummarizeScriptOutput> {
  return summarizeScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeScriptPrompt',
  input: {schema: SummarizeScriptInputSchema},
  output: {schema: SummarizeScriptOutputSchema},
  prompt: `Summarize the following video script into a comma-separated list of keywords that can be used for image generation.\n\nScript: {{{script}}}`,
});

const summarizeScriptFlow = ai.defineFlow(
  {
    name: 'summarizeScriptFlow',
    inputSchema: SummarizeScriptInputSchema,
    outputSchema: SummarizeScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
