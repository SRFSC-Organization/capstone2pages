// ============================================
// councilRequest.js
// RESPONSIBILITY: One survey request on its own page (?id=N) for council Admins: the message,
// its photos, the sender's contact details, and the review form. Photos are fetched with the
// admin's login cookie and shown from in-memory copies, since only Admins may load them.
// ============================================
import { loadCouncilRequest, loadRequestPhoto, reviewCouncilRequest } from './memberApi.js';
import { createElement, showStatus } from './srfscDom.js';

const id = new URLSearchParams(window.location.search).get('id');
const status = document.querySelector('#srfsc-request-status');
const article = document.querySelector('#srfsc-request');
const form = document.querySelector('#srfsc-review-form');
const formStatus = form.querySelector('.srfsc-form__status');
const save = form.querySelector('button[type="submit"]');
const photoUrls = [];

const formatWhen = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '');

function contactRow(label, value, href) {
  const term = createElement('dt', null, label);
  const detail = createElement('dd');
  if (href) {
    const link = createElement('a', null, value);
    link.href = href;
    detail.append(link);
  } else {
    detail.textContent = value;
  }
  return [term, detail];
}

function showReview(request) {
  document.querySelector('#srfsc-request-badge').textContent = request.status;
  document.querySelector('#srfsc-request-badge').dataset.status = request.status;
  document.querySelector('#srfsc-request-reviewed').textContent = request.reviewed_by
    ? `Last reviewed by ${request.reviewed_by} on ${formatWhen(request.reviewed_at)}` : 'Not reviewed yet.';
  form.elements.status.value = request.status;
  form.elements.admin_note.value = request.admin_note || '';
}

async function showPhotos(request) {
  if (!request.photo_ids.length) return;
  const list = document.querySelector('#srfsc-request-photos');
  document.querySelector('#srfsc-request-photos-section').hidden = false;
  for (const [index, photoId] of request.photo_ids.entries()) {
    const item = createElement('li');
    list.append(item);
    try {
      const url = URL.createObjectURL(await loadRequestPhoto(request.id, photoId));
      photoUrls.push(url);
      // Each photo opens full size in a new tab.
      const link = createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener';
      const image = createElement('img');
      image.src = url;
      image.alt = `Photo ${index + 1} sent with request #${request.id}`;
      link.append(image);
      item.append(link);
    } catch (error) {
      item.append(createElement('p', 'srfsc-council__meta', `Photo ${index + 1} could not be loaded: ${error.message}`));
    }
  }
}

async function load() {
  if (!id) {
    showStatus(status, 'No request was chosen. Go back to all requests and pick one.', 'error');
    return;
  }
  try {
    const request = await loadCouncilRequest(id);
    document.title = `Request #${request.id} · SRFSC Council`;
    document.querySelector('#srfsc-request-title').textContent = `#${request.id} · ${request.request_type}`;
    document.querySelector('#srfsc-request-sent').textContent = `Sent ${formatWhen(request.created_at)}`;
    document.querySelector('#srfsc-request-message').textContent = request.message;
    document.querySelector('#srfsc-request-contact').append(
      ...contactRow('Name', request.name),
      ...contactRow('Email', request.email, `mailto:${request.email}`),
      ...(request.neighborhood ? contactRow('Neighborhood', request.neighborhood) : []),
    );
    showReview(request);
    status.hidden = true;
    article.hidden = false;
    showPhotos(request);
  } catch (error) {
    if (error.status === 401) {
      showStatus(status, 'Sign in with your council admin account to see this request.', 'error');
      document.querySelector('#srfsc-request-login').hidden = false;
    } else if (error.status === 403) {
      showStatus(status, 'This page is only for council administrators.', 'error');
    } else {
      showStatus(status, error.message, 'error');
    }
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  save.disabled = true;
  showStatus(formStatus, 'Saving…', 'pending');
  try {
    const updated = await reviewCouncilRequest(id, { status: form.elements.status.value, admin_note: form.elements.admin_note.value });
    showReview(updated);
    showStatus(formStatus, 'Review saved.', 'success');
  } catch (error) {
    showStatus(formStatus, error.message, 'error');
  } finally {
    save.disabled = false;
  }
});

window.addEventListener('pagehide', () => photoUrls.forEach((url) => URL.revokeObjectURL(url)));
load();
