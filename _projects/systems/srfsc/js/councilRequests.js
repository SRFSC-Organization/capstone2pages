// ============================================
// councilRequests.js
// RESPONSIBILITY: Council Admin review page for the public request survey.
// The backend only answers Admin accounts; this page just explains 401/403 nicely.
// ============================================
import { loadCouncilRequests, reviewCouncilRequest } from './memberApi.js';
import { createElement, showStatus } from './srfscDom.js';

const STATUSES = ['New', 'In review', 'Resolved'];
const list = document.querySelector('#srfsc-council-list');
const status = document.querySelector('#srfsc-council-status');
const filter = document.querySelector('#srfsc-council-filter');
const loginLink = document.querySelector('#srfsc-council-login');

function formatWhen(iso) {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';
}

function detail(label, value, href) {
  const row = createElement('p', 'srfsc-council__detail');
  row.append(createElement('strong', null, `${label}: `));
  if (href) {
    const link = createElement('a', null, value);
    link.href = href;
    row.append(link);
  } else {
    row.append(document.createTextNode(value));
  }
  return row;
}

function renderRequest(request) {
  const card = createElement('article', 'srfsc-council__card');
  card.dataset.status = request.status;
  const heading = createElement('h2', 'srfsc-panel__subtitle', `#${request.id} · ${request.request_type}`);
  card.append(heading, createElement('p', 'srfsc-council__meta', `${request.status} · sent ${formatWhen(request.created_at)}`));
  card.append(detail('From', request.name), detail('Email', request.email, `mailto:${request.email}`));
  if (request.neighborhood) card.append(detail('Neighborhood', request.neighborhood));
  card.append(createElement('p', 'srfsc-council__message', request.message));
  if (request.reviewed_by) {
    card.append(createElement('p', 'srfsc-council__meta', `Last reviewed by ${request.reviewed_by} on ${formatWhen(request.reviewed_at)}`));
  }

  const form = createElement('form', 'srfsc-form srfsc-council__review');
  const statusLabel = createElement('label', 'srfsc-field', 'Status');
  const statusSelect = document.createElement('select');
  statusSelect.name = 'status';
  STATUSES.forEach((value) => {
    const option = createElement('option', null, value);
    option.selected = value === request.status;
    statusSelect.append(option);
  });
  statusLabel.append(statusSelect);
  const noteLabel = createElement('label', 'srfsc-field', 'Council note');
  const note = document.createElement('textarea');
  note.name = 'admin_note';
  note.rows = 2;
  note.maxLength = 2000;
  note.value = request.admin_note || '';
  noteLabel.append(note);
  const save = createElement('button', 'ocs__btn alert-green fill small', 'Save review');
  save.type = 'submit';
  const result = createElement('p', 'srfsc-form__status');
  result.setAttribute('aria-live', 'polite');
  form.append(statusLabel, noteLabel, save, result);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    save.disabled = true;
    showStatus(result, 'Saving…', 'pending');
    try {
      const updated = await reviewCouncilRequest(request.id, { status: statusSelect.value, admin_note: note.value });
      card.replaceWith(renderRequest(updated));
    } catch (error) {
      showStatus(result, error.message, 'error');
      save.disabled = false;
    }
  });
  card.append(form);
  return card;
}

async function refresh() {
  showStatus(status, 'Loading requests…', 'pending');
  list.replaceChildren();
  loginLink.hidden = true;
  try {
    const requests = await loadCouncilRequests(filter.value);
    requests.forEach((request) => list.append(renderRequest(request)));
    const label = filter.value ? `${filter.value.toLowerCase()} ` : '';
    showStatus(status, requests.length ? `${requests.length} ${label}request(s).` : `No ${label}requests yet.`, 'success');
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
