---
layout: opencs
title: SRFSC Create an Account
description: Create a free SRFSC member account to save your interests and get suggested next steps.
permalink: /capstone/srfsc/app/signup/
hide: true
---

<div class="srfsc-app">
  {% include projects/srfsc/srfsc-nav.html active="signup" %}
  {% include projects/srfsc/srfsc-banner.html photo="involved" eyebrow="Join the council" title="Create your account" lead="It's free. Save your interests, get suggested events and volunteer projects, and keep track of how you can help." %}
  <div class="srfsc-columns srfsc-columns--auth">
    <section class="srfsc-panel srfsc-auth">
      <h2 class="srfsc-panel__title">Sign up for SRFSC</h2>
      <form id="srfsc-signup" class="srfsc-form" data-profile-url="{{ site.baseurl }}/capstone/srfsc/app/profile/">
        <label class="srfsc-field" for="srfsc-signup-name">Your name
          <input id="srfsc-signup-name" name="name" autocomplete="name" required minlength="2" maxlength="100">
        </label>
        <label class="srfsc-field" for="srfsc-signup-uid">Username
          <input id="srfsc-signup-uid" name="uid" autocomplete="username" autocapitalize="none" spellcheck="false" required minlength="3" maxlength="40" pattern="[A-Za-z0-9._\-]+" aria-describedby="srfsc-signup-uid-hint">
          <span id="srfsc-signup-uid-hint" class="srfsc-field__hint">3-40 letters, numbers, dots, dashes, or underscores.</span>
        </label>
        <label class="srfsc-field" for="srfsc-signup-password">Password
          <input id="srfsc-signup-password" name="password" type="password" autocomplete="new-password" required minlength="12" maxlength="200" aria-describedby="srfsc-signup-password-hint">
          <span id="srfsc-signup-password-hint" class="srfsc-field__hint">At least 12 characters.</span>
        </label>
        <label class="srfsc-field" for="srfsc-signup-confirm">Confirm password
          <input id="srfsc-signup-confirm" name="confirm" type="password" autocomplete="new-password" required minlength="12" maxlength="200">
        </label>
        <button class="ocs__btn alert-green fill srfsc-auth__submit" type="submit" disabled>Create account</button>
      </form>
      <p id="srfsc-signup-status" class="srfsc-form__status" role="status" aria-live="polite"></p>
      <button id="srfsc-signup-retry" class="ocs__btn" type="button" hidden>Connect again</button>
      <p class="srfsc-auth__switch">Already have an account? <a href="{{ site.baseurl }}/capstone/srfsc/app/login/">Sign in</a></p>
    </section>
    <aside class="srfsc-panel srfsc-auth__aside" aria-label="Why create an account">
      <h2 class="srfsc-panel__title">With an account you can</h2>
      <ul class="srfsc-perks">
        <li>Save your interests with a five-question quiz</li>
        <li>Get suggested events and volunteer projects</li>
        <li>Come back any time to update your answers</li>
      </ul>
      <p class="srfsc-panel__note">No account needed to <a href="{{ site.baseurl }}/capstone/srfsc/app/report/">report a hazard</a>, <a href="{{ site.baseurl }}/capstone/srfsc/app/request/">send a request</a>, or <a href="{{ site.baseurl }}/capstone/srfsc/app/prepare/">prepare your home</a>.</p>
    </aside>
  </div>
  <noscript><p>Please enable JavaScript to create an account.</p></noscript>
  {% include projects/srfsc/srfsc-footer.html %}
</div>
<script type="module" src="{{ site.baseurl }}/assets/js/projects/srfsc/memberSignup.js"></script>
