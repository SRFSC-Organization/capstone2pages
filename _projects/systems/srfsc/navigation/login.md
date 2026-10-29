---
layout: opencs
title: SRFSC Member Login
description: Sign in to save your community interests and participation preferences.
permalink: /capstone/srfsc/app/login/
hide: true
---

<div class="srfsc-app">
  {% include projects/srfsc/srfsc-nav.html active="login" %}
  {% include projects/srfsc/srfsc-banner.html photo="community" eyebrow="Your community" title="Welcome back, neighbor" lead="Sign in to save your interests and discover ways to participate in Scripps Ranch." %}
  <div class="srfsc-columns">
    <section class="srfsc-panel">
      <h2 class="srfsc-panel__title">Member login</h2>
      <form id="srfsc-login" class="srfsc-form" data-profile-url="{{ site.baseurl }}/capstone/srfsc/app/profile/">
        <label class="srfsc-field" for="srfsc-uid">User ID
          <input id="srfsc-uid" name="uid" autocomplete="username" required>
        </label>
        <label class="srfsc-field" for="srfsc-password">Password
          <input id="srfsc-password" name="password" type="password" autocomplete="current-password" required>
        </label>
        <button class="ocs__btn alert-green fill" type="submit" disabled>Sign in &amp; open my profile</button>
      </form>
      <p id="srfsc-login-status" class="srfsc-form__status" role="status" aria-live="polite"></p>
      <button id="srfsc-login-retry" class="ocs__btn" type="button" hidden>Connect again</button>
      <a id="srfsc-login-continue" href="{{ site.baseurl }}/capstone/srfsc/app/profile/" hidden>Continue to your profile</a>
      <p class="srfsc-panel__note">Use your existing verified account. Need an account or help signing in? <a href="mailto:srfiresafecouncil@gmail.com">Contact the council</a>.</p>
    </section>
    <aside class="srfsc-panel">
      <h2 class="srfsc-panel__title">Make this your community hub</h2>
      <p>A short interest quiz helps you find preparation resources, community events, and volunteer opportunities.</p>
      <p>Choose Resident or Volunteer to describe how you want to participate. Council administrator access is assigned separately.</p>
      <p>You can still explore public resources without an account.</p>
      <a href="{{ site.baseurl }}/capstone/srfsc/app/prepare/">Explore preparation resources</a>
    </aside>
  </div>
  <noscript><p>Please enable JavaScript to sign in and save your profile.</p></noscript>
  {% include projects/srfsc/srfsc-footer.html %}
</div>
<script type="module" src="{{ site.baseurl }}/assets/js/projects/srfsc/memberLogin.js"></script>
