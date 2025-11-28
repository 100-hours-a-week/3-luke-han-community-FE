import { renderMessage } from "../../../../utils/alerts.js";
import { getProfileImageUrl } from "../../../../utils/cacheStore.js";
import { registerEnterSubmit } from "../../../../utils/commonHooks.js";
import { renderUserInput } from "../../../../utils/renderUtil.js";
import { createComment, getComments, getPostDetail, likePost, unlikePost } from "../../../common/api.js";
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

  let liked = false;
  let likeCount = 0;
  let commentsThreads = [];
  let totalCommentCount = 0;
  let parentHasNext = false;
  let parentNextCursor = null;

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
  const commentsMoreContainer = document.querySelector(".comments_more_container");
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
      likeCount: lc = 0,
      viewCount: vc = 0,
      commentCount: cc = 0,
      images = [],
      isMine = false,
      liked: likedFlag = false,
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

    if (likeCountEl) likeCountEl.textContent = String(lc ?? 0);
    if (viewCountEl) viewCountEl.textContent = String(vc ?? 0);
    if (commentCountEl) commentCountEl.textContent = String(cc ?? 0);

    liked = !!likedFlag;
    likeCount = lc ?? 0;
    likeBox?.classList.toggle("liked", liked);

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

  function renderComments(threads = []) {
    if (!commentsContainer) return;

    commentsContainer.innerHTML = "";

    if (!threads.length) {
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
    threads.forEach((thread) => {
      const node = createCommentItem(thread);
      fragment.appendChild(node);
    });
    commentsContainer.appendChild(fragment);
  }

  function renderCommentsMore() {
    if (!commentsMoreContainer) return;

    commentsMoreContainer.innerHTML = '';

    if (!parentHasNext) return;

    const button = document.createElement("button");
    button.type = 'button';
    button.className = 'detail-more-comment-btn dm-btn-ghost w-100';
    button.textContent = '댓글 더보기';

    button.addEventListener('click', handleLoadMoreParents);

    commentsMoreContainer.appendChild(button);
  }

  function updateCommentsUI() {
    renderComments(commentsThreads);

    if (commentCountEl) {
      commentCountEl.textContent = String(totalCommentCount ?? 0)
    }

    renderCommentsMore();
  }

  async function handleLoadMoreParents() {
    if (!parentHasNext || parentNextCursor == null) return;

    try {
      const res = await getComments(postId, {
        parentId: 0,
        cursor: parentNextCursor,
        size: 10,
      });

      if (!res.ok) {
        console.error("[PostDetail] 댓글 더보기 실패", res.status);
        return;
      }

      const body = await res.json().catch(() => null);
      const page = body?.data;

      const newParents = (page?.list ?? []).map((c) => ({
        parent: c,
        children: [],
        hasMoreChildren: false,
        childNextCursor: null,
      }));

      commentsThreads = commentsThreads.concat(newParents);

      parentHasNext = !!page?.hasNextCursor;
      parentNextCursor = page?.nextCursor ?? null;

      updateCommentsUI();
    } catch (error) {
      console.error("[PostDetail] 댓글 더보기 렌더링 실패", error);
    }
  }

  likeBox?.addEventListener('click', async () => {
    if (!postId) return;

    try {
      if (liked) {
        const res = await unlikePost(postId);
        if (!res.ok) {
          console.error("[PostDetail] unlikePost failed", res.status);
          return;
        }

        liked = false;
        likeCount = Math.max(0, likeCount - 1);
      } else {
        const res = await likePost(postId);
        if (!res.ok) {
          console.error("[PostDetail] likePost failed", res.status);
          return;
        }

        liked = true;
        likeCount += 1;
      }

      if (likeCountEl) likeCountEl.textContent = String(likeCount);
      likeBox.classList.toggle("liked", liked);
    } catch (error) {
      console.error("[PostDetail] 좋아요 토글 실패", error);
    }
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

    try {
      const body = {
        parentId: 0,
        content: value
      };

      const res = await createComment(postId, body);
      if (!res.ok) {
        console.error("[PostDetail] 댓글 등록 실패", res.status);
        renderMessage(commentError, "댓글 등록에 실패했습니다.", { type: 'error' });
        return;
      }

      const resBody = await res.json().catch(() => null);
      const newCommentId = resBody?.data ?? null;

      commentInput.value = '';

      const userId = Number(localStorage.getItem("userId") || 0);
      const nickname = localStorage.getItem("nickname") || "";
      const profileImageUrl = getProfileImageUrl();

      const time = new Date().toISOString();

      const newParent = {
        id: newCommentId,
        userId,
        name: nickname,
        profileImageUrl,
        comment: value,
        parentId: 0,
        depth: 0,
        createdAt: time,
      };

      const newThread = {
        parent: newParent,
        children: [],
        hasMoreChildren: false,
        childNextCursor: null,
      };

      commentsThreads.push(newThread);
      totalCommentCount += 1;
      updateCommentsUI();
    } catch (error) {
      console.error("[PostDetail] cannot create comment message.", error);
    }
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

      (async () => {
        try {
          const body = {
            parentId: Number(commentId),
            content: value,
          };

          const res = await createComment(postId, body);
          if (!res.ok) {
            console.error("[PostDetail] failed createReply", res.status);
            return;
          }

          const resBody = await res.json().catch(() => null);
          const newCommentId = resBody?.data ?? null;

          replyWrap.classList.add("d-none");
          replyInput.value = "";

          const userId = Number(localStorage.getItem('userId') || 0);
          const nickname = localStorage.getItem('nickname') || '';
          const profileImageUrl = getProfileImageUrl();
          const time = new Date().toISOString();

          const newChild = {
            id: newCommentId,
            userId,
            name: nickname,
            profileImageUrl,
            comment: value,
            parentId: Number(commentId),
            depth: 1,
            createdAt: time,
          };

          const parentIdNum = Number(commentId);
          const thread = commentsThreads.find(
            (t) => t.parent && Number(t.parent.id) === parentIdNum
          );

          if (thread) {
            if (!Array.isArray(thread.children)) {
              thread.children = [];
            }

            thread.children.push(newChild);
          }

          totalCommentCount += 1;
          updateCommentsUI();
        } catch (error) {
          console.error("[PostDetail] failed createReply by error", error);
        }
      }) ();

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
    try {
      const res = await getPostDetail(postId);
      if (!res.ok) {
        console.error("[PostDetail] failed to load post detail", res.status);
        
        if (window.router?.navigate) {
          window.router.navigate('/');
        } else {
          window.location.href = '/';
        }
      }

      const body = await res.json();
      const { data } = body || {};

      if (!data) {
        if (window.router?.navigate) {
          window.router.navigate('/');
        } else {
          window.location.href = '/';
        }
      }

      renderPostDetail(data);

      const commentPage = data.comments;

      commentsThreads = commentPage?.list ?? [];
      parentHasNext = !!commentPage?.hasNextCursor;
      parentNextCursor = commentPage?.nextCursor ?? null;

      totalCommentCount = data.post?.commentCount ?? 0;
      updateCommentsUI();
    } catch (e) {
      console.error("[PostDetail] load 실패", e);
      // TODO: 전역 에러 DOM 두고 renderMessage로 노출
    }
  }

  loadPostDetail();
}