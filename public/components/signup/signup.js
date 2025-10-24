import { signup, uploadToS3 } from "../common/api.js";
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
const WARN_SELECTOR = '.form-warning';

/**
 * 이메일 형식 검증 함수
 * 
 * @returns 
 */
function validateEmail() {
  const email = emailInput?.value.trim() ?? "";

  if (!email) {
    renderUserInput(emailWarn, '이메일을 입력해주세요.', { autoHide: true });
    return false;
  } else {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      renderUserInput(emailWarn, '유효한 이메일 형식이 아닙니다.', { autoHide: true });
      return false;
    } else {
      renderUserInput(emailWarn, '', { autoHide: false });
      return true;
    }
  }
}

/**
 * 비밀번호 재입력 검증 함수
 * 
 * @returns 
 */
function validateReInputPassword() {
  const pw1 = password1Input?.value.trim() ?? "";
  const pw2 = password2Input?.value.trim() ?? "";

  if (pw1 !== pw2) {
    renderUserInput(passwordCheckWarn, '비밀번호가 일치하지 않습니다.', { autoHide: true });
    return false;
  } else {
    renderUserInput(passwordCheckWarn, '', { autoHide: false });
    return true;
  }
}

/**
 * 닉네임 검증 함수
 * 
 * @returns 
 */
function validateNickname() {
  const nick = nicknameInput?.value.trim() ?? "";
  
  if (!nick) {
    renderUserInput(nicknameWarn, '닉네임을 입력해주세요.', { autoHide: true });
    return false;
  } else {
    if (nick.length < 2 || nick.length > 10) {
      renderUserInput(nicknameWarn, '닉네임은 2자 이상 10자 이하여야 합니다.', { autoHide: true });
      return false;
    } else if (/\s/.test(nick)) {
      renderUserInput(nicknameWarn, '닉네임에는 공백이 포함될 수 없습니다.', { autoHide: true });
      return false;
    } else {
      renderUserInput(nicknameWarn, '', { autoHide: false });
      return true;
    }
  }
}

/**
 * 비밀번호 복잡성 검증 함수
 * 
 * @returns 
 */
function validatePassword() {
  const pw1 = password1Input?.value.trim() ?? "";
  console.log('validatePassword 호출, pw1:', pw1);

  if (!pw1) {
    renderUserInput(passwordWarn, '비밀번호를 입력해주세요.', { autoHide: true });
    return false;
  } else {
    if (pw1.length < 8) {
      renderUserInput(passwordWarn, '비밀번호는 최소 8자 이상이어야 합니다.', { autoHide: true });
      return false;
    } else if (pw1.length > 20) {
      renderUserInput(passwordWarn, '비밀번호는 최대 20자 이하여야 합니다.', { autoHide: true });
      return false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(pw1)) {
      renderUserInput(passwordWarn, '비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 이상 포함해야 합니다.', { autoHide: true });
      return false;
    } else {
      renderUserInput(passwordWarn, '', { autoHide: false });
      return true;
    }
  }
}

emailInput?.addEventListener('input', validateEmail);
password1Input?.addEventListener('input', validatePassword);
password2Input?.addEventListener('input', validateReInputPassword);
nicknameInput?.addEventListener('input', validateNickname);

/**
 * 회원가입 버튼 클릭 이벤트 처리
 */
submitButton?.addEventListener('click', async () => {
  if (!validateEmail || !validateNickname || !validatePassword || !validateReInputPassword) {
    console.log('!validateEmail: ', validateEmail);
    console.log('!validateNickname: ', validateNickname);
    console.log('!validatePassword: ', validatePassword);
    console.log('!validateReInputPassword: ', validateReInputPassword);
    return;
  }
  console.log('모든 입력값 검증 통과, 회원가입 진행');

  const email = emailInput.value.trim();
  const password = password1Input.value.trim();
  const nickname = nicknameInput.value.trim();

  const fileInput = document.getElementById('signup-profile');
  const file = fileInput?.files?.[0] || null;
  const fileName = file ? file.name : '';
  console.log('선택된 파일:', fileName);

  try {
    console.log('signup 호출, email:', email, 'nickname:', nickname);
    const res = await signup({ email, password, nickname, fileName });
    console.log('회원가입 응답:', res);

    // 응답 실패 시 경고문구 렌더링
    if (!res.ok) {
      let msg = '회원가입 실패';
      console.log(msg);
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

    let presigned = await res.text();
    if (!file || presigned.length === 0) {
      window.location.href = '/login';
      return;
    }

    try {
      await uploadToS3(presigned, file);
    } catch (e) {
      console.error(e);
      renderUserInput(WARN_SELECTOR, '프로필 사진 업로드에 실패했어요.');
      return;
    }

    window.location.href = '/login';
  } catch {
    renderUserInput(WARN_SELECTOR, '네트워크 오류가 발생했어요.');
  }
});
