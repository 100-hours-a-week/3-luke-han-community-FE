import { getPostDetail, createComment, getComments, likePost, unlikePost } from "../common/api.js";

/* =========================================
 * 공통/상태
 * ========================================= */

// DOM 캐싱 - 게시글 영역
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

// DOM 캐싱 - 댓글 입력(최상위)
const commentInput = document.querySelector('.comment_input');
const commentSubmitBtn = document.querySelector('.comment_button');

// DOM 캐싱 - 댓글 리스트 영역
const commentsContainer = document.querySelector('.comments_section');
const commentTemplate = commentsContainer?.querySelector('.comment_item') || null;
const commentsParent = commentTemplate?.parentElement;
if (commentTemplate) {
  commentTemplate.style.display = 'none';
}

// 상태
let liked = false;
let likeCountState = 0;

// post id
function getPostId() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const idx = parts.indexOf('post');
  if (idx > -1 && parts[idx + 1]) return parts[idx + 1];
  return null;
}
const POST_ID = getPostId();

// parentId별 커서 기반 페이지네이션 상태
const commentPaginationState = {}; // { [parentId]: { cursor, hasNext } }

/* =========================================
 * 게시글 렌더 관련 함수들
 * ========================================= */

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

function syncLikeButtonUI() {
  if (!likeBox || !likeCountEl) return;

  // 숫자 갱신
  likeCountEl.textContent = String(likeCountState);

  // 요소 찾기
  const likeLabelEl = likeBox.querySelector('.like_label');
  const likeNumberEl = likeCountEl;

  if (liked) {
    // 눌린 상태: 빨간색 + 굵기 강조
    if (likeLabelEl) {
      likeLabelEl.classList.remove('text-muted');       // 기존 흐릿한 회색 제거
      likeLabelEl.classList.add('text-danger', 'fw-bold');
    }
    if (likeNumberEl) {
      likeNumberEl.classList.add('text-danger');         // 숫자도 빨간색
      likeNumberEl.classList.add('fw-bold');             // 이미 fw-bold라면 중복은 무해
    }

    likeBox.classList.remove('border', 'border-dark');   // 정리용
    likeBox.classList.add('border', 'border-danger', 'shadow'); 
    // shadow는 눌렀을 때만 살짝 강조 효과

  } else {
    // 안 눌린 상태: 기본 스타일 복구
    if (likeLabelEl) {
      likeLabelEl.classList.remove('text-danger', 'fw-bold');
      likeLabelEl.classList.add('text-muted'); // 다시 연한 글씨
    }
    if (likeNumberEl) {
      likeNumberEl.classList.remove('text-danger');
    }

    // 카드 테두리 & 그림자 복구
    likeBox.classList.remove('border-danger', 'shadow');
    likeBox.classList.add('border'); // 기본 border (회색 테두리)
  }
}


async function handleLikeClick() {
  if (!POST_ID) return;

  // 현재 상태에 따라 like / unlike 결정
  if (liked) {
    // 이미 좋아요 상태였다면 → 취소 요청
    try {
      const res = await unlikePost(POST_ID);
      if (!res.ok) {
        console.error('unlike 실패 status:', res.status);
        return;
      }

      // 성공 → 상태 업데이트
      liked = false;
      likeCountState = Math.max(0, likeCountState - 1);

      // UI 반영
      syncLikeButtonUI();
    } catch (e) {
      console.error('unlike 중 예외:', e);
    }
  } else {
    // 아직 안 눌렀다면 → 좋아요 요청
    try {
      const res = await likePost(POST_ID);
      if (!res.ok) {
        console.error('like 실패 status:', res.status);
        return;
      }

      // 성공 → 상태 업데이트
      liked = true;
      likeCountState = likeCountState + 1;

      // UI 반영
      syncLikeButtonUI();
    } catch (e) {
      console.error('like 중 예외:', e);
    }
  }
}

