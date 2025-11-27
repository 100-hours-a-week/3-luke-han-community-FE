import { PrimaryButton } from "../../../atoms/button/PrimaryButton.js";
import { TextField } from "../../../atoms/input/TextField.js";

export function PostDetailPageView() {
  return `
    <div class="post-page post-detail-page">

      <!-- 상단: 제목 + 작성자 정보 -->
      <section class="post-detail-header">
        <h1 class="post-detail-title post_title">
          제목 로딩 중...
        </h1>

        <div class="post-detail-meta user_info">
          <div class="post-detail-author">
            <img
              class="profile rounded-circle object-fit-cover"
              src=""
              alt="profile_image"
            >
            <div class="post-detail-author-text">
              <span class="nickname"></span>
              <span class="created_time"></span>
            </div>
          </div>

          <div class="post-detail-actions">
            <button
              class="edit_button detail-secondary-btn d-none"
              type="button"
            >
              수정
            </button>
            <button
              class="delete_button detail-danger-btn d-none"
              type="button"
            >
              삭제
            </button>
          </div>
        </div>
      </section>

      <!-- 본문: 이미지 + 내용 + 카운트/좋아요 -->
      <section class="post-detail-body">
        <div class="post-detail-images post_images"></div>

        <article class="post-detail-content card shadow-sm mb-3">
          <div class="card-body">
            <p class="post_content mb-0">
              내용 로딩 중...
            </p>
          </div>
        </article>

        <div class="detail-stats">
          <button
            type="button"
            class="detail-stat-box detail-like-box"
          >
            <span class="detail-stat-label">좋아요</span>
            <span class="detail-stat-value like_count">0</span>
          </button>

          <div class="detail-stat-box">
            <span class="detail-stat-label">조회</span>
            <span class="detail-stat-value view_count">0</span>
          </div>

          <div class="detail-stat-box">
            <span class="detail-stat-label">댓글</span>
            <span class="detail-stat-value comment_count">0</span>
          </div>
        </div>
      </section>

      <!-- 댓글 입력 + 댓글 리스트 -->
      <section class="post-detail-comments">
        <div class="detail-comment-input card shadow-sm mb-4">
          <div class="card-body">
            ${TextField({
              id: "comment-input",
              label: "댓글을 남겨주세요!",
              type: "text",
              errorId: "comment-error",
              errorText: "댓글을 입력하세요.",
            })}
            <div class="d-flex justify-content-end mt-2">
              ${PrimaryButton({
                id: "comment-submit",
                label: "댓글 등록",
                extraClass: "detail-comment-submit-btn",
              })}
            </div>
          </div>
        </div>

        <div class="comments_section"></div>
      </section>

    </div>
  `;
}
