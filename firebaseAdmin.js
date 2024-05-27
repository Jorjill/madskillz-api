// firebaseAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./madskillz-a6ba6-firebase-adminsdk-9f6ai-4d04fe69d9.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;