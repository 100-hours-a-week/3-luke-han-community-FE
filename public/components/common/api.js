import { authFetch } from "../../utils/apiClient";

/**
 * 로그인 API
 * - url과 body를 받아서 fetch 요청을 보냄
 * 
 * @param {*} url 
 * @param {*} body 
 * @returns 
 */
export async function login(body) {
  const res = await authFetch(`/api/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }, { skipAuth: true });

  return res;
};

/**
 * 로그아웃 API
 * 
 * @returns 
 */
export async function logout() {
  const res = await authFetch(`/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res;
}

/**
 * 이메일 중복검사 API
 * 
 * @param {*} email 
 * @returns 
 */
export async function checkEmailDuplicate(body) {
  const res = await authFetch(`/api/auth/duplications/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }, { skipAuth: true });

  return res;
}

/**
 * 닉네임 중복검사 API
 * 
 * @param {*} nickname 
 * @returns 
 */
export async function checkNicknameDuplicate(body) {
  const res = await authFetch(`/api/auth/duplications/nickname`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }, { skipAuth: true });

  return res;
}

/**
 * 서비스 이용약관
 * 
 * @returns 
 */
export async function getTerms() {
  const res = await authFetch(`/terms`, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
    },
  }, { skipAuth: true });

  return res;
}

/**
 * 개인정보처리방침
 * 
 * @returns 
 */
export async function getPrivacyPolicy() {
  const res = await authFetch(`/privacy`, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/html',
    },
  }, { skipAuth: true });

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
  const res = await authFetch(`/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }, { skipAuth: true });

  return res;
};

/**
 * 회원정보 수정 API
 * 
 * @param {*} body 
 * @returns 
 */
export async function updateUserProfile(body) {
  const res = await authFetch(`/api/users`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
  const res = await authFetch(`/api/users/password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
  const res = await authFetch(`/api/posts?cursor=${cursor}&size=${size}`, {
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
  const res = await authFetch(`/api/posts/${postId}`, {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json',
    },
  });

  return res
}

/**
 * 댓글 생성 (최상위/대댓글 공통)
 * @param {number|string} postId
 * @param {string} content - 실제 댓글 내용
 * @param {number} parentId - 부모 댓글 id (최상위 댓글이면 0)
 */
export async function createComment(postId, body) {
  const res = await authFetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return res;
}

/** 
 * 댓글 목록 조회
 */
export async function getComments(postId, { parentId = 0, cursor = 0, size = 20 } = {}) {
  const res = await authFetch(`/api/posts/${postId}/comments?pid=${parentId}&cursor=${cursor}&size=${size}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res;
}

/** 게시글 생성 */
export async function createPost(body) {
  const res = await authFetch(`/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return res
}

/** 게시글 수정 */
export async function updatePost(postId, body) {
  const res = await authFetch(`/api/posts/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return res;
}

/** 게시글 좋아요 */
export async function likePost(postId) {
  const res = await authFetch(`/api/posts/${postId}/likes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res;
}

/** 좋아요 취소 */
export async function unlikePost(postId) {
  const res = await authFetch(`/api/posts/${postId}/likes`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/** profile image presigned url 가져오는 API */
export async function getMyProfile() {
  const res = await authFetch(`/api/users/images`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return res;
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