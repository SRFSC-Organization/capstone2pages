import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readQuizAnswers } from '../_projects/systems/srfsc/js/memberQuiz.js';

// Jekyll renders config.js front matter; inject its fetch defaults for these Node tests.
const source = (await readFile(new URL('../_projects/systems/srfsc/js/memberApi.js', import.meta.url), 'utf8'))
  .replace("import { srfscAccountURI, fetchOptions } from '../../api/config.js';",
    "const srfscAccountURI = 'http://localhost:8587'; const fetchOptions = { credentials: 'include', headers: { 'Content-Type': 'application/json' } };");
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

test('login sends credentials only to the Flask login resource', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'http://localhost:8587/api/login');
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
  await assert.rejects(api.loadInterestQuiz(), (error) => error.status === 0 && /Cannot connect/.test(error.message));
});

test('an unconfigured site never sends member credentials', async (t) => {
  const unconfiguredSource = source.replace("const srfscAccountURI = 'http://localhost:8587';", "const srfscAccountURI = '';" );
  const unconfiguredApi = await import(`data:text/javascript;base64,${Buffer.from(unconfiguredSource).toString('base64')}`);
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({}));
  await assert.rejects(unconfiguredApi.loginMember({ uid: 'neighbor', password: 'test-only' }), /not available on this site yet/);
  assert.equal(fetch.mock.callCount(), 0);
});

test('a missing backend deployment is reported separately from a rejected login', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>Not found</html>', { status: 404 }));
  await assert.rejects(api.loadMemberProfile(), (error) => error.status === 404 && /not available on this server yet/.test(error.message));
});

test('unexpected HTML responses are not treated as a successful save', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('<html>Proxy error</html>'));
  await assert.rejects(api.loadMemberProfile(), /unexpected response/);
});


test('login readiness checks the SRFSC service before requesting credentials', async (t) => {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'http://localhost:8587/api/login');
    assert.equal(options.method, 'GET');
    assert.equal(options.body, undefined);
    return Response.json({ service: 'srfsc-accounts', status: 'ready', accounts_available: true });
  });
  assert.equal((await api.checkLoginService()).accounts_available, true);
});

test('login readiness rejects a different service instead of sending passwords there', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => Response.json({ jokes: [] }));
  await assert.rejects(api.checkLoginService(), /does not provide SRFSC/);
});
