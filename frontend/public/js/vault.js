import { db } from './firebase-config.js';
import { requireAuth } from './auth.js';
import { renderBottomNav } from './components/bottom-nav.js';
import { getDrivePreviewUrl, getDriveDownloadUrl } from './drive-utils.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { renderChatFab } from './components/chat-fab.js';

renderBottomNav('vault');
renderChatFab();
requireAuth(() => {});

// Structure of SSC Study Vault
const VAULT_STRUCTURE = {
  workbook: {
    label: 'Workbooks',
    description: 'Official 10th SSC State Board Workbooks & Answer Key Sets',
    subjects: [
      'English Kumarbharati',
      'Marathi Aksharbharati',
      'Hindi Lokbharati',
    ],
    years: [2026],
  },
  journal: {
    label: 'Journals',
    description: 'Practical Journals, Experiments & Internal Assessment Books',
    subjects: [
      'Science Practical Journal',
      'Maths Practical Journal',
      'Physical & Health Education',
      'Water Security Journal',
      'Defence Studies'
    ],
    years: [2026],
  },
  question_paper: {
    label: 'Question Papers (PYQs)',
    description: 'Official Board Question Papers & Solution Sets (2024, 2025, 2026)',
    subjects: [
      'English',
      'Marathi',
      'Hindi',
      'Maths 1',
      'Maths 2',
      'Science 1',
      'Science 2',
      'History & Political Science',
      'Geography'
    ],
    // Subjects that don't have files yet — show "Coming Soon" instead of loading
    comingSoon: ['Marathi', 'Hindi'],
    years: [2026, 2025, 2024],
  },
};

const DEFAULT_DRIVE_FILES = {
  'default_sample': '1a2b3c4d5e6f7g8h9i0j',
};

let activeType = 'workbook';
let activeSubject = null;

const tabsRoot = document.getElementById('vault-tabs');
const contentRoot = document.getElementById('vault-content');
const modal = document.getElementById('resource-modal');
const modalTitle = document.getElementById('modal-title');
const modalCategory = document.getElementById('modal-category');
const modalFrame = document.getElementById('modal-frame');
const modalDownload = document.getElementById('modal-download');
const modalOpenDrive = document.getElementById('modal-open-drive');
const modalClose = document.getElementById('modal-close');
const modalStatus = document.getElementById('modal-status');

function renderTabs() {
  tabsRoot.innerHTML = Object.entries(VAULT_STRUCTURE).map(([key, val]) => `
    <button data-type="${key}"
      class="vault-tab flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all ${activeType === key ? 'bg-navy text-paper shadow-sm' : 'text-ink-soft hover:text-navy'}">
      ${val.label}
    </button>
  `).join('');

  tabsRoot.querySelectorAll('.vault-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeType = btn.dataset.type;
      activeSubject = null;
      renderTabs();
      renderContent();
    });
  });
}

function subjectCard(subject, subtext, onClick) {
  const card = document.createElement('button');
  card.className = 'w-full text-left border border-line rounded-2xl px-5 py-4 bg-white hover:border-navy/40 hover:shadow-md transition card-hover flex items-center justify-between group mb-3';
  card.innerHTML = `
    <div class="flex items-center gap-3.5 min-w-0 pr-3">
      <div class="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-navy group-hover:text-paper transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      </div>
      <div class="min-w-0">
        <p class="font-bold text-sm text-navy truncate">${subject}</p>
        <p class="text-xs text-ink-soft mt-0.5">${subtext || '10th SSC Board'}</p>
      </div>
    </div>
    <div class="w-8 h-8 rounded-full bg-paper flex items-center justify-center text-ink-soft group-hover:text-navy group-hover:bg-navy/10 transition shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
  `;
  card.addEventListener('click', onClick);
  return card;
}

async function fetchResource(type, subject, year) {
  try {
    const q = query(
      collection(db, 'resources'),
      where('type', '==', type),
      where('subject', '==', subject),
      where('year', '==', year)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data();
    }
  } catch (err) {
    console.log('Firestore lookup fallback:', err);
  }
  
  const lookupKey = `${type}_${subject}_${year}`.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const driveId = DEFAULT_DRIVE_FILES[lookupKey] || DEFAULT_DRIVE_FILES['default_sample'];
  
  return {
    type,
    subject,
    year,
    title: `${subject} (${year})`,
    driveFileId: driveId,
  };
}

function openModal(title, category) {
  modalTitle.textContent = title;
  modalCategory.textContent = category || 'STUDY MATERIAL';
  modal.classList.remove('hidden');
  modalFrame.classList.add('hidden');
  modalDownload.classList.remove('flex');
  modalDownload.classList.add('hidden');
  modalOpenDrive.classList.remove('flex');
  modalOpenDrive.classList.add('hidden');
  modalStatus.classList.remove('hidden');
  modalStatus.innerHTML = `
    <svg class="animate-spin h-8 w-8 text-indigo mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p class="font-semibold text-navy">Preparing ${title}…</p>
    <p class="text-xs text-ink-soft mt-1">Opening from Google Drive</p>`;
}

