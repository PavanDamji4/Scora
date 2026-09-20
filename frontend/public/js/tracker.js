import { db } from './firebase-config.js';
import { requireAuth } from './auth.js';
import { renderBottomNav } from './components/bottom-nav.js';
import { renderChatFab } from './components/chat-fab.js';
import {
  scheduleTaskReminders,
  maybeShowPermissionBanner,
  celebrateStreakMilestone,
} from './notifications.js';
import {
  collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot,
  serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

renderBottomNav('tracker');
renderChatFab();

let currentUser = null;
let unsubscribeTasks = null;

requireAuth((user) => {
  currentUser = user;
  listenToTasks();
  maybeShowPermissionBanner('tracker-banner-root');
});

// ---------- Date helpers ----------
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

function isYesterday(dateStr) {
  return dateStr === daysAgoStr(1);
}

// ---------- Firestore listeners ----------
function listenToTasks() {
  const tasksRef = collection(db, 'users', currentUser.uid, 'tasks');
  const q = query(tasksRef, orderBy('createdAt', 'asc'));

  unsubscribeTasks = onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderTasks(tasks);
  });
}

async function addTask(title, subject) {
  await addDoc(collection(db, 'users', currentUser.uid, 'tasks'), {
    title,
    subject: subject || 'General',
    createdAt: serverTimestamp(),
    currentStreak: 0,
    lastCompletedDate: null,
    completions: {},
  });
}

async function toggleTaskToday(task) {
  const today = todayStr();
  const isCompletedToday = !!task.completions?.[today];
  const taskRef = doc(db, 'users', currentUser.uid, 'tasks', task.id);

  if (isCompletedToday) {
    const newCompletions = { ...task.completions };
    delete newCompletions[today];
    const newStreak = Math.max(0, (task.currentStreak || 0) - 1);

    await updateDoc(taskRef, {
      completions: newCompletions,
      currentStreak: newStreak,
      lastCompletedDate: isYesterday(task.lastCompletedDate) ? task.lastCompletedDate : null,
    });
    return;
  }

  const continuesStreak = task.lastCompletedDate === today || isYesterday(task.lastCompletedDate);
  const newStreak = continuesStreak ? (task.currentStreak || 0) + 1 : 1;

  await updateDoc(taskRef, {
    [`completions.${today}`]: true,
    currentStreak: newStreak,
    lastCompletedDate: today,
  });

  // 🎉 Celebrate streak milestones
  celebrateStreakMilestone(task.title, newStreak);
}

async function removeTask(taskId) {
  await deleteDoc(doc(db, 'users', currentUser.uid, 'tasks', taskId));
}

// ---------- 30-Day Heatmap rendering ----------
function render30DayHeatmap(completions) {
  const blocks = [];
  const DAYS_COUNT = 30;

  for (let i = DAYS_COUNT - 1; i >= 0; i--) {
    const dateStr = daysAgoStr(i);
    const isDone = !!completions?.[dateStr];
    const displayDate = new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    
    // Calculate column position on mobile (15 columns) to clamp tooltips inside card boundaries
    const blockIndex = (DAYS_COUNT - 1) - i;
    const colIndex = blockIndex % 15;
    let alignClass = '';
    if (colIndex <= 1) {
      alignClass = 'tooltip-left';
    } else if (colIndex >= 13) {
      alignClass = 'tooltip-right';
    }

    blocks.push(`
      <div class="tooltip-trigger relative group">
        <div class="w-full aspect-square rounded-[3px] transition-colors ${isDone ? 'bg-indigo' : 'bg-line/60'}"></div>
        <div class="tooltip-box ${alignClass}">${displayDate}: ${isDone ? 'Completed ✓' : 'Missed'}</div>
      </div>
    `);
  }

  return `
    <div class="mt-3">
      <div class="flex items-center justify-between text-[10px] text-ink-soft mb-1 font-semibold">
        <span>30 Days Ago</span>
        <span>Today</span>
      </div>
      <div class="grid grid-cols-[repeat(15,1fr)] sm:grid-cols-[repeat(30,1fr)] gap-1">
        ${blocks.join('')}
      </div>
    </div>
  `;
}

