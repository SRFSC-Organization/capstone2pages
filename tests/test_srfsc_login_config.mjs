import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const config = (await readFile(new URL('../assets/js/api/config.js', import.meta.url), 'utf8'))
  .replace(/^---\n---\n/, '')
  .replaceAll('{{ site.baseurl }}', '')
  .replaceAll('{{ site.google_client_id }}', '')
  .replace("{{ site.srfsc_account_api_url | default: '' | jsonify }}", '""');

for (const hostname of ['localhost', '127.0.0.1']) {
  test(`local login cookies use the same hostname as ${hostname} frontend`, async () => {
    const source = `const location = { hostname: ${JSON.stringify(hostname)} };\n${config}`;
    const api = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
    assert.equal(api.srfscAccountURI, `http://${hostname}:8587`);
  });
}

test('unconfigured production login stays separate from the shared OCS service', async () => {
  const source = `const location = { hostname: 'srfsc-organization.github.io' };\n${config}`;
  const api = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  assert.equal(api.srfscAccountURI, '');
});
