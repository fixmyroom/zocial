// store-tools.js
import { auth, db } from './firebase-config.js';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { showAlert } from './utils.js';

const catalogList = document.getElementById('catalogList');
const addItemForm = document.getElementById('addItemForm');
const itemNameInput = document.getElementById('itemName');
const itemPriceInput = document.getElementById('itemPrice');

let currentUserId = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  currentUserId = user.uid;
  await loadCatalog();
});

async function loadCatalog() {
  catalogList.innerHTML = '<p>Loading catalog...</p>';
  try {
    const q = query(collection(db, 'storeCatalog'), where('storeId', '==', currentUserId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      catalogList.innerHTML = '<p>No items in your catalog yet.</p>';
      return;
    }
    catalogList.innerHTML = '';
    querySnapshot.forEach(docSnap => {
      const item = docSnap.data();
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${item.name}</strong> — $${item.price.toFixed(2)}
        <button class="edit-btn" data-id="${docSnap.id}">✏️ Edit</button>
        <button class="delete-btn" data-id="${docSnap.id}">🗑️ Delete</button>
      `;
      catalogList.appendChild(li);
    });

    // Add listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editItem(btn.dataset.id));
    });
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteItem(btn.dataset.id));
    });
  } catch (err) {
    showAlert('error', 'Failed to load catalog: ' + err.message);
  }
}

addItemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = itemNameInput.value.trim();
  const price = parseFloat(itemPriceInput.value);
  if (!name || isNaN(price)) {
    showAlert('error', 'Please enter valid name and price');
    return;
  }
  try {
    await addDoc(collection(db, 'storeCatalog'), {
      storeId: currentUserId,
      name,
      price,
      createdAt: new Date()
    });
    showAlert('success', 'Item added!');
    itemNameInput.value = '';
    itemPriceInput.value = '';
    await loadCatalog();
  } catch (err) {
    showAlert('error', 'Failed to add item: ' + err.message);
  }
});

async function editItem(itemId) {
  const newName = prompt('Enter new name:');
  if (newName === null) return; // cancel
  const newPriceStr = prompt('Enter new price:');
  if (newPriceStr === null) return; // cancel
  const newPrice = parseFloat(newPriceStr);
  if (!newName.trim() || isNaN(newPrice)) {
    showAlert('error', 'Invalid input.');
    return;
  }
  try {
    await updateDoc(doc(db, 'storeCatalog', itemId), {
      name: newName.trim(),
      price: newPrice
    });
    showAlert('success', 'Item updated!');
    await loadCatalog();
  } catch (err) {
    showAlert('error', 'Failed to update item: ' + err.message);
  }
}

async function deleteItem(itemId) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  try {
    await deleteDoc(doc(db, 'storeCatalog', itemId));
    showAlert('success', 'Item deleted!');
    await loadCatalog();
  } catch (err) {
    showAlert('error', 'Failed to delete item: ' + err.message);
  }
}
