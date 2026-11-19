// ============================================
// srfscSections.js
// RESPONSIBILITY: Fill the "On this page" section sidebar (srfsc-nav.html) with one link per
// panel heading, and highlight the section currently on screen. A heading's data-section-label
// wins over its text (the calendar heading's text changes to the month name).
// ============================================
const sidebar = document.querySelector('[data-srfsc-sections]');
const list = sidebar?.querySelector('.srfsc-sections__links');

const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

if (sidebar && list) {
  const sections = [];
  document.querySelectorAll('.srfsc-app h2.srfsc-panel__title').forEach((heading) => {
    const panel = heading.closest('section, .srfsc-panel') || heading;
    if (panel.closest('[hidden]')) return;
    const label = (heading.dataset.sectionLabel || heading.textContent).trim();
    if (!label) return;
    // Link to the panel when the heading opens it; otherwise to the heading itself
    // (a few panels hold two headed parts, e.g. "Upcoming events" and "What to expect").
    const target = panel.querySelector('h2.srfsc-panel__title') === heading ? panel : heading;
    if (!target.id) target.id = `srfsc-section-${slug(label)}`;
    target.classList.add('srfsc-sections__target');
    sections.push({ label, target });
  });

  if (sections.length >= 2) {
    const links = sections.map(({ label, target }) => {
      const link = document.createElement('a');
      link.className = 'ocs__btn small pill';
      link.href = `#${target.id}`;
      link.textContent = label;
      list.append(link);
      return link;
    });
    sidebar.hidden = false;

    // Highlight the section nearest the top of the screen (OCS grammar: current item adds accent fill).
    const setCurrent = (index) => {
      links.forEach((link, i) => {
        const current = i === index;
        link.classList.toggle('accent', current);
        link.classList.toggle('fill', current);
        if (current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    // A clicked link stays highlighted until the visitor scrolls on their own, so a short
    // section near the bottom isn't skipped for the one just below it.
    let pinned = -1;
    links.forEach((link, i) => link.addEventListener('click', () => { pinned = i; setCurrent(i); }));
    ['wheel', 'touchstart', 'keydown'].forEach((type) => {
      window.addEventListener(type, () => { pinned = -1; }, { passive: true });
    });

    const update = () => {
      if (pinned >= 0) return;
      // Just under the sticky council bar (the targets' scroll-margin-top is 6rem).
      const line = 140;
      let index = 0;
      sections.forEach(({ target }, i) => {
        if (target.getBoundingClientRect().top <= line) index = i;
      });
      // At the bottom of the page, the last section is the one being read.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) index = sections.length - 1;
      setCurrent(index);
    };
    let queued = false;
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; update(); });
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
}
