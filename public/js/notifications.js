import { db } from './firebase.js';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  doc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

export function listenToNotifications(uid, renderCallback) {
  const notificationsRef = collection(db, `users/${uid}/notifications`);
  const q = query(notificationsRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach(doc => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    renderCallback(notifications);
  });
}

export async function markNotificationSeen(uid, notificationId) {
  await updateDoc(doc(db, `users/${uid}/notifications/${notificationId}`), {
    seen: true
  });
}
