// ============================================
// councilRequests.js
// RESPONSIBILITY: Council Admin list of survey requests: one short row each, opening the
// request's own page (councilRequest.js). The backend only answers Admin accounts; this page
// just explains 401/403 nicely.
// ============================================
import { loadCouncilRequests } from './memberApi.js';
import { createElement, showStatus } from './srfscDom.js';

const page = document.querySelector('#srfsc-council');
const list = document.querySelector('#srfsc-council-list');
const status = document.querySelector('#srfsc-council-status');
const filter = document.querySelector('#srfsc-council-filter');
const loginLink = document.querySelector('#srfsc-council-login');

const formatDay = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '');

function renderRow(request) {
  const item = createElement('li');
  const link = createElement('a', 'srfsc-council__row');
  link.href = `${page.dataset.requestUrl}?id=${encodeURIComponent(request.id)}`;
  link.dataset.status = request.status;
  const badge = createElement('span', 'srfsc-council__badge', request.status);
  badge.dataset.status = request.status;
  const main = createElement('span', 'srfsc-council__row-main');
  main.append(createElement('strong', null, request.request_type), createElement('span', 'srfsc-council__meta', request.name));
  const photos = request.photo_count ? `${request.photo_count} photo${request.photo_count === 1 ? '' : 's'}` : '';
  const side = createElement('span', 'srfsc-council__meta', [photos, formatDay(request.created_at)].filter(Boolean).join(' · '));
  link.append(badge, main, side);
  item.append(link);
  return item;
}

async function refresh() {
  showStatus(status, 'Loading requests…', 'pending');
  list.replaceChildren();
  loginLink.hidden = true;
  try {
    const requests = await loadCouncilRequests(filter.value);
    list.append(...requests.map(renderRow));
    const label = filter.value ? `${filter.value.toLowerCase()} ` : '';
    showStatus(status, requests.length ? `${requests.length} ${label}request${requests.length === 1 ? '' : 's'}` : `No ${label}requests yet.`, 'success');
  } catch (error) {
    if (error.status === 401) {
      showStatus(status, 'Sign in with your council admin account to review requests.', 'error');
      loginLink.hidden = false;
    } else if (error.status === 403) {
      showStatus(status, 'This page is only for council administrators.', 'error');
    } else {
      showStatus(status, error.message, 'error');
    }
  }
}

filter.addEventListener('change', refresh);
refresh();
