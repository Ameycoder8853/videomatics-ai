
'use server';

import { generateVideoScript as genVideoScriptFlow, GenerateVideoScriptInput, GenerateVideoScriptOutput } from '@/ai/flows/generate-video-script';
// summarizeScriptIntoKeywords is no longer needed.
import { ai } from '@/ai/genkit';

// Action to generate video script
export async function generateScriptAction(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
  try {
    const result = await genVideoScriptFlow(input);
    if (!result || !result.title || !result.scenes || result.scenes.length === 0) {
      throw new Error('AI failed to generate a structured script with title and scenes.');
    }
    // Basic validation for scene content
    result.scenes.forEach((scene, index) => {
        if (!scene.imagePrompt || !scene.contentText) {
            throw new Error(`Scene ${index + 1} is missing imagePrompt or contentText.`);
        }
    });
    return result;
  } catch (error: any) {
    console.error('Error in generateScriptAction:', error);
    // If it's a Genkit error with a message, use that, otherwise a generic one
    const message = error.message || 'Script generation failed due to an unexpected error.';
    throw new Error(`Script generation failed: ${message}`);
  }
}

// summarizeScriptAction is removed.

interface GenerateImagesInput {
  prompts: string[]; // Array of prompts, one for each image
}
interface GenerateImagesOutput {
  imageUrls: string[]; // Will be an array of data URIs
}
export async function generateImagesAction(input: GenerateImagesInput): Promise<GenerateImagesOutput> {
  console.log('generateImagesAction called with', input.prompts.length, 'prompts.');
  const imageUrls: string[] = [];

  if (input.prompts.length === 0) {
    return { imageUrls: [] };
  }

  try {
    for (let i = 0; i < input.prompts.length; i++) {
      const imagePrompt = input.prompts[i]; // Use the specific prompt for this image
      console.log(`Generating image ${i + 1} with prompt: "${imagePrompt}"`);
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        // The prompt from the script already specifies portrait, but we reinforce it.
        prompt: `Generate a high-quality, visually appealing image suitable for a video, based on the following theme or keywords: "${imagePrompt}". The image should be in portrait orientation (1080x1920).`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
           safetySettings: [ // Relax safety settings a bit for broader creative generation
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        },
      });

      if (!media || !media.url) {
        console.warn(`AI failed to generate image for prompt: "${imagePrompt}" or returned an invalid response.`);
        imageUrls.push('https://placehold.co/1080x1920.png?text=Image+Gen+Failed'); // Add a placeholder on failure
      } else {
        imageUrls.push(media.url);
      }
    }

    if (imageUrls.filter(url => !url.includes('placehold.co')).length === 0 && input.prompts.length > 0) {
        // If all images failed for actual prompts
        throw new Error('AI failed to generate any images successfully.');
    }

    return { imageUrls };
  } catch (error: any) {
    console.error('Error in generateImagesAction:', error);
    if (error.message?.includes('USER_LOCATION_INVALID')) {
        throw new Error('Image generation is not available in your region.');
    }
    if (error.message?.includes('prompt was blocked')) {
        throw new Error('Image generation failed because the prompt was blocked by safety settings.');
    }
    throw new Error(`Image generation failed: ${error.message || 'Unknown error'}`);
  }
}


// Placeholder for Audio Generation Action (e.g., calling ElevenLabs)
interface GenerateAudioInput {
  text: string; // The script text to convert to speech
  voiceId?: string; // Optional voice ID for ElevenLabs
}
interface GenerateAudioOutput {
  audioUrl: string; // URL of the generated audio file
}
export async function generateAudioAction(input: GenerateAudioInput): Promise<GenerateAudioOutput> {
  console.log('Placeholder: generateAudioAction called with text length:', input.text.length);
  // In a real app, you would call an API like ElevenLabs here using the API key from .env
  // For example: process.env.ELEVENLABS_API_KEY
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  return { audioUrl: `/placeholder-audio.mp3` }; // Return path to a file in public/
}

// Placeholder for Captions Generation Action (e.g., calling AssemblyAI)
interface GenerateCaptionsInput {
  audioUrl: string; // URL of the audio file to transcribe
}
interface GenerateCaptionsOutput {
  captionsUrl: string; // URL to the SRT/VTT file
  transcript: string; // Full transcript text
}
export async function generateCaptionsAction(input: GenerateCaptionsInput): Promise<GenerateCaptionsOutput> {
  console.log('Placeholder: generateCaptionsAction called with audio URL:', input.audioUrl);
  // In a real app, you would call an API like AssemblyAI here using the API key from .env
  // For example: process.env.ASSEMBLYAI_API_KEY
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  return {
    captionsUrl: `/placeholder-captions.srt`, // Return path to a file in public/
    transcript: 'This is a placeholder transcript for the provided audio.'
  };
}
