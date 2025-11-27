import { renderUserInput } from "../../../utils/renderUtil.js";

export function createCommentItem(wrapper) {
  const comment = wrapper?.comment ?? {};
  const author = wrapper?.author ?? {};
  const children = Array.isArray(wrapper?.children) ? wrapper.children : [];

  const {
    id,
    content = '',
    createdAt = '',
  } = comment;

  const {
    name: nickname = '',
    profileImageUrl = '/assets/image/default_profile.png',
  } = author;

  const canEdit = !!wrapper?.canEdit;
  const canDelete = wrapper?.canDelete ?? canEdit;
  
  const root = document.createElement('div');
  root.className = 'comment_item detail-comment-card card shadow-sm mb-3';
  if (id != null) {
    root.dataset.commentId = String(id);
  }

  root.innerHTML = `
    <div class="card-body">
      <div class="user_info d-flex align-items-center gap-2 flex-wrap">
        <img
          class="profile rounded-circle object-fit-cover"
          src="${profileImageUrl || "/assets/image/default_profile.png"}"
          alt="profile_image"
          style="width:32px;height:32px;"
        >
        <span class="nickname fw-semibold">${nickname}</span>
        <span class="created_time text-muted small">${createdAt || ""}</span>

        <div class="ms-auto d-flex gap-2">
          <button
            class="edit_button btn btn-outline-secondary btn-sm ${canEdit ? "" : "d-none"}"
            type="button"
          >
            수정
          </button>
          <button
            class="delete_button btn btn-outline-danger btn-sm ${canDelete ? "" : "d-none"}"
            type="button"
          >
            삭제
          </button>
        </div>
      </div>

      <!-- 일반 모드 텍스트 -->
      <p class="comment_content mb-0 mt-2"></p>

      <!-- 인라인 수정 영역 (처음엔 숨김) -->
      <div class="comment-edit-wrap d-none mt-2">
        <input
          type="text"
          class="comment-edit-input form-control"
        />
        <div class="d-flex justify-content-end gap-2 mt-2">
          <button
            type="button"
            class="comment-edit-cancel btn btn-light btn-sm"
          >
            취소
          </button>
          <button
            type="button"
            class="comment-edit-save btn btn-dark btn-sm"
          >
            저장
          </button>
        </div>
      </div>

      <!-- 답글 버튼 -->
      <button
        class="reply_button btn btn-sm btn-light mt-2"
        type="button"
      >
        답글 달기
      </button>

      <!-- 인라인 답글 입력 (처음엔 숨김) -->
      <div class="reply-input-wrap d-none mt-2">
        <input
          type="text"
          class="reply-input form-control"
          placeholder="답글을 입력하세요."
        />
        <div class="d-flex justify-content-end gap-2 mt-2">
          <button
            type="button"
            class="reply-cancel btn btn-light btn-sm"
          >
            취소
          </button>
          <button
            type="button"
            class="reply-submit btn btn-dark btn-sm"
          >
            등록
          </button>
        </div>
      </div>

      <!-- 자식 댓글(대댓글) 영역 -->
      <div class="children_wrap mt-3"></div>

      <button
        class="load-more-replies btn btn-link btn-sm text-decoration-none p-0 mt-2 d-none"
        type="button"
      >
        댓글 더보기
      </button>
    </div>
  `;

  const contentEl = root.querySelector('.comment_content');
  renderUserInput(contentEl, content);

  const editInput = root.querySelector('.comment-edit-input');
  if (editInput) {
    editInput.value = content;
  }

  const childrenWrap = root.querySelector('.children_wrap');
  children.forEach((childWrapper) => {
    const childNode = createCommentItem(childWrapper);
    childrenWrap.appendChild(childNode);
  });

  return root;
}