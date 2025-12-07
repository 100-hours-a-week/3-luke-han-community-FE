import { PrimaryButton } from "../../../atoms/Button.js";
import { TextAreaField } from "../../../atoms/TextAreaField.js";
import { TextField } from "../../../atoms/TextField.js";
import { AuthLayout } from "../../../layout/AuthLayout.js";
import { getModeAndId } from "./PostFormController.js";

export function PostFormPage() {
  const { mode } = getModeAndId();
  const isCreate = mode === "create";

  const body = `
    ${TextField({
      id: "post-title-input",
      label: "제목",
      type: "text",
      errorId: "post-title-error",
      errorText: "제목을 입력하세요.",
    })}

    ${TextAreaField({
      id: "post-content-input",
      label: "내용",
      rows: 8,
      placeholder: "내용을 입력하세요.",
      errorId: "post-content-error",
      errorText: "내용을 입력하세요.",
    })}

    <div id="post-form-warning" class="auth-error-global" hidden></div>

    <!-- 이미지 업로드 -->
    <div class="auth-field">
      <label for="post-image-input" class="auth-label">이미지</label>
      <input
        id="post-image-input"
        type="file"
        class="auth-input-file"
        accept="image/*"
        multiple
      />
      <div class="auth-helper-text">
        여러 이미지를 선택할 수 있어요. (선택 사항)
      </div>
    </div>

    ${PrimaryButton({
      id: "post-form-submit",
      label: isCreate ? "작성하기" : "수정하기",
    })}

    <div class="auth-links">
      <span class="auth-link-subtle"></span>
      <a href="/" class="auth-link-main">목록으로</a>
    </div>
  `;

  return AuthLayout({
    title: isCreate ? "게시글 작성" : "게시글 수정",
    bodyHtml: body,
  });
}
