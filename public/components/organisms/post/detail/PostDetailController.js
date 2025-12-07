import { renderMessage } from "../../../../utils/alerts.js";
import { getProfileImageUrl } from "../../../../utils/cacheStore.js";
import { registerEnterSubmit } from "../../../../utils/commonHooks.js";
import { renderUserInput } from "../../../../utils/renderUtil.js";
import { createCommentItem } from "../../../molecules/comment/CommentItem.js";
import { configureHeader } from "../../../molecules/header/header.js";
import { closeModal, openModal } from "../../../molecules/modal/ModalController.js";
import { 
  createComment, 
  getComments, 
  getPostDetail, 
  likePost, 
  unlikePost,
  updateComment,
  deleteComment,
  deletePost,
 } from "../../../common/api.js";

let parentCommentSubmitting = false;

function getPostIdFromPath(pathname = window.location.pathname) {
  const match = /^\/post\/(\d+)$/.exec(pathname);
  if (!match) return null;
  return match[1];
}

export function initPostDetailPage() {
  const postId = getPostIdFromPath();

  let likeCount = 0;
  let commentsThreads = [];
  let totalCommentCount = 0;
  let parentHasNext = false;
  let parentNextCursor = null;

  let likeRequestInFlight = false;

  configureHeader?.({
    title: "Damul Board",
    showBack: true,
    showProfile: true,
  });

  const titleEl = document.querySelector(".post-detail-title.post_title");
  const nicknameEl = document.querySelector(".post-detail-meta .nickname");
  const createdTimeEl = document.querySelector(".post-detail-meta .created_time");
  const profileImg = document.querySelector(".post-detail-meta .profile");
  const pageErrorEl = document.getElementById("post-detail-error");

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
      liked: likedFlag = false,
    } = post;

    const {
      id: authorId,
      name: nickname = '',
      profileImageKey = "/assets/image/default_profile.png",
    } = author;

    const currentUserId = Number(localStorage.getItem("userId") || 0);
    const isMine = authorId != null && Number(authorId) === currentUserId;

    if (titleEl) renderUserInput(titleEl, title);
    if (contentEl) renderUserInput(contentEl, content);

    if (nicknameEl) nicknameEl.textContent = nickname;
    if (createdTimeEl) createdTimeEl.textContent = createdAt || "";
    if (profileImg) profileImg.src = profileImageKey || "/assets/image/default_profile.png";

    if (likeCountEl) likeCountEl.textContent = String(lc ?? 0);
    if (viewCountEl) viewCountEl.textContent = String(vc ?? 0);
    if (commentCountEl) commentCountEl.textContent = String(cc ?? 0);

    likeCount = lc ?? 0;
    if (likeBox) {
      likeBox.classList.toggle("liked", !!likedFlag);
    }

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

  function updateCommentContentInThreads(commentId, newValue) {
    const idNum = Number(commentId);

    // 1) 부모 댓글에서 찾기
    for (const thread of commentsThreads) {
      if (thread.parent && Number(thread.parent.id) === idNum) {
        thread.parent.comment = newValue;
        return;
      }
    }

    // 2) 자식(대댓글)에서 찾기
    for (const thread of commentsThreads) {
      if (!Array.isArray(thread.children)) continue;

      const target = thread.children.find(
        (child) => Number(child.id) === idNum
      );

      if (target) {
        target.comment = newValue;
        return;
      }
    }
  }

  function removeCommentFromThreads(commentId) {
    const idNum = Number(commentId);

    // 1) 부모 댓글인지 먼저 확인
    const parentIndex = commentsThreads.findIndex(
      (thread) => thread.parent && Number(thread.parent.id) === idNum
    );

    if (parentIndex !== -1) {
      commentsThreads.splice(parentIndex, 1);
      return;
    }

    // 2) 자식 댓글 검색
    for (const thread of commentsThreads) {
      if (!Array.isArray(thread.children)) continue;

      const beforeLen = thread.children.length;
      thread.children = thread.children.filter(
        (child) => Number(child.id) !== idNum
      );

      if (thread.children.length !== beforeLen) {
        // 하나라도 삭제됐으면 끝
        return;
      }
    }
  }

  function updateCommentsUI() {
    renderComments(commentsThreads);

    if (commentCountEl) {
      commentCountEl.textContent = String(totalCommentCount ?? 0)
    }

    renderCommentsMore();
  }

  async function handleLoadMoreParents() {
    console.log("[PostDetail] handleLoadMoreParents 호출", {
      parentHasNext,
      parentNextCursor,
    });

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
    if (likeRequestInFlight) {
      console.log("[PostDetail] likeRequestInFlight=true, 클릭 무시");
      return;
    }

    likeRequestInFlight = true;

    try {
      const currentlyLiked = likeBox.classList.contains('liked');
      console.log("[PostDetail] 클릭 직전 상태", {
        currentlyLiked,
        likeCount,
        classList: likeBox.className,
      });

      if (currentlyLiked) {
        // 이미 좋아요 상태 → 취소 요청
        const res = await unlikePost(postId);
        console.log("[PostDetail] unlike 응답", res.status, res.ok);
        if (!res.ok) {
          console.error("[PostDetail] unlikePost failed", res.status);
          return;
        }

        likeCount = Math.max(0, likeCount - 1);
        likeBox.classList.remove("liked");
      } else {
        // 아직 안 눌린 상태 → 좋아요 요청
        const res = await likePost(postId);
        console.log("[PostDetail] like 응답", res.status, res.ok);

        if (!res.ok) {
          console.error("[PostDetail] likePost failed", res.status);
          return;
        }

        likeCount += 1;
        likeBox.classList.add("liked");
      }

      if (likeCountEl) {
        likeCountEl.textContent = String(likeCount);
      }

      console.log("[PostDetail] 토글 이후 상태", {
        likeCount,
        classList: likeBox.className,
      });
    } catch (error) {
      console.error("[PostDetail] 좋아요 토글 실패", error);
    } finally {
      likeRequestInFlight = false;
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
              const res = await deletePost(postId);
              if (!res.ok) {
                console.error("[PostDetail] 게시글 삭제 실패", res.status);
                closeModal();
                return;
              }

              closeModal();
              if (window.router?.navigate) {
                window.router.navigate("/");
              } else {
                window.location.href = "/";
              }
            } catch (e) {
              closeModal();
              console.error("[PostDetail] 게시글 삭제 중 오류", e);
            }
          },
        },
      ],
    });
  });

  commentSubmit?.addEventListener('click', async (e) => {
    e.preventDefault();

    if (parentCommentSubmitting) {
      console.log("[PostDetail] 이미 부모 댓글 요청 진행 중, 무시");
      return;
    }

    const value = (commentInput?.value || "").trim();

    if (!value) {
      renderMessage(commentError, "댓글을 입력하세요.", { type: "error" });
      return;
    }

    parentCommentSubmitting = true;
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
      const profileImageUrl = await getProfileImageUrl();

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
    } finally {
      parentCommentSubmitting = false;
    }
  });

  registerEnterSubmit(commentInput, () => commentSubmit?.click());

  console.log("[PostDetailPage] initPostDetailPage 호출");
  commentsContainer?.addEventListener('click', (e) => {
    if (e.target.matches('.load-more-replies')) {
      const btn = e.target;
      const parentId = Number(btn.dataset.parentId || 0);
      const childNextCursorRaw = btn.dataset.childNextCursor;
      const childNextCursor = childNextCursorRaw ? Number(childNextCursorRaw) : 0;

      console.log("[PostDetail] load-more-replies 클릭", {
        parentId,
        childNextCursor,
      });

      if (!parentId) {
        console.warn("[PostDetail] load-more-replies parentId 없음, 무시");
        return;
      }

      (async () => {
        try {
          const res = await getComments(postId, {
            parentId,
            cursor: childNextCursor,
            size: 10,
          });

          if (!res.ok) {
            console.error("[PostDetail] 대댓글 더보기 실패", res.status);
            return;
          }

          const body = await res.json().catch(() => null);
          const page = body?.data;

          const newChildren = page?.list ?? [];
          const hasMore = !!page?.hasNextCursor;
          const nextCursor = page?.nextCursor ?? null;

          // 상태 업데이트: commentsThreads에서 해당 parent thread 찾기
          const thread = commentsThreads.find(
            (t) => t.parent && Number(t.parent.id) === parentId
          );

          if (thread) {
            if (!Array.isArray(thread.children)) {
              thread.children = [];
            }
            thread.children = thread.children.concat(newChildren);
            thread.hasMoreChildren = hasMore;
            thread.childNextCursor = nextCursor;
          }

          // UI 다시 그리기
          updateCommentsUI();
        } catch (err) {
          console.error("[PostDetail] 대댓글 더보기 처리 중 오류", err);
        }
      })();

      return;
    }

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

      const submitBtn = e.target;
      if (submitBtn.dataset.submitting === "true") {
        console.log("[PostDetail] 이미 답글 요청 진행 중, 무시");
        return;
      }
      submitBtn.dataset.submitting = "true";

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
          const profileImageUrl = await getProfileImageUrl();
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
        } finally {
          submitBtn.dataset.submitting = "false";
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

      (async () => {
        try {
          const res = await updateComment(postId, commentId, newValue);

          if (!res.ok) {
            console.error("[PostDetail] 댓글 수정 실패", res.status);
            // 필요하면 여기서 renderMessage로 에러 표시
            return;
          }

          // 상태 동기화
          updateCommentContentInThreads(commentId, newValue);

          // DOM 반영
          renderUserInput(contentEl, newValue);

          editWrap.classList.add("d-none");
          contentEl.classList.remove("d-none");
        } catch (err) {
          console.error("[PostDetail] 댓글 수정 중 오류", err);
        }
      })();
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
                const res = await deleteComment(postId, commentId);

                if (!res.ok) {
                  console.error("[PostDetail] 댓글 삭제 실패", res.status);
                  closeModal();
                  return;
                }

                // 상태 업데이트
                removeCommentFromThreads(commentId);
                totalCommentCount = Math.max(0, (totalCommentCount || 0) - 1);

                // UI 갱신
                updateCommentsUI();

                closeModal();
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

        if (pageErrorEl) {
          renderMessage(
            pageErrorEl,
            "게시글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.",
            { type: "error" }
          );
        }
        
        if (window.router?.navigate) {
          window.router.navigate('/');
        } else {
          window.location.href = '/';
        }

        return;
      }

      const body = await res.json();
      const { data } = body || {};

      if (!data) {
        if (pageErrorEl) {
          renderMessage(
            pageErrorEl,
            "게시글 정보를 찾을 수 없습니다.",
            { type: "error" }
          );
        }

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
      
      if (pageErrorEl) {
        renderMessage(
          pageErrorEl,
          "게시글을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
          { type: "error" }
        );
      }
    }
  }

  loadPostDetail();
}