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
      'Content-Type': 'application/json',
    },
    body: body,
    credentials: 'include',
  });

  return res;
};

/**
 * 로그아웃 API
 * 
 * @returns 
 */
export async function logout() {
  const res = await fetch(API_BASE_URL + `/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || '',
    },
    credentials: 'include',
  });

  return res;
}

/**
 * 이메일 중복검사 API
 * 
 * @param {*} email 
 * @returns 
 */
export async function checkEmailDuplicate(email) {
  const res = await fetch(API_BASE_URL + `/api/auth/duplications/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  return res;
}

/**
 * 닉네임 중복검사 API
 * 
 * @param {*} nickname 
 * @returns 
 */
export async function checkNicknameDuplicate(nickname) {
  const res = await fetch(API_BASE_URL + `/api/auth/duplications/nickname`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ nickname }),
  });

  return res;
}

/**
 * 서비스 이용약관
 * 
 * @returns 
 */
export async function getTerms() {
  const res = await fetch(API_BASE_URL + `/terms`, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
    },
  });

  return res;
}

/**
 * 개인정보처리방침
 * 
 * @returns 
 */
export async function getPrivacyPolicy() {
  const res = await fetch(API_BASE_URL + `/privacy`, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
    },
  });

  return res;
}

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
 * 회원정보 수정 API
 * 
 * @param {*} body 
 * @returns 
 */
export async function updateUserProfile(body) {
  const res = await fetch(API_BASE_URL + `/api/users`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || '',
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  return res;
}

/**
 * 비밀번호 수정 API
 * 
 * @param {*} body 
 * @returns 
 */
export async function updateUserPassword(body) {
  const res = await fetch(API_BASE_URL + `/api/users/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || '',
    },
    body: JSON.stringify(body),
    credentials: 'include',
  });

  return res;
}

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
 * 댓글 생성 (최상위/대댓글 공통)
 * @param {number|string} postId
 * @param {string} content - 실제 댓글 내용
 * @param {number} parentId - 부모 댓글 id (최상위 댓글이면 0)
 */
export async function createComment(postId, content, parentId = 0) {
  return fetch(API_BASE_URL + `/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || '',
    },
    body: JSON.stringify({
      parentId: parentId,
      content: content,
    }),
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

/** 게시글 좋아요 */
export async function likePost(postId) {
  return fetch(API_BASE_URL + `/api/posts/${postId}/likes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || '',
    },
    credentials: 'include',
  });
}

/** 좋아요 취소 */
export async function unlikePost(postId) {
  return fetch(API_BASE_URL + `/api/posts/${postId}/likes`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('accessToken') || '',
    },
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