import { renderMessage } from "../../../utils/alerts.js";
import { DEFAULT_PROFILE_IMAGE_URL, setProfileImageUrl } from "../../../utils/cacheStore.js";
import { registerEnterSubmit, useInput } from "../../../utils/commonHooks.js";
import { setAccessToken } from "../../../utils/tokenStore.js";
import { validateEmail, validatePassword } from "../../../utils/validator.js";
import { login } from "../../common/api.js";
import { configureHeader } from "../../molecules/header/header.js";

export function initLoginPage() {
  const loginBtn = document.getElementById('loginBtn');
  const emailInput = useInput('email');
  const passwordInput = useInput('password');

  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const formError = document.getElementById('form-error');

  configureHeader?.({
    title: "Damul Board",
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

    let res;
    try {
      res = await login({
        email: emailInput.value(),
        password: passwordInput.value(),
      });
    } catch (error) {
      renderMessage(formError, error.message || '로그인 중 오류가 발생했습니다.');
      return;
    }

    if (res.ok) {
      const authHeader = res.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        setAccessToken(token);
      }

      const body = await res.json();
      const { data } = body || {};
      

      localStorage.setItem('userId', data.userId);
      localStorage.setItem('nickname', data.nickname);
      
      const profileUrl = data.profileImageUrl || DEFAULT_PROFILE_IMAGE_URL;
      setProfileImageUrl(profileUrl);

      window.router.navigate('/');
    } else {
      window.location.href='/login';
    }
  });

  registerEnterSubmit(emailInput.element, () => loginBtn?.click());
  registerEnterSubmit(passwordInput.element, () => loginBtn?.click());
}