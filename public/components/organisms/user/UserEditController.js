import { renderMessage } from "../../../utils/alerts.js";
import { validateNickname } from "../../../utils/validator.js";
import { configureHeader } from "../../molecules/header/header.js";

export function initUserEditPage() {
  configureHeader?.({
    title: "아무 말 대잔치",
    showBack: true,
    showProfile: true,
  });

  const profilePreviewEl = document.getElementById("edit-profile-preview");
  const newProfileInput = document.getElementById("edit-profile-file");
  const profileWarnEl = document.getElementById("warn-photo");

  const emailDisplayEl = document.getElementById("edit-email");

  const nicknameInput = document.getElementById("edit-nickname");
  const nicknameWarnEl = document.getElementById("warn-nickname");
  const nicknameCheckButton = document.getElementById("nickname-check-btn");

  const submitButton = document.getElementById("edit-save-btn");
  const logoutButton = document.getElementById("logout-btn");

  const formWarnEl = document.getElementById("form-warning");

  const userId = Number(localStorage.getItem("userId")) || 0;
  // TODO: API 호출해서 유저 정보 가져오기
  let currentEmail = 'test@test.com';
  let currentNickname = '테스트유저';
  let currentProfileImageUrl = '/assets/image/default_profile.png';

  let pendingProfileFile = null;
  let nicknameChekcedOk = true; // 중복 통과 여부

  // 초기 데이터 세팅
  function hydrateInitialValues() {
    if (emailDisplayEl) {
      emailDisplayEl.textContent = currentEmail || '';
    }

    if (nicknameInput) {
      nicknameInput.value = currentNickname || '';
    }

    if (profilePreviewEl) {
      profilePreviewEl.src = currentProfileImageUrl || '/assets/image/default_profile.png';
    }

    nicknameChekcedOk = true;

    if (!nicknameInput?.value.trim()) {
      nicknameCheckButton?.setAttribute('disabled', 'true');
    } else {
      nicknameCheckButton?.removeAttribute('disabled');
    }
  }

  hydrateInitialValues();

  newProfileInput?.addEventListener('change', () => {
    const file = newProfileInput?.files?.[0] || null;
    pendingProfileFile = file || null;

    renderMessage(profileWarnEl, '', { autoHide: true });

    if (file && file.size > 10 * 1024 * 1024) {
      renderMessage(
        profileWarnEl,
        '10MB 이하 이미지를 업로드해주세요.',
        { type: 'error' },
      );

      pendingProfileFile = null;
      return;
    }

    if (file && profilePreviewEl) {
      const blobUrl = URL.createObjectURL(file);
      profilePreviewEl.src = blobUrl;
    }
  });

  nicknameInput?.addEventListener('input', () => {
    const nick = nicknameInput?.value ?? '';

    nicknameChekcedOk = nick.trim() === currentNickname.trim();

    validateNickname(nick, nicknameWarnEl);

    if (!nick.trim()) {
      nicknameCheckButton?.setAttribute('disabled', 'true');
    } else {
      nicknameCheckButton?.removeAttribute('disabled');
    }
  });

  nicknameCheckButton?.addEventListener('click', async () => {
    const nick = nicknameInput?.value ?? '';
    const trimmed = nick.trim();

    if (!validateNickname(trimmed, nicknameWarnEl)) {
      nicknameChekcedOk = false;
      return;
    }

    if (trimmed === currentNickname.trim()) {
      renderMessage(nicknameWarnEl, '현재 닉네임과 동일합니다.', { type: 'info', autoHide: true });
      nicknameChekcedOk = true;
      return;
    }

    // TODO: 닉네임 중복 확인 API 호출

    renderMessage(
      nicknameWarnEl,
      '닉네임 중복확인 완료: 사용 가능한 닉네임입니다.',
      { type: 'success', autoHide: true }
    );
    nicknameChekcedOk = true;
  });

  submitButton?.addEventListener('click', async () => {
    renderMessage(formWarnEl, '', { autoHide: true });

    if (!userId) {
      renderMessage(formWarnEl, '로그인이 필요합니다.', { type: 'error' });
      return;
    }

    const newNick = nicknameInput?.value.trim() || '';
    const fileObj = pendingProfileFile;

    const nicknameValid = validateNickname(newNick, nicknameWarnEl);
    if (!nicknameValid) {
      renderMessage(formWarnEl, '닉네임을 다시 확인해주세요', { type: 'error' });
      return;
    }

    if (newNick !== currentNickname && !nicknameChekcedOk) {
      renderMessage(formWarnEl, '닉네임 중복확인을 해주세요.', { type: 'error' });
      return;
    }

    // TOOD: 회원정보 수정 API 호출
  });

  logoutButton?.addEventListener('click', () => {
    renderMessage(formWarnEl, '', { autoHide: true });

    // TODO: 로그아웃 API 호출
  });
}