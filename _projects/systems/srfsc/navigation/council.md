---
layout: opencs
title: SRFSC Council Requests
description: Council administrators review requests sent through the SRFSC request survey.
permalink: /capstone/srfsc/app/council/
hide: true
search_exclude: true
---

<!-- markdownlint-disable MD033 -->
<div class="srfsc-app" id="srfsc-council" data-login-url="{{ site.baseurl }}/capstone/srfsc/app/login/">
  {% include projects/srfsc/srfsc-nav.html active="council" %}

  <section class="srfsc-panel">
    <header class="srfsc-panel__header">
      <h1 class="srfsc-panel__title">Council requests</h1>
      <label class="srfsc-field srfsc-council__filter">Show
        <select id="srfsc-council-filter">
          <option value="">All requests</option>
          <option>New</option>
          <option>In review</option>
          <option>Resolved</option>
        </select>
      </label>
    </header>
    <p id="srfsc-council-status" class="srfsc-form__status" role="status" aria-live="polite">Loading requests…</p>
    <a id="srfsc-council-login" href="{{ site.baseurl }}/capstone/srfsc/app/login/" hidden>Sign in with a council admin account</a>
    <div id="srfsc-council-list" class="srfsc-council__list"></div>
  </section>

  <noscript><p>Please enable JavaScript to review requests.</p></noscript>
  {% include projects/srfsc/srfsc-footer.html %}
</div>
<script type="module" src="{{ site.baseurl }}/assets/js/projects/srfsc/councilRequests.js"></script>
