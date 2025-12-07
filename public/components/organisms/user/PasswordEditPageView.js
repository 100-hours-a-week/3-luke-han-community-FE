import { PrimaryButton } from "../../atoms/Button.js";
import { TextField } from "../../atoms/TextField.js";
import { AuthLayout } from "../../layout/AuthLayout.js";

export function PasswordEditPageView() {
  const body = `
    ${TextField({
      id: "current-password",
      label: "현재 비밀번호",
      type: "password",
      errorId: "warn-current-pw",
      errorText: "현재 비밀번호를 입력해주세요.",
    })}

    <hr class="auth-divider" />

    ${TextField({
      id: "new-password",
      label: "새 비밀번호",
      type: "password",
      errorId: "warn-new-pw",
      errorText: "새 비밀번호를 입력해주세요.",
    })}

    ${TextField({
      id: "new-password-check",
      label: "새 비밀번호 확인",
      type: "password",
      errorId: "warn-new-pw-check",
      errorText: "새 비밀번호를 한 번 더 입력해주세요.",
    })}

    <div id="form-warning" class="auth-error-global" hidden></div>

    ${PrimaryButton({
      id: "pw-change-btn",
      label: "비밀번호 변경",
    })}

    <div class="auth-links">
      <span class="auth-link-subtle">프로필 정보로 돌아가시겠어요?</span>
      <a href="/user/edit" class="auth-link-main">회원정보 수정</a>
    </div>
  `;

  return AuthLayout({
    title: "비밀번호 변경",
    bodyHtml: body,
  });
}