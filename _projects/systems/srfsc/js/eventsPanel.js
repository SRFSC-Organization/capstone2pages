// ============================================
// eventsPanel.js
// RESPONSIBILITY: Render upcoming events and let neighbors RSVP inline.
// ============================================
import { fetchUpcomingEvents, rsvpToEvent } from './srfscApi.js';
import { bindForm, createElement } from './srfscDom.js';
import { DEMO_EVENT_LABEL, DEMO_EVENTS_NOTICE, OFFLINE_EVENTS_MESSAGE } from './srfscFallback.js';

const rsvpLabel = (count) => {
  if (!count) return 'Be the first to RSVP';
  return count === 1 ? '1 neighbor going' : `${count} neighbors going`;
};

function buildDateBadge(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const badge = createElement('div', 'srfsc-event__date');
  badge.append(
    createElement('span', 'srfsc-event__month', date.toLocaleDateString(undefined, { month: 'short' })),
    createElement('span', 'srfsc-event__day', String(day)),
    createElement('span', 'srfsc-event__weekday', date.toLocaleDateString(undefined, { weekday: 'short' })),
  );
  return badge;
}

function buildRsvpForm(event, countLabel, onRsvp) {
  const form = createElement('form', 'srfsc-form srfsc-rsvp');
  form.hidden = true;
  form.noValidate = true;
  const nameInput = Object.assign(document.createElement('input'),
    { name: 'name', placeholder: 'Your name', required: true, maxLength: 128, autocomplete: 'name' });
  const emailInput = Object.assign(document.createElement('input'),
    { name: 'email', type: 'email', placeholder: 'Email', required: true, autocomplete: 'email' });
  nameInput.setAttribute('aria-label', `Name for ${event.title}`);
  emailInput.setAttribute('aria-label', `Email for ${event.title}`);
  const submit = createElement('button', 'ocs__btn alert-yellow fill small', "I'm going");
  submit.type = 'submit';
  form.append(nameInput, emailInput, submit, createElement('p', 'srfsc-form__status'));

  bindForm(form, {
    submitFn: (attendee) => rsvpToEvent(event.id, attendee),
    successMessage: (result) => result.message,
    onSuccess: (result) => {
      countLabel.textContent = rsvpLabel(result.rsvp_count);
      onRsvp();
    },
  });
  return form;
}

function buildEventCard(event, onRsvp) {
  const card = createElement('article', event.is_demo ? 'srfsc-event srfsc-event--demo' : 'srfsc-event');
  card.id = `srfsc-event-${event.id}`;
  const body = createElement('div', 'srfsc-event__body');
  if (event.is_demo) body.append(createElement('span', 'srfsc-event__sample', DEMO_EVENT_LABEL));
  body.append(
    createElement('span', 'srfsc-event__type', event.event_type),
    createElement('h3', 'srfsc-event__title', event.title),
    createElement('p', 'srfsc-event__location', event.location),
  );
  if (event.description) body.append(createElement('p', 'srfsc-event__desc', event.description));
  // Sample events take no RSVPs (the backend refuses them too), so neighbors never sign up for a made-up date.
  if (event.is_demo) {
    card.append(buildDateBadge(event.event_date), body);
    return card;
  }

  const countLabel = createElement('span', 'srfsc-event__rsvps', rsvpLabel(event.rsvp_count));
  const rsvpForm = buildRsvpForm(event, countLabel, onRsvp);
  const toggle = createElement('button', 'ocs__btn alert-yellow small', 'RSVP');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => {
    rsvpForm.hidden = !rsvpForm.hidden;
    toggle.setAttribute('aria-expanded', String(!rsvpForm.hidden));
    if (!rsvpForm.hidden) rsvpForm.querySelector('input').focus();
  });

  const footer = createElement('div', 'srfsc-event__footer');
  footer.append(countLabel, toggle);
  body.append(footer, rsvpForm);
  card.append(buildDateBadge(event.event_date), body);
  return card;
}

/** @param {() => void} onRsvp called after any successful RSVP so other panels can refresh */
export async function loadEventsPanel(onRsvp) {
  const container = document.getElementById('srfsc-events');
  try {
    const events = await fetchUpcomingEvents();
    if (events.length === 0) {
      container.replaceChildren(createElement('p', 'srfsc-empty', 'No upcoming events yet. Check back soon.'));
      return;
    }
    const cards = events.map((event) => buildEventCard(event, onRsvp));
    if (events.some((event) => event.is_demo)) cards.unshift(createElement('p', 'srfsc-demo-notice', DEMO_EVENTS_NOTICE));
    container.replaceChildren(...cards);
    // Hub links target #srfsc-event-<id>; cards render after load, so scroll to the target by hand.
    if (location.hash.startsWith('#srfsc-event-')) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'center' });
    }
  } catch (error) {
    container.replaceChildren(createElement('p', 'srfsc-empty', error.offline ? OFFLINE_EVENTS_MESSAGE : error.message));
  }
}
