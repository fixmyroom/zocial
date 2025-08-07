// admin.js
import { auth, db } from './firebase-config.js';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { showAlert } from './utils.js';

const usersTableBody = document.getElementById('usersTableBody');

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  checkAdmin(user);
});

async function checkAdmin(user) {
  const userDoc = await db.collection('users').doc(user.uid).get();
  if (!userDoc.exists || userDoc.data().role !== 'admin') {
    showAlert('error', 'Access denied: Admins only.');
    setTimeout(() => {
      auth.signOut();
      window.location.href = 'login.html';
    }, 2000);
    return;
  }
  loadUsers();
}

async function loadUsers() {
  const usersSnapshot = await getDocs(collection(db, 'users'));
  usersTableBody.innerHTML = '';

  usersSnapshot.forEach(docSnap => {
    const user = docSnap.data();
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${user.name || ''}</td>
      <td>${user.email || ''}</td>
      <td>${user.role || 'N/A'}</td>
      <td>
        <select class="roleSelect" data-id="${docSnap.id}">
          <option value="">Select Role</option>
          <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Customer</option>
          <option value="worker" ${user.role === 'worker' ? 'selected' : ''}>Worker</option>
          <option value="store" ${user.role === 'store' ? 'selected' : ''}>Store</option>
          <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
        </select>
        <button class="deleteBtn" data-id="${docSnap.id}">🗑️ Delete</button>
      </td>
    `;

    usersTableBody.appendChild(tr);
  });

  // Add event listeners for role change and delete buttons
  document.querySelectorAll('.roleSelect').forEach(select => {
    select.addEventListener('change', async (e) => {
      const uid = e.target.dataset.id;
      const newRole = e.target.value;

      try {
        await updateDoc(doc(db, 'users', uid), { role: newRole });
        showAlert('success', 'User role updated.');
      } catch (err) {
        showAlert('error', 'Failed to update role: ' + err.message);
      }
    });
  });

  document.querySelectorAll('.deleteBtn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const uid = e.target.dataset.id;
      if (!confirm('Delete this user? This action cannot be undone.')) return;
      try {
        await deleteDoc(doc(db, 'users', uid));
        showAlert('success', 'User deleted.');
        loadUsers(); // Refresh list
      } catch (err) {
        showAlert('error', 'Failed to delete user: ' + err.message);
      }
    });
  });
}
