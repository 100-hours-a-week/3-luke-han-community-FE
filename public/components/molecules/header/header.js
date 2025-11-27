export function configureHeader(options = {}) {
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

  if (titleElement && typeof title === 'string') {
    titleElement.textContent = title;
  }

  if (backButton) {
    backButton.hidden = !showBack;
  }

  if (profileButton) {
    profileButton.hidden = !showProfile;
  }
}

export function setProfileImage(src) {
  const img = document.getElementById('profile');
  if (!img) return;
  img.src = src || '';
}