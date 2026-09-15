// Paste your firebaseConfig object from Firebase Console here
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
apiKey: "AIzaSyBAU1TjQUuSarGl4t9gMe7Yqhl8tF1bJKw",
  authDomain: "scora-ssc.firebaseapp.com",
  projectId: "scora-ssc",
  storageBucket: "scora-ssc.firebasestorage.app",
  messagingSenderId: "830755865484",
  appId: "1:830755865484:web:901ad9319b750106c98ca9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const BACKEND_URL = " https://scora-vrvu.onrender.com"; // update after Render deployment