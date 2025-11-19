import { useInput } from "../../utils/hooks.js";
import { validateEmail, validatePassword } from "../../utils/validator.js";
import { renderMessage } from "../../utils/alerts.js";

// 로그인 페이지 UI
export function LoginPage() {
  return `
    <div class="auth-wrapper">

      <h1 class="auth-title">로그인</h1>

      <div class="auth-card">

        <!-- 이메일 -->
        <div class="auth-field">
          <label for="email" class="auth-label">이메일</label>
          <input id="email" type="email" class="auth-input" />
          <div id="email-error" class="auth-error" hidden>이메일을 입력하세요.</div>
        </div>

        <!-- 비밀번호 -->
        <div class="auth-field">
          <label for="password" class="auth-label">비밀번호</label>
          <input id="password" type="password" class="auth-input" />
          <div id="password-error" class="auth-error" hidden>비밀번호를 입력하세요.</div>
        </div>

        <!-- 서버/전역 오류 -->
        <div id="form-error" class="auth-error-global" hidden></div>

        <!-- 로그인 버튼 -->
        <button id="loginBtn" class="auth-submit">로그인</button>

        <!-- 서브 링크 -->
        <div class="auth-links">
          <a href="/forgot" class="auth-link-subtle">비밀번호 찾기</a>
          <a href="/signup" class="auth-link-main">회원가입</a>
        </div>

      </div>

    </div>
  `;
}

export function initLoginPage() {
  const loginBtn = document.getElementById('loginBtn');
  const emailInput = useInput('email');
  const passwordInput = useInput('password');

  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const formError = document.getElementById('form-error');

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