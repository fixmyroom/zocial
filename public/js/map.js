// map.js
import { db, auth } from './firebase-config.js';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';

// Initialize the map
let map = L.map('map').setView([27.7172, 85.3240], 13); // Default: Kathmandu

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let userMarker = null;

// Get user's live location and update Firestore
function trackUserLocation(uid, role) {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(position => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      if (!userMarker) {
        userMarker = L.marker([lat, lng]).addTo(map);
      } else {
        userMarker.setLatLng([lat, lng]);
      }

      map.setView([lat, lng]);

      setDoc(doc(db, "locations", uid), {
        uid,
        role,
        lat,
        lng,
        updatedAt: serverTimestamp()
      }, { merge: true });

    }, err => {
      console.error("Geolocation error:", err);
    }, {
      enableHighAccuracy: true
    });
  } else {
    alert("Geolocation not supported.");
  }
}

// Show other nearby markers
function showNearbyMarkers(currentUid) {
  onSnapshot(collection(db, "locations"), (snapshot) => {
    snapshot.docChanges().forEach(change => {
      const data = change.doc.data();
      if (data.uid === currentUid) return;

      if (change.type === "added" || change.type === "modified") {
        const marker = L.marker([data.lat, data.lng])
          .bindPopup(`${data.role} nearby`)
          .addTo(map);
      }
    });
  });
}

// Auth check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const uid = user.uid;
  const role = localStorage.getItem("userRole") || "customer"; // fallback
  trackUserLocation(uid, role);
  showNearbyMarkers(uid);
});
