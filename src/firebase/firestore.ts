
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
  imageUris: string[]; // Array of image URLs for slideshows, OR a single-element array with the avatar video URL
  audioUri: string; // Generated audio download URL
  captions?: string; // Generated captions text
  musicUri?: string; // Selected background music URI

  // Remotion composition props (mainly for slideshows)
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  imageDurationInFrames: number; // Calculated duration per scene
  totalDurationInFrames: number; // Total video duration

  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Timestamp | Date;
  thumbnailUrl?: string; // URL of the first image, or a placeholder
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
      // Add empty/default values for other required fields to satisfy rules/types
      topic: 'N/A',
      imageUris: [],
      audioUri: '',
      primaryColor: '',
      secondaryColor: '',
      fontFamily: '',
      imageDurationInFrames: 0,
      totalDurationInFrames: 0,
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

// Update video document with all metadata after assets are uploaded
export const updateVideoDocument = async (videoId: string, videoData: Partial<Omit<VideoDocument, 'id' | 'createdAt'>>): Promise<void> => {
    try {
        const docRef = doc(db, 'videos', videoId);
        await updateDoc(docRef, videoData);
    } catch (error) {
        throw error;
    }
};

// Get all videos for a specific user, ordered by creation date (newest first)
export const getUserVideos = async (userId: string): Promise<VideoDocument[]> => {
  try {
    const q = query(videosCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoDocument));
  } catch (error: any) {
    if (error.code === 'failed-precondition' && error.message.includes('requires an index')) {
      // This more specific error helps the user diagnose the problem.
      throw new Error("A database index is required for this query. Please check the browser console for a link to create it in your Firebase project.");
    }
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
      return null;
    }
  } catch (error) {
    throw error;
  }
};


// Delete a video document AND its associated files in Storage
export const deleteVideoAndAssets = async (video: VideoDocument): Promise<void> => {
  if (!video.id || !video.userId) {
    throw new Error('Cannot delete video without ID or UserID');
  }

  const { id: videoId, imageUris, audioUri } = video;

  try {
    // `imageUris` can contain slideshow images or the final avatar video.
    // This logic handles both cases.
    if (imageUris && imageUris.length > 0) {
      const deletePromises = imageUris
        .filter(url => url && url.includes('firebasestorage.googleapis.com'))
        .map(url => deleteFileFromStorage(url));
      await Promise.all(deletePromises);
    }
    
    // Delete audio from Storage using its full download URL
    if (audioUri && audioUri.includes('firebasestorage.googleapis.com')) {
        await deleteFileFromStorage(audioUri);
    }

    // Finally, delete the Firestore document
    const docRef = doc(db, 'videos', videoId);
    await deleteDoc(docRef);

  } catch (error) {
    throw error;
  }
};
