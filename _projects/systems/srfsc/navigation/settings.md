---
layout: opencs
title: SRFSC Settings
description: Change your display name and your site preferences (theme, text, language, voice).
permalink: /capstone/srfsc/app/settings/
hide: true
---

<!-- markdownlint-disable MD033 -->
<!-- Opened from the member's name in the site header. Account: srfscSettings.js. Preferences: srfsc-preferences.html. -->
<div class="srfsc-app srfsc-settings" id="srfsc-settings" data-login-url="{{ site.baseurl }}/capstone/srfsc/app/login/">
  {% include projects/srfsc/srfsc-nav.html active="profile" %}
  {% include projects/srfsc/srfsc-banner.html photo="community" eyebrow="Your account" title="Settings" lead="Change how your name appears and how the site looks, reads, and sounds for you." %}

  <section class="srfsc-panel" id="srfsc-settings-account" aria-labelledby="srfsc-settings-account-title">
    <h2 class="srfsc-panel__title" id="srfsc-settings-account-title">Account</h2>
    <p id="srfsc-settings-status" class="srfsc-form__status" role="status" aria-live="polite">Loading your account…</p>

    <p id="srfsc-settings-signed-out" hidden>
      <a class="ocs__btn alert-ember fill" href="{{ site.baseurl }}/capstone/srfsc/app/login/">Sign in</a>
      to change your display name. Your preferences below work without an account.
    </p>

    <form id="srfsc-settings-name" class="srfsc-form srfsc-settings__name" hidden>
      <label class="srfsc-field" for="srfsc-settings-display-name">Display name
        <input id="srfsc-settings-display-name" name="name" autocomplete="name" minlength="2" maxlength="100" required>
      </label>
      <p class="srfsc-panel__note">Shown at the top right of every page while you are signed in.</p>
      <div class="ocs__links">
        <button type="submit" class="ocs__btn alert-green fill">Save name</button>
        <a class="ocs__btn" href="{{ site.baseurl }}/capstone/srfsc/app/profile/">Interests &amp; membership</a>
        <button id="srfsc-settings-logout" type="button" class="ocs__btn">Sign out</button>
      </div>
    </form>
  </section>

  <section class="srfsc-panel" id="srfsc-settings-preferences" aria-labelledby="srfsc-settings-preferences-title">
    <h2 class="srfsc-panel__title" id="srfsc-settings-preferences-title">Preferences</h2>
    <p class="srfsc-panel__note srfsc-panel__intro">Saved in this browser. Pick a theme, adjust text and buttons, choose a language or voice, then press Save.</p>
    {% include projects/srfsc/srfsc-preferences.html %}
  </section>

  <noscript><p>Please enable JavaScript to change your settings.</p></noscript>
  {% include projects/srfsc/srfsc-footer.html %}
</div>
<script type="module" src="{{ site.baseurl }}/assets/js/projects/srfsc/srfscSettings.js"></script>