function renderDetail(wrapper) {
  console.log('renderDetail', wrapper);
  const author = wrapper?.author || {};
  const post = wrapper?.post || {};
  const comments = Array.isArray(wrapper?.comments) ? wrapper.comments : [];

  // 제목/작성자/시간
  if (titleEl) titleEl.textContent = post.title ?? '';
  if (authorImg) authorImg.src = author.profileImageUrl || '/assets/image/default_profile.png';
  if (authorNameEl) authorNameEl.textContent = author.name ?? '';
  if (createdTimeEl) createdTimeEl.textContent = post.createdAt ?? '';

  // 이미지
  const images = Array.isArray(post.images) ? post.images : [];
  renderImages(images);

  // 본문
  if (postContent) postContent.textContent = post.content ?? '';

  // 카운트
  likeCountState = Number(post.likeCount ?? 0);
  const viewCount = Number(post.viewCount ?? 0);
  const cCount    = Number(post.commentCount ?? 0);

  if (likeCountEl) likeCountEl.textContent = String(likeCountState);
  if (viewCountEl) viewCountEl.textContent = String(viewCount);
  if (commentCountEl) commentCountEl.textContent = String(cCount);

  // 좋아요 초기화
  liked = !!post.liked;
  syncLikeButtonUI();

  // 수정/삭제 버튼 노출 조건 (TODO: 현재는 무조건 노출)
  if (editBtn) editBtn.classList.remove('invisible');
  if (deleteBtn) deleteBtn.classList.remove('invisible');

  // 초기 댓글 렌더
  renderCommentList(comments);

  // (추후) hasNextCursor 정보를 postDetail에서 내려준다면
  // 각 루트 댓글별로 load-more-replies 버튼을 on/off 할 수 있음
}

/* =========================================
 * 댓글 렌더 & 동작 관련 함수들
 * ========================================= */

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

/**
 * 개별 댓글 카드에 이벤트(답글 달기 버튼, 더보기 버튼)를 붙인다.
 */
function attachCommentActions(node, commentId) {
  // 답글 달기 버튼
  const replyBtn = node.querySelector('.reply_button');
  if (replyBtn) {
    replyBtn.addEventListener('click', () => {
      openReplyInput(node, commentId); // parentId = commentId
    });
  }

  // 더보기 버튼 (초기엔 d-none일 수 있음)
  const moreBtn = node.querySelector('.load-more-replies');
  if (moreBtn) {
    moreBtn.addEventListener('click', async () => {
      const childrenWrap = node.querySelector('.children_wrap');
      await loadMoreComments(commentId, childrenWrap);
    });
  }
}

/**
 * 서버에서 받은 CommentDto 하나 -> DOM node 생성
 * element: {id, userId, name, profileImageUrl, comment, parentId, depth, createdAt}
 */
function buildCommentNode(element) {
  if (!commentTemplate) return null;
  const node = commentTemplate.cloneNode(true);
  node.style.display = '';

  // 기본 정보 주입
  const ui = node.querySelector('.user_info');
  const img = ui?.querySelector('img.profile');
  const nick = ui?.querySelector('.nickname');
  const time = ui?.querySelector('.created_time');
  const content = node.querySelector('.comment_content');

  if (img) {
    img.src = element?.profileImageUrl || '/assets/image/default_profile.png';
  }
  if (nick) nick.textContent = element?.name ?? '';
  if (time) time.textContent = element?.createdAt ?? '';
  if (content) content.textContent = element?.comment ?? '';

  // 수정/삭제 권한 노출
  const edit = node.querySelector('.edit_button');
  const del = node.querySelector('.delete_button');
  const myUserId = Number(localStorage.getItem('userId')); // 현재 로그인 유저
  if (myUserId && myUserId === element?.userId) {
    if (edit) edit.classList.remove('d-none');
    if (del)  del.classList.remove('d-none');
  } else {
    if (edit) edit.classList.add('d-none');
    if (del)  del.classList.add('d-none');
  }

  // dataset으로 메타 저장
  node.dataset.commentId = element.id;
  node.dataset.parentId = element.parentId;
  node.dataset.depth = element.depth;

  // depth > 0 인 경우 시각적 들여쓰기 보조
  if (element.depth > 0) {
    node.classList.add('reply-comment');
    // 얘 자체가 자식이면, card 전체에 약간의 추가 여백을 줄 수도 있음
    node.classList.add('ms-3'); // Bootstrap margin-start
  }

  // reply_button / load-more-replies 이벤트 연결
  attachCommentActions(node, element.id);

  return node;
}

