// Firebase Client SDK — browser-safe
// Only initializes when all required env vars are present
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
};

// Guard: don't initialize without credentials (build-time SSR has no env vars)
const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!hasConfig) throw new Error("Firebase is not configured — add .env.local with NEXT_PUBLIC_FIREBASE_* values");
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

export const auth = hasConfig
  ? getAuth(getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : (null as any);

export const db = hasConfig
  ? getFirestore(getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : (null as any);

export const storage = hasConfig
  ? getStorage(getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : (null as any);

export default app;
