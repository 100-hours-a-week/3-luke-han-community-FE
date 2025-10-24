import { getPostDetail, createComment } from "../common/api.js";

// 상세 영역
const titleEl = document.querySelector('.post_title');
const authorBox = document.querySelector('.title .user_info');
const authorImg = authorBox?.querySelector('img.profile');
const authorNameEl = authorBox?.querySelector('.nickname');
const createdTimeEl = authorBox?.querySelector('.created_time');

const editBtn = document.querySelector('.title .edit_button');
const deleteBtn = document.querySelector('.title .delete_button');

const imagesWrap = document.querySelector('.post_images');
const postContent = document.querySelector('.post_content');

const likeBox = document.querySelector('.like_box');
const likeCountEl = document.querySelector('.like_count');
const viewCountEl = document.querySelector('.view_count');
const commentCountEl = document.querySelector('.comment_count');

// 댓글 입력
const commentInput = document.querySelector('.comment_input');
const commentSubmitBtn = document.querySelector('.comment_button');

// 댓글 템플릿/컨테이너
const commentsContainer = document.querySelector('.comments_section');
const commentTemplate = commentsContainer?.firstElementChild || null;
const commentsParent = commentTemplate?.parentElement;
if (commentTemplate) commentTemplate.style.display = 'none';

// 경로에서 postId 추출 (/post/{id})
function getPostId() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const idx = parts.indexOf('post');
  if (idx > -1 && parts[idx + 1]) return parts[idx + 1];
  return null;
}
const POST_ID = getPostId();
console.log('POST_ID:', POST_ID);

function renderEmptyComment() {
  if (!commentsParent) return;

  const existed = commentsContainer.querySelector('.empty-state');
  if (existed) return;

  const empty = document.createElement('div');
  empty.className = 'empty-state text-center text-muted py-3';
  empty.innerHTML = `
    <div class="d-inline-block">
      <div class="mb-2">댓글이 없습니다.</div>
      <div class="small">첫 글을 작성해 보세요!</div>
    </div>`;
  commentsParent.appendChild(empty);
}

function renderOneComment(element) {
  if (!commentTemplate || !commentsParent) return;

  const node = commentTemplate.cloneNode(true);
  node.style.display = '';

  const ui = node.querySelector('.user_info');
  const img = ui?.querySelector('img.profile');
  const nick = ui?.querySelector('.nickname');
  const time = ui?.querySelector('.created_time');
  const content = ui?.querySelector('.comment_content');

  if (img && element?.profileImageUrl) img.src = element.profileImageUrl;
  if (nick) nick.textContent = element?.name ?? '';
  if (time) time.textContent = element?.createdAt ?? '';
  if (content) content.textContent = element?.comment ?? '';

  // TODO: 본인만 수정/삭제 보이게 (me.id === element.userId)
  const edit = node.querySelector('.edit_button');
  const del = node.querySelector('.delete_button');
  if (edit) edit.style.display = 'none';
  if (del) del.style.display = 'none';

  commentsParent.appendChild(node);
}

// 댓글 카드 렌더 (CommentDto)
function renderCommentItem(item) {
  console.log('item: ', item);
  if (!commentsContainer) return;

  const arr = Array.isArray(item) ? item : [];

  const existedEmpty = commentsContainer.querySelector('.empty-state');
  if (existedEmpty) existedEmpty.remove();

  if (arr.length === 0) {
    renderEmptyComment();
    return;
  }

  arr.forEach((element) => {
    renderOneComment(element);
  });
}

function renderImages(urls = []) {
  if (!imagesWrap) return;
  imagesWrap.innerHTML = '';

  urls.forEach((url) => {
    if (!url) return;
    const col = document.createElement('div');
    col.className = 'col-12';
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'post_image';
    img.className = 'img-fluid';
    col.appendChild(img);
    imagesWrap.appendChild(col);
  });
}

// 상세 렌더 (PostDetailWrapper: { author, post, comments })
function renderDetail(wrapper) {
  console.log('renderDetail 호출:', wrapper);
  const author = wrapper?.author || {};
  const post = wrapper?.post || {};
  const comments = Array.isArray(wrapper?.comments) ? wrapper.comments : [];

  // 제목/작성자/시간
  if (titleEl) titleEl.textContent = post.title ?? '';
  if (authorImg) authorImg.src = author.profileImageUrl || '/assets/image/default_profile.png';
  if (authorNameEl) authorNameEl.textContent = author.name ?? '';
  if (createdTimeEl) createdTimeEl.textContent = post.createdAt ?? '';

  const images = Array.isArray(post.images) ? post.images : [];
  renderImages(images);

  console.log('post:', post);
  // 본문/카운트
  if (postContent) postContent.textContent = post.content ?? '';

  const likeCount = Number(post.likeCount ?? 0);
  const viewCount = Number(post.viewCount ?? 0);
  const commentCount = Number(post.commentCount ?? 0);

  if (likeCountEl) likeCountEl.textContent = String(likeCount);
  if (viewCountEl) viewCountEl.textContent = String(viewCount);
  if (commentCountEl) commentCountEl.textContent = String(commentCount);

  // TODO: liked 여부를 백엔드에서 내려준다면 여기에 반영 (지금은 없으니 false 유지)
  liked = false;
  toggleLike();

  // TODO: 본인일 때만 수정/삭제 보이기 (me.id === author.id)
  if (editBtn) editBtn.classList.remove('invisible');
  if (deleteBtn) deleteBtn.classList.remove('invisible');

  // 댓글 렌더
  renderCommentItem(comments);
}

// 댓글 등록
async function submitComment() {
  if (!POST_ID) return;
  const value = (commentInput?.value || '').trim();
  if (!value) return;

  try {
    const res = await createComment(POST_ID, value); // body: { comment: value }
    if (!res.ok) return;

    // 서버는 생성된 commentId(int)를 리턴 → 간단히 목록을 다시 긁어오거나, 임시로 페이지 새로고침
    commentInput.value = '';
    // 가장 단순한 동기화
    window.location.reload();
  } catch (e) {
    console.error('댓글 등록 실패', e);
  }
}

let liked = false;

function toggleLike() {
  if (!likeCountEl) return;

  let n = parseInt(likeCountEl.textContent || '0', 10);
  n = isNaN(n) ? 0 : n;

  liked = !liked;
  n = Math.max(0, n + (liked ? 1 : -1));

  likeCountEl.textContent = String(n);
}

// 이벤트 바인딩
likeBox?.addEventListener('click', toggleLike);

// 댓글 등록 버튼
commentSubmitBtn?.addEventListener('click', submitComment);


// TODO: 삭제 모달 띄우기

// 초기 로드
async function init() {
  if (!POST_ID) return;
  try {
    console.log('게시글 상세 조회:', POST_ID);
    const res = await getPostDetail(POST_ID);
    console.log('상세 조회 응답:', res);
    if (!res.ok) return;
    const data = await res.json(); // PostDetailWrapper
    console.log('상세 조회 데이터:', data);
    renderDetail(data);
  } catch (e) {
    console.error('상세 조회 실패', e);
  }
};

init();
