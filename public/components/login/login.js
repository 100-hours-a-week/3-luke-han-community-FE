import { login } from "../common/api.js";
import { renderUserInput } from "../common/common.js";

const emailInput = document.querySelector('input[type="email"]');
const passwordInput = document.querySelector('input[type="password"]');
const submitButton = document.querySelector('.submit_button');

/**
 * 입력값에 대해 경고문구 렌더링 처리 함수
 */
function validateInputs() {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  renderUserInput(
    '.warning',
    email === '' || password === '' ? '모든 필드를 채워주세요.' : ''
  );
}

emailInput.addEventListener('input', validateInputs);
passwordInput.addEventListener('input', validateInputs);

submitButton.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    renderUserInput('.warning', '모든 필드를 채워주세요.');
    return;
  }
  renderUserInput('.warning', '');

  try {
    const res = await login('/api/auth/signin', { email, password });

    if (!res.ok) {
      let msg = '로그인 실패';
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch {
        const text = await res.text();
        if (text) msg = text;
      }
      renderUserInput('.warning', '아이디 혹은 비밀번호가 다릅니다.');
      return;
    }

    localStorage.setItem('accessToken', res.headers.get('Authorization') || '');

    // 로그인 성공 후 메인 페이지로 리다이렉트
    window.location.href = '/board';
  } catch {
    renderUserInput('.warning', '네트워크 오류가 발생했어요.');
  }
});