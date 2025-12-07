import { getProfileImageUrl } from "../../../utils/cacheStore.js";

let headerInitialized = false;

export async function configureHeader(options = {}) {
  const {
    title,
    showBack = true,
    showProfile = true,
  } = options;

  const headerElement = document.getElementById('header');
  if (!headerElement) return;

  const titleElement = headerElement.querySelector('#logo');
  const backButton = headerElement.querySelector('.back-btn');
  const profileButton = headerElement.querySelector('.profile-btn');
  const profileImage = headerElement.querySelector('#profile');

  if (titleElement && typeof title === 'string') {
    titleElement.textContent = title;
  }

  if (backButton) {
    backButton.hidden = !showBack;
  }

  if (!showProfile) {
    if (profileButton) profileButton.hidden = true;
    if (profileImage) {
      profileImage.src = '/assets/image/default_profile.png';
    }
    return;
  }

  if (profileButton) {
    profileButton.hidden = false;
  }

  if (profileImage) {
    profileImage.src = '/assets/image/default_profile.png';

    try {
      const url = await getProfileImageUrl();
      if (url) {
        profileImage.src = url;
      }
    } catch (error) {
      console.error("프로필 이미지 불러오기 실패:", error);
    }
  }

  if (!headerInitialized) {
    headerInitialized = true;

    if (profileButton) {
      profileButton.addEventListener('click', () => {
        const path = '/user/edit';
        if (window.router?.navigate) {
          window.router.navigate(path);
        } else {
          window.location.href = path;
        }
      });
    }

    if (titleElement) {
      titleElement.style.cursor = 'pointer';
      titleElement.addEventListener('click', () => {
        const path = '/';
        if (window.router?.navigate) {
          window.router.navigate(path);
        } else {
          window.location.href = path;
        }
      });
    }
  }
}

export function setProfileImage(src) {
  const img = document.getElementById('profile');
  if (!img) return;
  img.src = src || '/assets/image/default_profile.png';
}