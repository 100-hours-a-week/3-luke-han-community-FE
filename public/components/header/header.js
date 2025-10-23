const profileLink = localStorage.getItem('profile_image') || '/assets/image/default_profile.png';

const initHeader = () => {
  console.log("이거 실행됨");
  
  const path = window.location.pathname;
  let backButton = '';
  let profileImage = '';
  let gridTemplate = 'auto 1fr auto';

  if (path === '/login') {
    backButton = '';
    profileImage = '';
    gridTemplate = '1fr';
  } else if (path === '/signup') {
    backButton = `
      <a href="javascript:history.back()" class="btn btn-link text-decoration-none py-0">
        &larr;
      </a>`;
    profileImage = "";
    gridTemplate = 'auto 1fr';
  } else {
    backButton = `
      <a href="javascript:history.back()" class="btn btn-link text-decoration-none py-0">
        &larr;
      </a>`;
    profileImage = `
      <img src="${profileLink}" alt="profile_image"
           id="profile"
           class="rounded-circle object-fit-cover"
           style="width:36px;height:36px;">`;
  }

  document.getElementById('header-component').innerHTML = `
    <div class="container">
      <div class="d-grid align-items-center py-3"
           style="grid-template-columns:${gridTemplate}; gap:.5rem;">
        ${backButton}
        <h1 id="logo" class="m-0 fs-3 fw-semibold text-center text-truncate px-2">
          아무 말 대잔치
        </h1>
        ${profileImage}
      </div>
    </div>`;

    const logo = document.getElementById('logo');
    logo?.addEventListener('click', () => {
      window.location.href = '/';
    });

    const profile = document.getElementById('profile');
    profile?.addEventListener('click', () => {
      window.location.href = '/profile';
    });
};

initHeader();