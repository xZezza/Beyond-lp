import test from 'node:test';
import assert from 'node:assert/strict';
import { getAppLinks } from '../src/data/app-links.mjs';

test('production links target the separate Beyond app and its existing hash routes', () => {
  const links = getAppLinks();
  assert.equal(links.home, 'https://beyond-one-topaz.vercel.app/');
  assert.equal(links.library, 'https://beyond-one-topaz.vercel.app/#biblioteca');
  assert.equal(links.blackHole, 'https://beyond-one-topaz.vercel.app/#scoperta/buco-nero');
});
test('an optional app base path is preserved without appending another /explore', () => {
  const links = getAppLinks('https://example.com/explore');
  assert.equal(links.library, 'https://example.com/explore#biblioteca');
});
test('local preview links retain their host and port', () => {
  assert.equal(getAppLinks('http://127.0.0.1:4173/').map, 'http://127.0.0.1:4173/#mappa');
});
test('invalid or unsafe configured app URLs fail the build instead of producing broken links', () => {
  for (const value of ['/explore','javascript:alert(1)','http://example.com/','https://name:secret@example.com/','https://example.com/?token=1','https://example.com/#wrong']) {
    assert.throws(() => getAppLinks(value), /PUBLIC_BEYOND_APP_URL/);
  }
});
