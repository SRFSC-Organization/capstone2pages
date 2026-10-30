import { checkLoginService, loginMember, signupMember } from './memberApi.js';
import { showStatus } from './srfscDom.js';

const form = document.querySelector('#srfsc-signup');
const status = document.querySelector('#srfsc-signup-status');
const submit = form.querySelector('button[type="submit"]');
const retry = document.querySelector('#srfsc-signup-retry');
let serviceReady = false;

// Same check as the login page: don't let someone fill the form if the account service is down.
async function connect() {
  serviceReady = false;
  submit.disabled = true;
  retry.hidden = true;
  showStatus(status, 'Connecting to member accounts…', 'pending');
  try {
    await checkLoginService();
    serviceReady = true;
    submit.disabled = false;
    status.textContent = '';
    status.className = 'srfsc-form__status';
  } catch (error) {
    showStatus(status, error.message, 'error');
    retry.hidden = false;
  }
}

retry.addEventListener('click', connect);

form.elements.confirm.addEventListener('input', () => form.elements.confirm.setCustomValidity(''));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const { name, uid, password, confirm } = form.elements;
  confirm.setCustomValidity(password.value === confirm.value ? '' : 'Passwords do not match.');
  if (!serviceReady || !form.reportValidity()) return;
  submit.disabled = true;
  showStatus(status, 'Creating your account…', 'pending');
  const account = { name: name.value.trim(), uid: uid.value.trim(), password: password.value };
  try {
    await signupMember(account);
    // Sign the new member straight in so they land on their profile and quiz.
    await loginMember({ uid: account.uid, password: account.password });
    window.location.assign(form.dataset.profileUrl);
  } catch (error) {
    showStatus(status, error.message, 'error');
    if (error.status === 0 || error.status >= 500) {
      serviceReady = false;
      retry.hidden = false;
    }
    submit.disabled = !serviceReady;
  }
});

connect();
