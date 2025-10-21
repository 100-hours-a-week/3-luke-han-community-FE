const initHeader = () => {
  console.log("이거 실행됨");
  document.getElementById('header-component').innerHTML = `
  <div class="container">
      <div class="d-grid align-items-center py-3" style="grid-template-columns:auto 1fr auto; gap:.5rem;">
        <!-- 좌측: 뒤로가기(필요 없으면 a 태그 지워도 됨) -->
        <a href="javascript:history.back()" class="btn btn-link text-decoration-none py-0">
          &larr; <span class="d-none d-sm-inline">뒤로</span>
        </a>

        <!-- 중앙: 타이틀(정중앙 보장) -->
        <h1 id="logo" class="m-0 fs-3 fw-semibold text-center text-truncate px-2">
          아무 말 대잔치
        </h1>

        <!-- 우측: 동그란 프로필 -->
        <img src="" alt="profile_image"
             id="profile"
             class="rounded-circle object-fit-cover"
             style="width:36px;height:36px;">
      </div>
    </div>`;
  
  const logo = document.getElementById('logo');
  const profileImage = document.getElementById('profile');

  profileImage.addEventListener('click', () => {
    window.location.href = '/profile';
  });

  logo.addEventListener('click', () => {
    window.location.href = '/';
  });
};

initHeader();