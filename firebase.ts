
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your actual Firebase project configuration
// You can find this in the Firebase Console: Project Settings > General > Your apps
const firebaseConfig = {
    apiKey: "AIzaSyD5H3geUOUCzwUcFJ9y2GuNqPYs_782v2Q",
    authDomain: "ai-crm-5c42b.firebaseapp.com",
    projectId: "ai-crm-5c42b",
    storageBucket: "ai-crm-5c42b.firebasestorage.app",
    messagingSenderId: "876074926872",
    appId: "1:876074926872:web:d977e763cd0a48076bd46d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
