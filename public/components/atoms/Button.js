export function PrimaryButton({ id, label, extraClass = '' }) {
  return `
    <button id="${id}" class="auth-submit ${extraClass}">
      ${label}
    </button>
  `;
}
