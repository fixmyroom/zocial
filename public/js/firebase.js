// public/js/firebase.js

// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// ✅ Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAB5KK4gMMwCAzmxjzTRAd0gK-gzpzbzmw",
  authDomain: "fixmyroomwithzocial.firebaseapp.com",
  projectId: "fixmyroomwithzocial",
  // Remove storageBucket since you don’t want Storage
  messagingSenderId: "594671909340",
  appId: "1:594671909340:web:9a9feedefed205a50ef719"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services you want to use
export const auth = getAuth(app);
export const db = getFirestore(app);

// Note: no storage here since you don’t want to use Storage
