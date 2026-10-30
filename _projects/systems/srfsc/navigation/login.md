---
layout: opencs
title: SRFSC Member Login
description: Sign in to save your community interests and participation preferences.
permalink: /capstone/srfsc/app/login/
hide: true
---

<div class="srfsc-app">
  {% include projects/srfsc/srfsc-nav.html active="login" %}
  {% include projects/srfsc/srfsc-banner.html photo="involved" eyebrow="Member sign in" title="Welcome back, neighbor" lead="Sign in to save your interests, find your next step, or review council requests." %}
  <div class="srfsc-columns srfsc-columns--auth">
    <section class="srfsc-panel srfsc-auth">
      <h2 class="srfsc-panel__title">Sign in to SRFSC</h2>
      <form id="srfsc-login" class="srfsc-form" data-profile-url="{{ site.baseurl }}/capstone/srfsc/app/profile/" data-council-url="{{ site.baseurl }}/capstone/srfsc/app/council/">
        <label class="srfsc-field" for="srfsc-uid">Username
          <input id="srfsc-uid" name="uid" autocomplete="username" autocapitalize="none" spellcheck="false" required>
        </label>
        <label class="srfsc-field" for="srfsc-password">Password
          <input id="srfsc-password" name="password" type="password" autocomplete="current-password" required>
        </label>
        <button class="ocs__btn alert-green fill srfsc-auth__submit" type="submit" disabled>Sign in</button>
      </form>
      <p id="srfsc-login-status" class="srfsc-form__status" role="status" aria-live="polite"></p>
      <button id="srfsc-login-retry" class="ocs__btn" type="button" hidden>Connect again</button>
      <a id="srfsc-login-continue" class="ocs__btn" href="{{ site.baseurl }}/capstone/srfsc/app/profile/" hidden>You're already signed in. Continue to your profile</a>
      <p class="srfsc-panel__note">Accounts are set up by the council. Need one, or forgot your password? <a href="mailto:srfiresafecouncil@gmail.com">Email the council</a>.</p>
    </section>
    <aside class="srfsc-panel srfsc-auth__aside" aria-label="Why sign in">
      <h2 class="srfsc-panel__title">With an account you can</h2>
      <ul class="srfsc-perks">
        <li>Save your interests with a five-question quiz</li>
        <li>Get suggested events and volunteer projects</li>
        <li>Council admins: review requests from neighbors</li>
      </ul>
      <p class="srfsc-panel__note">No account needed to <a href="{{ site.baseurl }}/capstone/srfsc/app/report/">report a hazard</a>, <a href="{{ site.baseurl }}/capstone/srfsc/app/request/">send a request</a>, or <a href="{{ site.baseurl }}/capstone/srfsc/app/prepare/">prepare your home</a>.</p>
    </aside>
  </div>
  <noscript><p>Please enable JavaScript to sign in and save your profile.</p></noscript>
  {% include projects/srfsc/srfsc-footer.html %}
</div>
<script type="module" src="{{ site.baseurl }}/assets/js/projects/srfsc/memberLogin.js"></script>
