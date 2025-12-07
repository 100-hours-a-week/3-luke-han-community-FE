import { renderMessage } from "../../../utils/alerts.js";
import { registerEnterSubmit } from "../../../utils/commonHooks.js";
import { validatePassword, validateReInputPassword, validateRequired } from "../../../utils/validator.js";
import { updateUserPassword } from "../../common/api.js";
import { configureHeader } from "../../molecules/header/header.js";

export function initPasswordEditPage() {
  configureHeader?.({
    title: "Damul Board",
    showBack: true,
    showProfile: true,
  });

  const currentPwInput = document.getElementById("current-password");
  const newPwInput = document.getElementById("new-password");
  const newPwCheckInput = document.getElementById("new-password-check");

  const warnCurrentPwEl = document.getElementById("warn-current-pw");
  const warnNewPwEl = document.getElementById("warn-new-pw");
  const warnNewPwCheckEl = document.getElementById("warn-new-pw-check");

  const submitBtn = document.getElementById("pw-change-btn");
  const formWarnEl = document.getElementById("form-warning");

  currentPwInput?.addEventListener('input', () => {
    validateRequired(currentPwInput?.value, warnCurrentPwEl, "현재 비밀번호를 입력해주세요.");
  });

  newPwInput?.addEventListener('input', () => {
    const pw = newPwInput?.value ?? '';
    const pwCheck = newPwCheckInput?.value ?? '';

    validatePassword(pw, warnNewPwEl);

    if (pwCheck) {
      validateReInputPassword(pw, pwCheck, warnNewPwCheckEl);
    }
  });

  newPwCheckInput?.addEventListener('input', () => {
    const pw = newPwInput?.value ?? '';
    const pwCheck = newPwCheckInput?.value ?? '';

    validateReInputPassword(pw, pwCheck, warnNewPwCheckEl);
  });

  submitBtn?.addEventListener('click', async () => {
    renderMessage(formWarnEl, '', { autoHide: true });

    const curOk = validateRequired(
      currentPwInput?.value,
      warnCurrentPwEl,
      "현재 비밀번호를 입력해주세요."
    );

    const pwOk = validatePassword(newPwInput?.value ?? '', warnNewPwEl);
    const pwCheckOk = validateReInputPassword(
      newPwInput?.value ?? '',
      newPwCheckInput?.value ?? '',
      warnNewPwCheckEl
    );

    if (!curOk || !pwOk || !pwCheckOk) {
      renderMessage(formWarnEl, '입력한 내용을 다시 확인해주세요.', { type: 'error' });
      return;
    }

    try {
      const userId = Number(localStorage.getItem("userId") || 0);

      const body = {
        userId,
        oldPassword: currentPwInput.value,
        newPassword: newPwInput.value,
      };

      const res = await updateUserPassword(body);

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        const message =
          errorBody?.message || '비밀번호 변경에 실패했습니다. 다시 시도해주세요.';

        renderMessage(formWarnEl, message, { type: 'error' });
        return;
      }

      renderMessage(formWarnEl, '비밀번호가 성공적으로 변경되었습니다.', {
        type: 'success',
      });

      setTimeout(() => {
        if (window.router?.navigate) {
          window.router.navigate('/mypage');
        } else {
          window.location.href = '/mypage';
        }
      }, 800);

    } catch (e) {
      console.error('[PasswordEdit] 비밀번호 변경 요청 실패', e);
      renderMessage(
        formWarnEl,
        '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        { type: 'error' }
      );
    }
  });

  registerEnterSubmit(currentPwInput, () => submitBtn?.click());
  registerEnterSubmit(newPwInput, () => submitBtn?.click());
  registerEnterSubmit(newPwCheckInput, () => submitBtn?.click());
}