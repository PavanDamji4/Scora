import { db } from './firebase-config.js';
import { requireAuth } from './auth.js';
import { renderBottomNav } from './components/bottom-nav.js';
import { renderChatFab } from './components/chat-fab.js';
import {
  collection, addDoc, serverTimestamp, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

renderBottomNav('settings');
renderChatFab();

// ─── EmailJS config ───────────────────────────────────────────────────────────
// Steps to set this up (one time):
//  1. Go to https://www.emailjs.com and create a free account
//  2. Add an Email Service (Gmail) → connect pavandamji4@gmail.com
//  3. Create an Email Template with these variables:
//       {{from_name}}, {{from_email}}, {{school}}, {{category}}, {{subject}}, {{message}}
//  4. Replace the three values below with your actual IDs from EmailJS dashboard

const EMAILJS_PUBLIC_KEY  = '5_bcWeIKSFRVvSoRx';
const EMAILJS_SERVICE_ID  = 'service_ikqgmlp';
const EMAILJS_TEMPLATE_ID = 'ka64jjs';

// ─────────────────────────────────────────────────────────────────────────────

let currentUser = null;
let userData    = {};

requireAuth(async (user) => {
  currentUser = user;
  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) userData = snap.data();
  } catch (e) {
    console.warn('User fetch warning:', e);
  }
});

const form          = document.getElementById('feedback-form');
const successBanner = document.getElementById('success-banner');
const submitBtn     = document.getElementById('submit-feedback-btn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const category = document.getElementById('feedback-type').value;
  const subject  = document.getElementById('feedback-subject').value.trim();
  const message  = document.getElementById('feedback-message').value.trim();
  if (!subject || !message) return;

  submitBtn.disabled    = true;
  submitBtn.textContent = 'Submitting…';

  const studentName  = userData.name || currentUser.displayName || currentUser.email.split('@')[0];
  const studentEmail = currentUser.email;
  const school       = [userData.school, userData.city].filter(Boolean).join(', ') || '—';

  try {
    // 1 — Send email via EmailJS
    const emailjsReady = typeof emailjs !== 'undefined' &&
                         EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY';

    if (emailjsReady) {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name:   studentName,
          from_email:  studentEmail,
          school,
          category,
          subject,
          message,
          reply_to:    studentEmail,
        });
      } catch (emailErr) {
        // Log but don't block — Firestore save still happens below
        console.warn('EmailJS failed (will save to Firestore only):', emailErr?.text || emailErr?.message || emailErr);
      }
    }

    // 2 — Always save to Firestore as backup
    await addDoc(collection(db, 'feedback'), {
      uid: currentUser.uid,
      studentName,
      email: studentEmail,
      school: userData.school || '',
      city:   userData.city   || '',
      category,
      subject,
      message,
      emailSent: emailjsReady,
      createdAt: serverTimestamp(),
    });

    form.classList.add('hidden');
    successBanner.classList.remove('hidden');

  } catch (error) {
    console.error('Feedback submit failed:', error);
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Submit Feedback';
    alert(`Could not submit feedback: ${error?.message || 'Unknown error. Please try again.'}`);
  }
});
