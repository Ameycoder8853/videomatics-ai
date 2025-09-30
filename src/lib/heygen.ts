

const HEYGEN_API_URL = 'https://api.heygen.com/v1';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function createHeyGenVideo(scriptText: string, avatarId: string, apiKey: string): Promise<string | null> {
  try {
    // Step 1: Create the video generation job using the v1 endpoint
    const createResponse = await fetch(`${HEYGEN_API_URL}/video.generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`, // Corrected header for v1
      },
      body: JSON.stringify({
        test: false, // Set to false for actual generation
        text: scriptText,
        avatar_id: avatarId,
      }),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(`HeyGen API error (create): ${errorData.message || createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    const videoId = createData.data.video_id;

    if (!videoId) {
      throw new Error('HeyGen API did not return a video ID.');
    }

    // Step 2: Poll for the video status until it's ready (using v1 status endpoint)
    let attempts = 0;
    const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5s = 300s)
    
    while (attempts < maxAttempts) {
      await delay(5000); // Wait 5 seconds between polls
      
      const statusResponse = await fetch(`${HEYGEN_API_URL}/video_status.get?video_id=${videoId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!statusResponse.ok) {
        // Continue polling even if one status check fails
        console.warn(`HeyGen status check failed with status: ${statusResponse.status}`);
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      const videoStatus = statusData.data.status;

      if (videoStatus === 'completed') {
        return statusData.data.video_url;
      }

      if (videoStatus === 'failed') {
        throw new Error(`HeyGen video generation failed. Reason: ${statusData.data.error?.message || 'Unknown error'}`);
      }
      
      attempts++;
    }

    throw new Error('HeyGen video generation timed out.');

  } catch (error: any) {
    console.error('Error in HeyGen video generation process:', error);
    throw new Error(`Failed to create HeyGen video: ${error.message}`);
  }
}
