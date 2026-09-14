import { db } from './firebase-config.js';
import { requireAuth } from './auth.js';
import { renderBottomNav } from './components/bottom-nav.js';
import { renderChatFab } from './components/chat-fab.js';
import { maybeShowPermissionBanner, scheduleTaskReminders } from './notifications.js';
import {
  doc, getDoc, collection, query, orderBy, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

renderBottomNav('dashboard');
renderChatFab();
maybeShowPermissionBanner('dashboard-banner-root');

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function calculateDaysLeft(targetDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(targetDateStr);
  examDate.setHours(0, 0, 0, 0);
  const diffTime = examDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function renderTasksPreview(tasks) {
  const root = document.getElementById('tasks-preview');
  const today = todayStr();

  if (!root) return;

  if (tasks.length === 0) {
    root.innerHTML = `
      <div class="text-sm text-ink-soft border border-dashed border-line rounded-2xl p-5 text-center bg-white">
        <p class="font-medium text-ink mb-1">No tasks set for today</p>
        <p class="text-xs text-ink-soft mb-3">Add daily study goals in your Tracker to stay consistent.</p>
        <a href="tracker.html" class="inline-block bg-navy text-paper text-xs px-3.5 py-1.5 rounded-lg font-semibold hover:bg-navy-light transition">
          + Add Task
        </a>
      </div>`;
    return;
  }

  root.innerHTML = tasks.slice(0, 4).map((task) => {
    const isDone = !!task.completions?.[today];
    return `
      <div class="flex items-center justify-between bg-white border border-line rounded-xl px-4 py-3 shadow-sm hover:border-navy/30 transition">
        <div class="min-w-0 pr-3">
          <p class="text-xs font-semibold uppercase tracking-wider text-pen mb-0.5">${task.subject || 'General'}</p>
          <p class="text-sm font-semibold text-navy truncate ${isDone ? 'line-through opacity-60' : ''}">${task.title}</p>
        </div>
        <span class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${isDone ? 'bg-success text-white' : 'bg-line/50 text-ink-soft'} transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </span>
      </div>`;
  }).join('');
}

requireAuth(async (user) => {
  document.getElementById('greeting').textContent = getGreeting();

  const userSnap = await getDoc(doc(db, "users", user.uid));
  if (userSnap.exists()) {
    const data = userSnap.data();
    const rawName = data.name || user.displayName || user.email.split('@')[0];
    const firstName = rawName.split(' ')[0];
    const initialLetter = firstName.charAt(0).toUpperCase() || 'S';

    document.getElementById('student-name').textContent = firstName;
    
    // Set profile avatar initial letter
    const initialBadge = document.getElementById('profile-initial-badge');
    if (initialBadge) {
      initialBadge.textContent = initialLetter;
    }

    const schoolText = [data.school, data.city].filter(Boolean).join(' • ') || '10th Standard (SSC)';
    document.getElementById('student-school').textContent = schoolText;

    const countdownNumber = document.getElementById('countdown-number');
    const countdownLabel = document.getElementById('countdown-label');
    const countdownSubtext = document.getElementById('countdown-subtext');
    const progressBar = document.getElementById('countdown-progress-bar');

    // Current academic year default target is March 2027
    const targetDate = data.examDate || '2027-03-01';
    const daysLeft = calculateDaysLeft(targetDate);

    if (daysLeft > 0) {
      countdownNumber.textContent = daysLeft;
      countdownLabel.textContent = 'days to go';
      const pct = Math.max(10, Math.min(100, Math.round((180 - Math.min(180, daysLeft)) / 180 * 100)));
      if (progressBar) progressBar.style.width = `${pct}%`;

      if (data.examDate) {
        const formattedDate = new Date(data.examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        countdownSubtext.textContent = `1st Board Exam scheduled on ${formattedDate}`;
      } else {
        countdownSubtext.textContent = 'Targeting March 2027 SSC Boards (Set exact date in Settings)';
      }
    } else if (daysLeft === 0) {
      countdownNumber.textContent = '🎯';
      countdownLabel.textContent = 'Today!';
      countdownSubtext.textContent = "Today is your Board Exam — Best of luck!";
      if (progressBar) progressBar.style.width = '100%';
    } else {
      countdownNumber.textContent = '✓';
      countdownLabel.textContent = 'Exams Complete';
      countdownSubtext.textContent = 'Board exams finished. Great work!';
      if (progressBar) progressBar.style.width = '100%';
    }
  }

  // Live-updating tasks preview
  const tasksQuery = query(collection(db, 'users', user.uid, 'tasks'), orderBy('createdAt', 'asc'));
  onSnapshot(tasksQuery, (snapshot) => {
    const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderTasksPreview(tasks);
    scheduleTaskReminders(tasks);
  });
});