/**
 * node를 DOM에 실제로 삽입.
 * parentId=0 → 최상위 / 그 외 → 부모의 .children_wrap 안
 */
function insertCommentNode(node, parentId) {
  if (!node) return;
  if (parentId === 0) {
    // 최상위
    const emptyState = commentsContainer.querySelector('.empty-state');
    if (emptyState) emptyState.remove();
    commentsParent.appendChild(node);
    return;
  }

  // 대댓글
  const parentNode = commentsContainer.querySelector(`[data-comment-id="${parentId}"]`);
  if (!parentNode) {
    // 부모가 없으면 fallback
    commentsParent.appendChild(node);
    return;
  }
  const childrenWrap = parentNode.querySelector('.children_wrap');
  if (childrenWrap) {
    childrenWrap.appendChild(node);
  } else {
    parentNode.appendChild(node);
  }
}

/**
 * 배열 렌더
 */
function renderCommentList(arr) {
  if (!Array.isArray(arr)) return;

  const existedEmpty = commentsContainer.querySelector('.empty-state');
  if (existedEmpty) existedEmpty.remove();

  if (arr.length === 0) {
    renderEmptyComment();
    return;
  }

  arr.forEach((element) => {
    const node = buildCommentNode(element);
    insertCommentNode(node, element.parentId);
  });
}

/**
 * 대댓글 입력 UI를 특정 댓글 카드 아래에 생성
 */
function openReplyInput(parentNode, parentId) {
  // 이미 열려있으면 중복 방지
  if (parentNode.querySelector('.reply-input-row')) return;

  const wrap = document.createElement('div');
  wrap.className = 'reply-input-row mt-2 ms-4';

  wrap.innerHTML = `
    <div class="card shadow-sm">
      <div class="card-body">
        <input type="text" class="form-control reply_input" placeholder="답글을 입력하세요" />
        <div class="d-flex justify-content-end mt-2">
          <button class="btn btn-dark btn-sm reply_submit_btn">등록</button>
        </div>
      </div>
    </div>
  `;

  parentNode.appendChild(wrap);

  const replyInputEl = wrap.querySelector('.reply_input');
  const replySubmitBtn = wrap.querySelector('.reply_submit_btn');
  replySubmitBtn.addEventListener('click', async () => {
    const text = (replyInputEl.value || '').trim();
    if (!text) return;

    await submitComment(parentId, text); // parentId != 0 → 대댓글

    replyInputEl.value = '';
    wrap.remove();
  });
}

/**
 * 방금 작성한 댓글을 낙관적으로(optimistic) DOM에 반영
 * parentId=0 → 최상위 / else → 대댓글
 * createdAt은 일단 '방금 전'
 */
function insertNewCommentLocal({ commentText, parentId, createdAt }) {
  const nickname = localStorage.getItem('nickname') || '나';
  const profileImageUrl = localStorage.getItem('profile_image') || '/assets/image/default_profile.png';
  const userId = Number(localStorage.getItem('userId')) || 0;

  const fakeComment = {
    id: Date.now(), // 임시 키
    userId,
    name: nickname,
    profileImageUrl,
    comment: commentText,
    parentId: parentId,
    depth: parentId === 0 ? 0 : 1,
    createdAt: createdAt || '방금 전',
  };

  const node = buildCommentNode(fakeComment);
  insertCommentNode(node, parentId);

  // 댓글 수 UI 증가
  if (commentCountEl) {
    let c = parseInt(commentCountEl.textContent || '0', 10);
    c = isNaN(c) ? 0 : c + 1;
    commentCountEl.textContent = String(c);
  }
}

/**
 * 서버에서 댓글 더 불러오기 (대댓글 페이징 포함)
 * parentId 기준
 */
