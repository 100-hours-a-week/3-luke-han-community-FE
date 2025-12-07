// components/layout/AuthLayout.js
export function AuthLayout({ title, bodyHtml }) {
  return `
    <div class="auth-wrapper">
      <h1 class="auth-title">${title}</h1>
      <div class="auth-card">
        ${bodyHtml}
      </div>
    </div>
  `;
}
