let cachedUrl = null;
let cachedExpireAt = 0;

export async function getProfileImageUrl() {
  const now = Date.now();

  if (cachedUrl && now < cachedExpireAt) {
    return cachedUrl;
  }

  // TODO: 프로필 이미지 URL 가져오는 API 호출

  return cachedUrl;
}