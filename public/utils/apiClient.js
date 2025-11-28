import { getAccessToken, setAccessToken } from "./tokenStore";

export async function authFetch(input, init = {}, { skipAuth = false } = {}) {
  const headers = new Headers(init.headers || {});

  const token = getAccessToken();
  if (!skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });

  const authHeader = res.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    setAccessToken(authHeader.slice(7));
  }

  return res;
}