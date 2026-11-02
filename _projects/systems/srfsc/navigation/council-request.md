---
layout: opencs
title: SRFSC Council Request
description: One request sent through the SRFSC request survey, for council administrators to review.
permalink: /capstone/srfsc/app/council/request/
hide: true
search_exclude: true
---

<!-- markdownlint-disable MD033 -->
<div class="srfsc-app" id="srfsc-request-detail">
  {% include projects/srfsc/srfsc-nav.html active="council" %}

  <p class="srfsc-back"><a href="{{ site.baseurl }}/capstone/srfsc/app/council/">&larr; All requests</a></p>
  <h1 class="srfsc-request__title" id="srfsc-request-title">Council request</h1>
  <p id="srfsc-request-status" class="srfsc-form__status" role="status" aria-live="polite">Loading request…</p>
  <a id="srfsc-request-login" class="ocs__btn small" href="{{ site.baseurl }}/capstone/srfsc/app/login/" hidden>Sign in with a council admin account</a>

  <article id="srfsc-request" class="srfsc-request" hidden>
    <header class="srfsc-request__header">
      <span class="srfsc-council__badge" id="srfsc-request-badge"></span>
      <p class="srfsc-council__meta" id="srfsc-request-sent"></p>
    </header>

    <div class="srfsc-columns srfsc-columns--wide-left">
      <section class="srfsc-panel" aria-labelledby="srfsc-request-message-title">
        <h2 class="srfsc-panel__title" id="srfsc-request-message-title">Message</h2>
        <p class="srfsc-council__message" id="srfsc-request-message"></p>
        <div id="srfsc-request-photos-section" hidden>
          <h2 class="srfsc-panel__title">Photos</h2>
          <ul class="srfsc-request__photos" id="srfsc-request-photos"></ul>
        </div>
      </section>

      <aside class="srfsc-panel" aria-label="Contact and review">
        <h2 class="srfsc-panel__title">From</h2>
        <dl class="srfsc-request__contact" id="srfsc-request-contact"></dl>

        <h2 class="srfsc-panel__title">Review</h2>
        <form class="srfsc-form" id="srfsc-review-form">
          <label class="srfsc-field">Status
            <select name="status" id="srfsc-review-status">
              <option>New</option>
              <option>In review</option>
              <option>Resolved</option>
            </select>
          </label>
          <label class="srfsc-field">Council note
            <textarea name="admin_note" id="srfsc-review-note" rows="4" maxlength="2000"></textarea>
          </label>
          <button class="ocs__btn alert-green fill" type="submit">Save review</button>
          <p class="srfsc-form__status" aria-live="polite"></p>
        </form>
        <p class="srfsc-council__meta" id="srfsc-request-reviewed"></p>
      </aside>
    </div>
  </article>

  <noscript><p>Please enable JavaScript to review requests.</p></noscript>
  {% include projects/srfsc/srfsc-footer.html %}
</div>
<script type="module" src="{{ site.baseurl }}/assets/js/projects/srfsc/councilRequest.js"></script>
