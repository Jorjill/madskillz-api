// firebaseAdmin.js
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Ensure the private key is correctly formatted
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

module.exports = admin;
