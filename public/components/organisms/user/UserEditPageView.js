import { PrimaryButton } from "../../atoms/Button.js";
import { AuthLayout } from "../../layout/AuthLayout.js";

export function UserEditPageView() {
  const body = `
    <div class="auth-profile-edit">

      <!-- 프로필 사진 -->
      <div class="auth-field">
        <label class="auth-label">프로필 사진</label>

        <div class="auth-profile-row">
          <img
            src="/assets/image/default_profile.png"
            alt="현재 프로필 이미지"
            class="auth-profile-preview"
            id="edit-profile-preview"
          />

          <div class="auth-profile-file">
            <input
              id="edit-profile-file"
              type="file"
              class="auth-input-file"
              accept="image/*"
            />
            <div id="warn-photo" class="auth-error" hidden></div>
            <div class="auth-helper-text">
              5MB 이하 이미지를 업로드해주세요.
            </div>
          </div>
        </div>
      </div>

      <!-- 이메일 (수정 불가) -->
      <div class="auth-field">
        <label class="auth-label">이메일</label>
        <p id="edit-email" class="auth-plaintext"></p>
      </div>

      <!-- 닉네임 -->
      <div class="auth-field">
        <label for="edit-nickname" class="auth-label">
          닉네임 <span class="auth-label-required">*</span>
        </label>

        <div class="auth-nickname-row">
          <input
            id="edit-nickname"
            type="text"
            class="auth-input"
            placeholder="닉네임을 입력하세요"
          />
          <button
            class="auth-sub-btn"
            id="nickname-check-btn"
            type="button"
          >
            중복확인
          </button>
        </div>

        <div id="warn-nickname" class="auth-error" hidden></div>
      </div>

      <!-- 전역 경고 영역 -->
      <div id="form-warning" class="auth-error-global" hidden></div>

      ${PrimaryButton({
        id: "edit-save-btn",
        label: "변경사항 저장",
      })}

      <div class="auth-links">
        <span class="auth-link-subtle">비밀번호를 바꾸고 싶으신가요?</span>
        <a href="/user/password" class="auth-link-main">비밀번호 변경</a>
      </div>

      <button
        class="auth-secondary-btn auth-logout-btn"
        id="logout-btn"
        type="button"
      >
        로그아웃
      </button>
    </div>
  `;

  return AuthLayout({
    title: "회원정보 수정",
    bodyHtml: body,
  });
}
