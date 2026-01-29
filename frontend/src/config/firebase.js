import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';

// Firebase configuration - Replace with your project's config
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Check if we're in production (Vercel)
const isProduction = import.meta.env.PROD;

// Google Sign-in - Use redirect in production, popup in development
export const signInWithGoogle = async () => {
    try {
        let result;
        
        if (isProduction) {
            // Use redirect for production (avoids COOP issues)
            await signInWithRedirect(auth, googleProvider);
            // This won't return immediately - page will redirect
            return null;
        } else {
            // Use popup for local development
            result = await signInWithPopup(auth, googleProvider);
        }
        
        const user = result.user;
        const idToken = await user.getIdToken();

        return {
            idToken,
            user: {
                email: user.email,
                name: user.displayName,
                photoURL: user.photoURL,
                uid: user.uid
            }
        };
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
};

// Handle redirect result (call this on app init)
export const handleRedirectResult = async () => {
    try {
        const result = await getRedirectResult(auth);
        if (result) {
            const user = result.user;
            const idToken = await user.getIdToken();
            return {
                idToken,
                user: {
                    email: user.email,
                    name: user.displayName,
                    photoURL: user.photoURL,
                    uid: user.uid
                }
            };
        }
        return null;
    } catch (error) {
        console.error('Redirect result error:', error);
        throw error;
    }
};

// Sign out
export const firebaseSignOut = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
};

export { auth };
