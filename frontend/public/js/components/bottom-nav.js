// Injects the bottom navigation bar into any page.
// Call renderBottomNav('dashboard' | 'vault' | 'tracker' | 'settings')
// from that page's own JS file after the DOM is ready.

const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Home',
    href: 'dashboard.html',
    icon: `<path d="M3 10.5 12 3l9 7.5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
           <path d="M5 9.5V20a1 1 0 0 0 1 1h3.5v-5.5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1V21H18a1 1 0 0 0 1-1V9.5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'vault',
    label: 'Vault',
    href: 'vault.html',
    icon: `<rect x="4" y="4" width="16" height="16" rx="2" stroke-width="1.8"/>
           <path d="M8 9h8M8 13h8M8 17h4" stroke-width="1.8" stroke-linecap="round"/>`,
  },
  {
    id: 'tracker',
    label: 'Tracker',
    href: 'tracker.html',
    icon: `<rect x="3" y="4" width="18" height="17" rx="2" stroke-width="1.8"/>
           <path d="M3 9h18M8 2v4M16 2v4" stroke-width="1.8" stroke-linecap="round"/>
           <path d="M8 13.5l2 2 4-4.5" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'settings',
    label: 'Settings',
    href: 'settings.html',
    icon: `<circle cx="12" cy="12" r="3" stroke-width="1.8"/>
           <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V20a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.11-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H4a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.55-1.11 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H10a1.7 1.7 0 0 0 1.04-1.56V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V10a1.7 1.7 0 0 0 1.56 1.04H20a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.56 1.04Z" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
];

export function renderBottomNav(activeId) {
  const root = document.getElementById('bottom-nav-root');
  if (!root) return;

  root.innerHTML = `
    <nav class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-line z-50 shadow-[0_-2px_12px_rgba(13,31,53,0.06)]">
      <div class="max-w-lg mx-auto grid grid-cols-4">
        ${NAV_ITEMS.map((item) => {
          const isActive = item.id === activeId;
          return `
            <a href="${item.href}" class="flex flex-col items-center gap-0.5 py-2.5 transition ${isActive ? 'text-navy' : 'text-ink-soft hover:text-navy'}">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                ${item.icon}
              </svg>
              <span class="text-[11px] font-${isActive ? 'bold' : 'medium'}">${item.label}</span>
              ${isActive ? '<span class="nav-active-dot"></span>' : '<span class="w-1 h-1"></span>'}
            </a>
          `;
        }).join('')}
      </div>
    </nav>
  `;
}