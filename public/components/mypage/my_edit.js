import { checkNicknameDuplicate, logout, updateUserProfile, uploadToS3 } from "../common/api.js";
import { renderUserInput } from "../common/common.js";

const profilePreviewEl = document.getElementById('edit-profile-preview');
const newProfileInput = document.getElementById('edit-profile-file');
const profileWarnEl = document.getElementById('warn-photo');

const emailDisplayEl = document.getElementById('edit-email');

const nicknameInput = document.getElementById('edit-nickname');
const nicknameWarnEl = document.getElementById('warn-nickname');
const nicknameCheckButton = document.getElementById('nickname-check-btn');

const submitButton = document.getElementById('edit-save-btn');

const logoutButton = document.getElementById('logout-btn');

const formWarnEl = document.getElementById('form-warning');
const WARN_SELECTOR = '#form-warning';

let currentUserId = Number(localStorage.getItem('userId')) || 0;
let currentEmail = localStorage.getItem('email') || '';
let currentNickname = localStorage.getItem('nickname') || '';
let currentProfileUrl = localStorage.getItem('profile_image') || '/assets/image/default_profile.png';

let pendingProfileFile = null;

let nicknameCheckedOK = true;

/* =========================================
 * 유틸 함수들
 * ========================================= */

function setFormWarning(msg) {
  renderUserInput(WARN_SELECTOR, msg || '');
}

/**
 * 닉네임 기본 유효성 체크
 * - 2~10자
 * - 공백 금지
 */
function validateNicknameBasic(nick) {
  if (!nick) {
    renderUserInput(nicknameWarnEl, '닉네임을 입력해주세요.', { autoHide: true });
    return false;
  }
  if (nick.length < 2 || nick.length > 10) {
    renderUserInput(nicknameWarnEl, '닉네임은 2자 이상 10자 이하여야 합니다.', { autoHide: true });
    return false;
  }
  if (/\s/.test(nick)) {
    renderUserInput(nicknameWarnEl, '닉네임에는 공백이 포함될 수 없습니다.', { autoHide: true });
    return false;
  }

  renderUserInput(nicknameWarnEl, '', { autoHide: false });
  return true;
}

/**
 * 프로필 프리뷰 업데이트
 */
function updateProfilePreview(file) {
  if (!file || !profilePreviewEl) return;
  const blobUrl = URL.createObjectURL(file);
  profilePreviewEl.src = blobUrl;
}

/* =========================================
 * 초기 세팅
 * ========================================= */

function hydrateInitialValues() {
  if (emailDisplayEl && currentEmail) {
    emailDisplayEl.textContent = currentEmail;
  }

  if (nicknameInput && currentNickname) {
    nicknameInput.value = currentNickname;
  }

  if (profilePreviewEl && currentProfileUrl) {
    profilePreviewEl.src = currentProfileUrl;
  }

  // 초기 닉네임은 이미 사용 가능한 닉네임이므로 통과 상태로 간주
  nicknameCheckedOK = true;

  // 버튼 enable/disable
  if (!nicknameInput.value.trim()) {
    nicknameCheckButton?.setAttribute('disabled', 'true');
  } else {
    nicknameCheckButton?.removeAttribute('disabled');
  }
}

/* =========================================
 * 이벤트 바인딩
 * ========================================= */

/**
 * 프로필 이미지 선택
 * - 용량 제한 5MB
 * - 미리보기
 */
newProfileInput?.addEventListener('change', () => {
  const file = newProfileInput.files?.[0] || null;
  pendingProfileFile = file || null;

  renderUserInput(profileWarnEl, '');

  if (file && file.size > 5 * 1024 * 1024) { // 5MB
    renderUserInput(profileWarnEl, '5MB 이하 이미지만 업로드할 수 있어요.', { autoHide: false });
    pendingProfileFile = null;
    return;
  }

  if (file) {
    updateProfilePreview(file);
  }
});

/**
 * 닉네임 입력 변화
 * - 기본 유효성 검사
 * - 현재 닉네임과 다르면 중복확인 다시 필요
 * - 버튼 활성화/비활성
 */
nicknameInput?.addEventListener('input', () => {
  const nick = nicknameInput?.value.trim() ?? '';

  // 닉네임이 기존 닉네임과 다르면 아직 중복확인 안 한 상태로 간주
  nicknameCheckedOK = (nick === currentNickname);

  validateNicknameBasic(nick);

  if (!nick) {
    nicknameCheckButton?.setAttribute('disabled', 'true');
  } else {
    nicknameCheckButton?.removeAttribute('disabled');
  }
});

/**
 * 닉네임 중복확인
 * - /api/auth/duplications/nickname 에 POST { nickname }
 * - 백엔드에서 { duplicated: boolean } 내려준다고 가정
 */
