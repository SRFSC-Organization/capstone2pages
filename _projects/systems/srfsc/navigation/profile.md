---
layout: opencs
title: My SRFSC Profile
description: Save your interests and find your next step in the community.
permalink: /capstone/srfsc/app/profile/
hide: true
---

<div class="srfsc-app" id="srfsc-member" data-app-url="{{ site.baseurl }}/capstone/srfsc/app/" data-login-url="{{ site.baseurl }}/capstone/srfsc/app/login/">
  {% include projects/srfsc/srfsc-nav.html active="profile" %}
  {% include projects/srfsc/srfsc-banner.html photo="community" eyebrow="Your community" title="Your interests. Your next step." lead="Tell us what matters to you. Save your preferences and explore ways to get involved." %}
  <p id="srfsc-profile-status" class="srfsc-form__status" role="status" aria-live="polite">Loading your profile…</p>
  <button id="srfsc-profile-retry" class="ocs__btn" type="button" hidden>Try loading again</button>
  <a id="srfsc-session-login" href="{{ site.baseurl }}/capstone/srfsc/app/login/" hidden>Sign in again to save your changes</a>
  <div class="srfsc-columns srfsc-columns--wide-left">
    <section class="srfsc-panel">
      <form id="srfsc-profile" class="srfsc-form" hidden>
        <h2 class="srfsc-panel__title">My profile</h2>
        <label class="srfsc-field" for="srfsc-member-name">Display name
          <input id="srfsc-member-name" name="name" autocomplete="name" minlength="2" maxlength="100" required>
        </label>
        <h2 class="srfsc-panel__title">Find your community interests</h2>
        <p>Five questions, no score. Choose what fits you today.</p>
        <div id="srfsc-quiz-questions" class="srfsc-quiz"></div>
        <button type="submit" class="ocs__btn alert-green fill">Save profile &amp; interests</button>
      </form>
    </section>
    <aside class="srfsc-panel" id="srfsc-member-summary" hidden>
      <h2 class="srfsc-panel__title">Your membership</h2>
      <dl class="srfsc-member-details">
        <dt>User ID</dt><dd id="srfsc-member-uid"></dd>
        <dt>Account role</dt><dd id="srfsc-account-role"></dd>
        <dt>Participation</dt><dd id="srfsc-participation"></dd>
      </dl>
      <p id="srfsc-quiz-progress"></p>
      <h3 class="srfsc-panel__subtitle">Suggested next steps</h3>
      <ul id="srfsc-recommendations"></ul>
      <p class="srfsc-panel__note">Your participation choice describes your interests. Administrator permissions are managed by the council.</p>
    </aside>
  </div>
  <button id="srfsc-logout" type="button" class="ocs__btn" hidden>Sign out</button>
  <noscript><p>Please enable JavaScript to view and update your profile.</p></noscript>
  {% include projects/srfsc/srfsc-footer.html %}
</div>
<script type="module" src="{{ site.baseurl }}/assets/js/projects/srfsc/memberProfile.js"></script>
