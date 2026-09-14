import { db } from './firebase-config.js';
import { requireAuth } from './auth.js';
import { askAI } from './api.js';
import { SSC_SUBJECTS } from './constants.js';
import {
  doc, getDoc, setDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let currentUser = null;
let activeSubject = 'General';
let attachedImage = null;
let sessionsCache = {};

const subjects = ['General', ...SSC_SUBJECTS];

requireAuth((user) => {
  currentUser = user;
  renderChips();
  bindSuggestions();
  loadSession(activeSubject);
});

// ---------- Simple Markdown Parser for Sarthi responses ----------
function parseMarkdown(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks ```code```
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic *text*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-navy mt-2 mb-1">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-navy mt-2 mb-1">$1</h2>');

  // Paragraph splits
  const lines = html.split('\n');
  let inList = false;
  let listType = null;
  let formatted = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList || listType !== 'ul') {
        if (inList) formatted.push(listType === 'ul' ? '</ul>' : '</ol>');
        formatted.push('<ul class="list-disc ml-5 space-y-1 my-1">');
        inList = true;
        listType = 'ul';
      }
      formatted.push(`<li>${trimmed.substring(2)}</li>`);
    } else if (/^\d+\.\s/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        if (inList) formatted.push(listType === 'ul' ? '</ul>' : '</ol>');
        formatted.push('<ol class="list-decimal ml-5 space-y-1 my-1">');
        inList = true;
        listType = 'ol';
      }
      formatted.push(`<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`);
    } else {
      if (inList) {
        formatted.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = null;
      }
      if (trimmed.length > 0) {
        formatted.push(`<p class="mb-1.5">${line}</p>`);
      }
    }
  }

  if (inList) {
    formatted.push(listType === 'ul' ? '</ul>' : '</ol>');
  }

  return `<div class="markdown-body text-sm leading-relaxed">${formatted.join('')}</div>`;
}

// ---------- Subject Chips ----------
function renderChips() {
  const root = document.getElementById('subject-chips');
  if (!root) return;

  root.innerHTML = subjects.map((s) => `
    <button data-subject="${s}"
      class="chip shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition
             ${s === activeSubject ? 'bg-navy text-paper border-navy shadow-sm' : 'bg-white border-line text-ink-soft hover:border-navy/40'}">
      ${s}
    </button>
  `).join('');

  root.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      activeSubject = chip.dataset.subject;
      renderChips();
      loadSession(activeSubject);
    });
  });
}

function bindSuggestions() {
  document.querySelectorAll('.suggestion-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const input = document.getElementById('chat-input');
      input.value = chip.textContent.replace(/^[^\w]+/, '').trim();
      document.getElementById('chat-form').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
  });
}

// ---------- Firestore Session Storage ----------
function sessionDocRef(subject) {
  const key = subject.replace(/[^a-zA-Z0-9]/g, '_');
  return doc(db, 'users', currentUser.uid, 'chatSessions', key);
}

async function loadSession(subject) {
  if (sessionsCache[subject]) {
    renderMessages(sessionsCache[subject]);
    return;
  }
  sessionsCache[subject] = [];
  try {
    const snap = await getDoc(sessionDocRef(subject));
    const messages = snap.exists() ? snap.data().messages || [] : [];
    sessionsCache[subject] = messages;
    renderMessages(messages);
  } catch (err) {
    console.warn('Failed to load chat session:', err);
    renderMessages([]);
  }
}

async function saveSession(subject) {
  try {
    await setDoc(sessionDocRef(subject), {
      subject,
      messages: sessionsCache[subject],
    });
  } catch (err) {
    console.warn('Failed to save chat session:', err);
  }
}

