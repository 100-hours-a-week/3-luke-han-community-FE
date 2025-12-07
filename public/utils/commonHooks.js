export function useInput(id) {
  const element = document.getElementById(id);

  return {
    element,
    value: () => element.value.trim(),
    clear: () => (element.value = ''),
    focus: () => element.focus(),
  };
}

export function registerEnterSubmit(inputEl, submitCallback) {
  if (!inputEl || typeof submitCallback !== "function") return;

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitCallback();
    }
  });
}
