import { getPosts } from "../common/api.js";
import { renderUserInput } from "../common/common.js";

const logo = document.querySelector('.logo');
const headerProfile = document.querySelector('header .profile');
const createBtn = document.querySelector('.create');

const postTemplate = document.querySelector('.post');
const listParent = postTemplate?.parentElement;

if (postTemplate) postTemplate.style.display = 'none';

createBtn?.addEventListener('click', () => (window.location.href = '/post/create'));

// 게시글 목록 하나(템플릿 용) 렌더링
function renderPost(wrapper) {
  const { post = {}, author = {} } = wrapper || {};

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
  if (profEl && author.profileImageUrl) profEl.src = author.profileImageUrl;

  node.addEventListener('click', () => {
    const id = node.dataset.postId;
    if (id) window.location.href = `/post/${id}`;
  });

  listParent.appendChild(node);
}

// 게시글 목록 로드
async function loadPosts() {
  try {
    const res = await getPosts(0, 20);

    if (!res.ok) {
      console.error("게시글 목록 불러오기 실패");
      return;
    }

    const data = await res.json();

    let list =
      data?.items ??
      data?.content ??
      data?.data ??
      data?.list ??
      data?.results ??
      (Array.isArray(data) ? data : []);

    if (!Array.isArray(list)) list = [];

    list.forEach(renderPost);
  } catch (e) {
    console.error("게시글 목록 요청 중 오류:", e);
  }
}

loadPosts();
