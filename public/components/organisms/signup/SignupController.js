import { renderMessage } from "../../../utils/alerts.js";
import { registerEnterSubmit, useInput } from "../../../utils/commonHooks.js";
import { validateAgreements, validateEmail, validateNickname, validatePassword, validateReInputPassword } from "../../../utils/validator.js";
import { configureHeader } from "../../../molecules/header/Header.js";

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
  });

  registerEnterSubmit(emailInput.element, () => signupBtn?.click());
  registerEnterSubmit(passwordInput.element, () => signupBtn?.click());
  registerEnterSubmit(password2Input.element, () => signupBtn?.click());
  registerEnterSubmit(nicknameInput.element, () => signupBtn?.click());
}