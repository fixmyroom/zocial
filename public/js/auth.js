// auth.js
import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

// Save user info to Firestore
export async function saveUser(user) {
  if (!user) return;
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email || "",
    name: user.displayName || "",
    phone: user.phoneNumber || "",
    isPremium: false,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// Redirect after login/signup
export async function redirectUser(user) {
  if (!user) return;
  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.data();

  if (!snap.exists() || !data.role) {
    window.location.href = "profile.html";
  } else if (data.role === "admin") {
    window.location.href = "admin.html";
  } else if (data.role === "customer") {
    window.location.href = "map.html";
  } else if (["painter", "plumber", "electrician"].includes(data.role)) {
    window.location.href = "worker.html";
  } else if (data.role === "store") {
    window.location.href = "store.html";
  } else {
    window.location.href = "profile.html";
  }
}

// Google Sign-in
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  await saveUser(cred.user);
  redirectUser(cred.user);
}
