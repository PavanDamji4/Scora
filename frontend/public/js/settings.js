import { db } from './firebase-config.js';
import { requireAuth, logout } from './auth.js';
import { renderBottomNav } from './components/bottom-nav.js';
import { renderChatFab } from './components/chat-fab.js';
import {
  doc, getDoc, updateDoc, collection, onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

renderBottomNav('settings');
renderChatFab();

let currentUser = null;
let tasksCache = [];
let notificationsEnabledInApp = true;
let scheduledTimers = {};

requireAuth(async (user) => {
  currentUser = user;
  await loadProfile();
  checkNotificationPermission();
  listenToTasks();
});

// ---------- Profile ----------
async function loadProfile() {
  const name = currentUser.displayName || currentUser.email.split('@')[0];
  document.getElementById('profile-name').textContent = name;
  document.getElementById('profile-email').textContent = currentUser.email;
  document.getElementById('profile-initial').textContent = name.charAt(0).toUpperCase();

  const snap = await getDoc(doc(db, 'users', currentUser.uid));
  if (snap.exists()) {
    const data = snap.data();
    if (data.name) document.getElementById('profile-name').textContent = data.name;
    
    const schoolCityText = [data.school, data.city, data.standard].filter(Boolean).join(' • ') || '10th Standard (SSC)';
    document.getElementById('profile-school').textContent = schoolCityText;

    if (data.examDate) document.getElementById('exam-date-input').value = data.examDate;

    notificationsEnabledInApp = data.notificationsEnabled !== false;
    updateMasterToggleUI();
  }
}

// ---------- Exam details ----------
document.getElementById('save-exam-details')?.addEventListener('click', async () => {
  const examDate = document.getElementById('exam-date-input').value;

  try {
    await updateDoc(doc(db, 'users', currentUser.uid), { examDate });
    const confirmation = document.getElementById('save-confirmation');
    confirmation.classList.remove('hidden');
    setTimeout(() => confirmation.classList.add('hidden'), 2500);
  } catch (err) {
    console.error('Failed to save exam date:', err);
    alert('Failed to save date: ' + err.message);
  }
});

// ---------- Notifications: browser permission ----------
function checkNotificationPermission() {
  const statusEl = document.getElementById('permission-status');
  const promptEl = document.getElementById('permission-prompt');

  if (!statusEl) return;

  if (!('Notification' in window)) {
    statusEl.textContent = 'Browser notifications not supported';
    return;
  }

  if (Notification.permission === 'granted') {
    if (promptEl) promptEl.classList.add('hidden');
    statusEl.textContent = notificationsEnabledInApp
      ? 'Enabled — daily study task reminders will pop up'
      : 'Turned off in settings';
  } else if (Notification.permission === 'denied') {
    statusEl.textContent = 'Blocked in browser settings. Please allow notifications in your browser address bar.';
    if (promptEl) promptEl.classList.add('hidden');
  } else {
    if (promptEl) promptEl.classList.remove('hidden');
    statusEl.textContent = '';
  }
}

document.getElementById('enable-notifications')?.addEventListener('click', async () => {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    notificationsEnabledInApp = true;
    await updateDoc(doc(db, 'users', currentUser.uid), { notificationsEnabled: true });
    updateMasterToggleUI();
    new Notification('Scora', { body: "Daily study reminders enabled for 10th SSC." });
  }
  checkNotificationPermission();
  scheduleAllReminders();
});

// ---------- Master toggle ----------
function updateMasterToggleUI() {
  const toggle = document.getElementById('master-notif-toggle');
  const knob = document.getElementById('master-toggle-knob');
  if (!toggle || !knob) return;

  toggle.classList.toggle('bg-navy', notificationsEnabledInApp);
  toggle.classList.toggle('bg-line', !notificationsEnabledInApp);
  knob.classList.toggle('left-[22px]', notificationsEnabledInApp);
  knob.classList.toggle('left-0.5', !notificationsEnabledInApp);
}

document.getElementById('master-notif-toggle')?.addEventListener('click', async () => {
  if (Notification.permission !== 'granted') {
    alert('Please click "Enable Reminders" below first.');
    return;
  }

  notificationsEnabledInApp = !notificationsEnabledInApp;
  await updateDoc(doc(db, 'users', currentUser.uid), { notificationsEnabled: notificationsEnabledInApp });
  updateMasterToggleUI();
  checkNotificationPermission();
  scheduleAllReminders();
});

// ---------- Task reminders list ----------
function listenToTasks() {
  const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
  onSnapshot(tasksRef, (snapshot) => {
    tasksCache = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderRemindersList();
    scheduleAllReminders();
  });
}

