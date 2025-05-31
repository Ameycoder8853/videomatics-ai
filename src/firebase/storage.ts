import { storage } from './config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Function to upload a file (e.g., video, image, audio)
export const uploadFileToStorage = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file: ", error);
    throw error;
  }
};

// Function to upload a Blob
export const uploadBlobToStorage = async (blob: Blob, path: string, metadata?: object): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, blob, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading blob: ", error);
    throw error;
  }
};


// Function to delete a file
export const deleteFileFromStorage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file: ", error);
    // Handle specific errors, e.g., object not found
    if ((error as any).code === 'storage/object-not-found') {
      console.warn(`File not found at path: ${path}`);
    } else {
      throw error;
    }
  }
};

// Add other storage functions as needed.
