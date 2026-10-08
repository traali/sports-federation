#!/usr/bin/env node
/**
 * Hakemisto (site/index.html) check.
 *
 *   node scripts/check-site.mjs          offline: links, order, forbidden hosts, no computed results
 *   node scripts/check-site.mjs --live   also fetches every link and checks it serves the intended app
 *
 * Production hosts come from the Cloudflare Pages projects published by
 * traali/pelipaiva .github/workflows/deploy-neighbors.yml (Pages adds a suffix when the
 * short name is taken): football-stats -> football-stats-agk, basketball-stats -> basketball-stats-byu,
 * volleyball-stats -> volleyball-stats-7xq. The short hosts are not Arto's apps.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SITE = fileURLToPath(new URL('../site/index.html', import.meta.url));

export const EXPECTED = [
  { app: 'pelipaiva', label: 'Pelipäivä', url: 'https://pelipaiva.pages.dev/', title: /pelipäiv/i },
  { app: 'football', label: 'Jalkapallo', url: 'https://football-stats-agk.pages.dev/', title: /^Football Stats & H2H$/ },
  { app: 'floorball', label: 'Salibandy', url: 'https://floorball-stats.pages.dev/', title: /Salibandy Tilastot/ },
  { app: 'basketball', label: 'Koripallo', url: 'https://basketball-stats-byu.pages.dev/', title: /Koripallo Torneopal/ },
  { app: 'volleyball', label: 'Lentopallo', url: 'https://volleyball-stats-7xq.pages.dev/', title: /Lentopallo Tilastot/ },
  { app: 'weather', label: 'Sää', url: 'https://weather-stats.pages.dev/', title: /Weather Stats & Radar|Sää/ },
  { app: 'parkkis', label: 'Parkkis', url: 'https://parkkis.pages.dev/', title: /ParkkiS/ },
];

/** Hosts that do not answer or belong to someone else. */
export const FORBIDDEN_HOSTS = ['football-stats.pages.dev', 'basketball-stats.pages.dev', 'volleyball-stats.pages.dev'];

const failures = [];
const fail = (msg) => failures.push(msg);

const html = readFileSync(SITE, 'utf-8');
const links = [...html.matchAll(/<a\b[^>]*\bdata-app="([^"]+)"[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({
  app: m[1],
  url: m[2],
  name: /class="name">([^<]*)</.exec(m[3])?.[1] ?? '',
}));
const allHrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

if (links.length !== EXPECTED.length) fail(`expected ${EXPECTED.length} app links, found ${links.length}`);
EXPECTED.forEach((exp, i) => {
  const got = links[i];
  if (!got) return;
  if (got.app !== exp.app) fail(`link ${i + 1}: expected ${exp.app}, got ${got.app}`);
  if (got.url !== exp.url) fail(`${exp.app}: expected ${exp.url}, got ${got.url}`);
  if (got.name !== exp.label) fail(`${exp.app}: expected label "${exp.label}", got "${got.name}"`);
});
for (const href of allHrefs) {
  const host = new URL(href).host;
  if (FORBIDDEN_HOSTS.includes(host)) fail(`forbidden host ${host}`);
  if (!href.startsWith('https://')) fail(`not https: ${href}`);
}

// The index links apps; it never shows its own scores or stats.
const visible = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ');
if (/\b\d{1,3}\s*[–-]\s*\d{1,3}\b/.test(visible)) fail('looks like a score in the index text');
if (/<script\b/i.test(html)) fail('index must not run scripts (nothing to compute)');
if (!/<html lang="fi">/.test(html)) fail('lang="fi" missing');
if (!/name="viewport"/.test(html)) fail('viewport meta missing');

if (process.argv.includes('--live')) {
  for (const exp of EXPECTED) {
    try {
      const res = await fetch(exp.url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
      const body = await res.text();
      const title = (/<title>([^<]*)<\/title>/i.exec(body)?.[1] ?? '').trim();
      const ok = res.ok && exp.title.test(title);
      console.log(`${ok ? '✅' : '❌'} ${exp.label.padEnd(10)} ${exp.url} HTTP ${res.status} title="${title}"`);
      if (!ok) fail(`${exp.url} does not serve the intended app (HTTP ${res.status}, title "${title}")`);
    } catch (err) {
      console.log(`❌ ${exp.label.padEnd(10)} ${exp.url} ${err instanceof Error ? err.message : err}`);
      fail(`${exp.url} did not answer`);
    }
  }
}

if (failures.length) {
  for (const f of failures) console.error(`❌ ${f}`);
  process.exit(1);
}
console.log(`✅ Hakemisto: ${links.length} links in order, no forbidden hosts, no computed results.`);
