// ============================================
// eventsCalendar.js
// RESPONSIBILITY: Month calendar of council events (all of them, past included), refreshed every
// minute. Upcoming events link to their card in the RSVP list below.
// ============================================
import { fetchAllEvents } from './srfscApi.js';
import { createElement } from './srfscDom.js';

const REFRESH_MS = 60 * 1000;
const isoDay = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const monthKey = (date) => isoDay(date).slice(0, 7);

export function initEventsCalendar(root) {
  const title = root.querySelector('[data-calendar-title]');
  const grid = root.querySelector('[data-calendar-grid]');
  const status = root.querySelector('[data-calendar-status]');
  const today = new Date();
  let shown = new Date(today.getFullYear(), today.getMonth(), 1);
  let events = [];

  function chip(event) {
    const upcoming = event.event_date >= isoDay(today);
    const item = createElement(upcoming ? 'a' : 'span', 'srfsc-calendar__event', event.title);
    item.dataset.type = event.event_type;
    item.title = `${event.title} · ${event.location}`;
    if (upcoming) item.href = `#srfsc-event-${event.id}`;
    else item.classList.add('srfsc-calendar__event--past');
    return item;
  }

  function render() {
    title.textContent = shown.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    const byDay = new Map();
    events.forEach((event) => byDay.set(event.event_date, [...(byDay.get(event.event_date) || []), event]));
    const first = shown.getDay();
    const days = new Date(shown.getFullYear(), shown.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let blank = 0; blank < first; blank += 1) cells.push(createElement('li', 'srfsc-calendar__day srfsc-calendar__day--blank'));
    for (let day = 1; day <= days; day += 1) {
      const date = new Date(shown.getFullYear(), shown.getMonth(), day);
      const key = isoDay(date);
      const dayEvents = byDay.get(key) || [];
      const cell = createElement('li', 'srfsc-calendar__day');
      if (key === isoDay(today)) {
        cell.classList.add('srfsc-calendar__day--today');
        cell.setAttribute('aria-current', 'date');
      }
      const label = date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
      cell.setAttribute('aria-label', dayEvents.length ? `${label}: ${dayEvents.map((e) => e.title).join(', ')}` : label);
      cell.append(createElement('span', 'srfsc-calendar__date', String(day)), ...dayEvents.map(chip));
      cells.push(cell);
    }
    grid.replaceChildren(...cells);
    const inMonth = events.filter((event) => event.event_date.startsWith(monthKey(shown)));
    if (status.dataset.offline !== 'true') {
      status.textContent = inMonth.length ? `${inMonth.length} event${inMonth.length === 1 ? '' : 's'} this month` : 'No events this month.';
    }
  }

  function move(months) {
    shown = months === 0 ? new Date(today.getFullYear(), today.getMonth(), 1)
      : new Date(shown.getFullYear(), shown.getMonth() + months, 1);
    render();
  }
  root.querySelector('[data-calendar-prev]').addEventListener('click', () => move(-1));
  root.querySelector('[data-calendar-next]').addEventListener('click', () => move(1));
  root.querySelector('[data-calendar-today]').addEventListener('click', () => move(0));

  async function refresh() {
    try {
      events = await fetchAllEvents();
      status.dataset.offline = 'false';
    } catch (error) {
      status.dataset.offline = 'true';
      status.textContent = error.offline
        ? 'The live calendar is offline right now. Clearing days run monthly; call 858-201-3711 for the next date.'
        : error.message;
    }
    render();
  }

  render();
  refresh();
  const timer = setInterval(() => { if (!document.hidden) refresh(); }, REFRESH_MS);
  window.addEventListener('pagehide', () => clearInterval(timer));
}
