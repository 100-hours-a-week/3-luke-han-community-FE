export function TextField({ id, label, type = 'text', errorId, errorText = '' }) {
  return `
    <div class="auth-field">
      <label for="${id}" class="auth-label">${label}</label>
      <input id="${id}" type="${type}" class="auth-input" />
      <div id="${errorId}" class="auth-error" hidden>${errorText}</div>
    </div>
  `;
}
