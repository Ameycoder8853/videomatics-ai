import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBd3NejbNidk6b6eqwMfcLLpvnQRqgyzJU",
  authDomain: "videomatic-ai-5c2b2.firebaseapp.com",
  projectId: "videomatic-ai-5c2b2",
  storageBucket: "videomatic-ai-5c2b2.appspot.com",
  messagingSenderId: "544423783139",
  appId: "1:544423783139:web:fe8e173e58b4c7a3b873d6",
  measurementId: "G-NE0VT2T105"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
// Explicitly initialize Firestore with settings to improve network compatibility
const db: Firestore = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Use a more compatible connection strategy
  experimentalUseFetchStreams: false, // Disable fetch streams which can cause issues in some environments
  ignoreUndefinedProperties: true, // Good practice to prevent errors with undefined fields
});
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
