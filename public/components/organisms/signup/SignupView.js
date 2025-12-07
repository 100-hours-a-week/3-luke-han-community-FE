import { PrimaryButton } from "../../atoms/Button.js";
import { TextField } from "../../atoms/TextField.js";
import { AuthLayout } from "../../layout/AuthLayout.js";

export function SignupPage() {
  const body = `
    ${TextField({
      id: "signup-email",
      label: "이메일",
      type: "email",
      errorId: "signup-email-error",
      errorText: "",
    })}

    ${TextField({
      id: "signup-password",
      label: "비밀번호",
      type: "password",
      errorId: "signup-password-error",
      errorText: "",
    })}

    ${TextField({
      id: "signup-password2",
      label: "비밀번호 확인",
      type: "password",
      errorId: "signup-password2-error",
      errorText: "",
    })}

    ${TextField({
      id: "signup-nickname",
      label: "닉네임",
      type: "text",
      errorId: "signup-nickname-error",
      errorText: "",
    })}

    <!-- 프로필 이미지 (선택) -->
    <div class="auth-field">
      <label for="signup-profile" class="auth-label">프로필 이미지 (선택)</label>
      <input id="signup-profile" type="file" class="auth-input-file" accept="image/*" />
      <div class="auth-helper-text">이미지를 선택하지 않으면 기본 프로필로 설정됨</div>
    </div>

    <!-- 약관 동의 -->
    <div class="auth-field auth-agree-group">
      <div class="auth-checkbox-row">
        <input id="agree-terms" type="checkbox" class="auth-checkbox" />
        <label for="agree-terms" class="auth-checkbox-label">이용약관 동의</label>
        <button type="button" class="auth-link-inline" id="open-terms">내용 보기</button>
      </div>

      <div class="auth-checkbox-row">
        <input id="agree-privacy" type="checkbox" class="auth-checkbox" />
        <label for="agree-privacy" class="auth-checkbox-label">개인정보 처리방침 동의</label>
        <button type="button" class="auth-link-inline" id="open-privacy">내용 보기</button>
      </div>

      <div id="signup-agree-error" class="auth-error" hidden></div>
    </div>

    <div id="terms-content" class="auth-terms-content" hidden></div>
    <div id="privacy-content" class="auth-terms-content" hidden></div>

    <div id="signup-form-error" class="auth-error-global" hidden></div>

    ${PrimaryButton({ id: "signupBtn", label: "회원가입" })}

    <div class="auth-links">
      <span class="auth-link-subtle">이미 계정이 있으신가요?</span>
      <a href="/login" class="auth-link-main">로그인</a>
    </div>
  `;

  return AuthLayout({ title: "회원가입", bodyHtml: body });
}