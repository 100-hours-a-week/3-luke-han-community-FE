/**
 * 로그인 API
 * - url과 body를 받아서 fetch 요청을 보냄
 * 
 * @param {*} url 
 * @param {*} body 
 * @returns 
 */
export async function login(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return res;
};

/**
 * 회원가입 API
 * - url과 body를 받아서 fetch 요청을 보냄
 * 
 * @param {*} url 
 * @param {*} body 
 * @returns 
 */
export async function signup(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return res;
};

/**
 * 게시글 목록 조회 API
 * - cursor, size를 받아서 GET 요청
 * 
 * @param {number} cursor 
 * @param {number} size 
 * @returns {Promise<Response>}
 */
export async function getPosts(cursor = 0, size = 20) {
  const res = await fetch(`/api/posts?cursor=${cursor}&size=${size}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res;
}

/**
 * 게시글 상세 조회
 */
export async function getPostDetail(postId) {
  return fetch(`/api/posts/${postId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * 댓글 생성
 */
export async function createComment(postId, comment) {
  return fetch(`/api/post/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment }),
  });
}

/** 
 * 댓글 목록 조회
 */
export async function getComments(postId, { parentId = 0, cursor = 0, size = 20 } = {}) {
  return fetch(`/api/${postId}/comments?pid=${parentId}&cursor=${cursor}&size=${size}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}

/** 게시글 생성 */
export async function createPost(body) {
  return fetch(`/api/post`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** 게시글 수정 */
export async function updatePost(postId, body) {
  return fetch(`/api/post/${postId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** 
 * S3 presigned URL 발급
 * TODO: 향후 백엔드 presigned URL API와 맞춰서 수정 필요
 */
export async function getPresignedUrl(filename, contentType) {
  return fetch(`/api/uploads/presign?filename=${encodeURIComponent(filename)}&contentType=${encodeURIComponent(contentType)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
}