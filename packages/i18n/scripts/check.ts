/**
 * Verifies every locale has exactly the same message keys, array lengths and
 * ICU placeholders as the Persian master file. Exits non-zero on any mismatch.
 */
import fs from 'node:fs';
import path from 'node:path';
import { locales } from '../src/index';

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
const dir = path.join(import.meta.dirname, '..', 'messages');
const load = (l: string) => JSON.parse(fs.readFileSync(path.join(dir, `${l}.json`), 'utf8')) as Json;

function flatten(obj: Json, prefix = '', out = new Map<string, string>()) {
  if (Array.isArray(obj)) {
    out.set(`${prefix}#length`, String(obj.length));
    obj.forEach((v, i) => flatten(v, `${prefix}[${i}]`, out));
  } else if (obj && typeof obj === 'object') {
    for (const [k, v] of Object.entries(obj)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else {
    out.set(prefix, String(obj));
  }
  return out;
}

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

const master = flatten(load('fa'));
let problems = 0;
for (const locale of locales.filter((l) => l !== 'fa')) {
  const other = flatten(load(locale));
  for (const [key, value] of master) {
    if (!other.has(key)) {
      console.error(`[${locale}] missing: ${key}`);
      problems++;
    } else if (key.endsWith('#length') && other.get(key) !== value) {
      console.error(`[${locale}] array length differs: ${key} (${other.get(key)} vs ${value})`);
      problems++;
    } else if (!key.endsWith('slug') && placeholders(other.get(key)!) !== placeholders(value)) {
      console.error(`[${locale}] placeholders differ: ${key}`);
      problems++;
    }
  }
  for (const key of other.keys()) {
    if (!master.has(key)) {
      console.error(`[${locale}] extra: ${key}`);
      problems++;
    }
  }
}
if (problems) {
  console.error(`\n${problems} problem(s) found.`);
  process.exit(1);
}
console.log(`All ${locales.length} locales are complete (${master.size} entries each).`);
