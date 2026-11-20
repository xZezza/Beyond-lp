import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('../dist/', import.meta.url)));
const html = await readFile(path.join(root, 'index.html'), 'utf8');
const missing = [];
for (const [, raw] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
  if (!raw.startsWith('/') || raw.startsWith('//')) continue;
  const target = path.resolve(root, '.' + decodeURIComponent(raw.split(/[?#]/)[0]));
  if (target !== root && !target.startsWith(root + path.sep)) throw new Error('Invalid local asset path');
  try { await access(target); } catch { missing.push(raw); }
}
if (missing.length) throw new Error('Missing local resources: ' + missing.join(', '));
if (/href="\/explore(?:["#])/.test(html)) throw new Error('The landing must link to the separate Beyond app.');
console.log('Verified standalone landing output and local resource references.');
