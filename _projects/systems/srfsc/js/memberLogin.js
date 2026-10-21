import { loginMember, loadMemberProfile } from './memberApi.js';
import { showStatus } from './srfscDom.js';

const form = document.querySelector('#srfsc-login');
const status = document.querySelector('#srfsc-login-status');
const submit = form.querySelector('button[type="submit"]');

// Already-authenticated visitors can continue without entering credentials again.
loadMemberProfile().then(() => {
  document.querySelector('#srfsc-login-continue').hidden = false;
}).catch((error) => {
  if (error.status !== 401) showStatus(status, error.message, 'error');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  submit.disabled = true;
  showStatus(status, 'Signing in…', 'pending');
  const fields = new FormData(form);
  try {
    await loginMember({ uid: fields.get('uid').trim(), password: fields.get('password') });
    // Login may issue a cookie for an account still pending verification.
    await loadMemberProfile();
    window.location.assign(form.dataset.profileUrl);
  } catch (error) {
    showStatus(status, error.message, 'error');
  } finally {
    form.elements.password.value = '';
    submit.disabled = false;
  }
});