// ---------- Rendering Messages ----------
function renderMessages(messages) {
  const root = document.getElementById('messages');
  if (!root) return;

  if (messages.length === 0) {
    root.innerHTML = `
      <div class="text-center text-ink-soft my-12 px-4 max-w-sm mx-auto">
        <div class="w-14 h-14 rounded-full bg-navy text-paper flex items-center justify-center font-serif text-2xl font-bold mx-auto mb-3 shadow-md">
          S
        </div>
        <h3 class="font-serif text-lg font-bold text-navy mb-1">Hello! I'm Sarthi</h3>
        <p class="text-xs leading-relaxed mb-4">
          Ask me any doubt from <strong>${activeSubject}</strong> or upload a photo of your textbook question. I will solve it step-by-step!
        </p>
      </div>`;
    return;
  }

  root.innerHTML = messages.map((msg) => {
    if (msg.role === 'user') {
      return `
        <div class="flex justify-end mb-3">
          <div class="max-w-[85%] sm:max-w-[75%] bg-navy text-paper rounded-2xl rounded-tr-sm px-4 py-3 text-sm shadow-sm">
            ${msg.imageUrl ? `<img src="${msg.imageUrl}" class="rounded-xl mb-2 max-h-48 border border-white/20" />` : ''}
            ${msg.text ? `<p class="whitespace-pre-wrap">${msg.text}</p>` : ''}
          </div>
        </div>`;
    }
    return `
      <div class="flex justify-start items-start gap-2.5 mb-4">
        <div class="w-8 h-8 rounded-full bg-navy text-paper flex items-center justify-center font-serif text-sm font-bold shrink-0 mt-1 shadow-sm">
          S
        </div>
        <div class="max-w-[88%] sm:max-w-[80%] bg-white border border-line rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <span class="text-[10px] text-pen font-bold uppercase tracking-wider block mb-1">Sarthi AI • Step-by-Step</span>
          ${parseMarkdown(msg.text)}
        </div>
      </div>`;
  }).join('');

  root.scrollTop = root.scrollHeight;
}

function showTypingIndicator() {
  const root = document.getElementById('messages');
  const el = document.createElement('div');
  el.id = 'typing-indicator';
  el.className = 'flex justify-start items-start gap-2.5 mb-4 animate-fade-in';
  el.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-navy text-paper flex items-center justify-center font-serif text-sm font-bold shrink-0 mt-1 shadow-sm">
      S
    </div>
    <div class="bg-white border border-line rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5 shadow-sm">
      <span class="typing-dot w-2 h-2 bg-navy rounded-full"></span>
      <span class="typing-dot w-2 h-2 bg-navy rounded-full"></span>
      <span class="typing-dot w-2 h-2 bg-navy rounded-full"></span>
      <span class="text-xs text-ink-soft font-medium ml-2">Sarthi is solving…</span>
    </div>`;
  root.appendChild(el);
  root.scrollTop = root.scrollHeight;
}

function removeTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

// ---------- Image Attachment ----------
const imageInput = document.getElementById('image-input');
const imagePreviewBar = document.getElementById('image-preview-bar');
const imagePreview = document.getElementById('image-preview');

if (imageInput) {
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      attachedImage = reader.result;
      imagePreview.src = attachedImage;
      imagePreviewBar.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });
}

document.getElementById('remove-image')?.addEventListener('click', () => {
  attachedImage = null;
  if (imageInput) imageInput.value = '';
  imagePreviewBar.classList.add('hidden');
});

// ---------- Clear Chat ----------
document.getElementById('clear-chat-btn')?.addEventListener('click', async () => {
  if (confirm(`Clear chat history for ${activeSubject}?`)) {
    sessionsCache[activeSubject] = [];
    renderMessages([]);
    try {
      await deleteDoc(sessionDocRef(activeSubject));
    } catch (e) {
      console.warn('Failed to delete chat doc:', e);
    }
  }
});

// ---------- Send Message ----------
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text && !attachedImage) return;

  if (!sessionsCache[activeSubject]) {
    sessionsCache[activeSubject] = [];
  }

  const userMsg = { role: 'user', text, imageUrl: attachedImage || null };
  sessionsCache[activeSubject].push(userMsg);
  renderMessages(sessionsCache[activeSubject]);

  const imageToSend = attachedImage;
  chatInput.value = '';
  chatInput.style.height = 'auto';
  attachedImage = null;
  imagePreviewBar.classList.add('hidden');
  if (imageInput) imageInput.value = '';

  showTypingIndicator();

  try {
    const result = await askAI(text, activeSubject, imageToSend);
    removeTypingIndicator();
    sessionsCache[activeSubject].push({ role: 'ai', text: result.text });
    renderMessages(sessionsCache[activeSubject]);
    await saveSession(activeSubject);
  } catch (error) {
    removeTypingIndicator();
    console.error('AI request error:', error);
    const displayMessage = error.message?.includes('limit')
      ? error.message
      : `Sorry, Sarthi couldn't solve that right now: ${error.message || 'Server error'}. Please try again!`;
    sessionsCache[activeSubject].push({ role: 'ai', text: displayMessage });
    renderMessages(sessionsCache[activeSubject]);
  }
});

// Auto-grow textarea
if (chatInput) {
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
  });
}