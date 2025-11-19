import { renderMessage } from "./alerts.js";

export function validateEmail(value, warnEl) {
  const email = value?.trim() ?? "";

  if (!email) {
    renderMessage(warnEl, "이메일을 입력해주세요.", { type: "error" });
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    renderMessage(warnEl, "유효한 이메일 형식이 아닙니다.", { type: "error" });
    return false;
  }

  renderMessage(warnEl, "", { autoHide: true });
  return true;
}

export function validatePassword(value, warnEl) {
  const pw1 = value?.trim() ?? "";

  if (!pw1) {
    renderMessage(warnEl, "비밀번호를 입력해주세요.", { type: "error" });
    return false;
  }

  if (pw1.length < 8) {
    renderMessage(warnEl, "비밀번호는 최소 8자 이상이어야 합니다.", { type: "error" });
    return false;
  }

  if (pw1.length > 20) {
    renderMessage(warnEl, "비밀번호는 최대 20자 이하여야 합니다.", { type: "error" });
    return false;
  }

  const pwRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/;

  if (!pwRegex.test(pw1)) {
    renderMessage(
      warnEl,
      "비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 이상 포함해야 합니다.",
      { type: "error" }
    );
    return false;
  }

  renderMessage(warnEl, "", { autoHide: true });
  return true
}

export function validateReInputPassword(pw1, pw2, warnEl) {
  const val1 = pw1?.trim() ?? "";
  const val2 = pw2?.trim() ?? "";

  if (val1 !== val2) {
    renderMessage(warnEl, "비밀번호가 일치하지 않습니다.", { type: "error" });
    return false;
  }

  renderMessage(warnEl, "", { autoHide: true });
  return true;
}

export function validateNickname(value, warnEl) {
  const nickname = value?.trim() ?? "";

  if (!nickname) {
    renderMessage(warnEl, "닉네임을 입력해주세요.", { type: "error" });
    return false;
  }

  if (nickname.length < 2 || nickname.length > 10) {
    renderMessage(warnEl, "닉네임은 2자 이상 10자 이하여야 합니다.", { type: "error" });
    return false;
  }

  if (/\s/.test(nickname)) {
    renderMessage(warnEl, "닉네임에는 공백이 포함될 수 없습니다.", { type: "error" });
    return false;
  }

  renderMessage(warnEl, "", { autoHide: true });
  return true;
}

/**
 * 약관 동의 검증
 * @param {boolean} termsChecked
 * @param {boolean} privacyChecked
 * @param {HTMLElement|string} warnEl
 */
export function validateAgreements(termsChecked, privacyChecked, warnEl) {
  if (!termsChecked || !privacyChecked) {
    renderMessage(
      warnEl,
      "약관 및 개인정보처리방침에 동의해주세요.",
      { type: "error" }
    );
    return false;
  }

  renderMessage(warnEl, "", { autoHide: true });
  return true;
}