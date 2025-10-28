
'use server';

import { GenerateVideoScriptInput } from '@/ai/flows/generate-video-script';
import { GenerateAvatarVideoInput } from '@/ai/flows/generate-avatar-video';
import { RenderVideoInput } from '@/ai/flows/render-video';
import { ai } from '@/ai/genkit';
import wav from 'wav';

// Action to generate video script
export async function generateScriptAction(input: GenerateVideoScriptInput): Promise<any> {
  try {
    const { generateVideoScript } = await import('@/ai/flows/generate-video-script');
    const result = await generateVideoScript(input);

    if (!result || !result.title || !result.scenes || result.scenes.length === 0) {
      throw new Error('AI failed to generate a structured script with title and scenes.');
    }
    result.scenes.forEach((scene: any, index: number) => {
        if (!scene.imagePrompt || !scene.contentText) {
            throw new Error(`Scene ${index + 1} is missing imagePrompt or contentText.`);
        }
    });
    return result;
  } catch (error: any) {
    console.error('Error in generateScriptAction:', error);
    throw new Error(`Script generation failed: ${error.message || 'An unexpected error occurred.'}`);
  }
}

// Action to generate AI Avatar video
export async function generateAvatarVideoAction(input: GenerateAvatarVideoInput): Promise<any> {
    try {
        const { generateAvatarVideo } = await import('@/ai/flows/generate-avatar-video');
        const result = await generateAvatarVideo(input);

        if (!result || !result.videoUrl) {
            throw new Error('AI failed to generate an avatar video.');
        }
        return result;
    } catch (error: any) {
        console.error('Error in generateAvatarVideoAction:', error);
        throw new Error(`AI Avatar video generation failed: ${error.message}`);
    }
}

// Action to render a video on Cloud Run
export async function renderVideoAction(input: RenderVideoInput): Promise<any> {
    try {
        const { renderVideo } = await import('@/ai/flows/render-video');
        const result = await renderVideo(input);
        return result;
    } catch (error: any) {
        console.error('Error in renderVideoAction:', error);
        throw new Error(`Remote video rendering failed: ${error.message}`);
    }
}


interface GenerateImagesInput {
  prompts: string[];
}
interface GenerateImagesOutput {
  imageUrls: string[];
}
export async function generateImagesAction(input: GenerateImagesInput): Promise<GenerateImagesOutput> {
 try {
    const imageUrls: string[] = [];

    if (input.prompts.length === 0) {
      return { imageUrls: [] };
    }

    const promptsToProcess = input.prompts.slice(0, 15); // Limit to 15 images

    for (let i = 0; i < promptsToProcess.length; i++) {
      const imagePrompt = promptsToProcess[i];
      try {
        const {media} = await ai.generate({
          model: 'googleai/imagen-4.0-fast-generate-001',
          prompt: `Generate a high-quality, visually appealing image suitable for a video, based on the following theme or keywords: "${imagePrompt}". The image should be in portrait orientation (1080x1920). Ensure it is safe for all audiences.`,
          config: {
            safetySettings: [ // Stricter safety settings
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            ],
          },
        });

        if (!media || !media.url) {
          imageUrls.push(`https://placehold.co/1080x1920.png?text=Image+Failed+${i + 1}`);
        } else {
          imageUrls.push(media.url);
        }
      } catch (singleImageError: any) {
        console.error(`Error generating image ${i + 1}:`, singleImageError);
        imageUrls.push(`https://placehold.co/1080x1920.png?text=Error+Img+${i + 1}`);
      }
    }
     if (imageUrls.filter(url => !url.includes('placehold.co')).length === 0 && promptsToProcess.length > 0) {
        throw new Error('AI failed to generate any images successfully.');
    }
    return { imageUrls };
  } catch (error: any) {
    console.error('Error in generateImagesAction:', error);
    const errorMessage = error.message?.toLowerCase() || '';
    if (errorMessage.includes('user_location_invalid')) {
        throw new Error('Image generation is not available in your region.');
    }
    if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        throw new Error('Image generation failed due to API rate limits. Please wait or check your plan.');
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
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, 
          },
        },
      },
      prompt: input.text,
    });

    if (!media || !media.url) {
      throw new Error('AI failed to generate audio or returned an invalid response.');
    }
    
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);
    const wavDataUri = `data:audio/wav;base64,${wavBase64}`;

    return { audioUrl: wavDataUri };

  } catch (error: any) {
    console.error('Error in generateAudioAction:', error);
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
    console.warn('AssemblyAI API key not found, skipping caption generation.');
    return { transcript: "" };
  }
   if (!input.audioDataUri || !input.audioDataUri.startsWith('data:audio')) {
    throw new Error('Valid audio data URI is required for caption generation.');
  }

  try {
    const fetchResponse = await fetch(input.audioDataUri);
    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch audio data URI: ${fetchResponse.statusText}`);
    }
    const audioBlob = await fetchResponse.blob();

    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: { 'authorization': apiKey, 'Content-Type': audioBlob.type || 'application/octet-stream' },
      body: audioBlob,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`AssemblyAI audio upload failed with status ${uploadResponse.status}: ${errorText}`);
    }
    const uploadResult = await uploadResponse.json();
    const audio_url = uploadResult.upload_url;
    if (!audio_url) throw new Error('AssemblyAI did not return an upload URL.');

    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: { 'authorization': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_url }),
    });

    if (!transcriptResponse.ok) {
      const errorText = await transcriptResponse.text();
      throw new Error(`AssemblyAI transcription submission failed: ${errorText}`);
    }
    const transcriptSubmissionResult = await transcriptResponse.json();
    const transcriptId = transcriptSubmissionResult.id;
    if (!transcriptId) throw new Error('AssemblyAI did not return a transcript ID.');

    let attempts = 0;
    const maxAttempts = 30; 
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    while (attempts < maxAttempts) {
      attempts++;
      await delay(5000); 
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 'authorization': apiKey },
      });
      if (!pollResponse.ok) {
        console.warn(`Polling AssemblyAI failed (attempt ${attempts}): Status ${pollResponse.status}`);
        continue; 
      }
      const pollResult = await pollResponse.json();

      if (pollResult.status === 'completed') {
        return { transcript: pollResult.text || "" };
      } else if (pollResult.status === 'failed' || pollResult.status === 'error') {
        throw new Error(`AssemblyAI transcription failed: ${pollResult.error || 'Unknown error'}`);
      }
    }
    throw new Error('AssemblyAI transcription timed out.');
  } catch (error: any) {
    console.error(`Caption generation failed: ${error.message}`);
    return { transcript: '' };
  }
}
