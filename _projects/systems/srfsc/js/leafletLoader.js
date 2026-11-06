// ============================================
// leafletLoader.js
// RESPONSIBILITY: Load the Leaflet map library (from cdnjs) once, only on pages that show a map.
// ============================================
const LEAFLET = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min';

let loading = null;

function addTag(tag, attributes) {
  return new Promise((resolve, reject) => {
    const element = Object.assign(document.createElement(tag), attributes);
    element.addEventListener('load', resolve);
    element.addEventListener('error', () => reject(new Error('The map could not be loaded.')));
    document.head.append(element);
  });
}

/** Resolves to the global `L` once Leaflet's script and stylesheet have loaded. */
export function loadLeaflet() {
  loading = loading || Promise.all([
    addTag('link', { rel: 'stylesheet', href: `${LEAFLET}.css`, crossOrigin: 'anonymous' }),
    addTag('script', { src: `${LEAFLET}.js`, crossOrigin: 'anonymous' }),
  ]).then(() => window.L);
  return loading;
}
