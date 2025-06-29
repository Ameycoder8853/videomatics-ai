
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

// NEW: Function to upload a data URI by converting it to a blob first
export const uploadDataUriToStorage = async (dataUri: string, path: string): Promise<string> => {
    try {
        console.log(`Starting upload to: ${path}`);
        const response = await fetch(dataUri);
        console.log(`Fetched data URI for ${path}, creating blob...`);
        const blob = await response.blob();
        console.log(`Blob created for ${path} (size: ${blob.size}, type: ${blob.type}), creating storage ref...`);
        const storageRef = ref(storage, path);
        console.log(`Storage ref created for ${path}, uploading bytes...`);
        const snapshot = await uploadBytes(storageRef, blob, { contentType: blob.type });
        console.log(`Upload successful for ${path}, getting download URL...`);
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log(`Got download URL for ${path}`);
        return downloadURL;
    } catch (error) {
        console.error(`Error uploading data URI to ${path}:`, error);
        throw error;
    }
};


// Function to delete a file
export const deleteFileFromStorage = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    // Handle specific errors, e.g., object not found is not a failure in this context
    if ((error as any).code === 'storage/object-not-found') {
      console.warn(`File to delete was not found at path: ${path}`);
    } else {
      console.error(`Error deleting file from ${path}:`, error);
      throw error;
    }
  }
};
