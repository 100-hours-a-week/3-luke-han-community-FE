import { renderUserInput } from "../../utils/renderUtil.js";

/**
 * 게시글 카드 DOM 노드를 생성하는 컴포넌트
 * - props: { post, author }
 */
export function createPostCard(wrapper) {
  const post = wrapper?.post ?? {};
  const author = wrapper?.author ?? {};

  const {
    id,
    title = "",
    commentCount = 0,
    likeCount = 0,
    viewCount = 0,
    createdAt = "",
  } = post;

  const {
    name: nickname = "",
    profileImageUrl = "/assets/image/default_profile.png",
  } = author;

  // 카드 컨테이너
  const card = document.createElement("div");
  card.className = "card post-card shadow-sm mb-3 post";
  if (id != null) {
    card.dataset.postId = String(id);
  }

  // 카드 내용 템플릿
  card.innerHTML = `
    <div class="card-body">
      <h3 class="h5 mb-2">
        <strong class="post_title"></strong>
      </h3>

      <div class="d-flex flex-wrap align-items-center gap-2 mb-3 post-meta">
        <span class="counts badge text-bg-secondary"></span>
        <span class="counts badge text-bg-secondary"></span>
        <span class="counts badge text-bg-secondary"></span>
        <small class="created_time text-muted ms-auto"></small>
      </div>

      <div class="d-flex align-items-center gap-2">
        <img
          class="profile rounded-circle object-fit-cover"
          src=""
          alt="profile_image"
          style="width:36px;height:36px;"
        >
        <span class="nickname fw-medium"></span>
      </div>
    </div>
  `;

  // 제목 (XSS 방지 위해 renderUserInput 사용)
  const titleEl = card.querySelector(".post_title");
  renderUserInput(titleEl, title);

  // 카운트/시간
  const counts = card.querySelectorAll(".counts");
  if (counts[0]) counts[0].textContent = `댓글 ${commentCount ?? 0}`;
  if (counts[1]) counts[1].textContent = `좋아요 ${likeCount ?? 0}`;
  if (counts[2]) counts[2].textContent = `조회 ${viewCount ?? 0}`;

  const timeEl = card.querySelector(".created_time");
  if (timeEl) timeEl.textContent = createdAt ?? "";

  // 작성자 정보
  const nickEl = card.querySelector(".nickname");
  if (nickEl) nickEl.textContent = nickname ?? "";

  const profEl = card.querySelector("img.profile");
  if (profEl) profEl.src = profileImageUrl || "/assets/image/default_profile.png";

  return card;
}
