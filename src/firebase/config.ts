
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// --- Primary Firebase Project (For Authentication and Firestore) ---
const primaryFirebaseConfig = {
  apiKey: "AIzaSyBd3NejbNidk6b6eqwMfcLLpvnQRqgyzJU",
  authDomain: "videomatic-ai-5c2b2.firebaseapp.com",
  projectId: "videomatic-ai-5c2b2",
  storageBucket: "videomatic-ai-5c2b2.appspot.com", // This will be ignored, but is part of the config.
  messagingSenderId: "544423783139",
  appId: "1:544423783139:web:fe8e173e58b4c7a3b873d6",
  measurementId: "G-NE0VT2T105"
};

// --- Secondary Firebase Project (For Cloud Storage) ---
// IMPORTANT: You must replace these placeholder values with the actual
// configuration of the Firebase project you want to use for Storage.
// You can find these details in that project's Settings.
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
// We give it a unique name 'primary' to avoid conflicts if it's already initialized elsewhere.
let app: FirebaseApp;
const primaryAppName = 'primary';
if (getApps().find(app => app.name === primaryAppName)) {
  app = getApp(primaryAppName);
} else {
  app = initializeApp(primaryFirebaseConfig, primaryAppName);
}

// Initialize Secondary App (for Storage)
// We give it a unique name 'storage' to avoid conflicts.
let storageApp: FirebaseApp;
const storageAppName = 'storage';
if (getApps().find(app => app.name === storageAppName)) {
  storageApp = getApp(storageAppName);
} else {
  storageApp = initializeApp(storageFirebaseConfig, storageAppName);
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
