import { getMyProfile } from "../components/common/api";

export const DEFAULT_PROFILE_IMAGE_URL = '/assets/image/default-profile.png';

let cachedUrl = null;
let cachedExpireAt = 0;

export function setProfileImageUrl(presignedUrl, ttlMs = 1000 * 60 * 20) {
  if (!presignedUrl) {
    presignedUrl = DEFAULT_PROFILE_IMAGE_URL;
  }

  cachedUrl = presignedUrl;
  let expireAt;
  try {
    const parsed = new URL(presignedUrl, window.location.origin);
    const hasExpires = parsed.searchParams.has('X-Amz-Expires');

    if (hasExpires) {
      expireAt = Date.now() + ttlMs;
    } else {
      expireAt = Number.POSITIVE_INFINITY;
    }
  } catch (e) {
    expireAt = Number.POSITIVE_INFINITY;
  }

  cachedExpireAt = expiredAt;

  // 유저가 새로고침해도 가져올 수 있게
  localStorage.setItem('profileImageUrl', presignedUrl);
}

export async function getProfileImageUrl() {
  const now = Date.now();

  if (cachedUrl && now < cachedExpireAt) {
    return cachedUrl;
  }

  const saved = localStorage.getItem('profileImageUrl');
  if (saved) {
    cachedUrl = saved;
    
    try {
      const parsed = new URL(cachedUrl, window.location.origin);
      const hasExpires = parsed.searchParams.has('X-Amz-Expires');

      if (hasExpires) {
        cachedExpireAt = now + 1000 * 60 * 10;
      } else {
        cachedExpireAt = Number.POSITIVE_INFINITY;
      }
    } catch (e) {
      cachedExpireAt = Number.POSITIVE_INFINITY;
    }

    return cachedUrl;
  }
  
  // 여기까지 온거면 처음 호출일 수 있음
  try {
    const res = await getMyProfile();
    const { data } = await res.json();
    const url = data?.profileImageUrl || DEFAULT_PROFILE_IMAGE_URL;

    setProfileImageUrl(url);
    return url;
  } catch (e) {
    cachedUrl = DEFAULT_PROFILE_IMAGE_URL;
    cachedExpireAt = Number.POSITIVE_INFINITY;
    return cachedUrl;
  }
}
