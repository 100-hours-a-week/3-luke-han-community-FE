/**
 * html 요소에 사용자 입력값 렌더링하는 함수
 * 
 * @param {*} targetSelector 
 * @param {*} inputValue 
 * @returns 
 */
function renderUserInput(targetSelector, inputValue) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  target.textContent = inputValue;
}

export { renderUserInput };
