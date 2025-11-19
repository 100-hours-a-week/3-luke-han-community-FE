const e = require("express");
const { LoginPage, initLoginPage } = require("./public/components/login/login");

const main = document.querySelector('main');

// 라우팅 테이블 정의
// URL 경로(pathname)에 따라 어떤 화면(view)과 init 함수를 쓸지 매핑해 둠
const routes = {
  '/': {                  // 루트 경로
    view: LoginPage,      // 화면 그리는 함수
    init: initLoginPage,  // 해당 화면에서 이벤트 바인딩 등 초기화하는 함수
  },
  'login': {              // "/login" 경로로 쓰고 싶으면 key를 '/login'으로 두는 게 더 자연스러움
    view: LoginPage,
    init: initLoginPage,
  },
};

// 실제로 라우트에 맞는 화면을 렌더링하는 함수
function renderRoute(pathname) {
  // path에 맞는 route 객체 찾고, 없으면 '/'용 route 사용
  const route = routes[pathname] || routes['/'];

  // main 영역의 HTML을 해당 view 함수가 반환하는 문자열로 교체
  main.innerHTML = route.view();

  // 화면이 새로 그려졌으니, 그 화면 전용 init 함수 호출해서
  // 이벤트 리스너 등록, 폼 검증 등 세팅 수행
  route.init();
}

// 브라우저 뒤로가기/앞으로가기 발생할 때(popstate 이벤트)
// 현재 URL(pathname)에 맞춰 다시 렌더링
window.addEventListener('popstate', () => {
  renderRoute(window.location.pathname);
});

// 전역 router 객체를 window에 올려둠
// 다른 JS 코드에서 window.router.navigate('/login') 이런 식으로 호출해서
// SPA 방식으로 페이지 이동시키기 위함
window.router = {
  navigate(path) {
    // 이미 같은 경로라면 굳이 다시 렌더링 안 함
    if (window.location.pathname === path) {
      return;
    }

    // 브라우저 주소창의 URL만 바꿈 (실제 페이지 이동 없음)
    // history.pushState로 히스토리에 기록 남겨서 뒤로가기/앞으로가기 가능하게 함
    history.pushState({}, '', path);

    // 바뀐 path에 맞는 화면 다시 렌더링
    renderRoute(path);
  },
};

// 문서 전체에서 클릭 이벤트를 감시
// a 태그 클릭을 가로채서 SPA 방식으로 처리하기 위함
document.addEventListener('click', (e) => {
  // 이벤트 발생 지점에서 가장 가까운 <a> 찾음 (버블링 고려)
  const anchor = e.target.closest('a');
  if (!anchor) return; // 클릭한 게 a가 아니면 무시

  const href = anchor.getAttribute('href');

  // 외부 링크, 해시 링크, mailto 링크 등은 SPA 라우팅에서 제외하고 기본 동작 그대로 두기
  if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('malito:')) return;
  // ↑ 여기 오타 있음. 'malito:' → 'mailto:'가 맞음

  // 여기까지 왔다는 건 내부 경로이므로,
  // 브라우저의 기본 이동 동작 막고
  e.preventDefault();

  // SPA용 router.navigate 사용해서 화면만 갈아끼움
  window.router.navigate(href);
});

// 페이지가 처음 로드될 때
// 현재 URL(pathname)에 맞는 화면을 한 번 렌더링해줌
document.addEventListener('DOMContentLoaded', () => {
  renderRoute(window.location.pathname);
});