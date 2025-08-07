// premium.js
import { auth, db } from './firebase-config.js';
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { showAlert } from './utils.js';

const premiumToggle = document.getElementById('premiumToggle');
const premiumStatusText = document.getElementById('premiumStatus');

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  await loadPremiumStatus(user.uid);
});

async function loadPremiumStatus(uid) {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      premiumStatusText.textContent = 'User data not found.';
      return;
    }
    const isPremium = userDoc.data().isPremium || false;
    premiumToggle.checked = isPremium;
    premiumStatusText.textContent = isPremium ? 'You are a Premium user ⭐' : 'Free User';
  } catch (err) {
    showAlert('error', 'Failed to load premium status: ' + err.message);
  }
}

premiumToggle.addEventListener('change', async () => {
  const user = auth.currentUser;
  if (!user) {
    showAlert('error', 'Not authenticated.');
    return;
  }
  const newStatus = premiumToggle.checked;

  try {
    await updateDoc(doc(db, 'users', user.uid), {
      isPremium: newStatus,
      premiumUpdatedAt: serverTimestamp()
    });
    premiumStatusText.textContent = newStatus ? 'You are a Premium user ⭐' : 'Free User';
    showAlert('success', newStatus ? 'Premium enabled!' : 'Premium disabled');
  } catch (err) {
    showAlert('error', 'Failed to update premium status: ' + err.message);
    // revert toggle
    premiumToggle.checked = !newStatus;
  }
});
