
'use server';

import { generateVideoScript as genVideoScriptFlow, GenerateVideoScriptInput, GenerateVideoScriptOutput } from '@/ai/flows/generate-video-script';
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
    const message = error.message || 'Script generation failed due to an unexpected error.';
    throw new Error(`Script generation failed: ${message}`);
  }
}

interface GenerateImagesInput {
  prompts: string[];
}
interface GenerateImagesOutput {
  imageUrls: string[];
}
export async function generateImagesAction(input: GenerateImagesInput): Promise<GenerateImagesOutput> {
  console.log('generateImagesAction called with', input.prompts.length, 'prompts.');
  const imageUrls: string[] = [];

  if (input.prompts.length === 0) {
    return { imageUrls: [] };
  }

  try {
    // Generate up to a max of, say, 15 images to keep generation times reasonable
    const promptsToProcess = input.prompts.slice(0, 15);

    for (let i = 0; i < promptsToProcess.length; i++) {
      const imagePrompt = promptsToProcess[i];
      console.log(`Generating image ${i + 1} with prompt: "${imagePrompt}"`);
      const {media} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp',
        prompt: `Generate a high-quality, visually appealing image suitable for a video, based on the following theme or keywords: "${imagePrompt}". The image should be in portrait orientation (1080x1920).`,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
           safetySettings: [
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        },
      });

      if (!media || !media.url) {
        console.warn(`AI failed to generate image for prompt: "${imagePrompt}" or returned an invalid response.`);
        imageUrls.push('https://placehold.co/1080x1920.png?text=Image+Gen+Failed');
      } else {
        imageUrls.push(media.url);
      }
    }
     if (imageUrls.filter(url => !url.includes('placehold.co')).length === 0 && promptsToProcess.length > 0) {
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

interface GenerateAudioInput {
  text: string;
  voiceId?: string;
}
interface GenerateAudioOutput {
  audioUrl: string; // This will be a data URI
}
export async function generateAudioAction(input: GenerateAudioInput): Promise<GenerateAudioOutput> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error('ElevenLabs API key is not set in environment variables.');
    throw new Error('ElevenLabs API key is missing. Cannot generate audio.');
  }

  const voiceId = input.voiceId || '21m00Tcm4TlvDq8ikWAM'; // Default to "Rachel"
  const modelId = 'eleven_multilingual_v2';
  const ttsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

  console.log(`Generating audio with ElevenLabs for text: "${input.text.substring(0, 100)}..."`);

  try {
    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: input.text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75, // Boost similarity a bit for consistency
          style: 0.2, // Add a little style
          use_speaker_boost: true
        },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('ElevenLabs API Error:', response.status, errorBody);
      throw new Error(`ElevenLabs API request failed with status ${response.status}: ${errorBody}`);
    }

    const audioBlob = await response.blob();
    const buffer = await audioBlob.arrayBuffer();
    const base64Audio = Buffer.from(buffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
    
    console.log('Audio generated successfully from ElevenLabs.');
    return { audioUrl };

  } catch (error: any) {
    console.error('Error in generateAudioAction (ElevenLabs):', error);
    throw new Error(`Audio generation failed: ${error.message || 'Unknown error contacting ElevenLabs'}`);
  }
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
