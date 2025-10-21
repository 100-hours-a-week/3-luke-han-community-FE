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

export { renderUserInput };
