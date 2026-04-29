import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function decorateFooterColumns(footer) {
  const columns = [...footer.querySelectorAll('.footer-area > div')];
  if (!columns.length) return;

  const mobileQuery = window.matchMedia('(max-width: 1023px)');

  columns.forEach((column, index) => {
    const titleWrapper = column.children[0];
    const linksPanel = column.children[1];
    const heading = titleWrapper?.querySelector('h1, h2, h3, h4, h5, h6');
    if (!titleWrapper || !linksPanel || !heading) return;

    column.classList.add('footer-column');
    heading.classList.add('footer-title');
    linksPanel.classList.add('footer-links-panel');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'footer-accordion-trigger';

    const triggerText = document.createElement('span');
    triggerText.className = 'footer-accordion-label';
    triggerText.textContent = heading.textContent.trim();

    const triggerIcon = document.createElement('span');
    triggerIcon.className = 'footer-accordion-icon';
    triggerIcon.setAttribute('aria-hidden', 'true');

    const triggerId = `footer-accordion-trigger-${index + 1}`;
    const panelId = `footer-accordion-panel-${index + 1}`;

    trigger.id = triggerId;
    trigger.setAttribute('aria-controls', panelId);
    trigger.append(triggerText, triggerIcon);

    heading.textContent = '';
    heading.append(trigger);

    linksPanel.id = panelId;
    linksPanel.setAttribute('aria-labelledby', triggerId);

    trigger.addEventListener('click', () => {
      if (!mobileQuery.matches) return;
      const isOpen = column.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      linksPanel.hidden = !isOpen;
    });
  });

  const syncAccordionState = (event) => {
    const isMobile = event.matches;
    columns.forEach((column) => {
      const trigger = column.querySelector('.footer-accordion-trigger');
      const linksPanel = column.querySelector('.footer-links-panel');
      if (!trigger || !linksPanel) return;

      if (isMobile) {
        const isOpen = column.classList.contains('is-open');
        trigger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        linksPanel.hidden = !isOpen;
      } else {
        column.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        linksPanel.hidden = false;
      }
    });
  };

  syncAccordionState(mobileQuery);
  mobileQuery.addEventListener('change', syncAccordionState);
}

function decorateSocialArea(footer) {
  const socialItems = [...footer.querySelectorAll('.social-area > div')];
  if (!socialItems.length) return;

  socialItems.forEach((item) => {
    item.classList.add('social-item');
    const picture = item.querySelector('picture');
    const link = item.querySelector('a');
    if (!picture || !link) return;
    link.innerHTML = '';
    link.append(picture);
    item.innerHTML = '';
    item.append(link);
  });
}

function decorateFooterBelow(footer) {
  const footerBelowArea = footer.querySelector('.social-area-container');
  if (!footerBelowArea) return;
  footerBelowArea.classList.remove('social-area-container');
  // wrap content in a parent container to allow centering the social area and copyright separately on desktop
  footerBelowArea.classList.add('footer-below-area');
  const content = [...footerBelowArea.children];
  const footerBelowAreaWrapper = document.createElement('div');
  footerBelowAreaWrapper.className = 'footer-below-area-wrapper';
  content.forEach((child) => footerBelowAreaWrapper.append(child));
  footerBelowArea.textContent = '';
  footerBelowArea.append(footerBelowAreaWrapper);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  decorateFooterColumns(footer);
  decorateSocialArea(footer);
  decorateFooterBelow(footer);
  block.append(footer);
}
