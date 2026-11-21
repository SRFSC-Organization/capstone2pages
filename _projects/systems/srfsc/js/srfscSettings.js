// ============================================
// srfscSettings.js
// RESPONSIBILITY: The SRFSC settings page (navigation/settings.md):
//   1. Account: change the display name, sign out.
//   2. Preferences: start the OCS preferences panel (preferences.js / preferences-layout.js,
//      copied from Open-Coding-Society/pages) and switch its three tabs.
// ============================================
import { loadMemberProfile, saveMemberProfile, logoutMember } from './memberApi.js';
import { showStatus } from './srfscDom.js';
import { PreferencesAPI, initializePreferences } from './preferences.js';
import { initPreferencesLayout } from './preferences-layout.js';

const root = document.querySelector('#srfsc-settings');

// ---------- 1. Account ----------

const status = document.querySelector('#srfsc-settings-status');
const signedOut = document.querySelector('#srfsc-settings-signed-out');
const nameForm = document.querySelector('#srfsc-settings-name');
const nameInput = document.querySelector('#srfsc-settings-display-name');
const logout = document.querySelector('#srfsc-settings-logout');
let profile = null;

// The account service saves the name together with the interest quiz answers (PUT /api/srfsc/profile
// takes both), so a member who has not finished the quiz is sent to My profile to do that first.
async function saveName(event) {
  event.preventDefault();
  const name = nameInput.value.trim();
  if (!profile?.completed) {
    showStatus(status, 'Finish the interest quiz on Interests & membership first; your name is saved with it.', 'error');
    return;
  }
  const submit = nameForm.querySelector('button[type="submit"]');
  submit.disabled = true;
  showStatus(status, 'Saving your name…', 'pending');
  try {
    profile = await saveMemberProfile({ name, answers: profile.answers });
    nameInput.value = profile.name;
    showStatus(status, 'Saved. Your new name shows at the top of every page.', 'success');
    // Update the header right away instead of waiting for the next page.
    document.dispatchEvent(new CustomEvent('srfsc:member', { detail: profile }));
  } catch (error) {
    showStatus(status, error.message, 'error');
  } finally {
    submit.disabled = false;
  }
}

async function loadAccount() {
  try {
    profile = await loadMemberProfile();
    nameInput.value = profile.name || '';
    nameForm.hidden = false;
    status.textContent = '';
    status.className = 'srfsc-form__status';
  } catch (error) {
    // 401: not signed in. Anything else: the account service is unreachable.
    if (error.status === 401) {
      signedOut.hidden = false;
      status.textContent = '';
    } else {
      showStatus(status, error.message, 'error');
    }
  }
}

logout.addEventListener('click', async () => {
  logout.disabled = true;
  try {
    await logoutMember();
    window.location.assign(root.dataset.loginUrl);
  } catch (error) {
    showStatus(status, error.message, 'error');
    logout.disabled = false;
  }
});
nameForm.addEventListener('submit', saveName);
loadAccount();

// ---------- 2. Preferences ----------

// Language menu: one option per language in the site engine's list (assets/js/user-preferences.js),
// A to Z, so the menu and the Google Translate widget always offer the same languages. Runs before
// initializePreferences so a saved language can be selected when the form fills.
const languageSelect = document.getElementById('pref-language');
const languages = Object.values(window.SitePreferences?.LANGUAGES || {})
  .filter((language) => language.code)
  .sort((a, b) => a.name.localeCompare(b.name));
languageSelect.append(...languages.map((language) => new Option(language.name, language.code)));

// SRFSC accounts have no preferences storage yet, and the OCS Spring endpoints these
// call (/api/user/preferences) belong to a different login. Keep preferences in this
// browser's localStorage only, the same path OCS uses for guests.
PreferencesAPI.checkLogin = async () => false;
PreferencesAPI.get = async () => null;
PreferencesAPI.set = async () => false;
PreferencesAPI.delete = async () => false;
initializePreferences(null, null);
initPreferencesLayout();

// Appearance / Language & voice / Head tracking: each tab shows #tab-content-<name>.
const tabs = [...document.querySelectorAll('.srfsc-settings__tab')];
function selectTab(name) {
  tabs.forEach((tab) => {
    const selected = tab.dataset.tab === name;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(`tab-content-${tab.dataset.tab}`);
    if (panel) panel.hidden = !selected;
  });
}
tabs.forEach((tab) => tab.addEventListener('click', () => selectTab(tab.dataset.tab)));
selectTab('appearance');
