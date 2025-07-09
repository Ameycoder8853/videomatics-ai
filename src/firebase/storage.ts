
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
    throw error;
  }
};

// NEW: Function to upload a data URI by converting it to a blob first
export const uploadDataUriToStorage = async (dataUri: string, path: string): Promise<string> => {
    try {
        const response = await fetch(dataUri);
        const blob = await response.blob();
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, blob, { contentType: blob.type });
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        throw error;
    }
};


// Function to delete a file from a URL or path
export const deleteFileFromStorage = async (pathOrUrl: string): Promise<void> => {
  try {
    // ref() can take a full gs:// or https:// URL, or a simple path.
    const storageRef = ref(storage, pathOrUrl);
    await deleteObject(storageRef);
  } catch (error) {
    // Handle specific errors, e.g., object not found is not a failure in this context
    if ((error as any).code === 'storage/object-not-found') {
      // Supress error
    } else {
      throw error;
    }
  }
};
