
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// --- Project 1: For Authentication and Firestore Database ---
// Project ID: videomatics-ai-4b304
const primaryFirebaseConfig = {
  apiKey: "AIzaSyBd3NejbNidk6b6eqwMfcLLpvnQRqgyzJU",
  authDomain: "videomatics-ai-4b304.firebaseapp.com",
  projectId: "videomatics-ai-4b304",
  storageBucket: "videomatics-ai-4b304.firebasestorage.app", // This is not used for storage, but is part of the config
  messagingSenderId: "544423783139",
  appId: "1:544423783139:web:fe8e173e58b4c7a3b873d6",
  measurementId: "G-NE0VT2T105"
};

// --- Project 2: For Cloud Storage ---
// Project ID: videomatic-ai-5c2b2
const storageFirebaseConfig = {
  apiKey: "AIzaSyBZj5giRClqQGO7kpTs2KJOB6B61AKc-N0",
  authDomain: "videomatic-ai-5c2b2.firebaseapp.com",
  projectId: "videomatic-ai-5c2b2",
  storageBucket: "videomatic-ai-5c2b2.appspot.com", // This is the important one for storage.
  messagingSenderId: "663560280307",
  appId: "1:663560280307:web:bd79a2e97bf6c62d693f86",
  measurementId: "G-80MYDX1BMD"
};


// --- Initialize Firebase Apps ---

// Initialize Primary App (for Auth & Firestore)
let app: FirebaseApp;
const primaryAppName = 'primary';
if (!getApps().find(app => app.name === primaryAppName)) {
  app = initializeApp(primaryFirebaseConfig, primaryAppName);
} else {
  app = getApp(primaryAppName);
}

// Initialize Secondary App (for Storage)
let storageApp: FirebaseApp;
const storageAppName = 'storage';
if (!getApps().find(app => app.name === storageAppName)) {
  storageApp = initializeApp(storageFirebaseConfig, storageAppName);
} else {
  storageApp = getApp(storageAppName);
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
