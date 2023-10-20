const specialKeys = new Set([
  "Shift",
  "Control",
  "Alt",
  "CapsLock",
  "Enter",
  "Escape",
  "Meta",
  "Delete",
  "Home",
  "End",
  "PageUp",
  "PageDown",
  "NumLock",
  "Insert",
  "Tab",
  "Unidentified",
  "ArrowLeft",
  "ArrowUp",
  "ArrowDown",
  "ArrowRight",
]);

export function isSpecialKeyPressed(key: string) {
  return specialKeys.has(key);
}
