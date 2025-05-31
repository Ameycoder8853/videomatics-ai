import { db } from './config';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where, Timestamp } from 'firebase/firestore';

// Example interface for a Video document
export interface VideoDocument {
  id?: string;
  userId: string;
  title: string;
  topic: string;
  style?: string;
  duration?: string;
  scriptUrl?: string;
  imageUrl?: string;
  audioUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  captionsUrl?: string;
  createdAt: Timestamp;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

const videosCollection = collection(db, 'videos');

// Add more Firestore functions as needed:
// e.g., function to save video metadata
export const saveVideoMetadata = async (videoData: Omit<VideoDocument, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(videosCollection, {
      ...videoData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving video metadata: ", error);
    throw error;
  }
};

// e.g., function to get user's videos
export const getUserVideos = async (userId: string): Promise<VideoDocument[]> => {
  try {
    const q = query(videosCollection, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoDocument));
  } catch (error) {
    console.error("Error fetching user videos: ", error);
    throw error;
  }
};

// Add other CRUD operations for Firestore as required by the application.
