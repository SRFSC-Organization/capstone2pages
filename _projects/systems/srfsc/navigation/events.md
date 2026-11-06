---
layout: opencs
title: SRFSC Calendar & Map
description: A live calendar and map of clearing days, block meetings, fire safety events, and reported hazards in Scripps Ranch, with one-click RSVP.
permalink: /capstone/srfsc/app/events/
hide: true
---

<!-- markdownlint-disable MD033 -->
<div class="srfsc-app">
  {% include projects/srfsc/srfsc-nav.html active="events" %}
  {% include projects/srfsc/srfsc-banner.html photo="events" eyebrow="Join your neighbors" title="Calendar &amp; map" lead="See what is coming up, where it happens, and which hazards neighbors have reported. Both update live." %}

  <div class="srfsc-columns srfsc-columns--calendar-map">
    <section class="srfsc-panel srfsc-calendar" id="srfsc-calendar" aria-labelledby="srfsc-calendar-heading">
      <header class="srfsc-calendar__header">
        <h2 class="srfsc-panel__title" id="srfsc-calendar-heading" data-calendar-title>Calendar</h2>
        <div class="srfsc-calendar__nav">
          <button type="button" class="ocs__btn small" data-calendar-prev aria-label="Previous month">&lsaquo;</button>
          <button type="button" class="ocs__btn small" data-calendar-today>Today</button>
          <button type="button" class="ocs__btn small" data-calendar-next aria-label="Next month">&rsaquo;</button>
        </div>
      </header>
      <ol class="srfsc-calendar__weekdays" aria-hidden="true">
        <li>Sun</li><li>Mon</li><li>Tue</li><li>Wed</li><li>Thu</li><li>Fri</li><li>Sat</li>
      </ol>
      <ol class="srfsc-calendar__grid" data-calendar-grid aria-label="Days this month"></ol>
      <p class="srfsc-panel__note" data-calendar-status role="status">Loading the calendar…</p>
    </section>

    <section class="srfsc-panel srfsc-map" aria-labelledby="srfsc-map-heading">
      <h2 class="srfsc-panel__title" id="srfsc-map-heading">Live map</h2>
      <div class="srfsc-map__canvas" id="srfsc-live-map" role="region" aria-label="Map of Scripps Ranch events and reported hazards"></div>
      <ul class="srfsc-map__legend" aria-label="Map key">
        <li data-type="Clearing Day">Clearing day</li>
        <li data-type="Block Meeting">Block meeting</li>
        <li data-type="Fire Safety Expo">Fire safety expo</li>
        <li data-type="Hazard">Reported hazard</li>
        <li data-type="Office">SRFSC office</li>
      </ul>
      <p class="srfsc-panel__note" id="srfsc-map-status" role="status">Loading the map…</p>
    </section>
  </div>

  <div class="srfsc-columns srfsc-columns--wide-left">
    <section class="srfsc-panel">
      <header class="srfsc-panel__header">
        <h2 class="srfsc-panel__title">Upcoming events</h2>
        <span class="srfsc-panel__meta" data-live-stat="upcoming_events"></span>
      </header>
      <div class="srfsc-events" id="srfsc-events"><p class="srfsc-empty">Loading events…</p></div>
    </section>

    <aside class="srfsc-panel">
      <h2 class="srfsc-panel__title">What to expect</h2>
      <dl class="srfsc-facts">
        <dt>Clearing Day</dt>
        <dd>A monthly work party along canyon edges. Gloves and tools are provided. Wear long sleeves and closed-toe shoes.</dd>
        <dt>Block Meeting</dt>
        <dd>A neighbor hosts the conversation while the council shares defensible-space and evacuation tips for your street.</dd>
        <dt>Fire Safety Expo</dt>
        <dd>Meet San Diego Fire-Rescue and CAL FIRE, see home-hardening demos, and pick up practical checklists.</dd>
      </dl>
      <p class="srfsc-panel__note">Can't make it? <a href="{{ site.baseurl }}/capstone/srfsc/app/get-involved/">Sign up to volunteer</a> and we'll reach out about future events.</p>
    </aside>
  </div>

  {% include projects/srfsc/srfsc-footer.html %}
</div>

<script type="module">
  import { loadEventsPanel } from '{{site.baseurl}}/assets/js/projects/srfsc/eventsPanel.js';
  import { loadKpiPanel } from '{{site.baseurl}}/assets/js/projects/srfsc/kpiPanel.js';
  import { initEventsCalendar } from '{{site.baseurl}}/assets/js/projects/srfsc/eventsCalendar.js';
  import { initLiveMap } from '{{site.baseurl}}/assets/js/projects/srfsc/liveMap.js';

  loadKpiPanel();
  loadEventsPanel(loadKpiPanel);
  initEventsCalendar(document.getElementById('srfsc-calendar'));
  initLiveMap(document.getElementById('srfsc-live-map'), document.getElementById('srfsc-map-status'));
</script>
