import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCQhz_fDseHXzVTZy89-pphu2wrSm7z9zk",
  authDomain: "eldaemapp.firebaseapp.com",
  projectId: "eldaemapp",
  storageBucket: "eldaemapp.firebasestorage.app",
  messagingSenderId: "488136653774",
  appId: "1:488136653774:web:4d0699d59c31815267099f",
  measurementId: "G-MB6D3NR34E"
};


// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
