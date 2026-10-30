---
layout: opencs
title: Send a Request to SRFSC
description: Ask the Scripps Ranch Fire Safe Council for a home assessment, clearing help, a workshop, or anything else.
permalink: /capstone/srfsc/app/request/
hide: true
---

<!-- markdownlint-disable MD033 -->
<div class="srfsc-app">
  {% include projects/srfsc/srfsc-nav.html active="request" %}
  {% include projects/srfsc/srfsc-banner.html photo="involved" eyebrow="Ask the council" title="Send a request" lead="Need help preparing your home, want a workshop for your street, or have a question? Tell the council and a volunteer will follow up." %}

  <p class="srfsc-alert">Active fire or emergency? <strong>Call 911.</strong> This form is for non-emergency requests only.</p>

  <div class="srfsc-columns srfsc-columns--wide-left">
    <section class="srfsc-panel">
      <h2 class="srfsc-panel__title">Request survey</h2>
      <form class="srfsc-form" id="srfsc-request-form" novalidate>
        <label class="srfsc-field">What do you need?
          <select name="request_type" id="srfsc-request-type" required>
            <option>Home wildfire assessment</option>
            <option>Brush clearing or chipping help</option>
            <option>Workshop or presentation</option>
            <option>Volunteer opportunity</option>
            <option>Question or feedback</option>
          </select>
        </label>
        <label class="srfsc-field">Your name<input name="name" required minlength="2" maxlength="100" autocomplete="name"></label>
        <label class="srfsc-field">Email (so the council can reply)<input name="email" type="email" required autocomplete="email"></label>
        <label class="srfsc-field">Neighborhood or street <span class="srfsc-field__optional">(optional)</span><input name="neighborhood" maxlength="100" placeholder="e.g. Ironwood Rd"></label>
        <label class="srfsc-field">Tell us more<textarea name="message" rows="5" required minlength="10" maxlength="2000"></textarea></label>
        <button class="ocs__btn alert-green fill" type="submit">Send request</button>
        <p class="srfsc-form__status" aria-live="polite"></p>
      </form>
    </section>

    <aside class="srfsc-panel">
      <h2 class="srfsc-panel__title">What happens next</h2>
      <ol class="srfsc-steps">
        <li><strong>New.</strong> Your request reaches the council.</li>
        <li><strong>In review.</strong> A council member reads it and plans the next step.</li>
        <li><strong>Resolved.</strong> The council replies or follows up by email.</li>
      </ol>
      <p class="srfsc-panel__note">Your email is only visible to council administrators.</p>
    </aside>
  </div>

  {% include projects/srfsc/srfsc-footer.html %}
</div>

<script type="module">
  import { bindForm, showStatus } from '{{site.baseurl}}/assets/js/projects/srfsc/srfscDom.js';
  import { loadRequestOptions, submitCouncilRequest } from '{{site.baseurl}}/assets/js/projects/srfsc/memberApi.js';

  const form = document.getElementById('srfsc-request-form');
  bindForm(form, {
    submitFn: submitCouncilRequest,
    successMessage: (result) => result.message,
  });
  // Check the request service before anyone types a long message it can't receive.
  loadRequestOptions().catch((error) => {
    if (!error.offline) return;
    showStatus(form.querySelector('.srfsc-form__status'), error.message, 'error');
    [...form.elements].forEach((field) => { field.disabled = true; });
  });
</script>
