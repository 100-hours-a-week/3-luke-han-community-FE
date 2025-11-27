import { renderMessage } from "../../../utils/alerts.js";
import { registerEnterSubmit, useInput } from "../../../utils/commonHooks.js";
import { validateEmail, validatePassword } from "../../../utils/validator.js";
import { configureHeader } from "../../molecules/header/header.js";

export function initLoginPage() {
  const loginBtn = document.getElementById('loginBtn');
  const emailInput = useInput('email');
  const passwordInput = useInput('password');

  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const formError = document.getElementById('form-error');

  configureHeader?.({
    title: "아무 말 대잔치",
    showBack: false,
    showProfile: false,
  });

  emailInput.element?.addEventListener('input', () => {
    validateEmail(emailInput.value(), emailError);
  });

  passwordInput.element?.addEventListener('input', () => {
    validatePassword(passwordInput.value(), passwordError);
  });

  loginBtn?.addEventListener('click', async () => {
    renderMessage(formError, '', { autoHide: true });

    const okEmail = validateEmail(emailInput.value(), emailError);
    const okPassword = validatePassword(passwordInput.value(), passwordError);

    if (!okEmail || !okPassword) {
      return;
    }

    // TODO: 로그인 API 호출
  });

  registerEnterSubmit(emailInput.element, () => loginBtn?.click());
  registerEnterSubmit(passwordInput.element, () => loginBtn?.click());
}