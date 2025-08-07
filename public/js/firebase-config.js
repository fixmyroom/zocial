// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAB5KK4gMMwCAzmxjzTRAd0gK-gzpzbzmw",
  authDomain: "fixmyroomwithzocial.firebaseapp.com",
  projectId: "fixmyroomwithzocial",
  storageBucket: "fixmyroomwithzocial.firebasestorage.app",
  messagingSenderId: "594671909340",
  appId: "1:594671909340:web:9a9feedefed205a50ef719"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