async function loadMoreComments(parentId, targetWrapEl) {
  if (!POST_ID) return;

  const state = commentPaginationState[parentId] || { cursor: 0, hasNext: true };
  if (!state.hasNext) return;

  try {
    const res = await getComments(POST_ID, {
      parentId,
      cursor: state.cursor,
      size: 20,
    });
    if (!res.ok) {
      console.error('대댓글 더보기 실패: status', res.status);
      return;
    }
    const data = await res.json(); // CursorPage<CommentDto>
    const list = Array.isArray(data?.list) ? data.list : [];

    list.forEach((c) => {
      const node = buildCommentNode(c);
      if (targetWrapEl) {
        targetWrapEl.appendChild(node);
      } else {
        insertCommentNode(node, parentId);
      }
    });

    // 페이지네이션 갱신
    commentPaginationState[parentId] = {
      cursor: data?.nextCursor ?? 0,
      hasNext: !!data?.hasNextCursor,
    };

    if (!commentPaginationState[parentId].hasNext) {
      // 더 이상 없으면 버튼 숨김
      const parentNode = commentsContainer.querySelector(`[data-comment-id="${parentId}"]`);
      const moreBtn = parentNode?.querySelector('.load-more-replies');
      if (moreBtn) {
        moreBtn.classList.add('d-none');
      }
    } else {
      // 아직 있으면 버튼 보여주기
      const parentNode = commentsContainer.querySelector(`[data-comment-id="${parentId}"]`);
      const moreBtn = parentNode?.querySelector('.load-more-replies');
      if (moreBtn) {
        moreBtn.classList.remove('d-none');
      }
    }

  } catch (e) {
    console.error('대댓글 더보기 예외', e);
  }
}

/**
 * 댓글 등록
 * parentId = 0 이면 최상위 댓글
 * parentId != 0 이면 해당 parentId를 부모로 가지는 대댓글
 *
 * @param {number} parentId
 * @param {string} textFromChildInput (대댓글 작성 시 reply-input-row에서 넘어오는 값)
 */
async function submitComment(parentId = 0, textFromChildInput) {
  if (!POST_ID) return;

  // 1) 어떤 입력창에서 가져올지 고름
  const contentText = parentId === 0
    ? (commentInput?.value || '').trim()
    : (textFromChildInput || '').trim();

  if (!contentText) return;

  try {
    // 2) 서버 호출 - parentId까지 전달
    const res = await createComment(POST_ID, contentText, parentId);
    if (!res.ok) {
      console.error('댓글 등록 실패: status', res.status);
      return;
    }

    // (선택) commentId를 응답에서 뽑을 수도 있음
    // const newCommentId = await res.json();

    // 3) optimistic UI 반영
    insertNewCommentLocal({
      commentText: contentText,
      parentId,
      createdAt: '방금 전',
    });

    // 4) 최상위 댓글창 비우기
    if (parentId === 0 && commentInput) {
      commentInput.value = '';
    }

  } catch (e) {
    console.error('댓글 등록 중 예외', e);
  }
}

/* =========================================
 * 이벤트 & 초기화
 * ========================================= */

likeBox?.addEventListener('click', () => {
  handleLikeClick();
});

commentSubmitBtn?.addEventListener('click', () => {
  submitComment(0); // 최상위 댓글 작성
});

editBtn?.addEventListener('click', () => {
  window.location.href = `/post/${POST_ID}/edit`;
});

async function init() {
  if (!POST_ID) return;
  try {
    const res = await getPostDetail(POST_ID);
    if (!res.ok) return;
    const data = await res.json();
    console.log('상세 조회 데이터:', data);

    renderDetail(data);

    // TODO:
    // 만약 data 안에 각 parent 댓글별 nextCursor/hasNextCursor 정보가 있다면
    // commentPaginationState[commentId] 세팅하고
    // 해당 comment 카드의 .load-more-replies 버튼에 d-none 제거해주는 로직을
    // 여기서 돌리면 된다.

  } catch (e) {
    console.error('상세 조회 실패', e);
  }
}

init();
