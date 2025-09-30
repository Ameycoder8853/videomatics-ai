
const HEYGEN_API_URL = 'https://api.heygen.com/v1';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function createHeyGenVideo(scriptText: string, avatarId: string, apiKey: string): Promise<string | null> {
  try {
    // Step 1: Create the video generation job using the v1 endpoint
    const createResponse = await fetch(`${HEYGEN_API_URL}/video.generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        test: false, 
        text: scriptText,
        avatar_id: avatarId,
      }),
    });

    if (!createResponse.ok) {
        let errorDetails = `Status: ${createResponse.status}, StatusText: ${createResponse.statusText}`;
        try {
            // Check content type before parsing
            const contentType = createResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await createResponse.json();
                errorDetails = `HeyGen API error (create): ${errorData.message || createResponse.statusText}`;
            } else {
                const errorText = await createResponse.text();
                errorDetails = `HeyGen API returned non-JSON response: ${errorText.substring(0, 200)}...`;
            }
        } catch (e) {
            // Fallback if parsing fails for any reason
            errorDetails = `Could not parse HeyGen error response. Status: ${createResponse.status}`;
        }
        throw new Error(errorDetails);
    }

    const createData = await createResponse.json();
    const videoId = createData.data?.video_id;

    if (!videoId) {
      throw new Error('HeyGen API did not return a video ID.');
    }

    // Step 2: Poll for the video status until it's ready
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
        console.warn(`HeyGen status check failed with status: ${statusResponse.status}`);
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      const videoStatus = statusData.data?.status;

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
