
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// --- Project 1: For Authentication and Firestore Database ---
// This is your primary project, `videomatic-ai-5c2b2`.
const primaryFirebaseConfig = {
  apiKey: "AIzaSyBd3NejbNidk6b6eqwMfcLLpvnQRqgyzJU",
  authDomain: "videomatic-ai-5c2b2.firebaseapp.com",
  projectId: "videomatic-ai-5c2b2",
  storageBucket: "videomatic-ai-5c2b2.appspot.com", // This is ignored, as we use the secondary project for storage.
  messagingSenderId: "544423783139",
  appId: "1:544423783139:web:fe8e173e58b4c7a3b873d6",
  measurementId: "G-NE0VT2T105"
};

// --- Project 2: For Cloud Storage ---
// This is your secondary project, the one you named "Videomatics AI".
//
// IMPORTANT: You MUST replace these placeholder values with the actual
// configuration of the Firebase project you use for Storage.
// Follow the steps in the instructions to find these values in your project's settings.
const storageFirebaseConfig = {
  apiKey: "YOUR_STORAGE_PROJECT_API_KEY",
  authDomain: "YOUR_STORAGE_PROJECT_AUTH_DOMAIN",
  projectId: "YOUR_STORAGE_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_PROJECT_BUCKET.appspot.com", // This is the most important one.
  messagingSenderId: "YOUR_STORAGE_PROJECT_SENDER_ID",
  appId: "YOUR_STORAGE_PROJECT_APP_ID",
};


// --- Initialize Firebase Apps ---

// Initialize Primary App (for Auth & Firestore)
let app: FirebaseApp;
const primaryAppName = 'primary';
if (getApps().find(app => app.name === primaryAppName)) {
  app = getApp(primaryAppName);
} else {
  app = initializeApp(primaryFirebaseConfig, primaryAppName);
}

// Initialize Secondary App (for Storage)
let storageApp: FirebaseApp;
const storageAppName = 'storage';
if (getApps().find(app => app.name === storageAppName)) {
  storageApp = getApp(storageAppName);
} else {
  // Only initialize if the config is not a placeholder
  if (storageFirebaseConfig.projectId !== "YOUR_STORAGE_PROJECT_ID") {
    storageApp = initializeApp(storageFirebaseConfig, storageAppName);
  } else {
    // If the storage config is still the placeholder, we can't initialize it.
    // We will fall back to using the primary app's storage, but log a clear warning.
    console.warn("STORAGE_CONFIG_MISSING: Using primary project for storage. Please update `src/firebase/config.ts` with your dedicated storage project's credentials.");
    storageApp = app; // Fallback to primary app
  }
}


// --- Get Firebase Services ---

// Get Auth and Firestore from the PRIMARY app
const auth: Auth = getAuth(app);
const db: Firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalUseFetchStreams: false,
  ignoreUndefinedProperties: true,
});

// Get Storage from the SECONDARY app
const storage: FirebaseStorage = getStorage(storageApp);

export { app, auth, db, storage };
