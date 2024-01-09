// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


// Your Firebase configuration
const config = {
  apiKey: "AIzaSyDXtZ5qCuZbF1-zuiBRcmMEuPU1sOcfujQ",
  authDomain: "tattoo-a1500.firebaseapp.com",
  projectId: "tattoo-a1500",
  storageBucket: "tattoo-a1500.appspot.com",
  messagingSenderId: "698423300988",
  appId: "1:698423300988:web:be1e2efa64f23897868af9",
  measurementId: "G-WK4C399PBB"
};


// Initialize Firebase
const app = initializeApp(config);

// Get a reference to the Auth service
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };