export function showError(error, message) {
  if (!error) return;
  error.textContent = message;
  error.hidden = false;
}

export function hideError(error) {
  if (!error) return;
  error.textContent = '';
  error.hidden = true;
}

/**
 * UI 메시지를 렌더링하는 공통 함수
 *
 * @param {HTMLElement|string} targetOrSelector - 대상 요소 또는 선택자
 * @param {string} message - 출력할 텍스트
 * @param {object} options
 * @param {'error'|'warn'|'info'|'success'|null} [options.type='error'] - 메시지 타입
 * @param {boolean} [options.autoHide=true] - 빈 메시지일 때 자동 숨김
 */
export function renderMessage(targetOrSelector, message = "", opts = {}) {
  const target = typeof targetOrSelector === "string"
    ? document.querySelector(targetOrSelector)
    : targetOrSelector;

  if (!target) return;

  const {
    type = "error",   // 기본은 error
    autoHide = true,
  } = opts;

  // 메시지 텍스트 적용
  target.textContent = message;

  // 자동 숨김 처리
  if (autoHide) {
    target.hidden = !message;
  }

  // 먼저 기존 타입 클래스들 제거
  target.classList.remove(
    "msg-error",
    "msg-warn",
    "msg-info",
    "msg-success"
  );

  // message가 존재할 때만 타입 클래스 적용
  if (message) {
    if (type === "error") target.classList.add("msg-error");
    else if (type === "warn") target.classList.add("msg-warn");
    else if (type === "info") target.classList.add("msg-info");
    else if (type === "success") target.classList.add("msg-success");
  }
}
