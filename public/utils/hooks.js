export function useInput(id) {
  const element = document.getElementById(id);

  return {
    element,
    value: () => element.value.trim(),
    clear: () => (element.value = ''),
    focus: () => element.focus(),
  };
}