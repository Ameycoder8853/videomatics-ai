
'use server';

import { generateVideoScript as genVideoScriptFlow, GenerateVideoScriptInput, GenerateVideoScriptOutput } from '@/ai/flows/generate-video-script';
import { summarizeScriptIntoKeywords as summarizeKeywordsFlow, SummarizeScriptInput, SummarizeScriptOutput } from '@/ai/flows/summarize-script-into-keywords';
import { ai } from '@/ai/genkit'; // Import the global ai object

// Action to generate video script
export async function generateScriptAction(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
  try {
    const result = await genVideoScriptFlow(input);
    if (!result || !result.script) {
      throw new Error('AI failed to generate a script.');
    }
    return result;
  } catch (error: any) {
    console.error('Error in generateScriptAction:', error);
    throw new Error(`Script generation failed: ${error.message}`);
  }
}

// Action to summarize script into keywords
export async function summarizeScriptAction(input: SummarizeScriptInput): Promise<SummarizeScriptOutput> {
  try {
    const result = await summarizeKeywordsFlow(input);
     if (!result || !result.keywords) {
      throw new Error('AI failed to generate keywords.');
    }
    return result;
  } catch (error: any) {
    console.error('Error in summarizeScriptAction:', error);
    throw new Error(`Keyword summarization failed: ${error.message}`);
  }
}

interface GenerateImagesInput { // Changed from GenerateImageInput
  prompt: string;
  numberOfImages?: number;
}
interface GenerateImagesOutput { // Changed from GenerateImageOutput
  imageUrls: string[]; // Will be an array of data URIs
}
export async function generateImagesAction(input: GenerateImagesInput): Promise<GenerateImagesOutput> { // Renamed to generateImagesAction
  console.log('generateImagesAction called with prompt:', input.prompt, 'number of images:', input.numberOfImages);
  const numberOfImagesToGenerate = input.numberOfImages || 3; // Default to 3 images
  const imageUrls: string[] = [];

  try {
    for (let i = 0; i < numberOfImagesToGenerate; i++) {
      const imagePrompt = `${input.prompt} - scene ${i + 1}`; // Vary prompt slightly for each image
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: `Generate a high-quality, visually appealing image suitable for a video, based on the following theme or keywords: ${imagePrompt}. The image should be in portrait orientation (1080x1920). Ensure variety if multiple scenes are requested.`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!media || !media.url) {
        console.warn(`AI failed to generate image for scene ${i + 1} or returned an invalid response.`);
        // Optionally, add a placeholder or skip, for now, we'll skip if one fails.
        // Or throw new Error(`AI failed to generate an image for scene ${i + 1}.`);
        imageUrls.push('https://placehold.co/1080x1920.png?text=Image+Generation+Failed'); // Add a placeholder on failure
      } else {
        imageUrls.push(media.url);
      }
    }

    if (imageUrls.length === 0 && numberOfImagesToGenerate > 0) {
        throw new Error('AI failed to generate any images.');
    }

    return { imageUrls };
  } catch (error: any) {
    console.error('Error in generateImagesAction:', error);
    if (error.message.includes('USER_LOCATION_INVALID')) {
        throw new Error('Image generation is not available in your region.');
    }
    if (error.message.includes('prompt was blocked')) {
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
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  return { audioUrl: `/placeholder-audio.mp3` };
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
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  return {
    captionsUrl: `/placeholder-captions.srt`,
    transcript: 'This is a placeholder transcript for the provided audio.'
  };
}
