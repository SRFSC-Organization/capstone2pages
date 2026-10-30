import { loadInterestQuiz, loadMemberProfile, saveMemberProfile, logoutMember } from './memberApi.js';
import { readQuizAnswers } from './memberQuiz.js';
import { createElement, showStatus } from './srfscDom.js';

const root = document.querySelector('#srfsc-member');
const form = document.querySelector('#srfsc-profile');
const status = document.querySelector('#srfsc-profile-status');
const submit = form.querySelector('button[type="submit"]');
const logout = document.querySelector('#srfsc-logout');
let questions = [];

function renderQuestion(question, answers) {
  const fieldset = createElement('fieldset', 'srfsc-quiz__question');
  fieldset.append(createElement('legend', '', question.label));
  const selected = question.multiple ? (answers[question.id] || []) : [answers[question.id]];
  for (const option of question.options) {
    const label = createElement('label', 'srfsc-quiz__option');
    const input = document.createElement('input');
    input.type = question.multiple ? 'checkbox' : 'radio';
    input.name = question.id;
    input.value = option.value;
    input.checked = selected.includes(option.value);
    input.required = !question.multiple;
    label.append(input, createElement('span', '', option.label));
    fieldset.append(label);
  }
  return fieldset;
}

function renderSummary(profile) {
  document.querySelector('#srfsc-account-role').textContent = profile.account_role;
  document.querySelector('#srfsc-council-link').hidden = profile.account_role !== 'Admin';
  document.querySelector('#srfsc-participation').textContent = profile.participation_role === 'volunteer' ? 'Volunteer' : 'Resident';
  document.querySelector('#srfsc-quiz-progress').textContent = profile.completed
    ? `Quiz complete · Saved ${new Date(profile.updated_at).toLocaleString()}`
    : 'Your quiz has not been completed yet.';
  const list = document.querySelector('#srfsc-recommendations');
  list.replaceChildren();
  for (const recommendation of profile.recommendations) {
    // Only relative paths within this project can become recommendation links.
    if (!['prepare/', 'events/', 'get-involved/'].includes(recommendation.path)) continue;
    const item = document.createElement('li');
    const link = createElement('a', '', recommendation.title);
    link.href = root.dataset.appUrl + recommendation.path;
    item.append(link);
    list.append(item);
  }
}

async function initialize() {
  try {
    const profile = await loadMemberProfile();
    logout.hidden = false;
    const quiz = await loadInterestQuiz();
    questions = quiz.questions;
    form.elements.name.value = profile.name;
    document.querySelector('#srfsc-member-uid').textContent = profile.uid;
    document.querySelector('#srfsc-quiz-questions').replaceChildren(
      ...questions.map((question) => renderQuestion(question, profile.answers)),
    );
    renderSummary(profile);
    form.hidden = false;
    document.querySelector('#srfsc-member-summary').hidden = false;
    showStatus(status, 'Your answers are private to your account. You can update them at any time.', 'pending');
  } catch (error) {
    if (error.status === 401) {
      window.location.replace(root.dataset.loginUrl);
      return;
    }
    showStatus(status, error.message, 'error');
    document.querySelector('#srfsc-profile-retry').hidden = false;
  }
}

document.querySelector('#srfsc-profile-retry').addEventListener('click', () => window.location.reload());

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const answers = readQuizAnswers(data, questions);
  if (!answers.interests.length) {
    showStatus(status, 'Please choose at least one interest.', 'error');
    form.querySelector('[name="interests"]').focus();
    return;
  }
  submit.disabled = true;
  showStatus(status, 'Saving your profile…', 'pending');
  try {
    const saved = await saveMemberProfile({ name: data.get('name').trim(), answers });
    renderSummary(saved);
    form.elements.name.value = saved.name;
    showStatus(status, 'Profile and quiz saved. Your suggested next steps are ready.', 'success');
  } catch (error) {
    showStatus(status, error.message, 'error');
    if (error.status === 401) document.querySelector('#srfsc-session-login').hidden = false;
  } finally {
    submit.disabled = false;
  }
});

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

initialize();
