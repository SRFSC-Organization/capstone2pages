import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readQuizAnswers } from '../_projects/systems/srfsc/js/memberQuiz.js';

// Jekyll renders config.js front matter; inject its fetch defaults for these Node tests.
const source = (await readFile(new URL('../_projects/systems/srfsc/js/memberApi.js', import.meta.url), 'utf8'))
  .replace("import { pythonURI, fetchOptions } from '../../api/config.js';",
    "const pythonURI = 'http://localhost:8587'; const fetchOptions = { credentials: 'include', headers: { 'Content-Type': 'application/json' } };");
const api = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('quiz serialization preserves multiple interests and single choices', () => {
  const form = new FormData();
  form.append('interests', 'home');
  form.append('interests', 'events');
  form.append('participation', 'resident');
  assert.deepEqual(readQuizAnswers(form, [
    { id: 'interests', multiple: true }, { id: 'participation', multiple: false },
  ]), { interests: ['home', 'events'], participation: 'resident' });
});

test('profile saves send cookies and JSON to this Flask backend', async (t) => {
  let request;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    request = { url, options };
    return Response.json({ completed: true });
  });
  const payload = { name: 'Neighbor', answers: { interests: ['home'] } };
  await api.saveMemberProfile(payload);
  assert.equal(request.url, 'http://localhost:8587/api/srfsc/profile');
  assert.equal(request.options.method, 'PUT');
  assert.equal(request.options.credentials, 'include');
  assert.deepEqual(JSON.parse(request.options.body), payload);
});

test('login sends credentials only to the existing authentication endpoint', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'http://localhost:8587/api/authenticate');
    assert.equal(options.method, 'POST');
    assert.equal(options.credentials, 'include');
    return Response.json({ user: { uid: 'neighbor' } });
  });
  await api.loginMember({ uid: 'neighbor', password: 'test-only' });
});

test('logout accepts the existing backend plain-text success response', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('Token invalidated successfully'));
  await api.logoutMember();
});

test('expired sessions and pending accounts retain their status for the page', async (t) => {
  for (const status of [401, 403]) {
    t.mock.method(globalThis, 'fetch', async () => Response.json({ message: 'Sign in required' }, { status }));
    await assert.rejects(api.loadMemberProfile(), (error) => error.status === status && error.message === 'Sign in required');
    t.mock.restoreAll();
  }
});

test('network failure reports an actionable error', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => { throw new TypeError('network unavailable'); });
  await assert.rejects(api.loadInterestQuiz(), (error) => error.status === 0 && /connection/.test(error.message));
});

test('unexpected HTML responses are not treated as a successful save', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>Proxy error</html>'));
  await assert.rejects(api.loadMemberProfile(), /unexpected response/);
});
