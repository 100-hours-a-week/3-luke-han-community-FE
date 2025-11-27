import { renderMessage } from "../../../../utils/alerts";
import { registerEnterSubmit } from "../../../../utils/commonHooks.js";
import { configureHeader } from "../../../molecules/header/header.js";

export function getModeAndId(pathname = window.location.pathname) {
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
  
  registerEnterSubmit(titleInput, () => submitBtn?.click());
  registerEnterSubmit(contentInput, () => submitBtn?.click());
}