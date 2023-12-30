export const checkTextInHTML = (textMatch: string, node: Element | null) => {
  const hasText = (node: Element | null) => node!.textContent === textMatch;
  const nodeHasText = hasText(node);
  const childrenDontHaveText = Array.from(node!.children).every(
    (child) => !hasText(child),
  );
  return nodeHasText && childrenDontHaveText;
};
