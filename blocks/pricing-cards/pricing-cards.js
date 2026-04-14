import { createOptimizedPicture } from '../../scripts/aem.js';
import { PRICING_DETAILS, TOGGLE_LABEL_ICONS } from '../../constants/constants.js';

function extractPricingDetails(column) {
  const details = {};

  [...column.querySelectorAll('p')].forEach((paragraph) => {
    const text = paragraph.textContent.trim();
    const match = text.match(/^#(days|tour|countries|price)=(.+)$/i);

    if (match) {
      const [, key, value] = match;
      details[key.toLowerCase()] = value.trim();
      paragraph.remove();
    }
  });

  return details;
}

function buildPricingDetails(details) {
  const items = PRICING_DETAILS.filter(([key]) => details[key]);

  if (!items.length) {
    return null;
  }

  const list = document.createElement('dl');
  list.className = 'pricing-card-details';

  items.forEach(([key, label]) => {
    const item = document.createElement('div');
    item.className = `pricing-card-detail pricing-card-detail-${key}`;

    const term = document.createElement('dt');
    term.textContent = label;

    const description = document.createElement('dd');
    description.textContent = details[key];

    item.append(description, term);
    list.append(item);
  });

  return list;
}

function updateImageToggleIcon(toggle, iconName, label) {
  toggle.replaceChildren();

  const icon = document.createElement('img');
  icon.src = `${window.hlx.codeBasePath}/icons/${iconName}.svg`;
  icon.alt = label;
  icon.loading = 'lazy';

  toggle.append(icon);
  toggle.setAttribute('aria-label', label);
  toggle.title = label;
}

function updateImageToggleState(imageColumn, toggle, showSubImages) {
  const mainImage = imageColumn.querySelector('.pricing-card-main-image');
  const subImages = [...imageColumn.querySelectorAll('.pricing-card-sub-image')];

  if (mainImage) {
    mainImage.hidden = showSubImages;
  }

  subImages.forEach((picture) => {
    picture.hidden = !showSubImages;
  });

  imageColumn.dataset.showSubImages = showSubImages;
  updateImageToggleIcon(
    toggle,
    showSubImages ? TOGGLE_LABEL_ICONS['main-icon'] : TOGGLE_LABEL_ICONS['sub-icon'],
    showSubImages ? TOGGLE_LABEL_ICONS['main-label'] : TOGGLE_LABEL_ICONS['sub-label'],
  );
  toggle.setAttribute('aria-pressed', showSubImages);
}

function createImageToggle(imageColumn) {
  const toggle = document.createElement('span');
  toggle.className = 'pricing-card-image-toggle';
  toggle.setAttribute('role', 'button');
  toggle.setAttribute('tabindex', '0');

  const toggleImages = () => {
    const showSubImages = imageColumn.dataset.showSubImages !== 'true';
    updateImageToggleState(imageColumn, toggle, showSubImages);
  };

  toggle.addEventListener('click', toggleImages);
  toggle.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleImages();
    }
  });

  updateImageToggleState(imageColumn, toggle, false);

  return toggle;
}

function buildOptimizedPictures(pictures) {
  return pictures.map((picture, index) => {
    const img = picture.querySelector('img');
    const pictureClass = index === 0
      ? 'pricing-card-main-image'
      : 'pricing-card-sub-image';

    return createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }], pictureClass);
  });
}

/**
 * @param {HTMLElement} block The card block element
 */

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const pricingBody = document.createElement('div');
    pricingBody.className = 'pricing-body';
    while (row.firstElementChild) li.append(row.firstElementChild);
    const columnsInCard = [...li.children];
    const bodyColumn = columnsInCard[1];
    const dtcpColumn = columnsInCard[2];
    const buttonsColumn = columnsInCard[3];

    if (dtcpColumn) {
      const details = extractPricingDetails(dtcpColumn);
      const detailsList = buildPricingDetails(details);

      Object.entries(details).forEach(([key, value]) => {
        li.dataset[key] = value;
      });

      if (detailsList) {
        dtcpColumn.append(detailsList);
      }
    }

    [...li.children].forEach((div) => {
      const pictures = [...div.querySelectorAll('picture')];

      if (pictures.length) {
        const optimizedPictures = buildOptimizedPictures(pictures);
        div.replaceChildren(...optimizedPictures);

        if (optimizedPictures.length > 1) {
          div.append(createImageToggle(div));
        }

        div.className = 'pricing-card-image';
      } else {
        div.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
          heading.classList.add('pricing-card-title');
        });
        div.className = 'pricing-card-body';
        pricingBody.append(div);
      }
    });

    if (pricingBody.children.length) {
      li.append(pricingBody);
    }

    if (bodyColumn && buttonsColumn && buttonsColumn.querySelector('.button-wrapper')) {
      buttonsColumn.className = 'pricing-card-buttons';
      const buttonWrapper = buttonsColumn.querySelectorAll('.button-wrapper');
      if (buttonWrapper.length === 1) {
        buttonsColumn.classList.add('pricing-card-buttons-single');
      }
      pricingBody.append(buttonsColumn);
    }

    if (bodyColumn && buttonsColumn && buttonsColumn.children.length <= 0) {
      buttonsColumn.remove();
    }

    ul.append(li);
  });
  block.replaceChildren(ul);
}
