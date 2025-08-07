// requests.js
import { auth, db } from './firebase-config.js';
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { showAlert } from './utils.js';

const requestsContainer = document.getElementById('requestsContainer');

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  listenToRequests(user);
});

function listenToRequests(user) {
  // For workers/admin, listen to requests assigned or pending
  let q;

  if (user.role === 'admin') {
    q = query(collection(db, 'requests'));
  } else if (user.role === 'worker') {
    q = query(collection(db, 'requests'), where('status', '==', 'pending'));
  } else {
    // Customer sees only their requests
    q = query(collection(db, 'requests'), where('userId', '==', user.uid));
  }

  onSnapshot(q, (snapshot) => {
    requestsContainer.innerHTML = '';

    if (snapshot.empty) {
      requestsContainer.innerHTML = '<p>No requests found.</p>';
      return;
    }

    snapshot.forEach((docSnap) => {
      const req = docSnap.data();
      const id = docSnap.id;

      let btnAccept = '';
      let btnDecline = '';

      if (user.role === 'worker' && req.status === 'pending') {
        btnAccept = `<button onclick="acceptRequest('${id}')">✅ Accept</button>`;
        btnDecline = `<button onclick="declineRequest('${id}')">❌ Decline</button>`;
      }

      requestsContainer.innerHTML += `
        <div class="request-card">
          <p><strong>Description:</strong> ${req.description}</p>
          <p><strong>Location:</strong> ${req.location}</p>
          <p><strong>Status:</strong> ${req.status}</p>
          <p><strong>Premium:</strong> ${req.isPremium ? '⭐ Yes' : 'No'}</p>
          ${btnAccept} ${btnDecline}
        </div>
      `;
    });
  });
}

window.acceptRequest = async function (id) {
  try {
    await updateDoc(doc(db, 'requests', id), {
      status: 'accepted',
      workerId: auth.currentUser.uid,
      acceptedAt: new Date()
    });
    showAlert('success', 'Request accepted!');
  } catch (err) {
    showAlert('error', 'Error accepting request: ' + err.message);
  }
};

window.declineRequest = async function (id) {
  try {
    await updateDoc(doc(db, 'requests', id), {
      status: 'declined',
      declinedAt: new Date()
    });
    showAlert('success', 'Request declined.');
  } catch (err) {
    showAlert('error', 'Error declining request: ' + err.message);
  }
};
