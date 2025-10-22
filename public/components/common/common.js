/**
 * html 요소에 사용자 입력값 렌더링하는 함수
 * 
 * @param {*} targetSelector 
 * @param {*} inputValue 
 * @returns 
 */
function renderUserInput(targetOrSelector, inputValue) {
  const target = typeof targetOrSelector === 'string'
    ? document.querySelector(targetOrSelector)
    : targetOrSelector;
  if (!target) return;
  target.textContent = inputValue;
}

// // 게시글이 없을 때 렌더링
// function renderEmpty(name) {
//   // 이전에 그려둔 empty가 있으면 중복 방지
//   if (listParent.querySelector('.empty-state')) return;

//   const empty = document.createElement('div');
//   empty.className = 'empty-state text-center text-muted py-5';
//   empty.innerHTML = `
//     <div class="d-inline-block">
//       <div class="mb-2">${name}이 없습니다.</div>
//       <div class="small">첫 글을 작성해 보세요!</div>
//     </div>`;
//   listParent.appendChild(empty);
// }

export { renderUserInput };
