// ============================================
// requestForm.js
// RESPONSIBILITY: The public request survey, with up to three optional photos.
// Photos are shrunk in the browser before upload (phone pictures are often larger than the
// server accepts); redrawing them also drops their hidden location data.
// ============================================
import { loadRequestOptions, submitCouncilRequest } from './memberApi.js';
import { createElement, readForm, showStatus } from './srfscDom.js';

const MAX_PHOTOS = 3;
const MAX_SIDE = 1600;

const form = document.querySelector('#srfsc-request-form');
const status = form.querySelector('.srfsc-form__status');
const submit = form.querySelector('button[type="submit"]');
const picker = document.querySelector('#srfsc-request-photos');
const previews = document.querySelector('#srfsc-request-previews');
let photos = [];   // { file, url } in the order they were added

function renderPreviews() {
  previews.replaceChildren(...photos.map((photo, index) => {
    const item = createElement('li', 'srfsc-photo-previews__item');
    const image = createElement('img');
    image.src = photo.url;
    image.alt = `Photo ${index + 1} to send`;
    const remove = createElement('button', 'srfsc-photo-previews__remove', 'Remove');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Remove photo ${index + 1}`);
    remove.addEventListener('click', () => {
      URL.revokeObjectURL(photo.url);
      photos.splice(index, 1);
      renderPreviews();
      picker.focus();
    });
    item.append(image, remove);
    return item;
  }));
  picker.disabled = photos.length >= MAX_PHOTOS;
}

picker.addEventListener('change', () => {
  const chosen = [...picker.files];
  const room = MAX_PHOTOS - photos.length;
  chosen.slice(0, room).forEach((file) => photos.push({ file, url: URL.createObjectURL(file) }));
  if (chosen.length > room) showStatus(status, `Only ${MAX_PHOTOS} photos can be sent with one request.`, 'error');
  picker.value = '';
  renderPreviews();
});

// Redraws a photo at most MAX_SIDE pixels on its longest side and encodes it as JPEG.
async function shrink(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('shrink failed'))), 'image/jpeg', 0.85);
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  submit.disabled = true;
  showStatus(status, photos.length ? 'Preparing photos…' : 'Sending…', 'pending');
  try {
    let body = readForm(form);
    if (photos.length) {
      const data = new FormData();
      Object.entries(body).forEach(([key, value]) => data.append(key, value));
      for (const [index, photo] of photos.entries()) {
        // A photo the browser can't redraw goes as-is; the server checks it either way.
        const shrunk = await shrink(photo.file).catch(() => photo.file);
        data.append('photos', shrunk, `photo-${index + 1}.jpg`);
      }
      showStatus(status, 'Sending…', 'pending');
      body = data;
    }
    const result = await submitCouncilRequest(body);
    showStatus(status, result.message, 'success');
    form.reset();
    photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    photos = [];
    renderPreviews();
  } catch (error) {
    showStatus(status, error.message, 'error');
  } finally {
    submit.disabled = false;
  }
});

// Check the request service before anyone types a long message it can't receive.
loadRequestOptions().catch((error) => {
  if (!error.offline) return;
  showStatus(status, error.message, 'error');
  [...form.elements].forEach((field) => { field.disabled = true; });
});
