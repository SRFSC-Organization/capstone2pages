// ============================================
// srfscNav.js
// RESPONSIBILITY: Phone menu toggle for the SRFSC nav, and showing "My profile" instead of
// "Sign in" (and hiding "Sign up") when the visitor already has a session. Without JavaScript the full menu stays visible.
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

// The site header and the council bar may each carry an account link; update whichever exist.
// Signed in, each shows the member's initial and name (so they can see who is signed in) and
// links to data-profile-url (the settings page from the header). Signed-out visitors (401) and
// an unreachable account service keep the signed-out label.
function showMember(account, profile) {
  const name = (profile.name || '').trim() || account.dataset.profileTitle;
  const avatar = document.createElement('span');
  avatar.className = 'srfsc-account__avatar';
  avatar.setAttribute('aria-hidden', 'true');
  avatar.textContent = name.charAt(0).toUpperCase();
  const label = document.createElement('span');
  label.className = 'srfsc-account__name';
  label.textContent = name;
  account.replaceChildren(avatar, label);
  account.href = account.dataset.profileUrl;
  account.title = `Signed in as ${name}. Open your settings`;
  account.setAttribute('aria-label', `Signed in as ${name}. Open your settings`);
  account.classList.add('srfsc-account--signed-in');
}

const accounts = document.querySelectorAll('[data-profile-url]');
const showEverywhere = (profile) => accounts.forEach((account) => showMember(account, profile));
if (accounts.length) {
  loadMemberProfile().then((profile) => {
    showEverywhere(profile);
    const signup = document.querySelector('#srfsc-nav-signup');
    if (signup) signup.hidden = true;
  }).catch(() => {});
  // The settings page announces a saved name change so the header updates without a reload.
  document.addEventListener('srfsc:member', (event) => showEverywhere(event.detail));
}
