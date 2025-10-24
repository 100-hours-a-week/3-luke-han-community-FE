import { getPosts } from "../common/api.js";
import { renderUserInput } from "../common/common.js";

const createBtn = document.querySelector('.create-btn');
console.log(createBtn ? 'true' : 'false');

const postTemplate = document.querySelector('.post');
const listParent = postTemplate?.parentElement;

if (postTemplate) postTemplate.style.display = 'none';

createBtn?.addEventListener('click', () => {
  console.log('버튼 클릭');
  window.location.href = '/post/create';
});

// 게시글이 없을 때 렌더링
function renderEmpty() {
  // 이전에 그려둔 empty가 있으면 중복 방지
  if (listParent.querySelector('.empty-state')) return;

  const empty = document.createElement('div');
  empty.className = 'empty-state text-center text-muted py-5';
  empty.innerHTML = `
    <div class="d-inline-block">
      <div class="mb-2">게시글이 없습니다.</div>
      <div class="small">첫 글을 작성해 보세요!</div>
    </div>`;
  listParent.appendChild(empty);
}

// 게시글 목록 하나(템플릿 용) 렌더링
function renderPost(wrapper) {
  console.log('renderPost 호출');
  const post = wrapper?.post ?? {};
  const author = wrapper?.author ?? {};
  console.log('렌더링 게시글:', post);
  console.log('작성자:', author);

  const node = postTemplate.cloneNode(true);
  node.style.display = '';
  if (post.id != null) node.dataset.postId = String(post.id);

  const titleEl = node.querySelector('.post_title');
  renderUserInput(titleEl, post.title ?? '');

  const counts = node.querySelectorAll('.counts');
  if (counts[0]) counts[0].textContent = `댓글 ${post.commentCount ?? 0}`;
  if (counts[1]) counts[1].textContent = `좋아요 ${post.likeCount ?? 0}`;
  if (counts[2]) counts[2].textContent = `조회 ${post.viewCount ?? 0}`;

  const timeEl = node.querySelector('.created_time');
  if (timeEl) timeEl.textContent = post.createdAt ?? '';

  const nickEl = node.querySelector('.nickname');
  if (nickEl) nickEl.textContent = author.name ?? '';

  const profEl = node.querySelector('img.profile');
  if (profEl) profEl.src = author.profileImageUrl || '/assets/image/default_profile.png';

  node.addEventListener('click', () => {
    const id = node.dataset.postId;
    if (id) window.location.href = `/post/${id}`;
  });

  listParent.appendChild(node);
}

let nextCursor = 0;
let hasNextCursor = true;

// 게시글 목록 로드
async function loadPosts(cursor = nextCursor, size = 10) {
  try {
    const res = await getPosts(0, 20);
    console.log("게시글 목록 응답:", res);

    if (res.status == 401) {
      window.location.href = '/login';
      return;
    }

    if (res.status == 204) {
      console.log("res.status 204 - 게시글 없음");
      hasNextCursor = false;
      renderEmpty();
      return;
    }

    if (!res.ok) {
      console.error("게시글 목록 요청 실패:", res.status);
      return;
    }

    const data = await res.json();
    console.log("게시글 목록 데이터:", data);
    console.log("data.post:", data.list);

    const list = Array.isArray(data.list) ? data.list : [];
    nextCursor = data?.nextCursor ?? null;
    hasNextCursor = Boolean(data?.hasNextCursor);
    console.log(list);

    list.forEach(post => renderPost(post));
  } catch (e) {
    console.error("게시글 목록 요청 중 오류:", e);
  }
}

loadPosts();
