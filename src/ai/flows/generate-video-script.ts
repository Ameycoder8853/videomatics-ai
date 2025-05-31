
'use server';

/**
 * @fileOverview Generates a video script with title and scenes, where each scene has image prompts and content text.
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
  duration: z.string().optional().describe('The desired duration category of the video (e.g., short: <1min, medium: 1-3min, long: >3min). This guides the number of scenes.'),
});
export type GenerateVideoScriptInput = z.infer<typeof GenerateVideoScriptInputSchema>;

const SceneSchema = z.object({
  imagePrompt: z.string().describe('A detailed prompt for an AI image generator to create a realistic visual for the scene. Describe the scene, subjects, environment, mood, and style. Make it suitable for a portrait (1080x1920) aspect ratio image.'),
  contentText: z.string().describe('The voiceover script or text content that will be narrated or displayed during this scene. Keep it concise for a short video scene.'),
});
export type Scene = z.infer<typeof SceneSchema>;

const GenerateVideoScriptOutputSchema = z.object({
  title: z.string().describe('A catchy title for the video.'),
  scenes: z.array(SceneSchema).describe('An array of scenes, each with an image prompt and content text. For a "short" video, aim for 3-5 scenes. For "medium", 5-8 scenes. For "long", 8-15 scenes.'),
});
export type GenerateVideoScriptOutput = z.infer<typeof GenerateVideoScriptOutputSchema>;

export async function generateVideoScript(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
  return generateVideoScriptFlow(input);
}

const generateVideoScriptPrompt = ai.definePrompt({
  name: 'generateVideoScriptPrompt',
  input: {schema: GenerateVideoScriptInputSchema},
  output: {schema: GenerateVideoScriptOutputSchema},
  prompt: `You are a creative video scriptwriter and visual director.
Generate a video script based on the given topic, style, and desired duration category.
The video's length will be determined by the number of scenes you generate and the content within them.

- For a "short" duration, aim for 3-5 scenes.
- For a "medium" duration, aim for 5-8 scenes.
- For a "long" duration, aim for 8-15 scenes to create a video around 30-60 seconds.

For each scene in the script, provide:
1.  \`imagePrompt\`: A detailed prompt for an AI image generator to create a realistic visual for the scene, suitable for a portrait (1080x1920) aspect ratio. Describe the scene, subjects, environment, mood, and style effectively.
2.  \`contentText\`: The voiceover script or text content that will be narrated or displayed during this scene. Keep it concise, ideally 1-2 short sentences per scene.

The output MUST be a JSON object matching the following schema:
{
  "title": "string (A catchy title for the video.)",
  "scenes": [
    {
      "imagePrompt": "string (Detailed prompt for a portrait 1080x1920 realistic image.)",
      "contentText": "string (Concise voiceover script for the scene, 1-2 sentences.)"
    }
    // ... more scenes
  ]
}

Topic: {{{topic}}}
Style: {{{style}}}
Desired Duration Category: {{{duration}}}

Respond ONLY with the JSON object. Do not include any other text before or after the JSON.
`,
});

const generateVideoScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptFlow',
    inputSchema: GenerateVideoScriptInputSchema,
    outputSchema: GenerateVideoScriptOutputSchema,
  },
  async input => {
    const {output} = await generateVideoScriptPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate a script with the required structure.');
    }
    // Validate that the output is parsable and somewhat matches the structure,
    // though Genkit's definePrompt output schema validation should handle most of this.
    try {
      // Genkit already parses, but we can double-check key fields.
      if (!output.title || !Array.isArray(output.scenes) || output.scenes.length === 0) {
         throw new Error('Generated script is missing title or scenes.');
      }
      output.scenes.forEach(scene => {
        if (!scene.imagePrompt || !scene.contentText) {
          throw new Error('A scene is missing imagePrompt or contentText.');
        }
      });
    } catch (e: any) {
      console.error("Invalid script structure from AI:", output, e.message);
      throw new Error(`AI returned an invalid script structure: ${e.message}`);
    }
    return output;
  }
);

