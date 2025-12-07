import { clearAccessToken, getAccessToken, safeSetAccessToken, setAccessToken } from "./tokenStore.js";

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
    const newToken = authHeader.slice(7);
    safeSetAccessToken(newToken);
  }

  if (res.status === 401 && !skipAuth) {
    clearAccessToken();

    const path = window.location.pathname;
    if (path != "/login" && path !== "/signup") {
      if (window.router?.navigate) {
        window.router.navigate("/login");
      } else {
        window.location.href = "/login";
      }
    }
  }

  return res;
}