# FixMyRoomwithZocial

This is a Firebase-based Progressive Web App for managing room fix requests with multiple roles: Customer, Worker, Store, Admin.

## Structure

- `index.html` — Login/Signup page
- `role.html` — Role selection page
- `profile.html` — Profile completion
- `customer-dashboard.html` — Customer UI
- `worker-dashboard.html` — Worker UI with live GPS sharing
- `store-dashboard.html` — Store UI product management
- `admin-dashboard.html` — Admin overview and user management
- `contact-admin.html` — Contact admin or request premium

## Deployment

- Deploy to Firebase Hosting
- Set Firestore and Realtime Database security rules properly
- Replace Firebase config in `js/firebase-config.js` with your project info

## Notes

- Uses emojis for UI icons for fast load and mobile-friendliness
- Uses Firestore for persistent data and RTDB for live GPS locations
- Real-time updates implemented where applicable
