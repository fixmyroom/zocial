// customer-tools.js
import { auth, db } from './firebase-config.js';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { showAlert } from './utils.js';

const requestForm = document.getElementById('requestForm');
const premiumToggle = document.getElementById('premiumToggle');

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
});

if (requestForm) {
  requestForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      showAlert('error', 'Please login first.');
      return;
    }

    const description = requestForm['description'].value.trim();
    const location = requestForm['location'].value.trim();

    if (!description || !location) {
      showAlert('error', 'Please fill all fields.');
      return;
    }

    try {
      await addDoc(collection(db, 'requests'), {
        userId: user.uid,
        description,
        location,
        status: 'pending',
        isPremium: premiumToggle.checked || false,
        createdAt: serverTimestamp()
      });

      showAlert('success', 'Request submitted! Workers will see this soon.');
      requestForm.reset();
    } catch (error) {
      showAlert('error', 'Failed to submit request: ' + error.message);
    }
  });
}
