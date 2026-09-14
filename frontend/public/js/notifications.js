/**
 * notifications.js — Scora Study Reminder System
 *
 * Strategy: Instead of long setTimeout timers (which die when the tab closes),
 * we check on EVERY page load whether a reminder should fire right now.
 * We store the last-fired date in localStorage to avoid repeating on the same day.
 *
 * Morning window:  08:00 – 11:59  → fire if tasks pending
 * Evening window:  19:00 – 22:59  → fire if tasks still pending
 */

const STORAGE_MORNING = 'scora_reminded_morning';
const STORAGE_EVENING = 'scora_reminded_evening';

// ─── Permission ──────────────────────────────────────────────────────────────

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return await Notification.requestPermission();
}

export function notificationsAllowed() {
  return 'Notification' in window && Notification.permission === 'granted';
}

// ─── Core sender ─────────────────────────────────────────────────────────────

export function sendNotification(title, body, options = {}) {
  if (!notificationsAllowed()) return;
  try {
    new Notification(title, {
      body,
      icon:     '/assets/icons/icon-192.png',
      badge:    '/assets/icons/icon-72.png',
      tag:      options.tag || 'scora-reminder',
      renotify: options.renotify ?? true,
      ...options,
    });
  } catch (err) {
    console.warn('Notification send failed:', err);
  }
}

// ─── Main: check on page load and fire if in window ──────────────────────────

/**
 * Call this every time tasks are loaded (dashboard + tracker).
 * Fires immediately if:
 *  - it's morning (8–11) and morning reminder hasn't fired today
 *  - it's evening (19–22) and evening reminder hasn't fired today
 * Stores fired date in localStorage so it only fires once per window per day.
 */
export function scheduleTaskReminders(tasks) {
  if (!notificationsAllowed()) return;
  if (!tasks || tasks.length === 0) return;

  const today   = new Date().toISOString().split('T')[0];
  const hour    = new Date().getHours();
  const pending = tasks.filter((t) => !t.completions?.[today]);

  if (pending.length === 0) return; // all done ✅

  const pendingNames = pending.slice(0, 2).map((t) => t.title).join(', ');
  const more         = pending.length > 2 ? ` +${pending.length - 2} more` : '';
  const taskSummary  = `${pendingNames}${more}`;

  // ── Morning window: 8 AM – 11:59 AM ──────────────────────────────────────
  if (hour >= 8 && hour < 12) {
    const lastMorning = localStorage.getItem(STORAGE_MORNING);
    if (lastMorning !== today) {
      localStorage.setItem(STORAGE_MORNING, today);
      sendNotification(
        '📚 Good morning! Time to study',
        `${pending.length} task${pending.length > 1 ? 's' : ''} pending today: ${taskSummary}`,
        { tag: 'scora-morning' }
      );
    }
  }

  // ── Evening window: 7 PM – 10:59 PM ──────────────────────────────────────
  if (hour >= 19 && hour < 23) {
    const lastEvening = localStorage.getItem(STORAGE_EVENING);
    if (lastEvening !== today) {
      localStorage.setItem(STORAGE_EVENING, today);

      const streakAtRisk = pending
        .filter((t) => (t.currentStreak || 0) >= 3)
        .sort((a, b) => (b.currentStreak || 0) - (a.currentStreak || 0));

      if (streakAtRisk.length > 0) {
        const top = streakAtRisk[0];
        sendNotification(
          '🔥 Streak at risk! Don\'t break it',
          `"${top.title}" — ${top.currentStreak} day streak. Mark it done before midnight!`,
          { tag: 'scora-evening' }
        );
      } else {
        sendNotification(
          '⏰ Evening study check-in',
          `${pending.length} task${pending.length > 1 ? 's' : ''} still pending. Keep your consistency going!`,
          { tag: 'scora-evening' }
        );
      }
    }
  }
}

// Kept for backwards compat — no-op now (scheduling is replaced by window-check)
export function clearScheduledNotifications() {}

// ─── In-App Toast ─────────────────────────────────────────────────────────────

let _toastTimer = null;