// ---------- Task card rendering ----------
function taskCard(task) {
  const today = todayStr();
  const isDoneToday = !!task.completions?.[today];

  const card = document.createElement('div');
  card.className = 'bg-white border border-line rounded-2xl p-4 shadow-sm hover:border-navy/30 transition overflow-hidden relative';
  card.innerHTML = `
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 pr-2">
        <span class="text-[10px] font-bold text-indigo uppercase tracking-wider bg-indigo/8 px-2 py-0.5 rounded-md border border-indigo/20 inline-block mb-1">
          ${task.subject || 'General'}
        </span>
        <h3 class="font-bold text-sm text-navy truncate ${isDoneToday ? 'line-through opacity-60' : ''}">${task.title}</h3>
        <p class="text-xs font-semibold text-amber-dark mt-1 flex items-center gap-1">
          🔥 ${task.currentStreak || 0} day streak
        </p>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button class="delete-btn text-ink-soft hover:text-pen p-1.5 rounded-lg hover:bg-pen/5 transition" title="Delete Task">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="toggle-btn w-10 h-10 rounded-xl flex items-center justify-center transition shadow-sm ${isDoneToday ? 'bg-success text-white' : 'bg-line/40 text-ink-soft hover:bg-line/70'}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
    ${render30DayHeatmap(task.completions)}
  `;

  card.querySelector('.toggle-btn').addEventListener('click', () => toggleTaskToday(task));
  card.querySelector('.delete-btn').addEventListener('click', () => {
    if (confirm(`Remove "${task.title}"?`)) removeTask(task.id);
  });

  return card;
}

function renderTasks(tasks) {
  const root = document.getElementById('tasks-list');
  const emptyState = document.getElementById('empty-state');
  const today = todayStr();

  let maxStreak = 0;
  let doneTodayCount = 0;
  let totalCompletions30 = 0;
  let possibleCompletions30 = tasks.length * 30;

  tasks.forEach((t) => {
    if ((t.currentStreak || 0) > maxStreak) maxStreak = t.currentStreak;
    if (t.completions?.[today]) doneTodayCount++;

    for (let i = 0; i < 30; i++) {
      const d = daysAgoStr(i);
      if (t.completions?.[d]) totalCompletions30++;
    }
  });

  document.getElementById('stat-total-streak').textContent = `${maxStreak}🔥`;
  document.getElementById('stat-completed-today').textContent = `${doneTodayCount}/${tasks.length}`;
  const ratePct = possibleCompletions30 > 0 ? Math.round((totalCompletions30 / possibleCompletions30) * 100) : 0;
  document.getElementById('stat-month-rate').textContent = `${ratePct}%`;

  root.innerHTML = '';
  if (tasks.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');
  tasks.forEach((task) => root.appendChild(taskCard(task)));

  // Schedule browser reminder notifications for any pending tasks today
  scheduleTaskReminders(tasks);
}

// ---------- Add task modal ----------
const addModal = document.getElementById('add-task-modal');
const addForm = document.getElementById('add-task-form');
const openAddBtn = document.getElementById('open-add-task');
const emptyAddBtn = document.getElementById('empty-add-btn');
const cancelAddBtn = document.getElementById('cancel-add-task');
const modalCloseBtn = document.getElementById('modal-close-btn');
const subjectSelect = document.getElementById('task-subject');
const customSubjectContainer = document.getElementById('custom-subject-container');

if (subjectSelect && customSubjectContainer) {
  subjectSelect.addEventListener('change', () => {
    if (subjectSelect.value === 'Other') {
      customSubjectContainer.classList.remove('hidden');
    } else {
      customSubjectContainer.classList.add('hidden');
    }
  });
}

function showModal() { addModal.classList.remove('hidden'); }
function hideModal() { addModal.classList.add('hidden'); }

if (openAddBtn) openAddBtn.addEventListener('click', showModal);
if (emptyAddBtn) emptyAddBtn.addEventListener('click', showModal);
if (cancelAddBtn) cancelAddBtn.addEventListener('click', hideModal);
if (modalCloseBtn) modalCloseBtn.addEventListener('click', hideModal);

addForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  let subject = subjectSelect.value;
  if (subject === 'Other') {
    const customSub = document.getElementById('custom-subject').value.trim();
    subject = customSub || 'Other';
  }
  if (!title) return;

  const submitBtn = addForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving…';

  try {
    await addTask(title, subject);
    addForm.reset();
    customSubjectContainer.classList.add('hidden');
    hideModal();
  } catch (error) {
    console.error('Failed to add task:', error);
    alert(`Couldn't add task: ${error.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Task';
  }
});