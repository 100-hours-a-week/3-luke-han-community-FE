import { updateUserPassword } from "../common/api.js";
import { renderUserInput } from "../common/common.js";

// ===== DOM 캐싱 =====
const currentPwInput = document.getElementById('current-password');
const newPwInput = document.getElementById('new-password');
const newPwCheckInput = document.getElementById('new-password-check');

const warnCurrentPwEl = document.getElementById('warn-current-pw');
const warnNewPwEl = document.getElementById('warn-new-pw');
const warnNewPwCheckEl = document.getElementById('warn-new-pw-check');

const submitBtn = document.getElementById('pw-change-btn');
const formWarnEl = document.getElementById('form-warning');

const WARN_SELECTOR = '#form-warning';

// ===== 유효성 검사 로직 =====

/**
 * 현재 비밀번호 확인: 빈 값인지 여부만 검사
 */
function validateCurrentPassword() {
  const cur = currentPwInput?.value.trim() ?? '';

  if (!cur) {
    renderUserInput(warnCurrentPwEl, '현재 비밀번호를 입력해주세요.', { autoHide: true });
    return false;
  }

  renderUserInput(warnCurrentPwEl, '', { autoHide: false });
  return true;
}

/**
 * 새 비밀번호 복잡성 검사
 * - 8~20자
 * - 대문자 / 소문자 / 숫자 / 특수문자 각 1개 이상 포함
 */
function validateNewPasswordFormat() {
  const pw = newPwInput?.value.trim() ?? '';

  if (!pw) {
    renderUserInput(warnNewPwEl, '새 비밀번호를 입력해주세요.', { autoHide: true });
    return false;
  }

  if (pw.length < 8) {
    renderUserInput(warnNewPwEl, '비밀번호는 최소 8자 이상이어야 합니다.', { autoHide: true });
    return false;
  }

  if (pw.length > 20) {
    renderUserInput(warnNewPwEl, '비밀번호는 최대 20자 이하여야 합니다.', { autoHide: true });
    return false;
  }

  // 대문자, 소문자, 숫자, 특수문자
  const complexity = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/;
  if (!complexity.test(pw)) {
    renderUserInput(
      warnNewPwEl,
      '비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 이상 포함해야 합니다.',
      { autoHide: true }
    );
    return false;
  }

  renderUserInput(warnNewPwEl, '', { autoHide: false });
  return true;
}

/**
 * 새 비밀번호 확인 일치 여부
 */
function validateNewPasswordCheck() {
  const pw = newPwInput?.value.trim() ?? '';
  const pw2 = newPwCheckInput?.value.trim() ?? '';

  if (!pw2) {
    renderUserInput(warnNewPwCheckEl, '비밀번호 확인을 입력해주세요.', { autoHide: true });
    return false;
  }

  if (pw !== pw2) {
    renderUserInput(warnNewPwCheckEl, '비밀번호가 일치하지 않습니다.', { autoHide: true });
    return false;
  }

  renderUserInput(warnNewPwCheckEl, '', { autoHide: false });
  return true;
}

// ===== 입력 이벤트 바인딩 =====
currentPwInput?.addEventListener('input', validateCurrentPassword);
newPwInput?.addEventListener('input', () => {
  // 새 비번 바뀌면 둘 다 다시 체크
  validateNewPasswordFormat();
  validateNewPasswordCheck();
});
newPwCheckInput?.addEventListener('input', validateNewPasswordCheck);

// ===== 제출 버튼 로직 =====
submitBtn?.addEventListener('click', async () => {
  // 폼 전체 경고 초기화
  renderUserInput(WARN_SELECTOR, '');

  const okCur = validateCurrentPassword();
  const okFormat = validateNewPasswordFormat();
  const okMatch = validateNewPasswordCheck();

  if (!okCur || !okFormat || !okMatch) {
    renderUserInput(WARN_SELECTOR, '입력값을 다시 확인해주세요.');
    return;
  }

  const oldPassword = currentPwInput.value.trim();
  const newPassword = newPwInput.value.trim();

  // 서버 요청 바디는 PasswordDto 기준
  const body = {
    oldPassword,
    newPassword,
  };

  try {
    const res = await updateUserPassword(body);

    if (!res.ok) {
      // 실패 시 서버 메시지 있으면 표시
      let msg = '비밀번호 변경에 실패했어요.';
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch {
        try {
          const txt = await res.text();
          if (txt) msg = txt;
        } catch {}
      }

      renderUserInput(WARN_SELECTOR, msg);
      return;
    }

    window.location.href = '/mypage/edit';
  } catch (err) {
    console.error('비밀번호 변경 중 예외:', err);
    renderUserInput(WARN_SELECTOR, '네트워크 오류가 발생했어요.');
  }
});
