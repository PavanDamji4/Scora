import { auth, db } from './firebase-config.js';
import { requireAuth } from './auth.js';
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Fixed SSC subject list — same for every student, so it's stored here
// once rather than asked in onboarding.
const SSC_SUBJECTS = [
  "English", "Marathi", "Hindi", "Algebra", "Geometry",
  "Science - 1", "Science - 2", "History & Political Science", "Geography"
];

let currentUser = null;
let selectedMedium = null;

requireAuth((user) => {
  currentUser = user;
});

const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const dot1 = document.getElementById('dot-1');
const dot2 = document.getElementById('dot-2');
const stepLabel = document.getElementById('step-label');
const toStep2Btn = document.getElementById('to-step-2');

// Medium selection
document.querySelectorAll('.medium-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.medium-card').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedMedium = card.dataset.medium;
    toStep2Btn.disabled = false;
  });
});

toStep2Btn.addEventListener('click', () => {
  step1.classList.remove('active');
  step2.classList.add('active');
  dot1.classList.replace('bg-navy', 'bg-line');
  dot2.classList.replace('bg-line', 'bg-navy');
  stepLabel.textContent = 'Step 2 of 2';
});

document.getElementById('back-to-step-1').addEventListener('click', () => {
  step2.classList.remove('active');
  step1.classList.add('active');
  dot2.classList.replace('bg-navy', 'bg-line');
  dot1.classList.replace('bg-line', 'bg-navy');
  stepLabel.textContent = 'Step 1 of 2';
});

const examDateInput = document.getElementById('exam-date');
const finishBtn = document.getElementById('finish-btn');

examDateInput.addEventListener('input', () => {
  finishBtn.disabled = !examDateInput.value;
});
finishBtn.disabled = true;

finishBtn.addEventListener('click', async () => {
  if (!currentUser || !selectedMedium || !examDateInput.value) return;

  finishBtn.disabled = true;
  finishBtn.textContent = 'Saving…';

  try {
    await setDoc(doc(db, "users", currentUser.uid), {
      medium: selectedMedium,
      subjects: SSC_SUBJECTS,
      examDate: examDateInput.value, // stored as "YYYY-MM-DD"
      onboardingComplete: true,
    }, { merge: true });

    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Failed to save onboarding data:", error);
    finishBtn.disabled = false;
    finishBtn.textContent = 'Finish setup';
    alert("Something went wrong saving your details. Please try again.");
  }
});