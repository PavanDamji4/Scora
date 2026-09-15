import { auth, db, googleProvider } from './firebase-config.js';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const SSC_SUBJECTS = [
  "English", "Marathi", "Hindi", "Algebra", "Geometry",
  "Science - 1", "Science - 2", "History & Political Science", "Geography"
];

// Route directly to dashboard after login or account creation
async function routeAfterLogin(user, isNewUser, extraData = {}) {
  const userRef = doc(db, "users", user.uid);

  if (isNewUser) {
    await setDoc(userRef, {
      name: extraData.name || user.displayName || user.email.split('@')[0],
      email: user.email,
      school: extraData.school || '',
      city: extraData.city || '',
      standard: extraData.standard || '10th Standard (SSC)',
      medium: 'English', // English medium default per configuration
      subjects: SSC_SUBJECTS,
      photoURL: user.photoURL || null,
      onboardingComplete: true,
      createdAt: serverTimestamp(),
    }, { merge: true });
  } else {
    // Ensure basic doc exists for Google login first-timers
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        school: extraData.school || '',
        city: extraData.city || '',
        standard: '10th Standard (SSC)',
        medium: 'English',
        subjects: SSC_SUBJECTS,
        photoURL: user.photoURL || null,
        onboardingComplete: true,
        createdAt: serverTimestamp(),
      });
    }
  }

  window.location.href = "dashboard.html";
}

export async function loginWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const userRef = doc(db, "users", result.user.uid);
  const userSnap = await getDoc(userRef);
  await routeAfterLogin(result.user, !userSnap.exists());
}

export async function signupWithEmail(email, password, extraData = {}) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await routeAfterLogin(result.user, true, extraData);
}

export async function loginWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await routeAfterLogin(result.user, false);
}

export function logout() {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
}

export function requireAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user);
    } else {
      window.location.href = 'index.html';
    }
  });
}

export async function getAuthToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

export function friendlyAuthError(error) {
  const map = {
    'auth/email-already-in-use': 'An account already exists with this email. Try logging in instead.',
    'auth/invalid-email': 'That email address doesn\'t look right.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Try again.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/unauthorized-domain': 'This domain isn\'t authorized in Firebase yet — add it under Authentication → Settings → Authorized domains.',
    'auth/popup-closed-by-user': 'Google sign-in was closed before finishing.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  };
  return map[error.code] || `Something went wrong (${error.code || error.message}).`;
}