function renderRemindersList() {
  const root = document.getElementById('reminders-list');
  const noTasksMsg = document.getElementById('no-tasks-msg');
  if (!root) return;

  if (tasksCache.length === 0) {
    root.innerHTML = '';
    if (noTasksMsg) noTasksMsg.classList.remove('hidden');
    return;
  }
  if (noTasksMsg) noTasksMsg.classList.add('hidden');

  root.innerHTML = tasksCache.map((task) => `
    <div class="bg-white border border-line rounded-xl px-4 py-3 flex items-center justify-between gap-3 shadow-sm">
      <div class="min-w-0 pr-2">
        <p class="text-xs font-bold text-navy truncate">${task.title}</p>
        <p class="text-[10px] text-ink-soft">${task.subject || 'General'}</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <input type="time" data-task-id="${task.id}" class="reminder-time text-xs border border-line rounded-lg px-2 py-1 bg-paper/30 font-medium"
          value="${task.reminderTime || '18:00'}" />
        <button data-task-id="${task.id}" class="reminder-toggle w-10 h-6 rounded-full relative transition ${task.reminderEnabled ? 'bg-navy' : 'bg-line'}">
          <span class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition shadow-sm ${task.reminderEnabled ? 'left-[18px]' : 'left-0.5'}"></span>
        </button>
      </div>
    </div>
  `).join('');

  root.querySelectorAll('.reminder-toggle').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const taskId = btn.dataset.taskId;
      const task = tasksCache.find((t) => t.id === taskId);
      const newEnabled = !task.reminderEnabled;

      await updateDoc(doc(db, 'users', currentUser.uid, 'tasks', taskId), {
        reminderEnabled: newEnabled,
        reminderTime: task.reminderTime || '18:00',
      });
    });
  });

  root.querySelectorAll('.reminder-time').forEach((input) => {
    input.addEventListener('change', async () => {
      const taskId = input.dataset.taskId;
      await updateDoc(doc(db, 'users', currentUser.uid, 'tasks', taskId), {
        reminderTime: input.value,
      });
    });
  });
}

function scheduleAllReminders() {
  Object.values(scheduledTimers).forEach(clearTimeout);
  scheduledTimers = {};

  if (Notification.permission !== 'granted' || !notificationsEnabledInApp) return;

  tasksCache.forEach((task) => {
    if (!task.reminderEnabled || !task.reminderTime) return;

    const today = new Date().toISOString().split('T')[0];
    const alreadyDoneToday = !!task.completions?.[today];

    // Don't remind if already completed today
    if (alreadyDoneToday) return;

    const [hours, minutes] = task.reminderTime.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);

    // If time already passed today, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const msUntil = target - now;
    scheduledTimers[task.id] = setTimeout(() => {
      if (notificationsEnabledInApp && Notification.permission === 'granted') {
        new Notification('📚 Scora Study Reminder', {
          body: `Time to practice: "${task.title}"`,
          icon: '/assets/icons/icon-192.png',
          tag: `scora-task-${task.id}`,
        });
      }
    }, msUntil);
  });
}

// ---------- Test Notification Button ----------
document.getElementById('test-notif-btn')?.addEventListener('click', async () => {
  if (!('Notification' in window)) {
    alert('Your browser does not support notifications.');
    return;
  }

  if (Notification.permission === 'denied') {
    alert('Notifications are blocked. Please allow them in your browser address bar settings, then reload the page.');
    return;
  }

  if (Notification.permission === 'default') {
    const result = await Notification.requestPermission();
    if (result !== 'granted') {
      alert('Permission not granted. Please allow notifications to use reminders.');
      return;
    }
    notificationsEnabledInApp = true;
    checkNotificationPermission();
    updateMasterToggleUI();
  }

  // Fire the test notification immediately
  try {
    new Notification('🔔 Scora Reminder Test', {
      body: tasksCache.length > 0
        ? `You have ${tasksCache.length} task${tasksCache.length > 1 ? 's' : ''} to study today. Notifications are working!`
        : 'Notifications are working! Add tasks in your Tracker to get daily reminders.',
      icon: '/assets/icons/icon-192.png',
      tag: 'scora-test',
    });
  } catch (e) {
    console.error('Test notification failed:', e);
    alert('Could not fire notification: ' + e.message);
  }
});

// ---------- Logout ----------
document.getElementById('logout-btn')?.addEventListener('click', () => {
  if (confirm('Log out of Scora?')) logout();
});
