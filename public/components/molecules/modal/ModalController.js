export function openModal({
  title = '',
  message = '',
  html = '',
  actions = [],
}) {
  const modal = document.getElementById('dm-modal');
  if (!modal) return;

  const titleEl = document.getElementById("dm-modal-title");
  const textEl = document.getElementById("dm-modal-text");
  const actionsContainer = document.getElementById('dm-modal-actions');

  if (titleEl) {
    titleEl.textContent = title;
  }

  if (textEl) {
    if (html) {
      textEl.innerHTML = html;     // 약관/개인정보용
    } else {
      textEl.textContent = message; // 기존 confirm 용
    }
  }

  if (actionsContainer) {
    actionsContainer.innerHTML = '';

    actions.forEach((btn) => {
      const button = document.createElement('button');
      button.textContent = btn.label;
      button.className = `dm-btn ${btn.variant || "dm-btn-ghost"}`;
      button.addEventListener("click", btn.onClick);
      actionsContainer.appendChild(button);
    });
  }

  modal.hidden = false;
  document.body.classList.add('dm-modal-open');
}

export function closeModal() {
  const modal = document.getElementById('dm-modal');
  if (!modal) return;

  modal.hidden = true;
  document.body.classList.remove('dm-modal-open');
}