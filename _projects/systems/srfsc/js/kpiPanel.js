// ============================================
// kpiPanel.js
// RESPONSIBILITY: Fill every [data-live-stat] element on the page from /api/srfsc/stats.
// When the backend is unavailable, live-only tiles are hidden and [data-offline-text] elements
// show their fallback wording instead of empty dashes.
// ============================================
import { fetchStats } from './srfscApi.js';

/** @returns {Promise<object|null>} the stats payload, or null when the backend is unreachable */
export async function loadKpiPanel() {
  try {
    const stats = await fetchStats();
    document.querySelectorAll('[data-live-stat]').forEach((element) => {
      const value = stats[element.dataset.liveStat];
      if (value === undefined) return;
      element.textContent = element.dataset.liveStat === 'upcoming_events' ? `${value} scheduled` : value;
    });
    // A row of zeros reads as "nobody uses this": hide empty live tiles and fall back to the
    // inviting wording on status lines whose every live number is still 0.
    document.querySelectorAll('.srfsc-kpi--live').forEach((tile) => {
      const stat = tile.querySelector('[data-live-stat]');
      if (stat && stats[stat.dataset.liveStat] === 0) tile.hidden = true;
    });
    document.querySelectorAll('[data-offline-text]').forEach((element) => {
      const values = [...element.querySelectorAll('[data-live-stat]')].map((stat) => stats[stat.dataset.liveStat]);
      if (values.length && values.every((value) => value === 0)) element.textContent = element.dataset.offlineText;
    });
    return stats;
  } catch (error) {
    // Live counts are a bonus; static impact numbers still render without the backend.
    console.warn('SRFSC stats unavailable:', error.message);
    document.querySelectorAll('.srfsc-kpi--live').forEach((tile) => { tile.hidden = true; });
    document.querySelectorAll('[data-offline-text]').forEach((element) => {
      element.textContent = element.dataset.offlineText;
    });
    return null;
  }
}
