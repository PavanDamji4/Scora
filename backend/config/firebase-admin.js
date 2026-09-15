const admin = require('firebase-admin');

if (!admin.apps.length) {
  // On Render: credentials come from environment variables
  // Locally: falls back to the service account JSON file
  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Render stores the private key as a single-line string — restore newlines
        privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Local development — use the JSON file
    const serviceAccount = require('../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
}

const db   = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
