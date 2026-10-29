import { checkLoginService, loginMember, loadMemberProfile } from './memberApi.js';
import { showStatus } from './srfscDom.js';

const form = document.querySelector('#srfsc-login');
const status = document.querySelector('#srfsc-login-status');
const submit = form.querySelector('button[type="submit"]');
const retry = document.querySelector('#srfsc-login-retry');
let serviceReady = false;

async function connect() {
  serviceReady = false;
  submit.disabled = true;
  retry.hidden = true;
  showStatus(status, 'Connecting to member login…', 'pending');
  try {
    const service = await checkLoginService();
    if (!service.accounts_available) {
      showStatus(status, 'Login is connected. No verified member accounts have been added yet. Contact the council to create yours.', 'pending');
      retry.hidden = false;
      return;
    }
    serviceReady = true;
    submit.disabled = false;
    showStatus(status, 'Login is connected. Enter your user ID and password.', 'success');
    try {
      await loadMemberProfile();
      document.querySelector('#srfsc-login-continue').hidden = false;
    } catch (error) {
      if (error.status !== 401) showStatus(status, error.message, 'error');
    }
  } catch (error) {
    showStatus(status, error.message, 'error');
    retry.hidden = false;
  }
}

retry.addEventListener('click', connect);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!serviceReady || !form.reportValidity()) return;
  submit.disabled = true;
  showStatus(status, 'Signing in…', 'pending');
  const fields = new FormData(form);
  try {
    await loginMember({ uid: fields.get('uid').trim(), password: fields.get('password') });
    // Confirm the browser kept the authentication cookie before opening the profile.
    await loadMemberProfile();
    window.location.assign(form.dataset.profileUrl);
  } catch (error) {
    showStatus(status, error.message, 'error');
    if (error.status === 0 || error.status >= 500) {
      serviceReady = false;
      retry.hidden = false;
    }
  } finally {
    form.elements.password.value = '';
    submit.disabled = !serviceReady;
  }
});

connect();
