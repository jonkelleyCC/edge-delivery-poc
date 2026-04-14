import { createOptimizedPicture } from '../../scripts/aem.js';
import TITLE_SIZES from '../../constants/constants.js';

/**
 * @param {HTMLElement} block The card block element
 */

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
    const columnsInCard = [...li.children];
    const bodyColumn = columnsInCard[1];
    const buttonsColumn = columnsInCard[2];

    if (bodyColumn && buttonsColumn && buttonsColumn.querySelector('.button-wrapper')) {
      buttonsColumn.className = 'card-buttons';
      const buttonWrapper = buttonsColumn.querySelectorAll('.button-wrapper');
      if (buttonWrapper.length === 1) {
        buttonsColumn.classList.add('card-buttons-single');
      }
      bodyColumn.append(buttonsColumn);
    }

    if (bodyColumn && buttonsColumn && buttonsColumn.children.length <= 0) {
      buttonsColumn.remove();
    }

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'card-image';
      } else {
        div.className = 'card-body';
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    heading.classList.add(TITLE_SIZES[titleSize]);
  });
  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
