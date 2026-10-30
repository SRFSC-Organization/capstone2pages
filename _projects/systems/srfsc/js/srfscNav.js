// ============================================
// srfscNav.js
// RESPONSIBILITY: Phone menu toggle for the SRFSC nav, and showing "My profile" instead of
// "Sign in" when the visitor already has a session. Without JavaScript the full menu stays visible.
// ============================================
import { loadMemberProfile } from './memberApi.js';

const nav = document.querySelector('.srfsc-nav');
const toggle = nav?.querySelector('.srfsc-nav__toggle');

if (nav && toggle) {
  nav.classList.add('srfsc-nav--js');
  toggle.hidden = false;
  const setOpen = (open) => {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
}

const account = document.querySelector('#srfsc-nav-account');
if (account) {
  // Signed-out visitors (401) and an unreachable account service both keep the "Sign in" link.
  loadMemberProfile().then(() => {
    account.textContent = 'My profile';
    account.href = account.dataset.profileUrl;
  }).catch(() => {});
}
