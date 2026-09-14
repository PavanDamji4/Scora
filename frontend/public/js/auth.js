import { auth, db, googleProvider } from './firebase-config.js';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
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
  const user   = result.user;

  // Save profile to Firestore — NO redirect here
  await setDoc(doc(db, 'users', user.uid), {
    name:               extraData.name || user.email.split('@')[0],
    email:              user.email,
    school:             extraData.school   || '',
    city:               extraData.city     || '',
    standard:           extraData.standard || '10th Standard (SSC)',
    medium:             'English',
    subjects:           SSC_SUBJECTS,
    photoURL:           user.photoURL || null,
    onboardingComplete: true,
    emailVerified:      false,
    createdAt:          serverTimestamp(),
  }, { merge: true });

  // Send the verification email
  await sendEmailVerification(user, {
    url: window.location.origin + '/Scora/frontend/public/index.html',
  });

  // Sign them out immediately — must verify before entering the app
  await signOut(auth);

  // Throw so login-page.js can show the "check your inbox" screen
  throw { code: 'auth/verification-sent', email };
}

export async function loginWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);

  if (!result.user.emailVerified) {
    // Sign them back out so requireAuth doesn't let them through
    await signOut(auth);
    throw { code: 'auth/email-not-verified', email, user: result.user };
  }

  await routeAfterLogin(result.user, false);
}

export async function resendVerificationEmail(email, password) {
  // Re-sign in temporarily to get the user object, then resend
  const result = await signInWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(result.user, {
    url: window.location.origin + '/Scora/frontend/public/index.html',
  });
  await signOut(auth);
}

export function logout() {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
}

export function requireAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) {
      callback(user);
    } else if (user && !user.emailVerified) {
      // Signed in but not verified — boot them back to login
      signOut(auth).then(() => {
        window.location.href = 'index.html';
      });
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