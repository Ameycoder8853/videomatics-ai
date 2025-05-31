
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
    if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        throw new Error('Image generation failed due to API rate limits or quota exceeded. Please wait a minute or check your API plan.');
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
            const responseText = await audioBlob.text(); 
            console.error('ElevenLabs did not return audio. Response:', responseText);
            throw new Error(`ElevenLabs returned non-audio content type: ${audioBlob.type}. Response text: ${responseText.substring(0,100)}`);
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


interface GenerateCaptionsInput {
  audioDataUri: string; // Data URI of the audio file to transcribe
}
interface GenerateCaptionsOutput {
  transcript: string; // Full transcript text
  // srtCaptions?: string; // Optional: SRT format captions as a string or data URI
}
export async function generateCaptionsAction(input: GenerateCaptionsInput): Promise<GenerateCaptionsOutput> {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    console.error('AssemblyAI API key is not set in environment variables.');
    throw new Error('AssemblyAI API key is missing. Cannot generate captions.');
  }

  console.log('Generating captions with AssemblyAI for audio data URI...');

  try {
    // 1. Convert Data URI to Blob
    const fetchResponse = await fetch(input.audioDataUri);
    if (!fetchResponse.ok) {
      throw new Error(`Failed to fetch audio data URI: ${fetchResponse.statusText}`);
    }
    const audioBlob = await fetchResponse.blob();

    // 2. Upload audio to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': audioBlob.type, // Or specific type like 'audio/mpeg'
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

    // 3. Submit for transcription
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

    // 4. Poll for completion
    let attempts = 0;
    const maxAttempts = 30; // Poll for up to 5 minutes (30 attempts * 10s delay)
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    while (attempts < maxAttempts) {
      attempts++;
      await delay(10000); // Wait 10 seconds
      console.log(`Polling AssemblyAI transcript status (attempt ${attempts})...`);
      const pollResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 'authorization': apiKey },
      });
      if (!pollResponse.ok) {
        const errorText = await pollResponse.text();
        // Don't throw here immediately, could be a transient issue or just not ready
        console.warn(`AssemblyAI polling error: ${pollResponse.status}: ${errorText}`);
        continue; // Try again
      }
      const pollResult = await pollResponse.json();

      if (pollResult.status === 'completed') {
        console.log('AssemblyAI transcription completed.');
        if (!pollResult.text) {
            throw new Error('AssemblyAI transcription completed but returned no text.');
        }
        return { transcript: pollResult.text };
      } else if (pollResult.status === 'failed' || pollResult.status === 'error') {
        console.error('AssemblyAI transcription failed:', pollResult.error || 'Unknown error');
        throw new Error(`AssemblyAI transcription failed: ${pollResult.error || 'Unknown error'}`);
      }
      // If status is 'queued' or 'processing', continue polling
      console.log('AssemblyAI transcription status:', pollResult.status);
    }

    throw new Error('AssemblyAI transcription timed out after several attempts.');

  } catch (error: any) {
    console.error('Error in generateCaptionsAction (AssemblyAI):', error);
    throw new Error(`Caption generation failed: ${error.message || 'Unknown error contacting AssemblyAI'}`);
  }
}
