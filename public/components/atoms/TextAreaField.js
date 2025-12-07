export function TextAreaField({
  id,
  label,
  rows = 8,
  placeholder = "",
  errorId,
  errorText = "",
}) {
  return `
    <div class="auth-field">
      <label for="${id}" class="auth-label">${label}</label>
      <textarea
        id="${id}"
        class="auth-input auth-textarea"
        rows="${rows}"
        placeholder="${placeholder}"
      ></textarea>
      ${
        errorId
          ? `<div id="${errorId}" class="auth-error" hidden>${errorText}</div>`
          : ""
      }
    </div>
  `;
}