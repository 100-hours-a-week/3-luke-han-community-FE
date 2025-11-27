import { getPrivacyPolicy, getTerms, signup, uploadToS3 } from "../common/api.js";
import { renderUserInput } from "../common/common.js";

// ===== DOM =====
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
const agreeWarn = document.getElementById('warn-agree');
const globalWarnSel = '#form-warning';

const agreeTermsCheck = document.getElementById('agree-terms');
const agreePrivacyCheck = document.getElementById('agree-privacy');

// 모달 내부 컨테이너
const termsContentEl = document.getElementById('terms-content');
const privacyContentEl = document.getElementById('privacy-content');

// ===== 유효성 검사 =====

function validateEmail() {
  const email = emailInput?.value.trim() ?? "";

  if (!email) {
    renderUserInput(emailWarn, '이메일을 입력해주세요.', { autoHide: true });
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    renderUserInput(emailWarn, '유효한 이메일 형식이 아닙니다.', { autoHide: true });
    return false;
  }

  renderUserInput(emailWarn, '', { autoHide: false });
  return true;
}

function validatePassword() {
  const pw1 = password1Input?.value.trim() ?? "";

  if (!pw1) {
    renderUserInput(passwordWarn, '비밀번호를 입력해주세요.', { autoHide: true });
    return false;
  }
  if (pw1.length < 8) {
    renderUserInput(passwordWarn, '비밀번호는 최소 8자 이상이어야 합니다.', { autoHide: true });
    return false;
  }
  if (pw1.length > 20) {
    renderUserInput(passwordWarn, '비밀번호는 최대 20자 이하여야 합니다.', { autoHide: true });
    return false;
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(pw1)) {
    renderUserInput(
      passwordWarn,
      '비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 이상 포함해야 합니다.',
      { autoHide: true }
    );
    return false;
  }

  renderUserInput(passwordWarn, '', { autoHide: false });
  return true;
}

function validateReInputPassword() {
  const pw1 = password1Input?.value.trim() ?? "";
  const pw2 = password2Input?.value.trim() ?? "";

  if (pw1 !== pw2) {
    renderUserInput(passwordCheckWarn, '비밀번호가 일치하지 않습니다.', { autoHide: true });
    return false;
  }

  renderUserInput(passwordCheckWarn, '', { autoHide: false });
  return true;
}

function validateNickname() {
  const nick = nicknameInput?.value.trim() ?? "";

  if (!nick) {
    renderUserInput(nicknameWarn, '닉네임을 입력해주세요.', { autoHide: true });
    return false;
  }
  if (nick.length < 2 || nick.length > 10) {
    renderUserInput(nicknameWarn, '닉네임은 2자 이상 10자 이하여야 합니다.', { autoHide: true });
    return false;
  }
  if (/\s/.test(nick)) {
    renderUserInput(nicknameWarn, '닉네임에는 공백이 포함될 수 없습니다.', { autoHide: true });
    return false;
  }

  renderUserInput(nicknameWarn, '', { autoHide: false });
  return true;
}

// ★ 약관 동의 확인
function validateAgreements() {
  const termsOk = !!agreeTermsCheck?.checked;
  const privacyOk = !!agreePrivacyCheck?.checked;

  if (!termsOk || !privacyOk) {
    renderUserInput(agreeWarn, '약관 및 개인정보처리방침에 동의해주세요.', { autoHide: true });
    return false;
  }

  renderUserInput(agreeWarn, '', { autoHide: false });
  return true;
}

// ===== 실시간 이벤트 바인딩 =====
emailInput?.addEventListener('input', validateEmail);
password1Input?.addEventListener('input', () => {
  validatePassword();
  validateReInputPassword(); // pw1 바뀌면 일치 여부도 다시 체크
});
password2Input?.addEventListener('input', validateReInputPassword);
nicknameInput?.addEventListener('input', validateNickname);

agreeTermsCheck?.addEventListener('change', validateAgreements);
agreePrivacyCheck?.addEventListener('change', validateAgreements);

// ===== 모달 내용 로드 =====
// 서버에서 /terms, /privacy는 Thymeleaf 뷰를 리턴해야 하는데
// 지금 컨트롤러가 @RestController로 되어 있고 그냥 "terms" 문자열을 리턴하고 있음.
// 그 상태면 그냥 문자열 "terms"만 와. (== html 아님)
// 만약 실제 HTML을 받고 싶으면 컨트롤러를 @Controller로 바꾸고
// return "terms"; // -> templates/terms.html 렌더된 결과
// 으로 해야 함.
// 일단 여기서는 GET /terms, /privacy 결과를 그대로 박아주자.

async function loadModalContent() {
  try {
    const [tRes, pRes] = await Promise.all([
      await getTerms(),
      await getPrivacyPolicy(),
    ]);

    const tText = await tRes.text();
    const pText = await pRes.text();

    if (termsContentEl) termsContentEl.innerHTML = tText;
    if (privacyContentEl) privacyContentEl.innerHTML = pText;
  } catch (e) {
    console.error('약관/개인정보 불러오기 실패:', e);
    if (termsContentEl) termsContentEl.textContent = '약관 내용을 불러오지 못했습니다.';
    if (privacyContentEl) privacyContentEl.textContent = '개인정보처리방침을 불러오지 못했습니다.';
  }
}

// 최초 1번 로드
loadModalContent();

// ===== 가입 제출 처리 =====
submitButton?.addEventListener('click', async () => {
  // 전체 유효성 체크
  const okEmail = validateEmail();
  const okPw = validatePassword();
  const okPw2 = validateReInputPassword();
  const okNick = validateNickname();
  const okAgree = validateAgreements();

  if (!okEmail || !okPw || !okPw2 || !okNick || !okAgree) {
    renderUserInput(globalWarnSel, '입력값을 다시 확인해주세요.');
    return;
  }

  const email = emailInput.value.trim();
  const password = password1Input.value.trim();
  const nickname = nicknameInput.value.trim();

  // 프로필 파일
  const fileInput = document.getElementById('signup-profile');
  const file = fileInput?.files?.[0] || null;
  const fileName = file ? file.name : '';

  try {
    const res = await signup({ email, password, nickname, fileName });

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
      renderUserInput(globalWarnSel, msg);
      return;
    }

    const presigned = await res.text();

    // 파일이 없거나 presigned가 빈 값이면 업로드 생략하고 바로 로그인 페이지로
    if (!file || presigned.length === 0) {
      window.location.href = '/login';
      return;
    }

    // 파일 업로드 S3
    try {
      await uploadToS3(presigned, file);
    } catch (e) {
      console.error(e);
      renderUserInput(globalWarnSel, '프로필 사진 업로드에 실패했어요.');
      return;
    }

    // 성공적으로 업로드까지 끝났으면 로그인 페이지로
    window.location.href = '/login';
  } catch (err) {
    console.error('회원가입 중 예외:', err);
    renderUserInput(globalWarnSel, '네트워크 오류가 발생했어요.');
  }
});
