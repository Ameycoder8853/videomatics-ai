
import { db } from './config';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, Timestamp, orderBy } from 'firebase/firestore';
import type { GenerateVideoScriptOutput } from '@/ai/flows/generate-video-script';

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

  // URIs for generated assets
  imageUris: string[]; // Array of generated image data URIs
  audioUri: string; // Generated audio data URI
  captions?: string; // Generated captions text
  musicUri?: string; // Selected background music URI

  // Remotion composition props
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  imageDurationInFrames: number; // Calculated duration per scene
  totalDurationInFrames: number; // Total video duration

  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Timestamp;
  thumbnailUrl?: string; // URL of the first image, for display
  errorMessage?: string; // Optional: if status is 'failed'
}

const videosCollection = collection(db, 'videos');

// Save video metadata to Firestore
export const saveVideoMetadata = async (videoData: Omit<VideoDocument, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(videosCollection, {
      ...videoData,
      createdAt: Timestamp.now(),
    });
    console.log("Video metadata saved with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving video metadata: ", error);
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

// Update a video document (e.g., to change status)
export const updateVideoStatus = async (videoId: string, status: VideoDocument['status'], errorMessage?: string): Promise<void> => {
  try {
    const docRef = doc(db, 'videos', videoId);
    const updateData: Partial<VideoDocument> = { status };
    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }
    await updateDoc(docRef, updateData);
    console.log("Video status updated for ID: ", videoId);
  } catch (error) {
    console.error("Error updating video status: ", error);
    throw error;
  }
};

// Delete a video document
export const deleteVideoDocument = async (videoId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'videos', videoId);
    await deleteDoc(docRef);
    console.log("Video document deleted with ID: ", videoId);
  } catch (error) {
    console.error("Error deleting video document: ", error);
    throw error;
  }
};
