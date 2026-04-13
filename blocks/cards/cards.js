import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const section = block.closest('.section');
  const cardType = section ? section.dataset.cardType : 'default';
  const columns = section ? section.dataset.columns : '';
  const titleSize = section ? section.dataset.titleSize : 'l';

  /* change to ul, li */
  const ul = document.createElement('ul');
  ul.classList.add(`cards-${cardType}`);
  if (columns) {
    ul.classList.add(`${columns}`);
  }
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    heading.classList.add(`font-${titleSize}`);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