export function showToast(message, type = 'info', duration = 4500) {
  document.getElementById('scora-toast')?.remove();
  if (_toastTimer) clearTimeout(_toastTimer);

  const colours = {
    info:    'bg-navy text-paper',
    success: 'bg-success text-white',
    warning: 'bg-amber-500 text-white',
    streak:  'bg-gradient-to-r from-orange-500 to-amber-400 text-white',
  };
  const icons = { info: '💬', success: '✅', warning: '⏰', streak: '🔥' };

  const toast = document.createElement('div');
  toast.id = 'scora-toast';
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  toast.className = [
    'fixed top-4 left-1/2 -translate-x-1/2 z-[9999]',
    'flex items-center gap-2.5 px-4 py-3',
    'rounded-2xl shadow-lg max-w-[90vw] sm:max-w-sm',
    'text-sm font-semibold animate-fade-in',
    colours[type] || colours.info,
  ].join(' ');

  toast.innerHTML = `
    <span class="text-base leading-none">${icons[type] || icons.info}</span>
    <span class="flex-1 leading-snug">${message}</span>
    <button aria-label="Dismiss" class="ml-1 opacity-70 hover:opacity-100 transition shrink-0"
      onclick="this.closest('#scora-toast').remove()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>
      </svg>
    </button>`;

  document.body.appendChild(toast);
  _toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 300ms ease';
    setTimeout(() => toast.remove(), 320);
  }, duration);
}

// ─── Permission Banner ────────────────────────────────────────────────────────

export function maybeShowPermissionBanner(containerId = 'notification-banner-root') {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'default') return;
  if (localStorage.getItem('scora_notif_dismissed')) return;

  const container = document.getElementById(containerId);
  if (!container) return;

  const banner = document.createElement('div');
  banner.id = 'notif-permission-banner';
  banner.className = 'flex items-center justify-between gap-3 bg-indigo/8 border border-indigo/20 rounded-2xl px-4 py-3 mb-4';

  banner.innerHTML = `
    <div class="flex items-center gap-2.5 min-w-0">
      <span class="text-lg shrink-0">🔔</span>
      <p class="text-navy font-medium leading-snug text-xs">
        Enable reminders — Scora will nudge you at 8 AM and 7 PM if tasks are pending.
      </p>
    </div>
    <div class="flex items-center gap-2 shrink-0">
      <button id="notif-enable-btn"
        class="bg-navy text-paper text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-navy-light transition whitespace-nowrap">
        Enable
      </button>
      <button id="notif-dismiss-btn" aria-label="Dismiss"
        class="text-ink-soft hover:text-navy transition p-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round"/>
        </svg>
      </button>
    </div>`;

  container.prepend(banner);

  document.getElementById('notif-enable-btn').addEventListener('click', async () => {
    const result = await requestNotificationPermission();
    banner.remove();
    if (result === 'granted') {
      showToast('Reminders enabled! Open the app during 8–11 AM or 7–10 PM to get nudged.', 'success', 5000);
    } else {
      showToast('Notifications blocked. Allow them in your browser address bar settings.', 'warning');
    }
  });

  document.getElementById('notif-dismiss-btn').addEventListener('click', () => {
    banner.remove();
    localStorage.setItem('scora_notif_dismissed', '1');
  });
}

// ─── Streak Milestone ─────────────────────────────────────────────────────────

export function celebrateStreakMilestone(taskTitle, newStreak) {
  const milestones = { 3:'Off to a great start!', 7:'One full week! 💪', 14:'Two weeks strong! 🏆',
    21:"21 days — it's a habit now! 🧠", 30:'One month streak! 🥇', 60:"Two months! You're unstoppable! ⚡",
    90:'90 days! Absolute legend! 🏅', 100:'100 day streak! Board exams will be a breeze! 🎯' };

  if (!milestones[newStreak]) return;
  const msg = milestones[newStreak];
  showToast(`🔥 ${newStreak}-day streak on "${taskTitle}"! ${msg}`, 'streak', 5500);
  sendNotification(`🔥 ${newStreak}-Day Streak!`, `"${taskTitle}" — ${msg}`, { tag: 'scora-streak' });
}