function closeModal() {
  modal.classList.add('hidden');
  modalFrame.src = '';
  modalDownload.classList.remove('flex');
  modalDownload.classList.add('hidden');
  modalOpenDrive.classList.remove('flex');
  modalOpenDrive.classList.add('hidden');
}
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

async function openResource(type, subject, year, displayTitle) {
  const categoryLabel = VAULT_STRUCTURE[type]?.label || 'STUDY VAULT';
  openModal(displayTitle, categoryLabel);

  // Check if this subject is marked coming soon
  const comingSoonList = VAULT_STRUCTURE[type]?.comingSoon || [];
  if (comingSoonList.includes(subject)) {
    modalStatus.classList.remove('hidden');
    modalStatus.innerHTML = `
      <div class="text-center px-6">
        <div class="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="1.8">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="font-bold text-base text-navy mb-1">Coming Soon</p>
        <p class="text-sm text-ink-soft leading-relaxed">
          The <span class="font-semibold text-navy">${subject}</span> question paper for <span class="font-semibold text-navy">${year}</span> will be added shortly.<br/>
          Check back in a day or two!
        </p>
      </div>`;
    return;
  }

  const resource = await fetchResource(type, subject, year);

  if (!resource || !resource.driveFileId || resource.driveFileId === '1a2b3c4d5e6f7g8h9i0j') {
    modalStatus.classList.remove('hidden');
    modalStatus.innerHTML = `
      <div class="text-center px-6">
        <div class="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mx-auto mb-4">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="1.8">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p class="font-bold text-base text-navy mb-1">Coming Soon</p>
        <p class="text-sm text-ink-soft">This resource will be linked shortly. Check back soon!</p>
      </div>`;
    return;
  }

  const previewUrl = getDrivePreviewUrl(resource.driveFileId);
  const downloadUrl = getDriveDownloadUrl(resource.driveFileId);
  const driveViewUrl = `https://drive.google.com/file/d/${resource.driveFileId}/view`;

  modalStatus.classList.add('hidden');
  modalFrame.src = previewUrl;
  modalFrame.classList.remove('hidden');

  // Show download button
  modalDownload.href = downloadUrl;
  modalDownload.classList.remove('hidden');
  modalDownload.classList.add('flex');

  // Show "Open in Drive" button
  modalOpenDrive.href = driveViewUrl;
  modalOpenDrive.classList.remove('hidden');
  modalOpenDrive.classList.add('flex');
}

function renderContent() {
  const config = VAULT_STRUCTURE[activeType];
  contentRoot.innerHTML = '';

  const infoHeader = document.createElement('div');
  infoHeader.className = 'mb-4';
  infoHeader.innerHTML = `<p class="text-xs font-semibold text-ink-soft uppercase tracking-wider">${config.description}</p>`;
  contentRoot.appendChild(infoHeader);

  if (activeType !== 'question_paper') {
    const year = config.years[0];
    const list = document.createElement('div');
    config.subjects.forEach((subject) => {
      const card = subjectCard(subject, `10th SSC • ${config.label.slice(0, -1)}`, () => {
        openResource(activeType, subject, year, `${subject} ${config.label.slice(0, -1)}`);
      });
      list.appendChild(card);
    });
    contentRoot.appendChild(list);
    return;
  }

  if (!activeSubject) {
    const list = document.createElement('div');
    config.subjects.forEach((subject) => {
      const card = subjectCard(subject, 'Choose Year (2024, 2025, 2026)', () => {
        activeSubject = subject;
        renderContent();
      });
      list.appendChild(card);
    });
    contentRoot.appendChild(list);
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <button id="back-to-subjects" class="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-navy-light mb-4 bg-white border border-line rounded-lg px-3 py-1.5 shadow-sm">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Back to All Subjects (${activeSubject})
    </button>
    <div class="grid grid-cols-3 gap-3" id="year-chips"></div>
  `;
  contentRoot.appendChild(wrapper);

  document.getElementById('back-to-subjects').addEventListener('click', () => {
    activeSubject = null;
    renderContent();
  });

  const yearChips = document.getElementById('year-chips');
  config.years.forEach((year) => {
    const chip = document.createElement('button');
    chip.className = 'border border-line rounded-2xl py-6 text-center bg-white hover:border-navy/50 hover:shadow-md transition card-hover';
    chip.innerHTML = `
      <span class="font-serif text-2xl font-bold text-navy block mb-1">${year}</span>
      <span class="text-[10px] font-semibold uppercase text-pen tracking-wider">PYQ Paper</span>
    `;
    chip.addEventListener('click', () => openResource('question_paper', activeSubject, year, `${activeSubject} (${year} Board Paper)`));
    yearChips.appendChild(chip);
  });
}

renderTabs();
renderContent();