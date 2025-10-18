const logo = document.querySelector('.logo');
const backButton = document.querySelector('.back_button');
const profileImage = document.querySelector('.profile');

profileImage.addEventListener('click', () => {
  window.location.href = '/profile';
});

backButton.addEventListener('click', () => {
  window.history.back();
});

logo.addEventListener('click', () => {
  window.location.href = '/';
});