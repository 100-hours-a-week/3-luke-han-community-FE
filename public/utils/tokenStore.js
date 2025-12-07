let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function safeSetAccessToken(token) {
  accessToken = token || null;
}

export function getAccessToken() {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}
