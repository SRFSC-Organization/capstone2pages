// ============================================
// liveMap.js
// RESPONSIBILITY: The Scripps Ranch map: live pins for upcoming events and open hazard
// reports (GET /api/srfsc/map, refreshed every minute), and the pin picker on the hazard form.
// Pop-ups are built with textContent so report text can never inject HTML.
// ============================================
import { fetchMapPins } from './srfscApi.js';
import { createElement, formatDate } from './srfscDom.js';
import { loadLeaflet } from './leafletLoader.js';

const CENTER = [32.915, -117.095];
const ZOOM = 13;
// Same box the backend accepts pins in (srfsc_backend/srfsc/models.py SCRIPPS_RANCH_BOUNDS).
const BOUNDS = [[32.88, -117.14], [32.96, -117.04]];
const COUNCIL_OFFICE = { position: [32.9048, -117.1137], label: 'SRFSC office', address: '9903 Businesspark Ave #102' };
const REFRESH_MS = 60 * 1000;

// Keep in step with $srfsc-pin-colors in sass/_map.scss (legend and calendar chips).
const EVENT_COLORS = {
  'Clearing Day': '#3fb37f',
  'Block Meeting': '#60a5fa',
  'Fire Safety Expo': '#e6c27a',
  'Board Meeting': '#b39dfa',
};
const HAZARD_COLOR = '#e8663d';
const OFFICE_COLOR = '#e7e7e5';

async function createMap(container, options = {}) {
  const L = await loadLeaflet();
  const map = L.map(container, { maxBounds: BOUNDS, maxBoundsViscosity: 0.8, minZoom: 12, ...options })
    .setView(CENTER, ZOOM);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  return { L, map };
}

function popup(title, ...lines) {
  const box = createElement('div', 'srfsc-map__popup');
  box.append(createElement('strong', null, title), ...lines.filter(Boolean).map((line) => createElement('p', null, line)));
  return box;
}

function pin(L, position, color, radius = 9) {
  return L.circleMarker(position, { radius, color: '#111214', weight: 2, fillColor: color, fillOpacity: 0.95 });
}

/**
 * Show the live map in `container`; `status` gets a one-line summary. Returns { refresh() }.
 * When the events service is offline, the map still shows the council office and says why pins are missing.
 */
export async function initLiveMap(container, status) {
  let map;
  let L;
  try {
    ({ L, map } = await createMap(container, { scrollWheelZoom: false }));
  } catch (error) {
    status.textContent = `${error.message} Please try reloading the page.`;
    return { refresh() {} };
  }
  pin(L, COUNCIL_OFFICE.position, OFFICE_COLOR, 7)
    .bindPopup(popup(COUNCIL_OFFICE.label, COUNCIL_OFFICE.address))
    .bindTooltip(COUNCIL_OFFICE.label)
    .addTo(map);
  const layer = L.layerGroup().addTo(map);

  async function refresh() {
    try {
      const { events, hazards } = await fetchMapPins();
      layer.clearLayers();
      events.forEach((event) => {
        pin(L, [event.latitude, event.longitude], EVENT_COLORS[event.event_type] || OFFICE_COLOR)
          .bindPopup(popup(event.title, `${formatDate(event.event_date)} · ${event.event_type}`, event.location))
          .bindTooltip(event.title)
          .addTo(layer);
      });
      hazards.forEach((hazard) => {
        pin(L, [hazard.latitude, hazard.longitude], HAZARD_COLOR, 7)
          .bindPopup(popup(hazard.hazard_type, `Status: ${hazard.status}`, hazard.reported && `Reported ${new Date(hazard.reported).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
            'Location is approximate.'))
          .bindTooltip(`${hazard.hazard_type} (${hazard.status})`)
          .addTo(layer);
      });
      const time = new Date().toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      status.textContent = `${events.length} upcoming event${events.length === 1 ? '' : 's'} and ${hazards.length} open hazard report${hazards.length === 1 ? '' : 's'} · updated ${time}`;
    } catch (error) {
      status.textContent = error.offline
        ? 'Live event and hazard pins will appear here when the council calendar service is online.'
        : error.message;
    }
  }

  await refresh();
  const timer = setInterval(() => { if (!document.hidden) refresh(); }, REFRESH_MS);
  window.addEventListener('pagehide', () => clearInterval(timer));
  return { refresh };
}

/**
 * A small map where a neighbor taps to drop one pin. `onChange` gets { latitude, longitude } or null.
 * Returns { clear() }.
 */
export async function initPinPicker(container, onChange) {
  const { L, map } = await createMap(container);
  let marker = null;
  const clear = () => {
    if (marker) marker.remove();
    marker = null;
    onChange(null);
  };
  map.on('click', ({ latlng }) => {
    const point = { latitude: Number(latlng.lat.toFixed(6)), longitude: Number(latlng.lng.toFixed(6)) };
    if (marker) marker.setLatLng(latlng);
    else marker = pin(L, latlng, HAZARD_COLOR).addTo(map);
    onChange(point);
  });
  return { clear };
}
