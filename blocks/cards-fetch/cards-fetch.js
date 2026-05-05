import { createOptimizedPicture } from '../../scripts/aem.js';
import { TITLE_SIZES } from '../../constants/constants.js';
import getCardDetail from '../../api/card-api.js';

/**
 * Reads the GraphQL endpoint from the first authored link in the block.
 * Authors put the endpoint URL as a hyperlink in the first row of the block table.
 * @param {HTMLElement} block
 * @returns {string|null}
 */
function resolveEndpoint(block) {
  const paragraphs = block.querySelectorAll('p');
  if (!paragraphs.length) return null;
  return Array.from(paragraphs).map((p) => {
    const text = p.textContent.trim();
    const match = text.match(/^@(path)=(.+)$/i);
    return match ? match[2] : null;
  }).filter(Boolean);
}

function toItems(payload) {
  const singleItem = payload?.data?.vikingCardByPath?.item;
  if (singleItem) return [singleItem];

  const listItems = payload?.data?.vikingCardsByPath?.items
    || payload?.data?.vikingCardList?.items
    || payload?.data?.items;

  return Array.isArray(listItems) ? listItems : [];
}

function createCard(item, titleSize, textAlign) {
  const li = document.createElement('li');
  li.className = textAlign ? `text-${textAlign}` : 'text-left';

  // eslint-disable-next-line
  const imageSrc = item?.image?._publishUrl || item?.image?._dynamicUrl || item?.image?._path;
  if (imageSrc) {
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'card-image';
    const image = createOptimizedPicture(imageSrc, item?.title?.plaintext || '', false, [{ width: '750' }]);
    imageWrapper.append(image);
    li.append(imageWrapper);
  }

  const body = document.createElement('div');
  body.className = 'card-body';

  if (item?.title?.html) {
    const titleContainer = document.createElement('div');
    titleContainer.innerHTML = item.title.html;
    body.append(...titleContainer.childNodes);
  } else if (item?.title?.plaintext) {
    const heading = document.createElement('h3');
    heading.textContent = item.title.plaintext;
    body.append(heading);
  }

  if (item?.description?.html) {
    const descriptionContainer = document.createElement('div');
    descriptionContainer.innerHTML = item.description.html;
    body.append(...descriptionContainer.childNodes);
  } else if (item?.description?.plaintext) {
    const description = document.createElement('p');
    description.textContent = item.description.plaintext;
    body.append(description);
  }

  const buttonText = item?.buttonText;
  const buttonUrl = item?.buttonUrl;
  if (buttonText && buttonUrl) {
    const buttons = document.createElement('div');
    buttons.className = 'buttons-container';

    const p = document.createElement('p');
    p.className = 'button-wrapper';
    const a = document.createElement('a');
    a.href = buttonUrl;
    a.textContent = buttonText;

    const style = item?.buttonStyle?.toLowerCase();
    a.classList.add('button');
    if (style) a.classList.add(style);

    p.append(a);
    buttons.append(p);
    body.append(buttons);
  }

  li.append(body);

  li.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    heading.classList.add(TITLE_SIZES[titleSize] || TITLE_SIZES.l);
  });

  return li;
}

export default async function decorate(block) {
  const section = block.closest('.section');
  const cardType = section?.dataset.cardType || 'default';
  const columns = section?.dataset.columns || '';
  const textAlign = section?.dataset.textAlign || 'left';
  const titleSize = section?.dataset.titleSize || 'l';
  const endpoints = resolveEndpoint(block);

  block.classList.add('is-loading');
  block.textContent = '';

  if (!endpoints || !endpoints.length) {
    block.classList.remove('is-loading');
    block.classList.add('is-error');
    block.textContent = 'No GraphQL endpoint authored in block.';
    return;
  }

  try {
    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        const api = getCardDetail(endpoint);
        const response = await fetch(api);
        if (!response.ok) throw new Error(`Request failed for ${endpoint}: ${response.status}`);
        return response.json();
      }),
    );

    const items = results.flatMap((payload) => toItems(payload));

    if (!items.length) {
      block.classList.remove('is-loading');
      block.classList.add('is-empty');
      block.textContent = 'No cards returned from endpoint.';
      return;
    }

    const ul = document.createElement('ul');
    ul.classList.add(`cards-${cardType}`);
    if (columns) ul.classList.add(columns);

    items.forEach((item) => {
      ul.append(createCard(item, titleSize, textAlign));
    });

    block.replaceChildren(ul);
    block.classList.remove('is-loading');
  } catch (e) {
    block.classList.remove('is-loading');
    block.classList.add('is-error');
    if (e instanceof TypeError) {
      block.textContent = 'Request blocked (likely CORS). Use a same-origin proxy endpoint for local development.';
      return;
    }
    block.textContent = 'Unable to load cards right now.';
  }
}