nicknameCheckButton?.addEventListener('click', async () => {
  const nick = nicknameInput?.value.trim() ?? '';
  if (!nick) return;

  // 1차 프론트 유효성
  if (!validateNicknameBasic(nick)) return;

  try {
    const res = await checkNicknameDuplicate(nick);

    if (!res.ok) {
      renderUserInput(nicknameWarnEl, '닉네임 확인 중 오류가 발생했어요.', { autoHide: true });
      nicknameCheckedOk = false;
      return;
    }

    const data = await res.json();
    const duplicated = !!data.duplicated;

    if (duplicated) {
      renderUserInput(nicknameWarnEl, '이미 사용 중인 닉네임입니다.', { autoHide: true });
      nicknameCheckedOk = false;
    } else {
      renderUserInput(nicknameWarnEl, '사용 가능한 닉네임입니다.', {
        autoHide: false,
        success: true,
      });
      nicknameCheckedOk = true;
    }
  } catch (e) {
    console.error('닉네임 중복확인 예외:', e);
    renderUserInput(nicknameWarnEl, '닉네임 중복확인 중 문제가 발생했어요.', { autoHide: true });
    nicknameCheckedOk = false;
  }
});

/**
 * 저장 버튼
 * 흐름:
 * 1) 닉네임 유효성 검사
 * 2) 닉네임 변경 시 중복확인 통과 여부 확인
 * 3) updateUserProfile 호출 (SimpUserInfo 형태로 보냄)
 *    { id, name, profileImageUrl }
 *    profileImageUrl 은 새 파일명이거나 null
 * 4) 응답 body(String) = presigned URL (또는 빈 문자열)
 * 5) presigned가 있고 파일이 있으면 uploadToS3
 * 6) localStorage 갱신
 */
submitButton?.addEventListener('click', async () => {
  setFormWarning('');

  if (!currentUserId) {
    setFormWarning('로그인이 필요합니다.');
    return;
  }

  const newNick = nicknameInput?.value.trim() || '';
  const fileObj = pendingProfileFile;

  // 닉네임 기본 유효성
  if (!validateNicknameBasic(newNick)) {
    setFormWarning('닉네임을 다시 확인해주세요.');
    return;
  }

  // 닉네임이 변경되었는데 아직 중복확인 안 했으면 막기
  if (newNick !== currentNickname && !nicknameCheckedOk) {
    setFormWarning('닉네임 중복확인을 완료해주세요.');
    return;
  }

  const requestBody = {
    id: currentUserId,
    name: newNick,
    profileImageUrl: fileObj ? fileObj.name : null, 
  };

  let presignedUrl = '';

  // 1) 사용자 정보 업데이트 요청
  try {
    const res = await updateUserProfile(requestBody);

    if (!res.ok) {
      let msg = '저장에 실패했어요. 잠시 후 다시 시도해주세요.';
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch {
        try {
          const txt = await res.text();
          if (txt) msg = txt;
        } catch (_) {}
      }
      setFormWarning(msg);
      return;
    }

    // 컨트롤러 보면 ResponseEntity<String> 이라서 JSON 말고 그냥 문자열임.
    // presignedUrl 또는 "" 같은 값이 내려온다고 가정
    presignedUrl = await res.text();
  } catch (err) {
    console.error('프로필 저장 요청 중 예외:', err);
    setFormWarning('저장 중 오류가 발생했어요.');
    return;
  }

  // 2) presignedUrl이 있고, 실제로 업로드할 새 파일이 있으면 S3 업로드
  if (presignedUrl && fileObj) {
    try {
      await uploadToS3(presignedUrl, fileObj);
    } catch (uploadErr) {
      console.error('프로필 이미지 업로드 실패:', uploadErr);
      setFormWarning('프로필 이미지를 업로드하지 못했어요.');
      return;
    }
  }

  // 3) 로컬 상태/스토리지 갱신
  // 닉네임 업데이트
  currentNickname = newNick;
  localStorage.setItem('nickname', currentNickname);

  // 프로필 이미지 URL은
  // - presigned 업로드 후 실제 접근 가능한 URL은 백엔드에서 만들어주는 GET presigned URL일 가능성이 큼
  //   (로그인 성공 핸들러에서 s3Service.createGETPresignedUrl(...) 주는 것처럼)
  // 지금은 일단 프론트 미리보기와 localStorage만 바꿔줄게.
  if (fileObj) {
    // 새로 업로드한 파일 blob URL로 즉시 UI 업데이트
    const blobUrl = URL.createObjectURL(fileObj);
    profilePreviewEl.src = blobUrl;
    localStorage.setItem('profile_image', blobUrl);
    currentProfileUrl = blobUrl;
  }

  nicknameCheckedOK = true;
  pendingProfileFile = null;
  setFormWarning('변경사항이 저장되었습니다.');
});

logoutButton?.addEventListener('click', async () => {
  const res = await logout();
  console.log(res);

  if (!res.ok) {
    setFormWarning('로그아웃에 실패했어요. 잠시 후 다시 시도해주세요.');
    return;
  }

  // 로컬 스토리지 정리
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user_id');
  localStorage.removeItem('email');
  localStorage.removeItem('nickname');
  localStorage.removeItem('profile_image');

  // 로그인 페이지로 이동
  window.location.href = '/login';
});

/* =========================================
 * init
 * ========================================= */
hydrateInitialValues();