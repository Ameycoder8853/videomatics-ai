
'use server';

import { generateVideoScript as genVideoScriptFlow, GenerateVideoScriptInput, GenerateVideoScriptOutput } from '@/ai/flows/generate-video-script';
import { ai } from '@/ai/genkit';
import wav from 'wav';


// Action to generate video script
export async function generateScriptAction(input: GenerateVideoScriptInput): Promise<GenerateVideoScriptOutput> {
  try {
    console.log('Generating script with input:', JSON.stringify(input));
    const result = await genVideoScriptFlow(input);
    if (!result || !result.title || !result.scenes || result.scenes.length === 0) {
      throw new Error('AI failed to generate a structured script with title and scenes.');
    }
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
    const promptsToProcess = input.prompts.slice(0, 15); // Limit to 15 images for now

    for (let i = 0; i < promptsToProcess.length; i++) {
      const imagePrompt = promptsToProcess[i];
      console.log(`Generating image ${i + 1} of ${promptsToProcess.length} with prompt: "${imagePrompt}"`);
      try {
        const {media} = await ai.generate({
          model: 'googleai/gemini-2.0-flash-exp',
          prompt: `Generate a high-quality, visually appealing image suitable for a video, based on the following theme or keywords: "${imagePrompt}". The image should be in portrait orientation (1080x1920). Ensure it is safe for all audiences.`,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
            safetySettings: [ // Stricter safety settings
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ],
          },
        });

        if (!media || !media.url) {
          console.warn(`AI failed to generate image for prompt: "${imagePrompt}" or returned an invalid response.`);
          imageUrls.push(`https://placehold.co/1080x1920.png?text=Image+Failed+${i + 1}`);
        } else {
          imageUrls.push(media.url);
          console.log(`Image ${i + 1} generated.`);
        }
      } catch (singleImageError: any) {
        console.error(`Error generating image ${i + 1} for prompt "${imagePrompt}":`, singleImageError.message);
        imageUrls.push(`https://placehold.co/1080x1920.png?text=Error+Img+${i + 1}`);
      }
    }
     if (imageUrls.filter(url => !url.includes('placehold.co')).length === 0 && promptsToProcess.length > 0) {
        // Only throw if ALL images failed and we actually tried to generate some
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
    if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        throw new Error('Image generation failed due to API rate limits or quota exceeded. Please wait or check your API plan.');
    }
    if (errorMessage.includes('prompt was blocked') || errorMessage.includes('safety settings')) {
        throw new Error('Image generation failed because a prompt was blocked by safety settings.');
    }
    throw new Error(`Image generation failed: ${error.message || 'Unknown error during image batch processing'}`);
  }
}

interface GenerateAudioInput {
  text: string;
}
interface GenerateAudioOutput {
  audioUrl: string; // This will be a WAV data URI
}

// Helper to convert raw PCM audio data from Gemini to a WAV file buffer
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000, // Gemini TTS default sample rate
  sampleWidth = 2 // 16-bit audio
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', function (d: Buffer) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export async function generateAudioAction(input: GenerateAudioInput): Promise<GenerateAudioOutput> {
  try {
    console.log(`Generating audio with Gemini TTS for text: "${input.text.substring(0, 100)}..."`);
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // See available voices here: https://cloud.google.com/text-to-speech/docs/voices
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, 
          },
        },
      },
      prompt: input.text,
    });

    if (!media || !media.url) {
      throw new Error('AI failed to generate audio or returned an invalid response.');
    }

    // media.url is a data URI with base64 encoded raw PCM audio data.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    // Convert PCM to WAV so it's playable in browsers
    const wavBase64 = await toWav(audioBuffer);
    const wavDataUri = `data:audio/wav;base64,${wavBase64}`;

    console.log('Audio generated and converted to WAV successfully.');
    return { audioUrl: wavDataUri };

  } catch (error: any) {
    console.error('Error in generateAudioAction (Gemini TTS):', error);
    throw new Error(`Audio generation failed: ${error.message || 'Unknown error contacting Gemini TTS'}`);
  }
}


interface GenerateCaptionsInput {
  audioDataUri: string; 
}
interface GenerateCaptionsOutput {
  transcript: string; 
}
export async function generateCaptionsAction(input: GenerateCaptionsInput): Promise<GenerateCaptionsOutput> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    console.error('AssemblyAI API key is not set in environment variables.');
    throw new Error('AssemblyAI API key is missing. Cannot generate captions.');
  }
   if (!input.audioDataUri || !input.audioDataUri.startsWith('data:audio')) {
    console.error('Invalid audioDataUri for caption generation.');
    throw new Error('Valid audio data URI is required for caption generation.');
  }

  console.log('Generating captions with AssemblyAI for audio data URI...');

  try {
    const fetchResponse = await fetch(input.audioDataUri);
    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch audio data URI: ${fetchResponse.statusText}`);
    }
    const audioBlob = await fetchResponse.blob();

    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': audioBlob.type || 'application/octet-stream', 
      },
      body: audioBlob,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('AssemblyAI upload error:', uploadResponse.status, errorText);
      throw new Error(`AssemblyAI audio upload failed with status ${uploadResponse.status}: ${errorText}`);
    }
    const uploadResult = await uploadResponse.json();
    const audio_url = uploadResult.upload_url;
    if (!audio_url) {
      throw new Error('AssemblyAI did not return an upload URL.');
    }
    console.log('Audio uploaded to AssemblyAI:', audio_url);

    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ audio_url }),
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      console.error('AssemblyAI transcription submission error:', transcriptResponse.status, errorText);
      throw new Error(`AssemblyAI transcription submission failed with status ${transcriptResponse.status}: ${errorText}`);
    }
    const transcriptSubmissionResult = await transcriptResponse.json();
    const transcriptId = transcriptSubmissionResult.id;
    if (!transcriptId) {
      throw new Error('AssemblyAI did not return a transcript ID.');
    }
    console.log('Transcription submitted to AssemblyAI, ID:', transcriptId);

    let attempts = 0;
    const maxAttempts = 30; 
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    while (attempts < maxAttempts) {
      attempts++;
      await delay(10000); 
      console.log(`Polling AssemblyAI transcript status (attempt ${attempts})...`);
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 'authorization': apiKey },
      });
      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        console.warn(`AssemblyAI polling error: ${pollResponse.status}: ${errorText}`);
        if (pollResponse.status === 404 && attempts > 5) { // If transcript ID is gone after a few tries
            throw new Error(`AssemblyAI transcript ID ${transcriptId} not found after multiple attempts.`);
        }
        continue; 
      }
      const pollResult = await pollResponse.json();

      if (pollResult.status === 'completed') {
        console.log('AssemblyAI transcription completed.');
        if (!pollResult.text && pollResult.text !== '') { // Allow empty string for silent audio
            throw new Error('AssemblyAI transcription completed but returned no text field.');
        }
        return { transcript: pollResult.text || "" }; // Return empty string if text is null/undefined
      } else if (pollResult.status === 'failed' || pollResult.status === 'error') {
        console.error('AssemblyAI transcription failed:', pollResult.error || 'Unknown error');
        throw new Error(`AssemblyAI transcription failed: ${pollResult.error || 'Unknown error'}`);
      }
      console.log('AssemblyAI transcription status:', pollResult.status);
    }

    throw new Error('AssemblyAI transcription timed out after several attempts.');

  } catch (error: any) {
    console.error('Error in generateCaptionsAction (AssemblyAI):', error);
    throw new Error(`Caption generation failed: ${error.message || 'Unknown error contacting AssemblyAI'}`);
  }
}
