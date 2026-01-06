const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

let app;

try {
    // Check if serviceAccountKey.json exists locally
    if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized with serviceAccountKey.json');
    } else {
        // Fallback to default credentials (GOOGLE_APPLICATION_CREDENTIALS or Cloud environment)
        app = admin.initializeApp();
        console.log('Firebase Admin initialized with default credentials');
    }
} catch (error) {
    console.error('Firebase Admin initialization failed:', error);
}

const db = admin.firestore();

module.exports = { admin, db };
