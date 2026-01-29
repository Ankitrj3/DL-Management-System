const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
    // Check if we have a service account file
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (serviceAccountPath) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else if (process.env.FIREBASE_PROJECT_ID) {
        // Use environment variables
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
        });
    } else {
        console.warn('Firebase Admin not configured - using mock mode');
    }
}

module.exports = admin;
