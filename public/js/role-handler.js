// role-handler.js
import { auth, db } from './firebase-config.js';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

// Save selected role to Firestore
async function saveUserRole(uid, role) {
  await setDoc(doc(db, "users", uid), {
    role: role,
    updatedAt: serverTimestamp()
  }, { merge: true });

  if (role === "customer") {
    window.location.href = "customer.html";
  } else if (["painter", "plumber", "electrician"].includes(role)) {
    window.location.href = "worker.html";
  } else if (role === "store") {
    window.location.href = "store.html";
  } else if (role === "admin") {
    window.location.href = "admin.html";
  } else {
    alert("Invalid role selected.");
  }
}

// Wait for user to be logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Attach event listeners to role buttons
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedRole = btn.dataset.role;
      saveUserRole(user.uid, selectedRole);
    });
  });
});
