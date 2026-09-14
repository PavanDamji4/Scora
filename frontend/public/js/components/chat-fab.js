// Floating "Ask Sarthi" button, injected into any page that has a
// <div id="chat-fab-root"></div>. Sits above the bottom nav bar.

export function renderChatFab() {
  const root = document.getElementById('chat-fab-root');
  if (!root) return;

  root.innerHTML = `
    <a href="chat.html" class="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-pen text-paper
                                flex items-center justify-center shadow-lg shadow-pen/30 transition hover:bg-pen/90">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
        <path d="M21 11.5a8.5 8.5 0 0 1-11.8 7.8L4 21l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </a>
  `;
}