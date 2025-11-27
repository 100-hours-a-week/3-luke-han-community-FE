export function openModal({
  title = '',
  message = '',
  actions = [],
}) {
  const modal = document.getElementById('dm-modal');
  if (!modal) return;

  document.getElementById("dm-modal-title").textContent = title;
  document.getElementById("dm-modal-text").textContent = message;

  const actionsContainer = document.getElementById('dm-modal-actions');
  actionsContainer.innerHTML = '';

  actions.forEach((btn) => {
    const button = document.createElement('button');
    button.textContent = btn.label;
    button.className = `dm-btn ${btn.variant || "dm-btn-ghost"}`;
    button.addEventListener("click", btn.onClick);
    actionsContainer.appendChild(button);
  });

  modal.hidden = false;
  document.body.classList.add('dm-modal-open');
}

export function closeModal() {
  const modal = document.getElementById('dm-modal');
  if (!modal) return;

  modal.hidden = true;
  document.body.classList.remove('dm-modal-open');
}