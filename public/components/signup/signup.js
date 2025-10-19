import { signup } from "../common/api.js";
import { renderUserInput } from "../common/common.js";

const emailInput = document.querySelector('input[type="email"]');
const passwordInputs = document.querySelectorAll('input[type="password"]');
const password1Input = passwordInputs[0];
const password2Input = passwordInputs[1];
const nicknameInput = document.querySelector('input[type="text"]');
const submitButton = document.querySelector('.submit_button');
const emailWarn = document.getElementById('warn-email');
const passwordWarn = document.getElementById('warn-password');
const passwordCheckWarn = document.getElementById('warn-password-check');
const nicknameWarn = document.getElementById('warn-nickname');

/**
 * 입력값에 대해 경고문구 렌더링 처리 함수
 * 
 * @returns 
 */
function validateInputs() {
  const email = emailInput?.value.trim() ?? "";
  const pw1 = password1Input?.value.trim() ?? "";
  const pw2 = password2Input?.value.trim() ?? "";
  const nick = nicknameInput?.value.trim() ?? "";

  if (!email) {
    renderUserInput(emailWarn, '이메일을 입력해주세요.');
    return false;
  }

  if (!pw1) {
    renderUserInput(passwordWarn, '비밀번호를 입력해주세요.');
    return false;
  }

  if (pw1 !== pw2) {
    renderUserInput(WARN_SELECTOR, '비밀번호가 일치하지 않습니다.');
    return false;
  }

  if (!nick) {
    renderUserInput(nicknameWarn, '닉네임을 입력해주세요.');
    return false;
  }

  renderUserInput(WARN_SELECTOR, '');
  return true;
}

// 실시간 입력 및 검증
[emailInput, password1Input, password2Input, nicknameInput].forEach((el) => {
  el?.addEventListener('input', validateInputs);
});

/**
 * 회원가입 버튼 클릭 이벤트 처리
 */
submitButton?.addEventListener('click', async () => {
  if (!validateInputs()) return;

  const email = emailInput.value.trim();
  const password = password1Input.value.trim();
  const nickname = nicknameInput.value.trim();

  try {
    const res = await signup('/api/auth/signup', { email, password, nickname });

    // 응답 실패 시 경고문구 렌더링
    if (!res.ok) {
      let msg = '회원가입 실패';
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch {
        try {
          const text = await res.text();
          if (text) msg = text;
        } catch {}
      }
      renderUserInput(WARN_SELECTOR, msg);
      return;
    }

    // 성공 후 로그인으로 리다이렉트
    window.location.href = '/login';
  } catch {
    renderUserInput(WARN_SELECTOR, '네트워크 오류가 발생했어요.');
  }
});
