
'use server';

import { generateVideoScript as genVideoScriptFlow, GenerateVideoScriptInput, GenerateVideoScriptOutput } from '@/ai/flows/generate-video-script';
import { ai } from '@/ai/genkit';

// Action to generate video script
export async function generateScriptAction(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
  try {
    console.log('Generating script with input:', JSON.stringify(input));
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
    console.log('Script generated successfully:', result.title);
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
      console.log(`Generating image ${i + 1} of ${promptsToProcess.length} with prompt: "${imagePrompt}"`);
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
        console.log(`Image ${i + 1} generated.`);
      }
    }
     if (imageUrls.filter(url => !url.includes('placehold.co')).length === 0 && promptsToProcess.length > 0) {
        throw new Error('AI failed to generate any images successfully.');
    }
    console.log('All images processed. Total generated (or placeholders):', imageUrls.length);
    return { imageUrls };
  } catch (error: any) {
    console.error('Error in generateImagesAction:', error);
    const errorMessage = error.message?.toLowerCase() || '';
    if (errorMessage.includes('user_location_invalid')) {
        throw new Error('Image generation is not available in your region.');
    }
    if (errorMessage.includes('prompt was blocked')) {
        throw new Error('Image generation failed because the prompt was blocked by safety settings.');
    }
    if (errorMessage.includes('429') || errorMessage.includes('quota exceeded') || errorMessage.includes('rate limit')) {
        throw new Error('Image generation failed due to API rate limits (quota exceeded). Please try again in a minute or check your API plan.');
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
          similarity_boost: 0.75,
          style: 0.2, 
          use_speaker_boost: true
        },
      }),
    });

    if (!response.ok) {
      let errorBodyText = 'Could not retrieve error body from ElevenLabs.';
      try {
        errorBodyText = await response.text();
      } catch (e) {
        console.error('Failed to read error body from ElevenLabs response:', e);
      }
      console.error('ElevenLabs API Error:', response.status, errorBodyText);
      throw new Error(`ElevenLabs API request failed with status ${response.status}: ${errorBodyText}`);
    }
    
    let audioDataUri: string;
    try {
        const audioBlob = await response.blob();
        if (audioBlob.type !== 'audio/mpeg' && audioBlob.type !== 'audio/mp3') {
            const responseText = await audioBlob.text(); // Try to get text if it's not audio
            console.error('ElevenLabs did not return audio. Response:', responseText);
            throw new Error(`ElevenLabs returned non-audio content: ${responseText.substring(0,100)}`);
        }
        const buffer = await audioBlob.arrayBuffer();
        const base64Audio = Buffer.from(buffer).toString('base64');
        audioDataUri = `data:${response.headers.get('content-type') || 'audio/mpeg'};base64,${base64Audio}`;
    } catch (e: any) {
        console.error('Error processing ElevenLabs audio blob:', e);
        throw new Error(`Failed to process audio data from ElevenLabs: ${e.message}`);
    }
    
    console.log('Audio generated successfully from ElevenLabs.');
    return { audioUrl: audioDataUri };

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
