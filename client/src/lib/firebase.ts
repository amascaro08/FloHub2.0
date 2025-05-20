// Firebase configuration for authentication
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
// We'll update this with environment variables when available
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "temp-api-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "flohub"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "flohub",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "flohub"}.appspot.com`,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef123456789"
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Google auth provider for login
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');

// Set persistence is done during sign-in instead