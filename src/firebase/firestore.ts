
import { db, storage } from './config';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import type { GenerateVideoScriptOutput } from '@/ai/flows/generate-video-script';
import { deleteFileFromStorage } from './storage';
import { ref } from 'firebase/storage';

// Interface for a Video document stored in Firestore
export interface VideoDocument {
  id?: string;
  userId: string;
  title: string;
  topic: string; // From original form input
  style?: string; // From original form input
  durationCategory?: string; // From original form input ('short', 'medium', 'long')
  
  // Generated script details
  scriptDetails?: GenerateVideoScriptOutput; // Contains title and scenes array

  // URLs for generated assets stored in Firebase Storage
  imageUris: string[]; // Array of generated image download URLs
  audioUri: string; // Generated audio download URL
  captions?: string; // Generated captions text
  musicUri?: string; // Selected background music URI

  // Remotion composition props
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  imageDurationInFrames: number; // Calculated duration per scene
  totalDurationInFrames: number; // Total video duration

  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Timestamp | Date;
  thumbnailUrl?: string; // URL of the first image, for display
  errorMessage?: string; // Optional: if status is 'failed'
}

const videosCollection = collection(db, 'videos');

// Create a placeholder document to get an ID before assets are uploaded.
export const createVideoPlaceholder = async (userId: string): Promise<string> => {
  try {
    const docRef = await addDoc(videosCollection, {
      userId: userId,
      status: 'processing',
      createdAt: Timestamp.now(),
      title: 'Processing...', // Placeholder title
    });
    console.log("Video placeholder created with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating video placeholder: ", error);
    throw error;
  }
};

// Update video document with all metadata after assets are uploaded
export const updateVideoDocument = async (videoId: string, videoData: Partial<Omit<VideoDocument, 'id' | 'createdAt'>>): Promise<void> => {
    try {
        const docRef = doc(db, 'videos', videoId);
        await updateDoc(docRef, videoData);
        console.log("Video document updated for ID: ", videoId);
    } catch (error) {
        console.error("Error updating video document: ", error);
        throw error;
    }
};

// Get all videos for a specific user, ordered by creation date (newest first)
export const getUserVideos = async (userId: string): Promise<VideoDocument[]> => {
  try {
    const q = query(videosCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoDocument));
  } catch (error) {
    console.error("Error fetching user videos: ", error);
    throw error;
  }
};

// Get a single video document by its ID
export const getVideoDocument = async (videoId: string): Promise<VideoDocument | null> => {
  try {
    const docRef = doc(db, 'videos', videoId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as VideoDocument;
    } else {
      console.log("No such video document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching video document: ", error);
    throw error;
  }
};


// Delete a video document AND its associated files in Storage
export const deleteVideoAndAssets = async (video: VideoDocument): Promise<void> => {
  if (!video.id || !video.userId) {
    throw new Error('Cannot delete video without ID or UserID');
  }

  const { id: videoId, userId, imageUris, audioUri } = video;
  console.log(`Starting deletion for video ${videoId}...`);

  try {
    // Delete images from Storage in parallel
    if (imageUris && imageUris.length > 0) {
      console.log(`Deleting up to ${imageUris.length} images...`);
      const imageDeletePromises = imageUris.map((url, index) => {
        // Only attempt to delete files that were actually uploaded to Firebase Storage
        if (url.includes('firebasestorage.googleapis.com')) {
          const imagePath = `videos/${userId}/${videoId}/image_${index}.png`;
          return deleteFileFromStorage(imagePath);
        }
        return Promise.resolve(); // Do nothing for placeholder URLs
      });
      await Promise.all(imageDeletePromises);
       console.log("Image deletion process completed.");
    }
    
    // Delete audio from Storage
    if (audioUri && audioUri.includes('firebasestorage.googleapis.com')) {
        console.log("Deleting audio...");
        const audioPath = `videos/${userId}/${videoId}/audio.wav`;
        await deleteFileFromStorage(audioPath);
        console.log("Audio deleted from Storage.");
    }

    // Finally, delete the Firestore document
    const docRef = doc(db, 'videos', videoId);
    await deleteDoc(docRef);
    console.log(`Firestore document ${videoId} deleted.`);

  } catch (error) {
    console.error(`Error during deletion of video ${videoId}:`, error);
    throw error;
  }
};
