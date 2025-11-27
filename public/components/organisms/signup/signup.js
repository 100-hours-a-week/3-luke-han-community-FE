import { renderMessage } from "../../../utils/alerts.js";
import { useInput } from "../../../utils/hooks.js";
import { validateAgreements, validateEmail, validateNickname, validatePassword, validateReInputPassword } from "../../../utils/validator.js";
import { AuthLayout } from "../../layout/AuthLayout.js";
import { PrimaryButton } from "../../atoms/Button.js";
import { TextField } from "../../atoms/TextField.js";

export function SignupPage() {
  const body = `
    ${TextField({
      id: "signup-email",
      label: "이메일",
      type: "email",
      errorId: "signup-email-error",
      errorText: "",
    })}

    ${TextField({
      id: "signup-password",
      label: "비밀번호",
      type: "password",
      errorId: "signup-password-error",
      errorText: "",
    })}

    ${TextField({
      id: "signup-password2",
      label: "비밀번호 확인",
      type: "password",
      errorId: "signup-password2-error",
      errorText: "",
    })}

    ${TextField({
      id: "signup-nickname",
      label: "닉네임",
      type: "text",
      errorId: "signup-nickname-error",
      errorText: "",
    })}

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
        <label for="agree-terms" class="auth-checkbox-label">이용약관 동의</label>
        <button type="button" class="auth-link-inline" id="open-terms">내용 보기</button>
      </div>

      <div class="auth-checkbox-row">
        <input id="agree-privacy" type="checkbox" class="auth-checkbox" />
        <label for="agree-privacy" class="auth-checkbox-label">개인정보 처리방침 동의</label>
        <button type="button" class="auth-link-inline" id="open-privacy">내용 보기</button>
      </div>

      <div id="signup-agree-error" class="auth-error" hidden></div>
    </div>

    <div id="terms-content" class="auth-terms-content" hidden></div>
    <div id="privacy-content" class="auth-terms-content" hidden></div>

    <div id="signup-form-error" class="auth-error-global" hidden></div>

    ${PrimaryButton({ id: "signupBtn", label: "회원가입" })}

    <div class="auth-links">
      <span class="auth-link-subtle">이미 계정이 있으신가요?</span>
      <a href="/login" class="auth-link-main">로그인</a>
    </div>
  `;

  return AuthLayout({ title: "회원가입", bodyHtml: body });
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