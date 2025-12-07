import { renderMessage } from "../../../utils/alerts.js";
import { validateNickname } from "../../../utils/validator.js";
import { configureHeader } from "../../molecules/header/header.js";
import {
  checkNicknameDuplicate,
  updateUserProfile,
  uploadToS3,
  logout,
  getProfileInfo,
} from "../../common/api.js";
import { clearProfileImageCache } from "../../../utils/cacheStore.js";

export function initUserEditPage() {
  configureHeader?.({
    title: "Damul Board",
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

  let currentEmail = localStorage.getItem("email") || "";
  let currentNickname = localStorage.getItem("nickname") || "";
  let currentProfileImageUrl = "/assets/image/default_profile.png";

  let pendingProfileFile = null;
  let nicknameCheckedOk = true; // 중복 통과 여부

  // 초기 데이터 세팅
  async function hydrateInitialValues() {
    try {
      const res = await getProfileInfo();
      if (res.ok) {
        const body = await res.json().catch(() => null);
        const url = body?.data ?? null;
        if (url) {
          currentProfileImageUrl = url;
        }
      } else {
        console.warn("[UserEdit] 프로필 이미지 조회 실패", res.status);
      }
    } catch (e) {
      console.error("[UserEdit] 프로필 이미지 조회 중 오류", e);
    }

    if (emailDisplayEl) {
      emailDisplayEl.textContent = currentEmail || '';
    }

    if (nicknameInput) {
      nicknameInput.value = currentNickname || '';
    }

    if (profilePreviewEl) {
      profilePreviewEl.src = currentProfileImageUrl || '/assets/image/default_profile.png';
    }

    nicknameCheckedOk = true;

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

    nicknameCheckedOk = nick.trim() === currentNickname.trim();

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
      nicknameCheckedOk = false;
      return;
    }

    if (trimmed === currentNickname.trim()) {
      renderMessage(nicknameWarnEl, '현재 닉네임과 동일합니다.', { type: 'info', autoHide: true });
      nicknameCheckedOk = true;
      return;
    }

    try {
      const res = await checkNicknameDuplicate({ value: trimmed });

      if (res.status === 204) {
        // 사용 가능
        renderMessage(
          nicknameWarnEl,
          "닉네임 중복확인 완료: 사용 가능한 닉네임입니다.",
          { type: "success", autoHide: true }
        );
        nicknameCheckedOk = true;
      } else if (res.status === 409) {
        // 중복
        renderMessage(
          nicknameWarnEl,
          "이미 사용 중인 닉네임입니다.",
          { type: "error" }
        );
        nicknameCheckedOk = false;
      } else {
        console.error("[UserEdit] 닉네임 중복 확인 예상치 못한 응답", res.status);
        renderMessage(
          nicknameWarnEl,
          "닉네임 중복 확인 중 오류가 발생했습니다.",
          { type: "error" }
        );
        nicknameCheckedOk = false;
      }
    } catch (err) {
      console.error("[UserEdit] 닉네임 중복 확인 실패", err);
      renderMessage(
        nicknameWarnEl,
        "닉네임 중복 확인 중 오류가 발생했습니다.",
        { type: "error" }
      );
      nicknameCheckedOk = false;
    }
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

    if (newNick !== currentNickname && !nicknameCheckedOk) {
      renderMessage(formWarnEl, '닉네임 중복확인을 해주세요.', { type: 'error' });
      return;
    }

    try {
      // 1) /api/users 로 SimpUserInfo 전송 → presigned URL 응답
      const requestBody = {
        id: userId,
        name: newNick,
        profileImageKey: fileObj ? fileObj.name : null, // 파일 있으면 파일명, 아니면 null
      };

      const res = await updateUserProfile(requestBody);
      if (!res.ok) {
        console.error("[UserEdit] 회원정보 수정 실패", res.status);
        renderMessage(
          formWarnEl,
          "회원정보 수정에 실패했습니다. 잠시 후 다시 시도해주세요.",
          { type: "error" }
        );
        return;
      }

      const resBody = await res.json().catch(() => null);
      const presignedUrl = resBody?.data ?? null;

      // 2) 프로필 이미지 파일이 있고, presigned URL이 내려왔으면 S3에 업로드
      if (presignedUrl && fileObj) {
        try {
          await uploadToS3(presignedUrl, fileObj);
        } catch (e) {
          console.error("[UserEdit] 프로필 이미지 업로드 실패", e);
          renderMessage(
            formWarnEl,
            "프로필 이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.",
            { type: "error" }
          );
          return;
        }
      }

      // 3) 클라이언트 상태/스토리지 갱신
      currentNickname = newNick;
      localStorage.setItem("nickname", newNick);
      pendingProfileFile = null;

      clearProfileImageCache();
      try {
        const res2 = await getProfileInfo();
        if (res2.ok) {
          const body2 = await res2.json().catch(() => null);
          const newUrl = body2?.data ?? null;
          if (newUrl) {
            currentProfileImageUrl = newUrl;
            localStorage.setItem("profileImageUrl", newUrl);
          }
        }
      } catch (e) {
        console.error("[UserEdit] 프로필 이미지 재조회 실패", e);
      }

      renderMessage(
        formWarnEl,
        "회원정보가 수정되었습니다.",
        { type: "success", autoHide: true }
      );
    } catch (err) {
      console.error("[UserEdit] 회원정보 수정 중 오류", err);
      renderMessage(
        formWarnEl,
        "회원정보 수정 중 오류가 발생했습니다.",
        { type: "error" }
      );
    }
  });

  logoutButton?.addEventListener('click', async () => {
    renderMessage(formWarnEl, '', { autoHide: true });

    try {
      const res = await logout();
      if (!res.ok) {
        console.error("[UserEdit] 로그아웃 실패", res.status);
        // 실패해도 일단 클라이언트 쪽 상태는 정리하고 보냄
      }
    } catch (e) {
      console.error("[UserEdit] 로그아웃 요청 중 오류", e);
    }

    // 클라이언트 상태 정리
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("nickname");
    // 필요한 키 더 있으면 여기서 같이 지우기

    // 라우팅
    if (window.router?.navigate) {
      window.router.navigate("/login");
    } else {
      window.location.href = "/login";
    }
  });
}