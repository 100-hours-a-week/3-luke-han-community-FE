import { renderMessage } from "../../../../utils/alerts.js";
import { registerEnterSubmit } from "../../../../utils/commonHooks.js";
import { renderUserInput } from "../../../../utils/renderUtil.js";
import { createCommentItem } from "../../../molecules/comment/CommentItem.js";
import { configureHeader } from "../../../molecules/header/header.js";
import { closeModal, openModal } from "../../../molecules/modal/ModalController.js";

function getPostIdFromPath(pathname = window.location.pathname) {
  const match = /^\/post\/(\d+)$/.exec(pathname);
  if (!match) return null;
  return match[1];
}

export function initPostDetailPage() {
  const postId = getPostIdFromPath();

  configureHeader?.({
    title: "아무 말 대잔치",
    showBack: true,
    showProfile: true,
  });

  const titleEl = document.querySelector(".post-detail-title.post_title");
  const nicknameEl = document.querySelector(".post-detail-meta .nickname");
  const createdTimeEl = document.querySelector(".post-detail-meta .created_time");
  const profileImg = document.querySelector(".post-detail-meta .profile");

  const likeCountEl = document.querySelector(".like_count");
  const viewCountEl = document.querySelector(".view_count");
  const commentCountEl = document.querySelector(".comment_count");
  const likeBox = document.querySelector(".detail-like-box");

  const contentEl = document.querySelector(".post_content");
  const imagesContainer = document.querySelector(".post-detail-images.post_images");

  const editBtn = document.querySelector(".edit_button");
  const deleteBtn = document.querySelector(".delete_button");

  const commentsContainer = document.querySelector(".comments_section");
  const commentInput = document.getElementById("comment-input");
  const commentError = document.getElementById("comment-error");
  const commentSubmit = document.getElementById("comment-submit");

  if (!postId) {
    console.warn("PostDetailPage: Invalid postId");
    return;
  }

  function renderPostDetail(detail) {
    if (!detail) return;
    const post = detail.post ?? {};
    const author = detail.author ?? {};

    const {
      title = '',
      content = '',
      createdAt = '',
      likeCount = 0,
      viewCount: vc = 0,
      commentCount: cc = 0,
      images = [],
      isMine = false,
    } = post;

    const {
      name: nickname = '',
      profileImageUrl = "/assets/image/default-profile.png",
    } = author;

    if (titleEl) renderUserInput(titleEl, title);
    if (contentEl) renderUserInput(contentEl, content);

    if (nicknameEl) nicknameEl.textContent = nickname;
    if (createdTimeEl) createdTimeEl.textContent = createdAt || "";
    if (profileImg) profileImg.src = profileImageUrl || "/assets/image/default_profile.png";

    if (likeCountEl) likeCountEl.textContent = String(likeCount ?? 0);
    if (viewCountEl) viewCountEl.textContent = String(vc ?? 0);
    if (commentCountEl) commentCountEl.textContent = String(cc ?? 0);

    if (editBtn) editBtn.classList.toggle("d-none", !isMine);
    if (deleteBtn) deleteBtn.classList.toggle("d-none", !isMine);

    // 이미지 렌더링
    if (imagesContainer) {
      imagesContainer.innerHTML = "";
      if (Array.isArray(images) && images.length > 0) {
        const fragment = document.createDocumentFragment();
        images.forEach((url) => {
          const col = document.createElement("div");
          col.className = "post-detail-image-item";
          col.innerHTML = `
            <div class="post-detail-image-card">
              <img src="${url}" alt="post_image" />
            </div>
          `;
          fragment.appendChild(col);
        });
        imagesContainer.appendChild(fragment);
      }
    }
  }

  function renderComments(list = []) {
    if (!commentsContainer) return;

    commentsContainer.innerHTML = "";

    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state text-center text-muted py-4";
      empty.innerHTML = `
        <div class="d-inline-block">
          <div class="mb-1">첫 번째 댓글을 남겨보세요!</div>
        </div>
      `;
      commentsContainer.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();
    list.forEach((wrapper) => {
      const node = createCommentItem(wrapper);
      fragment.appendChild(node);
    });
    commentsContainer.appendChild(fragment);
  }

  likeBox?.addEventListener('click', async () => {
    // TODO: 좋아요 API 호출 및 UI 업데이트
  });

  editBtn?.addEventListener('click', () => {
    const path = `/post/${postId}/edit`;
    if (window.router?.navigate) {
      window.router.navigate(path);
    } else {
      window.location.href = path;
    }
  });

  deleteBtn?.addEventListener('click', async () => {
    openModal({
      title: "게시글을 삭제할까요?",
      message: "삭제된 게시글은 되돌릴 수 없어요.",
      actions: [
        {
          label: "취소",
          variant: "dm-btn-ghost",
          onClick: () => closeModal(),
        },
        {
          label: "삭제하기",
          variant: "dm-btn-danger",
          onClick: async () => {
            try {
              // await deletePost(postId);
              closeModal();
              window.router?.navigate("/") ?? (window.location.href = "/");
            } catch (e) {
              closeModal();
              console.error(e);
            }
          },
        },
      ],
    });
  });

  commentSubmit?.addEventListener('click', async () => {
    const value = (commentInput?.value || "").trim();

    if (!value) {
      renderMessage(commentError, "댓글을 입력하세요.", { type: "error" });
      return;
    }

    renderMessage(commentError, "", { autoHide: true });

    // TODO: 댓글 등록 API 호출 및 UI 업데이트
  });

  registerEnterSubmit(commentInput, () => commentSubmit?.click());

  commentsContainer?.addEventListener('click', (e) => {
    const item = e.target.closest('.comment_item');
    if (!item) return;

    const commentId = item.dataset.commentId;
    const contentEl = item.querySelector(".comment_content");
    const editWrap = item.querySelector(".comment-edit-wrap");
    const editInput = item.querySelector(".comment-edit-input");
    const replyWrap = item.querySelector(".reply-input-wrap");
    const replyInput = item.querySelector(".reply-input");

    // 1) "답글 달기" 버튼 클릭
    if (e.target.matches(".reply_button")) {
      if (!replyWrap || !replyInput) return;
      const isHidden = replyWrap.classList.contains("d-none");
      replyWrap.classList.toggle("d-none", !isHidden);
      if (!isHidden) {
        // 닫히는 경우 입력값 초기화
        replyInput.value = "";
      } else {
        // 처음 열리는 경우 이벤트 등록
        if (!replyInput.dataset.enterSubmitBound) {
          const replySubmitBtn = item.querySelector(".reply-submit");
          registerEnterSubmit(replyInput, () => {
            replySubmitBtn?.click();
          });
          replyInput.dataset.enterSubmitBound = "true";
        }
        // 열리는 경우 포커스
        replyInput.focus();
      }
      return;
    }

    // 2) 답글 취소
    if (e.target.matches(".reply-cancel")) {
      if (!replyWrap || !replyInput) return;
      replyWrap.classList.add("d-none");
      replyInput.value = "";
      return;
    }

    // 3) 답글 등록
    if (e.target.matches(".reply-submit")) {
      if (!replyWrap || !replyInput) return;
      const value = replyInput.value.trim();
      if (!value) {
        return;
      }

      // TODO: 댓글 생성 API 호출;
      // 성공 시: replyWrap 닫고 입력값 비우고, children_wrap에 새 comment append or 목록 재조회
      replyWrap.classList.add("d-none");
      replyInput.value = "";
      return;
    }

    // 4) 댓글 "수정" 버튼 클릭 → 인라인 편집 모드로
    if (e.target.matches(".edit_button")) {
      if (!editWrap || !editInput || !contentEl) return;

      editInput.value = contentEl.textContent.trim();
      contentEl.classList.add("d-none");
      editWrap.classList.remove("d-none");

      // 처음 열리릴 때 이벤트 등록
      if (!editInput.dataset.enterSubmitBound) {
        const editSaveBtn = item.querySelector(".comment-edit-save");
        registerEnterSubmit(editInput, () => {
          editSaveBtn?.click();
        });
        editInput.dataset.enterSubmitBound = "true";
      }

      editInput.focus();
      return;
    }

    // 5) 댓글 수정 취소
    if (e.target.matches(".comment-edit-cancel")) {
      if (!editWrap || !contentEl) return;
      editWrap.classList.add("d-none");
      contentEl.classList.remove("d-none");
      return;
    }

    // 6) 댓글 수정 저장
    if (e.target.matches(".comment-edit-save")) {
      if (!editWrap || !editInput || !contentEl) return;
      const newValue = editInput.value.trim();
      if (!newValue) {
        return;
      }

      // TODO: 댓글 수정 API 호출
      // 성공 시 UI 반영
      renderUserInput(contentEl, newValue);

      editWrap.classList.add("d-none");
      contentEl.classList.remove("d-none");
      return;
    }

    // 7) 댓글 삭제
    if (e.target.matches(".delete_button")) {
      openModal({
        title: "댓글을 삭제할까요?",
        message: "삭제된 댓글은 되돌릴 수 없어요.",
        actions: [
          {
            label: "취소",
            variant: "dm-btn-ghost",
            onClick: () => closeModal(),
          },
          {
            label: "삭제하기",
            variant: "dm-btn-danger",
            onClick: async () => {
              try {
                // TODO: 댓글 삭제 API 호출
                closeModal();
                // UI에서 제거
                item.remove();
              } catch (err) {
                closeModal();
                console.error("[PostDetail] 댓글 삭제 실패", err);
              }
            },
          },
        ],
      });
      return;
    }
  });

  async function loadPostDetail() {
    // TODO: 게시글 상세 API 호출
    try {
      const dummy = {
        post: {
          title: "제목 로딩 예시",
          content: "여기에는 게시글 본문 내용이 들어갑니다.",
          createdAt: "방금 전",
          likeCount: 3,
          viewCount: 42,
          commentCount: 0,
          images: [],
          isMine: true,
        },
        author: {
          name: "테스트 유저",
          profileImageUrl: "/assets/image/default_profile.png",
        },
        comments: [],
      };

      renderPostDetail(dummy);
      renderComments(dummy.comments);
    } catch (e) {
      console.error("[PostDetail] load 실패", e);
      // TODO: 전역 에러 DOM 두고 renderMessage로 노출
    }
  }

  loadPostDetail();
}