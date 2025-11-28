import { getPosts } from "../../common/api.js";
import { configureHeader } from "../../molecules/header/header.js";
import { createPostCard } from "../../molecules/post/PostCard.js";

export function initMainPage() {
  const listParent = document.querySelector('.post-list-wrapper');
  const createBtn = document.querySelector('.create-btn');

  if (!listParent) {
    console.warn("[HomePage] .post-list-wrapper not found");
    return;
  }

  configureHeader?.({
    title: "아무 말 대잔치",
    showBack: false,
    showProfile: true,
  });

  // 게시글 없을 때
  function renderEmpty() {
    if (!listParent) return;

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

  // 게시글 목록
  function renderPostList(list = [], { append = false } = {}) {
    if (!append) {
      listParent.innerHTML = '';
    }

    if (!list.length) {
      renderEmpty();
      return;
    }

    const fragment = document.createDocumentFragment();

    list.forEach((wrapper) => {
      const card = createPostCard(wrapper);
      fragment.appendChild(card);
    });

    listParent.appendChild(fragment);
  }

  listParent.addEventListener('click', (e) => {
    const card = e.target.closest('.post-card');
    if (!card) return;
    const id = card.dataset.postId;
    if (!id) return;

    if (window.router?.navigate) {
      window.router.navigate(`/post/${id}`);
    } else {
      window.location.href = `/post/${id}`;
    }
  });

  createBtn?.addEventListener('click', () => {
    if (window.router?.navigate) {
      window.router.navigate('/post/create');
    } else {
      window.location.href = '/post/create';
    }
  });

  let nextCursor = 0;
  let hasNextCursor = true;
  let isLoading = false;

  async function loadPosts(cursor = nextCursor, size = 10) {
    if (isLoading) return;
    isLoading = true;

    try {
      const res = await getPosts(cursor, size);

      if (!res.ok) {
        console.error("[MainPage] Failed to load posts", res.status);

        if (cursor === 0) {
          renderPostList([]);
        }

        hasNextCursor = false;
        return;
      }

      const body = await res.json();
      const { data } = body || {};
      const list = data?.list ?? [];
      const next = data?.nextCursor ?? 0;
      const hasNext = data?.hasNextCursor ?? false;

      renderPostList(list, { append: cursor !== 0 });

      nextCursor = next;
      hasNextCursor = hasNext;
    } catch (error) {
      console.error("[MainPage] Failed to load posts", error);
      
      if (cursor === 0) {
        renderPostList([]);
      }
      hasNextCursor = false;
    } finally {
      isLoading = false;
    }
  }

  // 무한스크롤링
  window.addEventListener("scroll", () => {
    if (!hasNextCursor || isLoading) return;
    const nearBottom =
      window.innerHeight + window.scrollY >=
      document.body.offsetHeight - 200;
    if (nearBottom) {
      loadPosts(nextCursor, 10);
    }
  });

  loadPosts();
}