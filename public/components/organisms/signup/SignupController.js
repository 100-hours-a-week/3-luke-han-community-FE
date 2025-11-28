import { renderMessage } from "../../../utils/alerts.js";
import { registerEnterSubmit, useInput } from "../../../utils/commonHooks.js";
import { validateAgreements, validateEmail, validateNickname, validatePassword, validateReInputPassword } from "../../../utils/validator.js";
import { getPrivacyPolicy, getTerms, signup, uploadToS3 } from "../../common/api.js";
import { configureHeader } from "../../molecules/header/header.js";

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

  openTermsBtn?.addEventListener('click', async () => {
    if (!termsContentEl) return;
    
    try {
      const res = await getTerms();
      const html = await res.text();
      termsContentEl.innerHTML = html;
      termsContentEl.dataset.loaded = 'true';
    } catch (e) {
      termsContentEl.innerHTML = '<p>약관을 불러오는 중 오류가 발생했습니다.</p>';
    }

    termsContentEl.hidden = !termsContentEl.hidden;
  });

  openPrivacyBtn?.addEventListener('click', async () => {
    if (!privacyContentEl) return;
    
    try {
      const res = await getPrivacyPolicy();
      const html = await res.text();
      privacyContentEl.innerHTML = html;
      privacyContentEl.dataset.loaded = 'true';
    } catch (e) {
      privacyContentEl.innerHTML = '<p>개인정보처리방침을 불러오는 중 오류가 발생했습니다.</p>';
    }
    
    privacyContentEl.hidden = !privacyContentEl.hidden;
  });

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

    try {
      const signupRes = await signup({
        email,
        password,
        nickname,
        profileImageName: fileName,
      });

      if (!signupRes.ok) {
        let msg = '회원가입 중 오류가 발생했습니다.';
        try {
          const errorBody = await signupRes.json();
          if (errorBody?.message) {
            msg = errorBody.message;
          }
        } catch (_) {
          renderMessage(formError, msg, { type: "error" });
          return;
        }
      }

      const body = await signupRes.json();
      const { data: presignedUrl, message } = body || {};

      if (file && presignedUrl) {
        // 프로필 이미지 업로드
        try {
          await uploadToS3(presignedUrl, file);
        } catch (e) {
          renderMessage(formError, '프로필 이미지 업로드 중 오류가 발생했습니다.', { type: "error" });
        }
      }

      window.router?.navigate
      ? window.router.navigate('/login')
      : (window.location.href = '/login');
    } catch (error) {
      renderMessage(formError, error.message || '회원가입 중 오류가 발생했습니다.', { type: "error" });
    }
  });

  registerEnterSubmit(emailInput.element, () => signupBtn?.click());
  registerEnterSubmit(passwordInput.element, () => signupBtn?.click());
  registerEnterSubmit(password2Input.element, () => signupBtn?.click());
  registerEnterSubmit(nicknameInput.element, () => signupBtn?.click());
}