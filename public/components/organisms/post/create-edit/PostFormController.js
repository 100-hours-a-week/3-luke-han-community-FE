import { renderMessage } from "../../../../utils/alerts.js";
import { registerEnterSubmit } from "../../../../utils/commonHooks.js";
import { configureHeader } from "../../../molecules/header/header.js";
import { getPostDetail, createPost, updatePost, uploadToS3 } from "../../../common/api.js";

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
    title: "Damul Board",
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

    try {
      const res = await getPostDetail(postId);

      if (!res.ok) {
        console.error("게시글 조회 실패:", res.status);
        renderMessage(warningEl, "게시글 정보를 불러오지 못 했습니다.");
        return;
      }

      const body = await res.json();
      const detail = body?.data;
      const post = detail?.post;

      if (!post) {
        console.error("잘못된 응답입니다:", body);
        return;
      }

      if (titleInput) {
        titleInput.value = post.title ?? "";
      }

      if (contentInput) {
        contentInput.value = post.content ?? "";
      }
    } catch (error) {
      console.error("게시글 조회 중 오류:", error);
      renderMessage(warningEl, "게시글 정보를 불러오는 도중 오류가 발생했습니다.");
    }
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
    const images = files.length > 0 ? files.map((f) => f.name) : null;
    const isImageChanged = isCreate
      ? files.length > 0                      // 새 글이면 파일 있으면 true
      : files.length > 0;                     // 수정 시: 파일이 새로 선택된 경우에만 true

    try {
      renderMessage(
        warningEl,
        isCreate ? "게시글을 작성 중입니다..." : "게시글을 수정 중입니다..."
      );

      // 1) 백엔드에 게시글 메타데이터 전송 (제목, 내용, 파일 이름, isImageChanged)
      const dto = {
        title,
        content,
        images,          // CreatePostDto.images
        isImageChanged,  // CreatePostDto.isImageChanged
      };

      let res;
      if (isCreate) {
        res = await createPost(dto);              // POST /api/posts
      } else {
        res = await updatePost(postId, dto);      // PATCH /api/posts/{postId}
      }

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error("게시글 저장 실패:", res.status, errText);
        renderMessage(warningEl, "게시글 저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const body = await res.json();
      const data = body?.data; // SavedPostDto { postId, presignedUrls }

      const savedPostId = data?.postId;
      const presignedUrls = data?.presignedUrls || [];

      // 2) presignedUrls가 있으면 실제 파일을 S3로 업로드
      if (presignedUrls && presignedUrls.length > 0 && files.length > 0) {
        if (presignedUrls.length !== files.length) {
          console.warn(
            "presignedUrls 개수와 파일 개수가 다릅니다.",
            presignedUrls.length,
            files.length
          );
        }

        // presignedUrls와 files를 인덱스 기준으로 매칭해서 업로드
        await Promise.all(
          presignedUrls.map((url, idx) => {
            const file = files[idx];
            if (!file) return Promise.resolve(); // 개수 안 맞을 때 방어 코드
            return uploadToS3(url, file);
          })
        );
      }

      // 3) 모든 것이 성공하면 페이지 이동
      const targetPostId = savedPostId ?? postId;

      if (window.router?.navigate) {
        if (targetPostId) {
          window.router.navigate(`/post/${targetPostId}`);
        } else {
          window.router.navigate("/");
        }
      } else {
        if (targetPostId) {
          window.location.href = `/post/${targetPostId}`;
        } else {
          window.location.href = "/";
        }
      }
    } catch (error) {
      console.error("게시글 저장 중 오류:", error);
      renderMessage(warningEl, "오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
  });

  prefillIfEdit();
  
  registerEnterSubmit(titleInput, () => submitBtn?.click());
  registerEnterSubmit(contentInput, () => submitBtn?.click());
}