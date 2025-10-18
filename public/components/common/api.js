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