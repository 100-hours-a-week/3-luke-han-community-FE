import { renderMessage } from "../../../utils/alerts";
import { registerEnterSubmit } from "../../../utils/commonHooks";
import { validatePassword, validateReInputPassword, validateRequired } from "../../../utils/validator";
import { configureHeader } from "../../molecules/header/header";

export function initPasswordEditPage() {
  configureHeader?.({
    title: "아무 말 대잔치",
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

    // TODO: 비밀번호 변경 API 호출
  });

  registerEnterSubmit(currentPwInput, () => submitBtn?.click());
  registerEnterSubmit(newPwInput, () => submitBtn?.click());
  registerEnterSubmit(newPwCheckInput, () => submitBtn?.click());
}