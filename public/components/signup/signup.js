import { renderMessage } from "../../utils/alerts.js";
import { useInput } from "../../utils/hooks.js";
import { validateAgreements, validateEmail, validateNickname, validatePassword, validateReInputPassword } from "../../utils/validator.js";

export function SignupPage() {
  return `
    <div class="auth-wrapper">

      <h1 class="auth-title">회원가입</h1>

      <div class="auth-card">

        <!-- 이메일 -->
        <div class="auth-field">
          <label for="signup-email" class="auth-label">이메일</label>
          <input id="signup-email" type="email" class="auth-input" />
          <div id="signup-email-error" class="auth-error" hidden></div>
        </div>

        <!-- 비밀번호 -->
        <div class="auth-field">
          <label for="signup-password" class="auth-label">비밀번호</label>
          <input id="signup-password" type="password" class="auth-input" />
          <div id="signup-password-error" class="auth-error" hidden></div>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="auth-field">
          <label for="signup-password2" class="auth-label">비밀번호 확인</label>
          <input id="signup-password2" type="password" class="auth-input" />
          <div id="signup-password2-error" class="auth-error" hidden></div>
        </div>

        <!-- 닉네임 -->
        <div class="auth-field">
          <label for="signup-nickname" class="auth-label">닉네임</label>
          <input id="signup-nickname" type="text" class="auth-input" />
          <div id="signup-nickname-error" class="auth-error" hidden></div>
        </div>

        <!-- 프로필 이미지 (선택) -->
        <div class="auth-field">
          <label for="signup-profile" class="auth-label">프로필 이미지 (선택)</label>
          <input id="signup-profile" type="file" class="auth-input-file" accept="image/*" />
          <div class="auth-helper-text">이미지를 선택하지 않으면 기본 프로필로 설정됨</div>
        </div>

        <!-- 약관 동의 -->
        <div class="auth-field auth-agree-group">
          <div class="auth-checkbox-row">
            <input id="agree-terms" type="checkbox" class="auth-checkbox" />
            <label for="agree-terms" class="auth-checkbox-label">
              이용약관 동의
            </label>
            <button type="button" class="auth-link-inline" id="open-terms">
              내용 보기
            </button>
          </div>

          <div class="auth-checkbox-row">
            <input id="agree-privacy" type="checkbox" class="auth-checkbox" />
            <label for="agree-privacy" class="auth-checkbox-label">
              개인정보 처리방침 동의
            </label>
            <button type="button" class="auth-link-inline" id="open-privacy">
              내용 보기
            </button>
          </div>

          <div id="signup-agree-error" class="auth-error" hidden></div>
        </div>

        <!-- 약관 / 개인정보 모달 컨테이너 (SPA 기준, 나중에 모달로 바꿔도 됨) -->
        <div id="terms-content" class="auth-terms-content" hidden></div>
        <div id="privacy-content" class="auth-terms-content" hidden></div>

        <!-- 서버/전역 오류 -->
        <div id="signup-form-error" class="auth-error-global" hidden></div>

        <!-- 가입 버튼 -->
        <button id="signupBtn" class="auth-submit">회원가입</button>

        <!-- 하단 링크 -->
        <div class="auth-links">
          <span class="auth-link-subtle">이미 계정이 있으신가요?</span>
          <a href="/login" class="auth-link-main">로그인</a>
        </div>

      </div>

    </div>
  `;
}

export function initSignupPage() {
  const emailInput = useInput("signup-email");
  const passwordInput = useInput("signup-password");
  const password2Input = useInput("signup-password2");
  const nicknameInput = useInput("signup-nickname");
  const profileInput = document.getElementById("signup-profile");

  const emailError = document.getElementById("signup-email-error");
  const passwordError = document.getElementById("signup-password-error");
  const password2Error = document.getElementById("signup-password2-error");
  const nicknameError = document.getElementById("signup-nickname-error");
  const agreeError = document.getElementById("signup-agree-error");
  const formError = document.getElementById("signup-form-error");

  const agreeTermsCheck = document.getElementById("agree-terms");
  const agreePrivacyCheck = document.getElementById("agree-privacy");

  const signupBtn = document.getElementById("signupBtn");

  const termsContentEl = document.getElementById("terms-content");
  const privacyContentEl = document.getElementById("privacy-content");

  emailInput.element?.addEventListener('input', () => {
    validateEmail(emailInput.value(), emailError);
  });

  passwordInput.element?.addEventListener('input', () => {
    validatePassword(passwordInput.value(), passwordError);
    validateReInputPassword(passwordInput.value(), password2Input.value(), password2Error);
  });

  password2Input.element?.addEventListener('input', () => {
    validateReInputPassword(passwordInput.value(), password2Input.value(), password2Error);
  });

  nicknameInput.element?.addEventListener('input', () => {
    validateNickname(nicknameInput.value(), nicknameError);
  });

  agreeTermsCheck.addEventListener('change', () => {
    validateAgreements(agreeTermsCheck.checked, agreePrivacyCheck.checked, agreeError);
  });

  agreePrivacyCheck.addEventListener('change', () => {
    validateAgreements(agreeTermsCheck.checked, agreePrivacyCheck.checked, agreeError);
  });

  const openTermsBtn = document.getElementById('open-terms');
  const openPrivacyBtn = document.getElementById('open-privacy');

  openTermsBtn?.addEventListener('click', () => {
    if (!termsContentEl) return;
    // TODO: 약관 가져오기
    termsContentEl.hidden = !termsContentEl.hidden;
  });

  openPrivacyBtn?.addEventListener('click', () => {
    if (!privacyContentEl) return;
    // TODO: 개인정보처리방침 가져오기
    privacyContentEl.hidden = !privacyContentEl.hidden;
  });

  // TODO: 약관/개인정보 내용 로드하는거

  signupBtn?.addEventListener('click', async () => {
    renderMessage(formError, '', { autoHide: true });

    const okEmail = validateEmail(emailInput.value(), emailError);
    const okPassword = validatePassword(passwordInput.value(), passwordError);
    const okPassword2 = validateReInputPassword(passwordInput.value(), password2Input.value(), password2Error);
    const okNickname = validateNickname(nicknameInput.value(), nicknameError);
    const okAgreements = validateAgreements(!!agreeTermsCheck.checked, !!agreePrivacyCheck.checked, agreeError);

    if (!okEmail || !okPassword || !okPassword2 || !okNickname || !okAgreements) {
      renderMessage(formError, '입력한 내용을 다시 확인해주세요.', { type: "error" });
      return;
    }

    const email = emailInput.value();
    const password = passwordInput.value();
    const nickname = nicknameInput.value();
    
    const file = profileInput?.files?.[0] || null;
    const fileName = file ? file.name : '';

    // TODO: 회원가입 API 호출 및 presigned url 받은걸로 이미지 업로드 처리

    window.router?.navigate
    ? window.router.navigate('/login')
    : (window.location.href = '/login');
  })
}