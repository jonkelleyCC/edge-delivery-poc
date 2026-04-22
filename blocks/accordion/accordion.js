function animateAccordionItem(details, body, shouldOpen) {
  body.style.maxHeight = `${body.scrollHeight}px`;

  if (shouldOpen) {
    details.setAttribute('open', '');
    details.setAttribute('aria-expanded', 'true');
    body.style.maxHeight = '0px';
    requestAnimationFrame(() => {
      body.style.maxHeight = `${body.scrollHeight}px`;
    });
    return;
  }

  details.setAttribute('aria-expanded', 'false');
  requestAnimationFrame(() => {
    body.style.maxHeight = '0px';
  });

  const onTransitionEnd = (e) => {
    if (e.propertyName !== 'max-height') return;
    details.removeAttribute('open');
    body.removeEventListener('transitionend', onTransitionEnd);
  };

  body.addEventListener('transitionend', onTransitionEnd);
}

export default function decorate(block) {
  [...block.children].forEach((row) => {
    // decorate accordion item label
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.setAttribute('aria-expanded', 'false');
    details.append(summary, body);

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      const shouldOpen = !details.hasAttribute('open');
      animateAccordionItem(details, body, shouldOpen);
    });

    row.replaceWith(details);
  });
}
