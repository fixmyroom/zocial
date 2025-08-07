// ===============================
// FixMyRoom - Worker Dashboard
// ===============================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, doc, setDoc, getDoc, updateDoc,
  collection, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { firebaseConfig } from './firebase-config.js';
import { showAlert } from './utils.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let map;
let userMarker;

// ===============================
// Init Map
// ===============================
function initMap() {
  map = L.map('map').setView([27.7, 85.3], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
}

// ===============================
// Track worker location
// ===============================
function trackWorkerLocation(userId) {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(async pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      // Update marker
      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      } else {
        userMarker = L.marker([lat, lng], {
          icon: L.divIcon({
            className: "worker-marker",
            html: "👷",
            iconSize: [30, 30]
          })
        }).addTo(map).bindPopup("📍 You are here");
      }

      map.setView([lat, lng], 14);

      // Update Firestore
      await setDoc(doc(db, "users", userId), {
        location: { lat, lng, updated: Date.now() }
      }, { merge: true });
    });
  }
}

// ===============================
// Save Worker Profile
// ===============================
document.getElementById("saveProfileBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  const name = document.getElementById("workerName").value;
  const phone = document.getElementById("workerPhone").value;
  const price = document.getElementById("workerPrice").value;

  try {
    await setDoc(doc(db, "users", user.uid), {
      name, phone, price
    }, { merge: true });

    showAlert("✅ Profile updated!", "success");
  } catch (err) {
    showAlert("❌ Error saving profile", "error");
  }
});

// ===============================
// Load Requests for this worker
// ===============================
function loadRequests(role) {
  const requestsList = document.getElementById("requestsList");
  const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));

  onSnapshot(q, snapshot => {
    requestsList.innerHTML = "";
    let hasRequests = false;

    snapshot.forEach(docSnap => {
      const req = docSnap.data();

      if (req.serviceType !== role) return;
      hasRequests = true;

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <p><b>👤 ${req.customerName}</b> (${req.customerPhone})</p>
        <p>${req.details}</p>
        <button class="btn btn-primary" onclick="acceptRequest('${docSnap.id}')">✅ Accept</button>
        <button class="btn btn-danger" onclick="rejectRequest('${docSnap.id}')">❌ Reject</button>
      `;

      requestsList.appendChild(div);
    });

    if (!hasRequests) {
      requestsList.innerHTML = "<p>No requests yet.</p>";
    }
  });
}

// ===============================
// Accept / Reject Request
// ===============================
window.acceptRequest = async function (id) {
  try {
    await updateDoc(doc(db, "requests", id), { status: "accepted" });
    showAlert("🎉 You accepted this request!", "success");
  } catch (err) {
    showAlert("❌ Error accepting request", "error");
  }
};

window.rejectRequest = async function (id) {
  try {
    await updateDoc(doc(db, "requests", id), { status: "rejected" });
    showAlert("❌ You rejected this request.", "warning");
  } catch (err) {
    showAlert("❌ Error rejecting request", "error");
  }
};

// ===============================
// Init on Auth
// ===============================
onAuthStateChanged(auth, async user => {
  if (user) {
    const docSnap = await getDoc(doc(db, "users", user.uid));
    const data = docSnap.data();
    const role = data?.role || "worker";

    initMap();
    trackWorkerLocation(user.uid);
    loadRequests(role);

    if (data) {
      document.getElementById("workerName").value = data.name || "";
      document.getElementById("workerPhone").value = data.phone || "";
      document.getElementById("workerPrice").value = data.price || "";
    }
  } else {
    window.location.href = "login.html";
  }
});
