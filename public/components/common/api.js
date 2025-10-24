const API_BASE_URL = 'http://localhost:8080';

/**
 * 로그인 API
 * - url과 body를 받아서 fetch 요청을 보냄
 * 
 * @param {*} url 
 * @param {*} body 
 * @returns 
 */
export async function login(body) {
  const res = await fetch(API_BASE_URL + `/api/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: body,
    credentials: 'include',
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
export async function signup(body) {
  const res = await fetch(API_BASE_URL + `/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    credentials: 'include',
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
  const res = await fetch(API_BASE_URL + `/api/posts?cursor=${cursor}&size=${size}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || '',
    },
    credentials: 'include',
  });

  return res;
}

/**
 * 게시글 상세 조회
 */
export async function getPostDetail(postId) {
  return fetch(API_BASE_URL + `/api/posts/${postId}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || '',
    },
    credentials: 'include',
  });
}

/**
 * 댓글 생성
 */
export async function createComment(postId, comment) {
  return fetch(API_BASE_URL + `/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || '',
    },
    body: JSON.stringify({ comment }),
    credentials: 'include',
  });
}

/** 
 * 댓글 목록 조회
 */
export async function getComments(postId, { parentId = 0, cursor = 0, size = 20 } = {}) {
  return fetch(API_BASE_URL + `/api/posts/${postId}/comments?pid=${parentId}&cursor=${cursor}&size=${size}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || '',
    },
    credentials: 'include',
  });
}

/** 게시글 생성 */
export async function createPost(body) {
  return fetch(API_BASE_URL + `/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || '',
    },
    body,
    credentials: 'include',
  });
}

/** 게시글 수정 */
export async function updatePost(postId, body) {
  return fetch(API_BASE_URL + `/api/posts/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || '',
    },
    body: body,
    credentials: 'include',
  });
}

export async function uploadToS3(url, file) {
  const headers = { 'Content-Type': file.type || 'application/octet-stream' };

  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: file,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`S3 업로드 실패: ${res.status} ${text}`);
  }

  return res;
}