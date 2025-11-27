import { PrimaryButton } from "../../atoms/Button.js";
import { TextAreaField } from "../../atoms/TextAreaField.js";
import { TextField } from "../../atoms/TextField.js";
import { AuthLayout } from "../../layout/AuthLayout.js";
import { renderMessage } from "../../../utils/alerts.js";

function getModeAndId(pathname = window.location.pathname) {
  const createMatch = /^\/post\/create$/.test(pathname);
  const editMatch = /^\/post\/(\d+)\/edit$/.exec(pathname);

  if (createMatch) {
    return { mode: "create", postId: null };
  }
  if (editMatch) {
    return { mode: "edit", postId: editMatch[1] };
  }
  // 이상한 주소면 일단 create 취급
  return { mode: "create", postId: null };
}

/**
 * 게시글 작성/수정 페이지 UI
 */
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

export function initPostFormPage() {
  const { mode, postId } = getModeAndId();
  const isCreate = mode === "create";

  configureHeader?.({
    title: "아무 말 대잔치",
    showBack: true,
    showProfile: true,
  });

  const titleInput = document.getElementById("post-title-input");
  const contentInput = document.getElementById("post-content-input");
  const imageInput = document.getElementById("post-image-input");
  const titleError = document.getElementById("post-title-error");
  const contentError = document.getElementById("post-content-error");
  const warningEl = document.getElementById("post-form-warning");
  const submitBtn = document.getElementById("post-form-submit");

  async function prefillIfEdit() {
    if (isCreate || !postId) return;

    // TODO: 게시글 API 호출해서 기존 데이터 불러오기
  }

  submitBtn?.addEventListener('click', async () => {
    const title = (titleInput?.value || "").trim();
    const content = (contentInput?.value || "").trim();

    let valid = true;

    if (!title) {
      renderMessage(titleError, "제목을 입력하세요.");
      valid = false;
    } else {
      renderMessage(titleError, "");
    }

    if (!content) {
      renderMessage(contentError, "내용을 입력하세요.");
      valid = false;
    } else {
      renderMessage(contentError, "");
    }

    if (!valid) {
      renderMessage(warningEl, "입력한 내용을 다시 확인해주세요.");
      return;
    }

    renderMessage(warningEl, "");

    const files = imageInput?.files ? Array.from(imageInput.files) : [];
    const images = files.map((f) => f.name);
    const isImageChanged = !isCreate && files.length > 0;

    // TODO: 게시글 작성/수정 API 호출
  });

  prefillIfEdit();
}