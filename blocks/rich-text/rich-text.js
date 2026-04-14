export default function decorate(block) {
  const parent = block.firstElementChild;

  if (!parent) return;

  parent.replaceWith(...parent.children);
}
