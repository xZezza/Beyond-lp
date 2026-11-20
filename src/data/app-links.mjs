/** Build cross-project links without assuming the app has an /explore route. */
export function getAppLinks(value = '') {
  const raw = value.trim() || 'https://beyond-one-topaz.vercel.app/';
  let base;
  try { base = new URL(raw); }
  catch { throw new Error('PUBLIC_BEYOND_APP_URL must be an absolute URL.'); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname);
  if ((base.protocol !== 'https:' && !(base.protocol === 'http:' && local)) || base.username || base.password || base.search || base.hash) {
    throw new Error('PUBLIC_BEYOND_APP_URL must be HTTPS (or local HTTP), without credentials, query, or fragment.');
  }
  const route = hash => new URL('#' + hash, base).href;
  return Object.freeze({home:base.href, library:route('biblioteca'), map:route('mappa'), diary:route('diario'), oumuamua:route('scoperta/oumuamua'), blackHole:route('scoperta/buco-nero')});
}
