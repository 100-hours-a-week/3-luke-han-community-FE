import { useInput } from "../../../utils/hooks.js";
import { validateEmail, validatePassword } from "../../../utils/validator.js";
import { renderMessage } from "../../../utils/alerts.js";
import { TextField } from "../../atoms/TextField.js";
import { AuthLayout } from "../../layout/AuthLayout.js";
import { PrimaryButton } from "../../atoms/Button.js";
import { configureHeader } from "../../molecules/header/header.js";

// 로그인 페이지 UI
export function LoginPage() {
  const body = `
    ${TextField({ id: 'email', label: '이메일', type: 'email', errorId: 'email-error', errorText: '이메일을 입력하세요.' })}
    ${TextField({ id: 'password', label: '비밀번호', type: 'password', errorId: 'password-error', errorText: '비밀번호를 입력하세요.' })}

    <div id="form-error" class="auth-error-global" hidden></div>

    ${PrimaryButton({ id: 'loginBtn', label: '로그인' })}

    <div class="auth-links">
      <a href="/forgot" class="auth-link-subtle">비밀번호 찾기</a>
      <a href="/signup" class="auth-link-main">회원가입</a>
    </div>
  `;

  return AuthLayout({ title: '로그인', bodyHtml: body });
}

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
  })
}