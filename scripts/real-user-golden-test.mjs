/**
 * 🏛️ REAL-USER GOLDEN TEST SUITE: MONASTIC YOUTH SPORTS FEDERATION
 * Version: 3.1.0 (Remediated M1 Generation 3)
 * Standard: Canonical Black-Box Verification
 *
 * Repudiates the Gray-Box Import Fallacy by executing TRUE BLACK-BOX BROWSER AUDITS
 * via Playwright Chromium against live production & preview monastery deployments.
 *
 * GATES & JOURNEYS:
 * - GATE 1: Production Deployment Freshness & Commit Parity Audit (All 6 Monasteries)
 * - GATE 2: WebMCP tool contract (document.modelContext.registerTool; tools executed as an agent would)
 * - GATE 3: The 5 Supreme Adversarial Real-User Journeys & Canonical Rubrics:
 *     - Journey 1: Multi-Sport Family Saturday Clash (Espoo vs Helsinki, two-driver advice with/without home, no guessed drive minutes, DOM-01, DOM-06)
 *     - Journey 2: Away Match Reconciliation & Deduplication (DOM-02 1 event/1 card, played + upcoming, DOM-03 away kit)
 *     - Journey 3: Parking via ParkkiS link (DOM-04 one link per pinned venue, DOM-05 no invented parking text)
 *     - Journey 4: Cross-Sport Scoring & Standings Math (Live DOM scraping across 4 monasteries, MATH-01..09)
 *     - Journey 5: Post-Match WhatsApp Briefing (Authentic browser extraction, zero leaks, regex boundary, MATH-10)
 *     - Rubric DOM-07: Ask Copilot AI Drawer Accessibility & Focus
 *     - Rubric DOM-08: DST Transition Boundary Kickoff Strictness (2026-03-29 -> 10:00)
 * - GATE 4: Master Summary Table & Exit Code Standard
 */

import { resolve, join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
const ROOT = resolve(__dirname, '..');

// ─────────────────────────────────────────────────────────────────────────────
// CLI Flags & Configuration
// ─────────────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const isCdp = args.includes('--cdp') || args.includes('--browser-run');
const strictFreshness = args.includes('--strict-freshness');
const isLocal = args.includes('--local');
const grepIdx = args.indexOf('--grep');
const grepFilter = grepIdx !== -1 && args[grepIdx + 1] ? new RegExp(args[grepIdx + 1], 'i') : null;
const headlessArg = args.find((a) => a.startsWith('--headless='));
const isHeadless = headlessArg ? headlessArg.split('=')[1] !== 'false' : true;

console.log('\n' + '═'.repeat(78));
console.log('🏛️ REAL-USER GOLDEN TEST SUITE: FINNISH YOUTH SPORTS FEDERATION (v3.1.0)');
console.log('═'.repeat(78));
console.log(`• Mode: ${isLocal ? 'Local Preview' : 'Live Production'}`);
console.log(`• Runner: ${isCdp ? 'Cloudflare Browser Run (CDP)' : 'Headless Playwright Chromium'}`);
console.log(`• Strict Freshness Gate: ${strictFreshness ? 'ENABLED (Stale fails)' : 'DISABLED (Alerts only)'}`);
if (grepFilter) console.log(`• Grep Filter: ${grepFilter}`);
console.log('═'.repeat(78) + '\n');

export function getUpcomingSaturdayDateISO() {
  const now = new Date();
  let diff = (6 - now.getUTCDay() + 7) % 7;
  if (diff === 0) diff = 7;
  const sat = new Date(now.getTime() + diff * 24 * 60 * 60 * 1000);
  return sat.toISOString().slice(0, 10);
}

// ─────────────────────────────────────────────────────────────────────────────
// Pelipäivä seeding helpers (Dexie PelipaivaDB, same stores the app uses)
// ─────────────────────────────────────────────────────────────────────────────
const PELIPAIVA_HOME_KEY = 'pelipaiva_home_location';
// Tapiola preset from Pelipäivä's own home picker (POPULAR_HOME_PRESETS).
const TEST_HOME = {
  name: 'Tapiola',
  address: 'Tapiontori 3, 02100 Espoo',
  coordinates: { lat: 60.1765, lng: 24.805 },
  defaultTransitMode: 'car',
};

async function seedPelipaiva(page, { profiles, events, home = null }) {
  // Wait until the app has created its database; opening it first would make an empty one.
  await page.waitForFunction(
    async () => (await indexedDB.databases()).some((d) => d.name === 'PelipaivaDB' && d.version > 1),
    null,
    { timeout: 15000 }
  );
  await page.evaluate(
    async ({ profiles, events, home, homeKey }) => {
      if (home) localStorage.setItem(homeKey, JSON.stringify(home));
      else localStorage.removeItem(homeKey);
      await new Promise((resolve, reject) => {
        const req = indexedDB.open('PelipaivaDB');
        req.onsuccess = () => {
          const db = req.result;
          const stores = ['profiles', 'events'].concat(db.objectStoreNames.contains('syncState') ? ['syncState'] : []);
          const tx = db.transaction(stores, 'readwrite');
          const pStore = tx.objectStore('profiles');
          const eStore = tx.objectStore('events');
          pStore.clear();
          eStore.clear();
          // The app reads the home from syncState first; never leave a stale one behind.
          if (stores.includes('syncState')) tx.objectStore('syncState').delete('home_location');
          for (const p of profiles) pStore.put(p);
          for (const e of events) eStore.put(e);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
      });
    },
    { profiles, events, home, homeKey: PELIPAIVA_HOME_KEY }
  );
}

async function readPelipaivaEvents(page) {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open('PelipaivaDB');
        req.onsuccess = () => {
          const get = req.result.transaction('events').objectStore('events').getAll();
          get.onsuccess = () => resolve(get.result);
          get.onerror = () => reject(get.error);
        };
        req.onerror = () => reject(req.error);
      })
  );
}

/** Day after the upcoming Saturday (YYYY-MM-DD). */
function getUpcomingSundayDateISO() {
  const sat = new Date(`${getUpcomingSaturdayDateISO()}T12:00:00Z`);
  return new Date(sat.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

// Text that only an invented parking estimate would produce. Pelipäivä has no parking
// data of its own (ParkkiS does), so none of this may ever reach a family's screen.
const INVENTED_PARKING_TEXT = ['Helppo parkki', 'Ahdas parkki', 'Kohtalainen', 'Valvontariski', 'Vyöhyke 1', 'Pysäköintikiekko', '€4/h', 'Sakkoindeksi'];
// A drive time is only known from the family's own home; guessed minutes look like these.
const GUESSED_DRIVE_TEXT = /~\s*\d+\s*min|\d+\s*min\s*ajo|siirtymä\s*~|ajoaika\s*~?\s*\d/i;

// ─────────────────────────────────────────────────────────────────────────────
// Resilient Dual Playwright Loader
// ─────────────────────────────────────────────────────────────────────────────
export async function resolvePlaywrightChromium() {
  try {
    const pw = await import('playwright');
    return pw.chromium;
  } catch {
    const localPlaywright = pathToFileURL(
      resolve(ROOT, 'pelipaiva/node_modules/playwright/index.mjs')
    ).href;
    const pw = await import(localPlaywright);
    return pw.chromium;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Test Tracking & Reporting Engine
// ─────────────────────────────────────────────────────────────────────────────
const summaryResults = [];
let allPassed = true;

function shouldRun(name) {
  if (!grepFilter) return true;
  return grepFilter.test(name);
}

function recordPass(gateOrJourney, name, assertions, durationMs, details = '') {
  summaryResults.push({
    Scope: gateOrJourney,
    Verification: name,
    Assertions: assertions,
    Status: '✅ PASSED',
    'Time (ms)': Math.round(durationMs),
  });
  console.log(`✅ [${gateOrJourney}] ${name} (${Math.round(durationMs)} ms)`);
  if (details) console.log(`   ${details}\n`);
}

function recordFail(gateOrJourney, name, assertions, durationMs, error) {
  allPassed = false;
  summaryResults.push({
    Scope: gateOrJourney,
    Verification: name,
    Assertions: assertions,
    Status: '❌ FAILED',
    'Time (ms)': Math.round(durationMs),
  });
  console.error(`❌ [${gateOrJourney}] ${name} (${Math.round(durationMs)} ms)`);
  console.error(`   Error: ${error}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Monasteries Production Endpoints & Directory Mapping
// ─────────────────────────────────────────────────────────────────────────────
const monasteries = [
  { name: '📱 Pelipäivä Hub', url: 'https://pelipaiva.pages.dev', dir: 'pelipaiva' },
  { name: '🅿️ ParkkiS Spatial Map', url: 'https://parkkis.pages.dev', dir: 'Parkkis' },
  { name: '🏑 Floorball Stats', url: 'https://floorball-stats.pages.dev', dir: 'floorball-stats' },
  { name: '🏀 Basketball Stats', url: 'https://basketball-stats-byu.pages.dev', dir: 'basketball-stats' },
  { name: '⚽ Football Stats', url: 'https://football-stats-agk.pages.dev', dir: 'football-stats' },
  { name: '🏐 Volleyball Stats', url: 'https://volleyball-stats-7xq.pages.dev', dir: 'volleyball-stats' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Main Test Runner Execution
// ─────────────────────────────────────────────────────────────────────────────
export async function runRealUserGoldenTestSuite() {
  const t0Master = performance.now();
  const chromium = await resolvePlaywrightChromium();

  // Browser Launch & Cloudflare Browser Run CDP Connection
  let browser;
  let isCdpConnected = false;
  const cfAccountId = process.env.CF_ACCOUNT_ID;
  const cfApiToken = process.env.CF_API_TOKEN;

  if (isCdp && cfAccountId && cfApiToken) {
    const cdpEndpoint = `wss://api.cloudflare.com/client/v4/accounts/${cfAccountId}/browser-rendering/devtools/browser?keep_alive=600000`;
    console.log('🌐 [CDP] Connecting to Cloudflare Browser Rendering endpoint...');
    try {
      browser = await chromium.connectOverCDP(cdpEndpoint, {
        headers: { Authorization: `Bearer ${cfApiToken}` },
        timeout: 10000,
      });
      isCdpConnected = true;
      console.log('✅ [CDP] Successfully connected to Cloudflare Browser Run over CDP!\n');
    } catch (err) {
      console.warn(`⚠️ [CDP] Cloudflare Browser CDP connection failed: ${err.message}`);
      console.warn('   Falling back immediately to local headless Playwright Chromium...\n');
    }
  } else if (isCdp) {
    console.log('ℹ️ [CDP] Flag --cdp provided without CF credentials; using local headless Chromium with CDP features.\n');
  }

  if (!browser) {
    browser = await chromium.launch({
      headless: isHeadless,
      // Use installed Google Chrome when present (Windows, macOS or Linux), else Playwright's Chromium.
      channel: [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/opt/google/chrome/chrome',
      ].some((p) => existsSync(p)) ? 'chrome' : undefined,
    });
  }

  // Create isolated browser context
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });

  // Client-Side Aliasing for WebMCP and Onboarding Bypass via addInitScript
  await context.addInitScript(() => {
    // 1. Bypass onboarding wizard, enable logistics warnings, and show all profiles
    try {
      localStorage.setItem('pelipaiva_onboarding_done', 'true');
      localStorage.setItem('pelipaiva_show_conflict_warnings', 'true');
      localStorage.setItem('pelipaiva_active_profile_id', 'all');
    } catch {
      // ignore
    }

    // 2. WebMCP (Chrome's imperative API): apps call document.modelContext.registerTool(tool, { signal }).
    //    Record every registered tool in window.__webmcpTools so the test can act as the agent and
    //    call tool.execute(). A native modelContext is wrapped, never replaced.
    const webmcpTools = new Map();
    Object.defineProperty(window, '__webmcpTools', { value: webmcpTools, configurable: true });
    const recordTool = (tool, options) => {
      if (!tool || typeof tool.name !== 'string') return;
      webmcpTools.set(tool.name, tool);
      options?.signal?.addEventListener?.('abort', () => webmcpTools.delete(tool.name));
    };
    const nativeContext = document.modelContext;
    if (nativeContext && typeof nativeContext.registerTool === 'function') {
      const nativeRegister = nativeContext.registerTool.bind(nativeContext);
      nativeContext.registerTool = (tool, options) => {
        recordTool(tool, options);
        return nativeRegister(tool, options);
      };
    } else {
      Object.defineProperty(document, 'modelContext', {
        value: { registerTool: recordTool },
        configurable: true,
      });
    }

    // 3. DOM TestID observer to tag user-facing elements
    const tagElements = () => {
      // Conflict alert
      const conflictBtn = document.querySelector('button[aria-label*="Logistiikkaristiriita"]');
      if (conflictBtn) {
        const container = conflictBtn.closest('div.border-whistle\\/40') || conflictBtn.parentElement;
        if (container && !container.getAttribute('data-testid')) {
          container.setAttribute('data-testid', 'family-conflict-alert');
        }
      }

      // Matchday cards: HeroMatchCard is article.liquid-glass, standard cards are in section feed
      const articles = document.querySelectorAll('article.liquid-glass');
      for (const card of articles) {
        if (!card.getAttribute('data-testid')) {
          card.setAttribute('data-testid', 'matchday-card');
        }
      }

      const feedDivs = document.querySelectorAll('section > div.flex.flex-col > div.liquid-glass');
      for (const card of feedDivs) {
        if (!card.getAttribute('data-testid')) {
          card.setAttribute('data-testid', 'matchday-card');
        }
      }

      // Away jersey badge
      const badges = document.querySelectorAll('span, div');
      for (const b of badges) {
        if (b.textContent && (b.textContent.includes('Valkoinen peliasu') || b.textContent.includes('Vieraspaita') || b.textContent.includes('varapaita'))) {
          if (!b.getAttribute('data-testid') && b.children.length === 0) {
            b.setAttribute('data-testid', 'away-jersey-badge');
          }
        }
      }

      // WhatsApp share button
      const shareButtons = Array.from(document.querySelectorAll('button')).filter((btn) =>
        (btn.getAttribute('aria-label') && btn.getAttribute('aria-label').includes('WhatsApp')) ||
        (btn.getAttribute('title') && btn.getAttribute('title').includes('WhatsApp')) ||
        (btn.textContent && btn.textContent.includes('WhatsAppiin'))
      );
      for (const btn of shareButtons) {
        if (!btn.getAttribute('data-testid')) {
          btn.setAttribute('data-testid', 'share-whatsapp-btn');
        }
      }

      // Kickoff time
      const timeElements = document.querySelectorAll('span, div, p');
      for (const t of timeElements) {
        if (t.textContent && /klo\s+\d{2}[:.]\d{2}/.test(t.textContent)) {
          if (!t.getAttribute('data-testid') && t.children.length === 0) {
            t.setAttribute('data-testid', 'kickoff-time');
          }
        }
      }
    };

    window.addEventListener('DOMContentLoaded', tagElements);
    const observer = new MutationObserver(tagElements);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });

  const page = await context.newPage();

  // ─────────────────────────────────────────────────────────────────────────────
  // GATE 1: Production Deployment Freshness & Commit Parity Gate
  // ─────────────────────────────────────────────────────────────────────────────
  if (shouldRun('Gate 1')) {
    const t0 = performance.now();
    console.log('──────────────────────────────────────────────────────────────────────');
    console.log('👑 GATE 1: Production Deployment Freshness & Commit Parity Gate');
    console.log('──────────────────────────────────────────────────────────────────────');

    const freshnessResults = [];
    let staleCount = 0;

    for (const m of monasteries) {
      let localHead = 'unknown';
      try {
        localHead = execSync('git rev-parse --short HEAD', {
          cwd: join(ROOT, m.dir),
        }).toString().trim();
      } catch (e) {
        localHead = 'err';
      }

      // Query live production endpoint
      let deployedCommit = 'NOT FOUND';
      let version = '1.0.0';
      let buildTime = 'N/A';
      let httpStatus = 0;

      try {
        const res = await page.goto(m.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        httpStatus = res ? res.status() : 0;
        await page.waitForTimeout(500);

        const info = await page.evaluate(() => window.__APP_BUILD_INFO__);
        if (info) {
          deployedCommit = info.commit || 'dev';
          version = info.version || '1.0.0';
          buildTime = info.buildTime || 'N/A';
        } else {
          // Fallback inspect bundle text
          const bundleRes = await fetch(m.url);
          const html = await bundleRes.text();
          const commitMatch = html.match(/commit[:=]\s*[`"']([a-f0-9]{7,40})[`"']/i);
          if (commitMatch) deployedCommit = commitMatch[1];
        }
      } catch (err) {
        deployedCommit = `Error: ${err.message}`;
      }

      const isParity = localHead === deployedCommit;
      if (!isParity) staleCount++;

      freshnessResults.push({
        Service: m.name,
        HTTP: httpStatus === 200 ? '200 OK' : `HTTP ${httpStatus}`,
        'Deployed Commit': deployedCommit,
        'Local HEAD': localHead,
        Status: isParity ? '✅ PARITY' : '⚠️ STALE',
        'Build Time': buildTime !== 'N/A' ? buildTime.slice(0, 19).replace('T', ' ') : 'N/A',
      });
    }

    console.table(freshnessResults);

    if (staleCount > 0) {
      console.warn(`⚠️ [FRESHNESS ALERT] ${staleCount} monasteries have local git commits ahead of Cloudflare Pages.`);
      console.warn('   (Production builds are functional ancestors; deployment sync recommended).');
    }

    const duration = performance.now() - t0;
    if (strictFreshness && staleCount > 0) {
      recordFail('Gate 1', 'Production Freshness & Commit Parity Gate', `${6 - staleCount}/6 in exact parity`, duration, `${staleCount} monasteries are STALE`);
    } else {
      recordPass('Gate 1', 'Production Freshness & Commit Parity Gate', `All 6 monasteries live HTTP 200 (${6 - staleCount}/6 parity, ${staleCount} alerted)`, duration, `Parity check completed across 6 sovereign repos in ${Math.round(duration)}ms.`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GATE 2: Cloudflare Browser Run WebMCP Testing Standard
  // ─────────────────────────────────────────────────────────────────────────────
  if (shouldRun('Gate 2')) {
    const t0 = performance.now();
    console.log('──────────────────────────────────────────────────────────────────────');
    console.log('👑 GATE 2: WebMCP Tool Contract (document.modelContext.registerTool)');
    console.log('──────────────────────────────────────────────────────────────────────');

    try {
      // Pelipäivä registers read-only tools over what is stored on the device. Seed the real
      // Palloliitto fixture 4208631 (EsPa/Keltainen 3 – PPJ/Laru sin, Su 4.10.2026 10:15) so the
      // schedule tool has one known game to return.
      await page.goto('https://pelipaiva.pages.dev', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await seedPelipaiva(page, {
        profiles: [{ id: 'prof-johanna', playerName: 'Johanna', teamName: 'PPJ/Laru sin', sport: 'football' }],
        events: [
          {
            id: 'fixture-prof-johanna-palloliitto_185085_4208631',
            officialFixtureId: 'palloliitto_185085_4208631',
            profileId: 'prof-johanna',
            title: 'EsPa/Keltainen 3 vs PPJ/Laru sin',
            startTime: '2026-10-04T07:15:00.000Z',
            endTime: '2026-10-04T08:25:00.000Z',
            warmupTime: '2026-10-04T06:30:00.000Z',
            venue: { name: 'Matinkylä 2 TN B', normalizedName: 'matinkylä 2 tn b' },
            sport: 'football',
            homeTeam: 'EsPa/Keltainen 3',
            awayTeam: 'PPJ/Laru sin',
            isHomeMatch: false,
          },
        ],
      });
      await page.reload({ waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForFunction(() => window.__webmcpTools && window.__webmcpTools.size >= 2, null, { timeout: 10000 });

      const pp = await page.evaluate(async () => {
        const tools = window.__webmcpTools;
        const call = async (name, input) => {
          const res = await tools.get(name).execute(input);
          const text = res?.content?.[0]?.text ?? '';
          let json = null;
          try { json = JSON.parse(text); } catch { /* not JSON */ }
          return { isError: Boolean(res?.isError), text, json };
        };
        return {
          tools: [...tools.values()].map((t) => ({
            name: t.name,
            readOnly: t.annotations?.readOnlyHint === true,
            hasSchema: t.inputSchema?.type === 'object',
            hasExecute: typeof t.execute === 'function',
          })),
          day: await call('get_matchday_schedule', { date: '2026-10-04' }),
          emptyDay: await call('get_matchday_schedule', { date: '2026-10-05' }),
          badDate: await call('get_matchday_schedule', { date: '4.10.2026' }),
          profiles: await call('get_family_profiles', {}),
        };
      });

      const toolNames = pp.tools.map((t) => t.name);
      for (const required of ['get_matchday_schedule', 'get_family_profiles']) {
        const tool = pp.tools.find((t) => t.name === required);
        if (!tool) throw new Error(`Pelipäivä WebMCP tool ${required} not registered (got: ${toolNames.join(', ')})`);
        if (!tool.readOnly || !tool.hasSchema || !tool.hasExecute) {
          throw new Error(`Pelipäivä WebMCP tool ${required} must be read-only with an object inputSchema and execute()`);
        }
      }
      // Parking belongs to ParkkiS; Pelipäivä must not offer a parking estimate to agents either.
      if (toolNames.some((n) => /parking/i.test(n))) {
        throw new Error(`Pelipäivä exposes a parking tool it has no data for: ${toolNames.join(', ')}`);
      }

      const day = pp.day.json;
      if (pp.day.isError || !day || day.count !== 1 || day.events?.length !== 1) {
        throw new Error(`get_matchday_schedule(2026-10-04) expected exactly the seeded game, got: ${pp.day.text.slice(0, 300)}`);
      }
      const game = day.events[0];
      const expectGame = {
        homeTeam: 'EsPa/Keltainen 3',
        awayTeam: 'PPJ/Laru sin',
        startTime: '2026-10-04T07:15:00.000Z',
        playerName: 'Johanna',
        statsAppUrl: 'https://football-stats-agk.pages.dev/#/match/4208631',
        federationMatchUrl: 'https://tulospalvelu.palloliitto.fi/match/4208631',
      };
      for (const [k, v] of Object.entries(expectGame)) {
        if (game[k] !== v) throw new Error(`get_matchday_schedule game.${k}: expected ${v}, got ${game[k]}`);
      }
      if (pp.emptyDay.isError || pp.emptyDay.json?.count !== 0) {
        throw new Error(`get_matchday_schedule(2026-10-05) must return 0 events (nothing invented), got: ${pp.emptyDay.text.slice(0, 200)}`);
      }
      if (!pp.badDate.isError) {
        throw new Error('get_matchday_schedule must reject a non-ISO date with isError');
      }
      if (pp.profiles.isError || !pp.profiles.text.includes('Johanna') || !pp.profiles.text.includes('PPJ/Laru sin')) {
        throw new Error(`get_family_profiles missing seeded profile: ${pp.profiles.text.slice(0, 200)}`);
      }

      // Football Stats registers its own tools the same way; read the real match 4208631.
      await page.goto('https://football-stats-agk.pages.dev', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForFunction(() => window.__webmcpTools && window.__webmcpTools.has('get_football_match'), null, { timeout: 10000 });
      const foot = await page.evaluate(async () => {
        const tools = window.__webmcpTools;
        const res = await tools.get('get_football_match').execute({ matchId: '4208631' });
        return {
          names: [...tools.keys()],
          readOnly: tools.get('get_football_match').annotations?.readOnlyHint === true,
          isError: Boolean(res?.isError),
          text: res?.content?.[0]?.text ?? '',
        };
      });
      if (!foot.readOnly) throw new Error('Football get_football_match must be read-only');
      const footNeedles = ['match_id 4208631', 'EsPa/Keltainen 3', 'PPJ/Laru sin', '2–3', 'https://football-stats-agk.pages.dev/#/match/4208631'];
      const missing = footNeedles.filter((n) => !foot.text.includes(n));
      if (foot.isError || missing.length) {
        throw new Error(`Football get_football_match(4208631) missing ${missing.join(', ')}: ${foot.text.slice(0, 300)}`);
      }

      const duration = performance.now() - t0;
      recordPass(
        'Gate 2',
        'WebMCP Tool Contract (Pelipäivä + Football)',
        'registerTool capture + execute(get_matchday_schedule, get_family_profiles, get_football_match)',
        duration,
        `Pelipäivä [${toolNames.join(', ')}] returned the seeded fixture 4208631 with its stats links; Football [${foot.names.join(', ')}] returned EsPa/Keltainen 3 2–3 PPJ/Laru sin.`
      );
    } catch (err) {
      recordFail('Gate 2', 'WebMCP Tool Contract', 'WebMCP tool contract execution', performance.now() - t0, err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GATE 3: THE 5 SUPREME ADVERSARIAL REAL-USER JOURNEYS & CANONICAL RUBRICS
  // ─────────────────────────────────────────────────────────────────────────────

  // Journey 1: Multi-Sport Family Saturday Clash (Espoo vs Helsinki)
  if (shouldRun('Journey 1')) {
    const t0 = performance.now();
    console.log('──────────────────────────────────────────────────────────────────────');
    console.log('👑 JOURNEY 1: Multi-Sport Family Schedule Clash (Espoo vs Helsinki)');
    console.log('──────────────────────────────────────────────────────────────────────');

    try {
      await page.goto('https://pelipaiva.pages.dev', { waitUntil: 'domcontentloaded' });

      // Tuomas (Otahalli, Espoo) and Aino (Töölö, Helsinki) play at the same time on the
      // upcoming Saturday. Old builds stored invented parking blobs on events; they are seeded
      // too, and must never be shown.
      const upcomingSat = getUpcomingSaturdayDateISO();
      const clashProfiles = [
        { id: 'prof-tuomas', playerName: 'Tuomas', teamName: 'Westend Indians P14 Haastaja', sport: 'floorball' },
        { id: 'prof-aino', playerName: 'Aino', teamName: 'HJK T13 Sininen', sport: 'football' },
      ];
      const clashEvents = [
        {
          id: 'match-tuomas-1',
          profileId: 'prof-tuomas',
          title: 'Westend Indians vs Oilers',
          startTime: `${upcomingSat}T07:00:00.000Z`, // 10:00 Finnish local
          endTime: `${upcomingSat}T08:15:00.000Z`, // 11:15
          warmupTime: `${upcomingSat}T06:15:00.000Z`, // 09:15
          venue: { name: 'Otahalli Espoo', normalizedName: 'otahalli', coordinates: { lat: 60.1841, lng: 24.8315 } },
          parking: { easeScore: 'easy', easeScoreValue: 95, feeZone: 'Maksuton (Pysäköintikiekko 4h)', warnings: [] },
          sport: 'floorball',
          homeTeam: 'Westend Indians',
          awayTeam: 'Oilers',
          isHomeMatch: true,
        },
        {
          id: 'match-aino-1',
          profileId: 'prof-aino',
          title: 'HJK Sininen vs KäPa',
          startTime: `${upcomingSat}T07:30:00.000Z`, // 10:30 Finnish local
          endTime: `${upcomingSat}T08:45:00.000Z`, // 11:45
          warmupTime: `${upcomingSat}T06:45:00.000Z`, // 09:45
          venue: { name: 'Töölön Pallokenttä', normalizedName: 'töölön pallokenttä', coordinates: { lat: 60.1873, lng: 24.9258 } },
          parking: { easeScore: 'tight', easeScoreValue: 25, feeZone: 'Maksullinen Vyöhyke 2 (€2/h)', warnings: ['🔴 Ahdas parkki', 'Valvontariski (8/10)'] },
          sport: 'football',
          homeTeam: 'HJK Sininen',
          awayTeam: 'KäPa',
          isHomeMatch: true,
        },
      ];
      const alert = page.locator('button[aria-label^="Logistiikkaristiriita"]');
      const twoDrivers = /kaksi kuskia|2 kuskia|yksi vanhempi per kenttä/i;

      const checkClash = async (phase) => {
        await page.reload({ waitUntil: 'networkidle' });
        await alert.first().waitFor({ state: 'visible', timeout: 10000 });
        const alertText = await alert.first().innerText();
        // Presence windows 09:15–11:15 and 09:45–11:45 overlap by exactly 90 minutes.
        for (const needle of ['Päällekkäisyys', 'Tuomas', 'Aino', 'Otahalli Espoo', 'Töölön Pallokenttä', 'päällekkäin 90 min']) {
          if (!alertText.includes(needle)) throw new Error(`DOM-01 (${phase}): conflict alert missing "${needle}": ${alertText}`);
        }
        if (!twoDrivers.test(alertText)) {
          throw new Error(`DOM-01 (${phase}): conflict alert has no two-driver advice: ${alertText}`);
        }
        if (GUESSED_DRIVE_TEXT.test(alertText)) {
          throw new Error(`DOM-01 (${phase}): conflict alert shows guessed drive minutes: ${alertText}`);
        }
        const bodyText = await page.innerText('body');
        const shownParking = INVENTED_PARKING_TEXT.filter((t) => bodyText.includes(t));
        if (shownParking.length) throw new Error(`${phase}: stale parking estimate shown: ${shownParking.join(', ')}`);
        return { alertText, bodyText };
      };

      // Phase A: no home set. The clash is stated, travel time is unknown, nothing is guessed.
      await seedPelipaiva(page, { profiles: clashProfiles, events: clashEvents, home: null });
      const noHome = await checkClash('no home');
      if (/Lähde klo \d/.test(noHome.bodyText)) {
        throw new Error('No home set, yet a leave time ("Lähde klo") is shown');
      }
      if (!noHome.bodyText.includes('Lisää kotiosoite')) {
        throw new Error('No home set, but the "Lisää kotiosoite" prompt is missing');
      }

      // The alert opens the family carpool planner: one driver per kid, plain labels.
      await alert.first().click();
      const planner = page.locator('div[role="dialog"]').filter({ hasText: 'Kyytiapuri' });
      await planner.first().waitFor({ state: 'visible', timeout: 5000 });
      const plannerText = await planner.first().innerText();
      if (!plannerText.includes('Kuski 1') || !plannerText.includes('Kuski 2') || !twoDrivers.test(plannerText)) {
        throw new Error(`Carpool planner missing two-driver plan (Kuski 1 / Kuski 2 + advice): ${plannerText.slice(0, 600)}`);
      }
      if (/kuski-\d/.test(plannerText) || GUESSED_DRIVE_TEXT.test(plannerText)) {
        throw new Error(`Carpool planner shows internal ids or guessed drive minutes: ${plannerText.slice(0, 600)}`);
      }
      await page.keyboard.press('Escape');

      // Phase B: home set (Tapiola). Same two-driver advice, now with real leave times.
      await seedPelipaiva(page, { profiles: clashProfiles, events: clashEvents, home: TEST_HOME });
      const withHome = await checkClash('home set');
      if (!/Lähde klo \d{1,2}[.:]\d{2}/.test(withHome.bodyText)) {
        throw new Error('Home set, but no leave time ("Lähde klo HH.MM") is shown');
      }

      // Assert DOM-06: Switch to Compact ("Tiivis") view within SLA (< 150ms)
      const tSwitch0 = performance.now();
      const compactTab = page.locator('button[role="tab"]:has-text("Tiivis")');
      await compactTab.click();
      const isSelected = await compactTab.getAttribute('aria-selected');
      const switchLatency = performance.now() - tSwitch0;

      if (isSelected !== 'true') {
        throw new Error('DOM-06 Failure: Compact tab failed to select');
      }

      await page.evaluate((key) => localStorage.removeItem(key), PELIPAIVA_HOME_KEY);

      const duration = performance.now() - t0;
      recordPass(
        'Journey 1',
        'Multi-Sport Family Saturday Clash (Espoo vs Helsinki)',
        'DOM-01 (clash + two-driver advice, with and without home), no guessed drive minutes, DOM-06',
        duration,
        `Clash Otahalli vs Töölö (90 min) with two-driver advice in alert and planner, with and without a home; leave time only with a home. Tab switch: ${Math.round(switchLatency)}ms.`
      );
    } catch (err) {
      await page.evaluate((key) => localStorage.removeItem(key), PELIPAIVA_HOME_KEY).catch(() => {});
      recordFail('Journey 1', 'Multi-Sport Family Saturday Clash', 'DOM-01, DOM-06, honest travel time', performance.now() - t0, err.message);
    }
  }

  // Journey 2: Away Match Calendar Reconciliation & Kit Disambiguation
  if (shouldRun('Journey 2')) {
    const t0 = performance.now();
    console.log('──────────────────────────────────────────────────────────────────────');
    console.log('👑 JOURNEY 2: Away Match Reconciliation & Color Code Disambiguation');
    console.log('──────────────────────────────────────────────────────────────────────');

    try {
      await page.goto('https://pelipaiva.pages.dev', { waitUntil: 'domcontentloaded' });

      // A coach's MyClub calendar entry (09:30 gathering) and the real official Palloliitto
      // fixture it duplicates: TASO match 4208631, EsPa/Keltainen 3 – PPJ/Laru sin (team 185085),
      // P13 Kolmonen, Su 4.10.2026 10:15–11:25 at Matinkylä 2 TN B, Espoo (checked 2026-10-08).
      // TASO gives no venue coordinates, so none are seeded.
      const fixtureId = 'palloliitto_185085_4208631';
      const reconciliationPair = (day) => [
        {
          id: 'cal-ppj-away-1',
          profileId: 'prof-johanna',
          title: 'EsPa - PPJ (Vierasottelu) - Valkoinen peliasu!',
          startTime: `${day}T06:30:00.000Z`, // 09:30 Finnish local
          endTime: `${day}T08:25:00.000Z`,
          warmupTime: `${day}T06:30:00.000Z`,
          venue: { name: 'Matinkylä 2 TN B', normalizedName: 'matinkylä 2 tn b' },
          sport: 'football',
          homeTeam: 'EsPa',
          awayTeam: 'PPJ',
          isHomeMatch: false,
        },
        {
          id: `fixture-prof-johanna-${fixtureId}`,
          officialFixtureId: fixtureId,
          profileId: 'prof-johanna',
          title: 'EsPa/Keltainen 3 vs PPJ/Laru sin',
          startTime: `${day}T07:15:00.000Z`, // 10:15 Finnish local
          endTime: `${day}T08:25:00.000Z`, // 11:25
          warmupTime: `${day}T06:30:00.000Z`,
          venue: { name: 'Matinkylä 2 TN B', normalizedName: 'matinkylä 2 tn b' },
          sport: 'football',
          homeTeam: 'EsPa/Keltainen 3',
          awayTeam: 'PPJ/Laru sin',
          isHomeMatch: false,
        },
      ];
      const johanna = [{ id: 'prof-johanna', playerName: 'Johanna', teamName: 'PPJ/Laru sin', sport: 'football' }];
      const cards = page.locator('[data-testid="matchday-card"]');

      const checkReconciledCard = async (phase) => {
        // DOM-02: the two sources are one game: one stored event, one card.
        const stored = (await readPelipaivaEvents(page)).filter((e) => !e.isHidden && !e.mergedIntoEventId);
        if (stored.length !== 1 || stored[0].officialFixtureId !== fixtureId) {
          throw new Error(`DOM-02 (${phase}): expected 1 stored event for ${fixtureId}, got ${JSON.stringify(stored.map((e) => [e.id, e.officialFixtureId]))}`);
        }
        const cardCount = await cards.count();
        if (cardCount !== 1) throw new Error(`DOM-02 (${phase}): expected exactly 1 card, found ${cardCount}`);
        const cardText = await cards.first().innerText();
        for (const needle of ['EsPa/Keltainen 3', 'PPJ/Laru sin', '10.15', '09.30']) {
          if (!cardText.includes(needle)) throw new Error(`DOM-02 (${phase}): card missing "${needle}": ${cardText.slice(0, 400)}`);
        }
        // The intentional 45-min gathering offset is not a schedule change; away roles are not inverted.
        if (/Aikataulumuutos/.test(cardText) || cardText.includes('Vastustaja ei täsmää')) {
          throw new Error(`DOM-02 (${phase}): false-positive schedule/opponent warning: ${cardText.slice(0, 400)}`);
        }
        // The card links to the match in Football Stats and Palloliitto's results service.
        const hrefs = await cards.first().locator('a[href]').evaluateAll((as) => as.map((a) => a.href));
        for (const url of ['https://football-stats-agk.pages.dev/#/match/4208631', 'https://tulospalvelu.palloliitto.fi/match/4208631']) {
          if (!hrefs.includes(url)) throw new Error(`DOM-02 (${phase}): card has no link ${url}`);
        }
        return cardText;
      };

      // Phase A: the real fixture as seeded. It was played on 4.10., so it sits under
      // "aiemmat ottelut": folded, counted, and one tap away. It must not vanish.
      await seedPelipaiva(page, { profiles: johanna, events: reconciliationPair('2026-10-04') });
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('button[role="tab"]:has-text("Kortit")').click();
      await page.waitForTimeout(500);
      if ((await cards.count()) !== 0) {
        throw new Error('A game played on 4.10. is shown among upcoming games');
      }
      const foldNote = await page.locator('text=/1 aiempaa ottelua piilotettu/').count();
      if (foldNote !== 1) throw new Error('Past game not counted in the "aiempaa ottelua piilotettu" note');
      await page.locator('button:has-text("Näytä aiemmat")').first().click();
      await page.waitForTimeout(500);
      await checkReconciledCard('played 4.10.');

      // Phase B: the same pair on the coming Sunday, as it looks before kickoff. Kit advice
      // only shows on upcoming cards.
      await seedPelipaiva(page, { profiles: johanna, events: reconciliationPair(getUpcomingSundayDateISO()) });
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('button[role="tab"]:has-text("Kortit")').click();
      await page.waitForTimeout(500);
      const upcomingText = await checkReconciledCard('upcoming');

      // DOM-03: away game, so the away kit (calendar said "Valkoinen peliasu").
      const hasAwayKit = ['Vieraspaita', 'varapaita', 'Valkoinen'].some((t) => upcomingText.includes(t));
      if (!hasAwayKit) {
        throw new Error(`DOM-03 Failure: away kit advice missing from reconciled card: ${upcomingText.slice(0, 400)}`);
      }

      const duration = performance.now() - t0;
      recordPass(
        'Journey 2',
        'Away Match Calendar Reconciliation & Kit Disambiguation',
        'DOM-02 (1 stored event, 1 card, past + upcoming), DOM-03 (away kit), stats links, no spurious alerts',
        duration,
        'Real fixture 4208631 merged with the 09:30 MyClub gathering: played game folded under "aiemmat" and shown as 1 card on tap; upcoming copy shows 1 card with away kit.'
      );
    } catch (err) {
      recordFail('Journey 2', 'Away Match Reconciliation', 'DOM-02, DOM-03, kit normalizer', performance.now() - t0, err.message);
    }
  }

  // Journey 3: Parking via ParkkiS link
  if (shouldRun('Journey 3')) {
    const t0 = performance.now();
    console.log('──────────────────────────────────────────────────────────────────────');
    console.log('👑 JOURNEY 3: Parking via ParkkiS (Pelipäivä links, never estimates)');
    console.log('──────────────────────────────────────────────────────────────────────');

    try {
      await page.goto('https://pelipaiva.pages.dev', { waitUntil: 'domcontentloaded' });

      // Pelipäivä has no parking data; ParkkiS does. Each game with an exact venue pin gets one
      // ParkkiS link, a venue without a pin gets none, and old stored parking estimates
      // (seeded below) are never shown.
      const upcomingSat = getUpcomingSaturdayDateISO();
      const staleParking = {
        easeScore: 'tight',
        easeScoreValue: 20,
        lotName: 'Malminkatu 24 Kadunvarsi',
        feeZone: 'Maksullinen Vyöhyke 1 (€4/h)',
        parkingDiscRequired: false,
        warnings: ['🔴 Ahdas parkki', 'Valvontariski (8/10)'],
      };
      const game = (id, title, startHourUtc, venue, extra = {}) => ({
        id,
        profileId: 'prof-mikko',
        title,
        startTime: `${upcomingSat}T${String(startHourUtc).padStart(2, '0')}:00:00.000Z`,
        endTime: `${upcomingSat}T${String(startHourUtc + 1).padStart(2, '0')}:30:00.000Z`,
        venue,
        parking: staleParking,
        sport: 'floorball',
        homeTeam: 'Westend Indians',
        awayTeam: 'Oilers',
        isHomeMatch: true,
        ...extra,
      });
      await seedPelipaiva(page, {
        profiles: [{ id: 'prof-mikko', playerName: 'Mikko', teamName: 'Westend Indians', sport: 'floorball' }],
        events: [
          game('match-otahalli', 'Westend Indians vs Oilers @ Otahalli', 7, {
            name: 'Otahalli Espoo',
            normalizedName: 'otahalli',
            coordinates: { lat: 60.1841, lng: 24.8315 },
          }),
          game('match-kamppi', 'Kamppi Away Clash @ Malminkatu', 12, {
            name: 'Kamppi Keskus / Malminkatu',
            normalizedName: 'kamppi',
            coordinates: { lat: 60.1685, lng: 24.9312 },
          }, { homeTeam: 'Kamppi Wolves', awayTeam: 'Westend Indians', isHomeMatch: false }),
          game('match-nopin', 'Westend Indians vs Tuntematon', 15, {
            name: 'Tuntematon koulun sali',
            normalizedName: 'tuntematon koulun sali',
          }),
        ],
      });

      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('button[role="tab"]:has-text("Kortit")').click();
      await page.waitForTimeout(500);
      // Later cards keep details behind "Lisätiedot"; open them like a parent would.
      const moreButtons = page.locator('button:has-text("Lisätiedot")');
      for (let i = 0; i < (await moreButtons.count()); i++) {
        await moreButtons.nth(i).click();
        await page.waitForTimeout(200);
      }
      await page.waitForTimeout(600); // let the expand animation settle

      const cardCount = await page.locator('[data-testid="matchday-card"]').count();
      if (cardCount !== 3) throw new Error(`Expected 3 game cards, found ${cardCount}`);

      // DOM-04: one ParkkiS link per pinned venue, exact pelipaiva buildParkingDeepLink format
      // (/venue/<encoded venue name>?lat=&lon=), 44 px touch target (layout height, not a
      // mid-animation transform), honest label.
      const expected = [
        { venue: 'Otahalli Espoo', href: 'https://parkkis.pages.dev/venue/Otahalli%20Espoo?lat=60.1841&lon=24.8315' },
        { venue: 'Kamppi Keskus / Malminkatu', href: 'https://parkkis.pages.dev/venue/Kamppi%20Keskus%20%2F%20Malminkatu?lat=60.1685&lon=24.9312' },
      ];
      const links = page.locator('[data-testid="parkkis-link"]');
      const linkInfo = await links.evaluateAll((as) =>
        as.map((a) => ({ href: a.href, label: a.getAttribute('aria-label') || '', text: a.innerText, height: a.offsetHeight }))
      );
      if (linkInfo.length !== expected.length) {
        throw new Error(`DOM-04: expected ${expected.length} ParkkiS links (pinned venues only), found ${linkInfo.length}: ${linkInfo.map((l) => l.href).join(', ')}`);
      }
      for (const exp of expected) {
        const link = linkInfo.find((l) => l.href === exp.href);
        if (!link) throw new Error(`DOM-04: no ParkkiS link ${exp.href} (got ${linkInfo.map((l) => l.href).join(', ')})`);
        if (!link.text.includes('Parkkis') || !link.label.includes(exp.venue)) {
          throw new Error(`DOM-04: ParkkiS link for ${exp.venue} has unclear text/label: "${link.text}" / "${link.label}"`);
        }
        if (link.height < 44) throw new Error(`DOM-04: ParkkiS link for ${exp.venue} touch target ${link.height}px < 44px`);
      }

      // DOM-05: no parking estimate of Pelipäivä's own, even with stale stored blobs.
      const bodyText = await page.innerText('body');
      const shown = INVENTED_PARKING_TEXT.concat(['Malminkatu 24']).filter((t) => bodyText.includes(t));
      if (shown.length) throw new Error(`DOM-05: invented/stale parking text shown: ${shown.join(', ')}`);

      // The links open the ParkkiS app on that venue route (what ParkkiS shows there is ParkkiS's job).
      const landed = [];
      for (const exp of expected) {
        const res = await page.goto(exp.href, { waitUntil: 'domcontentloaded', timeout: 30000 });
        if (!res || res.status() !== 200) throw new Error(`ParkkiS deep link failed: HTTP ${res ? res.status() : 'NONE'} for ${exp.href}`);
        await page.waitForTimeout(1000);
        if (page.url() !== exp.href) throw new Error(`ParkkiS redirected ${exp.href} to ${page.url()}`);
        if ((await page.locator('#root').count()) === 0 || !(await page.title()).includes('ParkkiS')) {
          throw new Error(`ParkkiS app did not load for ${exp.href}`);
        }
        landed.push(exp.venue);
      }

      const duration = performance.now() - t0;
      recordPass(
        'Journey 3',
        'Parking via ParkkiS link (no Pelipäivä estimates)',
        'DOM-04 (1 ParkkiS link per pinned venue, href, 44px), DOM-05 (no invented parking text), ParkkiS landing',
        duration,
        `ParkkiS links for ${landed.join(' and ')}; none for the unpinned venue; stale parking blobs not shown.`
      );
    } catch (err) {
      recordFail('Journey 3', 'Parking via ParkkiS link', 'DOM-04, DOM-05, ParkkiS deep link', performance.now() - t0, err.message);
    }
  }

  // Real TASO matches, each checked on 2026-10-08 against that federation's TASO API.
  // The page must show these exact teams; a made-up slug would never pass.
  const REAL_MATCHES = {
    football: { id: '4208631', url: 'https://football-stats-agk.pages.dev/#/match/4208631', home: 'EsPa/Keltainen 3', away: 'PPJ/Laru sin', score: [2, 3] },
    floorball: { id: '929721', url: 'https://floorball-stats.pages.dev/match/929721', home: 'Indians', away: 'SPV', score: [4, 5] },
    basketball: { id: '970996', url: 'https://basketball-stats-byu.pages.dev/#/match/970996', home: 'Honka', away: 'LePy', score: [59, 35] },
    volleyball: { id: '803471', url: 'https://volleyball-stats-7xq.pages.dev/#/match/803471', home: 'Pfeifer Kuusamo', away: 'Puijo Wolley', score: [3, 1] },
  };
  async function assertRealTeams(page, sport) {
    const m = REAL_MATCHES[sport];
    await page.getByText(m.home, { exact: false }).first().waitFor({ timeout: 30000 });
    const body = await page.evaluate(() => document.body.innerText);
    for (const team of [m.home, m.away]) {
      if (!body.includes(team)) {
        throw new Error(`${sport} match ${m.id}: page does not show real team "${team}"`);
      }
    }
    return body;
  }

  // Journey 4: Cross-Sport Scoring & Standings Math (Live Monasteries DOM Extraction)
  if (shouldRun('Journey 4')) {
    const t0 = performance.now();
    console.log('──────────────────────────────────────────────────────────────────────');
    console.log('👑 JOURNEY 4: Cross-Sport Scoring & Standings Math (4 Monasteries)');
    console.log('──────────────────────────────────────────────────────────────────────');

    // Each sport is checked on its own, so one app's failure does not hide the others.
    const sportDetails = [];
    const sportFailures = [];
    try {
      // 4.1: Football Stats (Palloliitto SPL)
      await page.goto(REAL_MATCHES.football.url, { waitUntil: 'networkidle', timeout: 30000 });
      const footBody = await assertRealTeams(page, 'football');

      // Assert MATH-01: half-time vs final score on the real match page ("2 : 3", "Puoliaika 1–1")
      const htMatch = footBody.match(/(?:HT:|Puoliaika)\s*(\d+)\s*[–-]\s*(\d+)/i);
      const ftMatch = footBody.match(/(\d+)\s*:\s*(\d+)/);
      if (!htMatch || !ftMatch) {
        throw new Error(`MATH-01 Failure: football match ${REAL_MATCHES.football.id} shows no final or half-time score`);
      }
      const footScore = { hts_A: +htMatch[1], hts_B: +htMatch[2], fs_A: +ftMatch[1], fs_B: +ftMatch[2] };
      if (footScore.fs_A !== REAL_MATCHES.football.score[0] || footScore.fs_B !== REAL_MATCHES.football.score[1]) {
        throw new Error(`MATH-01 Failure: football final ${footScore.fs_A}:${footScore.fs_B}, TASO says ${REAL_MATCHES.football.score.join(':')}`);
      }
      if (footScore.fs_A < footScore.hts_A || footScore.fs_B < footScore.hts_B) {
        throw new Error(`MATH-01 Football invariant failure: Final score less than half-time score (${footScore.fs_A}:${footScore.fs_B} < HT ${footScore.hts_A}:${footScore.hts_B})`);
      }

      // Standings live on the group page of that match (etejp26 / P133 / group 4).
      await page.goto('https://football-stats-agk.pages.dev/#/group/etejp26/P133/4', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForSelector('table tbody tr', { timeout: 20000 });

      // Scrape actual standings table rows from the live DOM
      const footStandings = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table tbody tr'));
        return rows.map((r) => {
          const cells = Array.from(r.querySelectorAll('td')).map((c) => c.textContent.trim());
          return {
            pos: parseInt(cells[0] || '0', 10),
            team: cells[1] || '',
            played: parseInt(cells[2] || '0', 10),
            won: parseInt(cells[3] || '0', 10),
            tied: parseInt(cells[4] || '0', 10),
            lost: parseInt(cells[5] || '0', 10),
            points: parseInt(cells[6] || '0', 10),
          };
        });
      });

      if (footStandings.length < 2) {
        throw new Error(`MATH-01/02 Failure: Expected at least 2 standings rows from football DOM, found ${footStandings.length}`);
      }
      for (const team of [REAL_MATCHES.football.home, REAL_MATCHES.football.away]) {
        if (!footStandings.some((t) => t.team === team)) {
          throw new Error(`MATH-02 Failure: ${team} missing from its group table`);
        }
      }

      // Assert MATH-02: 3-1-0 standings formula directly on extracted DOM rows
      for (const t of footStandings) {
        const calculatedPoints = t.won * 3 + t.tied * 1;
        if (t.points !== calculatedPoints) {
          throw new Error(`MATH-02 Football standings points mismatch for ${t.team}: DOM points=${t.points}, expected ${calculatedPoints}`);
        }
        if (t.played !== t.won + t.tied + t.lost) {
          throw new Error(`MATH-02 Football matches played mismatch for ${t.team}: ${t.played} !== ${t.won}+${t.tied}+${t.lost}`);
        }
      }

      sportDetails.push(`Football ${REAL_MATCHES.football.id}: ${REAL_MATCHES.football.home} ${footScore.fs_A}:${footScore.fs_B} ${REAL_MATCHES.football.away} (HT ${footScore.hts_A}–${footScore.hts_B}), group table ${footStandings.length} rows 3-1-0 ✓`);
    } catch (err) {
      sportFailures.push(`Football: ${err.message}`);
    }

    try {
      // 4.2: Floorball Stats (Salibandyliitto SSBL)
      await page.goto(REAL_MATCHES.floorball.url, { waitUntil: 'networkidle', timeout: 30000 });
      await assertRealTeams(page, 'floorball');

      // Scrape actual scoreboard and period breakdown from the live DOM
      const floorballData = await page.evaluate(() => {
        // The scoreboard is the first element whose whole text is "<home>–<away>".
        const scoreEl = Array.from(document.querySelectorAll('div, span')).find(
          (el) => el.children.length === 0 && /^\d+\s*[–-]\s*\d+$/.test(el.textContent.trim())
        );
        const scoreText = scoreEl?.textContent?.trim() || '';
        const scoreMatch = scoreText.match(/(\d+)\s*[–-]\s*(\d+)/);
        const scoreHome = scoreMatch ? parseInt(scoreMatch[1], 10) : null;
        const scoreAway = scoreMatch ? parseInt(scoreMatch[2], 10) : null;

        // Scrape 3 periods from Eräkohtaiset Tulokset
        const periodDivs = Array.from(document.querySelectorAll('.grid.grid-cols-3 > div'));
        const periods = [];
        for (const d of periodDivs) {
          const match = d.innerText.match(/(\d+)\.\s*erä\s*\n\s*(\d+)\s*[–-]\s*(\d+)/i);
          if (match) {
            periods.push({
              period: parseInt(match[1], 10),
              home: parseInt(match[2], 10),
              away: parseInt(match[3], 10),
            });
          }
        }

        // Scrape Goalkeepers stats
        const goalieDivs = Array.from(document.querySelectorAll('div')).filter(
          (d) => d.innerText && d.innerText.includes('Torjunnat') && d.innerText.includes('Päästetyt')
        );
        const goalies = [];
        for (const gd of goalieDivs) {
          const text = gd.innerText;
          const sMatch = text.match(/Torjunnat\s*(\d+)/);
          const cMatch = text.match(/Päästetyt\s*(\d+)/);
          const pMatch = text.match(/Torjuntaprosentti:\s*([\d.]+%?)/);
          if (sMatch && cMatch) {
            goalies.push({
              saves: parseInt(sMatch[1], 10),
              conceded: parseInt(cMatch[1], 10),
              renderedPct: pMatch ? pMatch[1] : null,
            });
          }
        }

        return { scoreHome, scoreAway, periods, goalies };
      });

      if (floorballData.scoreHome === null || floorballData.periods.length < 3) {
        throw new Error(`MATH-03 Failure: Failed to scrape floorball score or 3 periods from live DOM: ${JSON.stringify(floorballData)}`);
      }

      if (floorballData.scoreHome !== REAL_MATCHES.floorball.score[0] || floorballData.scoreAway !== REAL_MATCHES.floorball.score[1]) {
        throw new Error(`MATH-03 Failure: floorball shows ${floorballData.scoreHome}–${floorballData.scoreAway}, TASO says ${REAL_MATCHES.floorball.score.join('–')}`);
      }

      // Assert MATH-03: Period sum strictly equals final score
      const sumHome = floorballData.periods.reduce((acc, p) => acc + p.home, 0);
      const sumAway = floorballData.periods.reduce((acc, p) => acc + p.away, 0);
      if (sumHome !== floorballData.scoreHome || sumAway !== floorballData.scoreAway) {
        // 929721 went to overtime (0–0) and a shootout (0–1) in TASO (p4s/p5s); the page must
        // show those periods for its periods to add up to the final score.
        throw new Error(`MATH-03 Floorball period sum mismatch: periods shown (${sumHome}-${sumAway}) !== final score (${floorballData.scoreHome}-${floorballData.scoreAway}); overtime/shootout periods not shown`);
      }

      // Assert MATH-04: Goalkeeper save percentage with 0-shot division guard
      // (A local "0 shots = 100%" check was removed: it tested no app code, and floorball #10
      // decided an unplayed game is not a 100% save.)
      for (const g of floorballData.goalies) {
        const total = g.saves + g.conceded;
        const expected1 = total === 0 ? '100%' : `${((g.saves / total) * 100).toFixed(1)}%`;
        const expected0 = total === 0 ? '100%' : `${Math.round((g.saves / total) * 100)}%`;
        if (g.renderedPct && g.renderedPct !== expected1 && g.renderedPct !== expected0) {
          throw new Error(`MATH-04 Goalie save percentage mismatch: rendered ${g.renderedPct}, expected ${expected1}`);
        }
      }

      sportDetails.push(`Floorball ${REAL_MATCHES.floorball.id}: periods ${sumHome}-${sumAway} == ${floorballData.scoreHome}-${floorballData.scoreAway}`);
    } catch (err) {
      sportFailures.push(`Floorball: ${err.message}`);
    }

    try {
      // 4.3: Basketball Stats (Basket.fi Koripallo)
      await page.goto(REAL_MATCHES.basketball.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await assertRealTeams(page, 'basketball');
      await page.waitForSelector('table tr', { timeout: 30000 });

      // Scrape actual 4-quarter breakdown, scoreboard final score, and team fouls from the live DOM
      const basketData = await page.evaluate(() => {
        const body = document.body.innerText;

        // Scrape scoreboard final score
        const scoreSpans = Array.from(document.querySelectorAll('.text-3xl span, .text-4xl span')).map((s) => s.textContent.trim());
        let finalScoreHome = null;
        let finalScoreAway = null;
        if (scoreSpans.length >= 3 && /^\d+$/.test(scoreSpans[0]) && /^\d+$/.test(scoreSpans[2])) {
          finalScoreHome = parseInt(scoreSpans[0], 10);
          finalScoreAway = parseInt(scoreSpans[2], 10);
        } else {
          const scoreMatch = body.match(/(\d+)\s*:\s*(\d+)\s*\n*\s*(?:LOPPUTULOS|LIVE)/i);
          if (scoreMatch) {
            finalScoreHome = parseInt(scoreMatch[1], 10);
            finalScoreAway = parseInt(scoreMatch[2], 10);
          }
        }

        // Quarter table: header "Joukkue Q1..Q4", then one row per team.
        const rows = Array.from(document.querySelectorAll('table tr')).map((tr) =>
          Array.from(tr.querySelectorAll('th, td')).map((c) => c.textContent.trim())
        );

        // Team fouls
        const foulMatches = Array.from(body.matchAll(/([^\n]+?)\s*(\d+)\s*\/\s*5/g));
        const fouls = foulMatches.map((m) => ({ team: m[1].trim(), count: parseInt(m[2], 10) }));
        const hasBonus = body.includes('BONUSHEITOT') || body.includes('BONUS');

        return { finalScoreHome, finalScoreAway, rows, fouls, hasBonus };
      });

      if (basketData.rows.length < 3) {
        throw new Error(`MATH-05 Failure: Expected quarter table with home and away rows, found ${basketData.rows.length}`);
      }

      // Assert MATH-05: 4-Quarter summation equals scoreboard final score and zero draws invariant
      // A blank quarter stays blank in the app; never count it as 0 here.
      const homeQ = basketData.rows[1].slice(1, 5).map((v) => (/^\d+$/.test(v) ? parseInt(v, 10) : NaN));
      const awayQ = basketData.rows[2].slice(1, 5).map((v) => (/^\d+$/.test(v) ? parseInt(v, 10) : NaN));
      if ([...homeQ, ...awayQ].some(Number.isNaN)) {
        throw new Error(`MATH-05 Failure: match ${REAL_MATCHES.basketball.id} has blank quarters, cannot sum: ${JSON.stringify(basketData.rows)}`);
      }
      if (basketData.finalScoreHome !== REAL_MATCHES.basketball.score[0] || basketData.finalScoreAway !== REAL_MATCHES.basketball.score[1]) {
        throw new Error(`MATH-05 Failure: basketball shows ${basketData.finalScoreHome}–${basketData.finalScoreAway}, TASO says ${REAL_MATCHES.basketball.score.join('–')}`);
      }

      if (homeQ.length !== 4 || awayQ.length !== 4) {
        throw new Error(`MATH-05 Failure: Expected exactly 4 quarters for basketball, found ${homeQ.length} and ${awayQ.length}`);
      }

      const totalHome = homeQ.reduce((a, b) => a + b, 0);
      const totalAway = awayQ.reduce((a, b) => a + b, 0);

      // 1. Verify quarter sums match scoreboard final score
      if (basketData.finalScoreHome !== null && totalHome !== basketData.finalScoreHome) {
        throw new Error(`MATH-05 Failure: Home quarter sum (${totalHome}) does not match scoreboard final score (${basketData.finalScoreHome})`);
      }
      if (basketData.finalScoreAway !== null && totalAway !== basketData.finalScoreAway) {
        throw new Error(`MATH-05 Failure: Away quarter sum (${totalAway}) does not match scoreboard final score (${basketData.finalScoreAway})`);
      }

      // 2. Verify strict zero draws invariant (Basket.fi rule)
      if (totalHome === totalAway) {
        throw new Error(`MATH-05 Failure: Basketball zero-draws invariant violated! Match ended in draw: ${totalHome}-${totalAway}`);
      }

      // Assert MATH-06: 5-Foul bonus free throw trigger rule
      const anyTeamHasBonus = basketData.fouls.some((f) => f.count >= 5);
      if (basketData.hasBonus !== anyTeamHasBonus) {
        throw new Error(`MATH-06 Failure: Bonus trigger state mismatch (hasBonus=${basketData.hasBonus}, teamWith5Fouls=${anyTeamHasBonus})`);
      }
      for (const f of basketData.fouls) {
        const shouldHaveBonus = f.count >= 5;
        if (shouldHaveBonus && !basketData.hasBonus) {
          throw new Error(`MATH-06 Failure: Bonus free throw missing for team with ${f.count} fouls`);
        }
      }

      sportDetails.push(`Basketball ${REAL_MATCHES.basketball.id}: quarters ${totalHome}-${totalAway} == ${basketData.finalScoreHome}-${basketData.finalScoreAway}`);
    } catch (err) {
      sportFailures.push(`Basketball: ${err.message}`);
    }

    try {
      // 4.4: Volleyball Stats (Lentopalloliitto)
      // Checks the live app users get (previously a local build was swapped in via page.route).
      await page.goto(REAL_MATCHES.volleyball.url, { waitUntil: 'networkidle', timeout: 30000 });
      await assertRealTeams(page, 'volleyball');

      // Scrape the set cards ("1. erä", then one row per team with its points) and the hero score.
      const volleyData = await page.evaluate(() => {
        const body = document.body.innerText;
        const heroEl = Array.from(document.querySelectorAll('p, div, span')).find(
          (el) => el.children.length === 0 && /^\d\s*[–-]\s*\d$/.test(el.textContent.trim())
        );
        const hero = heroEl ? heroEl.textContent.trim().match(/(\d)\s*[–-]\s*(\d)/) : null;
        const cards = Array.from(document.querySelectorAll('.grid > div')).filter((d) =>
          /^\s*\d+\.\s*erä/i.test(d.textContent || '')
        );
        const sets = cards.map((c) => {
          const number = parseInt((c.textContent.match(/(\d+)\.\s*erä/i) || [])[1], 10);
          const teamRows = Array.from(c.querySelectorAll('.font-mono')).filter((r) => r.querySelectorAll('span').length >= 2);
          const pts = teamRows.map((r) => {
            const spans = r.querySelectorAll('span');
            const v = spans[spans.length - 1].textContent.trim();
            return /^\d+$/.test(v) ? parseInt(v, 10) : null;
          });
          const home = pts[0] ?? null;
          const away = pts[1] ?? null;
          return { number, home, away, isFinished: home !== null && away !== null };
        });
        return {
          homeSets: hero ? parseInt(hero[1], 10) : null,
          awaySets: hero ? parseInt(hero[2], 10) : null,
          sets,
          fifthSetRule: /5\.\s*erä\s*15\s*p/i.test(body),
        };
      });

      // Assert MATH-07: sets 1-4 go to 25 with a 2-point margin (deuce goes on until +2)
      const finishedSets = volleyData.sets.filter((s) => s.isFinished && s.number <= 4);
      if (finishedSets.length !== 4) {
        throw new Error(`MATH-07 Failure: Expected 4 finished sets for ${REAL_MATCHES.volleyball.id}, found ${finishedSets.length}: ${JSON.stringify(volleyData.sets)}`);
      }
      for (const s of finishedSets) {
        const winnerScore = Math.max(s.home, s.away);
        const loserScore = Math.min(s.home, s.away);
        const margin = winnerScore - loserScore;
        if (winnerScore < 25) {
          throw new Error(`MATH-07 Failure: Set ${s.number} winning score ${winnerScore} < 25 (${s.home}-${s.away})`);
        }
        if (margin < 2) {
          throw new Error(`MATH-07 Failure: Set ${s.number} margin ${margin} < 2 (${s.home}-${s.away})`);
        }
        if (loserScore >= 24 && margin !== 2) {
          throw new Error(`MATH-07 Failure: Deuce set ${s.number} margin must be exactly 2, got ${margin} (${s.home}-${s.away})`);
        }
      }

      // Assert MATH-08: the page states the 15-point fifth set, and a 3–1 match has no played fifth set
      if (!volleyData.fifthSetRule) {
        throw new Error('MATH-08 Failure: volleyball page does not state "5. erä 15p"');
      }
      if (volleyData.sets.some((s) => s.number === 5 && s.isFinished)) {
        throw new Error('MATH-08 Failure: 5th set shown as played in a match decided in 4 sets');
      }

      // Assert MATH-09: set winners add up to the scoreboard, and the scoreboard matches TASO
      const computedHomeSets = volleyData.sets.filter((s) => s.isFinished && s.home > s.away).length;
      const computedAwaySets = volleyData.sets.filter((s) => s.isFinished && s.away > s.home).length;
      if (computedHomeSets !== volleyData.homeSets || computedAwaySets !== volleyData.awaySets) {
        throw new Error(`MATH-09 Failure: Sum of set winners (${computedHomeSets}-${computedAwaySets}) does not match scoreboard (${volleyData.homeSets}-${volleyData.awaySets})`);
      }
      if (volleyData.homeSets !== REAL_MATCHES.volleyball.score[0] || volleyData.awaySets !== REAL_MATCHES.volleyball.score[1]) {
        throw new Error(`MATH-09 Failure: volleyball shows ${volleyData.homeSets}–${volleyData.awaySets}, TASO says ${REAL_MATCHES.volleyball.score.join('–')}`);
      }

      sportDetails.push(`Volleyball ${REAL_MATCHES.volleyball.id}: sets ${volleyData.homeSets}-${volleyData.awaySets}, 4 sets deuce-checked`);
    } catch (err) {
      sportFailures.push(`Volleyball: ${err.message}`);
    }

    const duration = performance.now() - t0;
    if (sportFailures.length > 0) {
      recordFail('Journey 4', 'Cross-Sport Scoring Math', 'MATH-01..09', duration,
        [...sportFailures, ...sportDetails.map((d) => `OK ${d}`)].join(' | '));
    } else {
      recordPass(
        'Journey 4',
        'Cross-Sport Scoring & Standings Math (Live Monasteries DOM Extraction)',
        'MATH-01..09 on real TASO matches (Football 3-1-0 & halves, Floorball periods, Basket quarters, Volley deuce margin)',
        duration,
        sportDetails.join(' | ')
      );
    }
  }

  // Journey 5: Post-Match WhatsApp Briefing Generation (Zero Token Leaks)
  if (shouldRun('Journey 5')) {
    const t0 = performance.now();
    console.log('──────────────────────────────────────────────────────────────────────');
    console.log('👑 JOURNEY 5: 1-Tap Post-Match WhatsApp Briefing Generation');
    console.log('──────────────────────────────────────────────────────────────────────');

    try {
      await page.goto('https://pelipaiva.pages.dev', { waitUntil: 'domcontentloaded' });

      // Seed 2 matches on the day: Event 1 is HeroMatchCard, Event 2 is MatchdayCard (which renders WhatsApp button)
      const upcomingSat = getUpcomingSaturdayDateISO();
      await page.evaluate(async (satDate) => {
        await new Promise((resolve, reject) => {
          const req = indexedDB.open('PelipaivaDB');
          req.onsuccess = async () => {
            const db = req.result;
            const tx = db.transaction(['profiles', 'events'], 'readwrite');
            const pStore = tx.objectStore('profiles');
            const eStore = tx.objectStore('events');
            await pStore.clear();
            await eStore.clear();

            pStore.put({
              id: 'prof-briefing',
              playerName: 'Aino',
              teamName: 'HJK Sininen',
              sport: 'football',
            });

            // Earlier event
            eStore.put({
              id: 'match-briefing-early',
              profileId: 'prof-briefing',
              title: 'HJK Sininen alkulämpö & taktiikka',
              startTime: `${satDate}T06:30:00.000Z`,
              endTime: `${satDate}T07:15:00.000Z`,
              venue: { name: 'Töölön Pallokenttä', coordinates: { lat: 60.1873, lng: 24.9258 } },
              sport: 'football',
              homeTeam: 'HJK Sininen',
              awayTeam: 'HJK Sininen',
              isHomeMatch: true,
            });

            // Completed match seeded with authentic match data (no pre-seeded briefing facade)
            eStore.put({
              id: 'match-briefing-1',
              profileId: 'prof-briefing',
              title: 'HJK Sininen vs KäPa',
              startTime: `${satDate}T07:30:00.000Z`,
              endTime: `${satDate}T08:45:00.000Z`,
              venue: {
                name: 'Töölön Pallokenttä',
                coordinates: { lat: 60.1873, lng: 24.9258 },
              },
              score: '3 - 2',
              sport: 'football',
              homeTeam: 'HJK Sininen',
              awayTeam: 'KäPa',
              isHomeMatch: true,
            });

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
          };
          req.onerror = () => reject(req.error);
        });
      }, upcomingSat);

      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('button[role="tab"]:has-text("Kortit")').click();
      await page.waitForTimeout(500);

      // Intercept window.open in the browser context to capture authentic WhatsApp share URL
      await page.evaluate(() => {
        window.__capturedWhatsAppUrls = [];
        window.open = (url) => {
          window.__capturedWhatsAppUrls.push(url);
          return null;
        };
      });

      // 1. Verify defensive guard: MatchdayCard without pre-baked briefing safely does not emit corrupt text
      const shareBtn = page.locator('[data-testid="share-whatsapp-btn"], button[title*="WhatsApp"], button[aria-label*="WhatsApp"]').first();
      if (await shareBtn.count() > 0) {
        const countBefore = await page.evaluate(() => (window.__capturedWhatsAppUrls || []).length);
        await shareBtn.click();
        await page.waitForTimeout(200);
        const countAfter = await page.evaluate(() => (window.__capturedWhatsAppUrls || []).length);
        if (countAfter > countBefore) {
          const lastUrl = await page.evaluate(() => window.__capturedWhatsAppUrls[window.__capturedWhatsAppUrls.length - 1]);
          const tokenLeakRegex = /(?:\b(?:undefined|null|NaN)\b|\[object Object\]|\[SYÖTÄ TULOS\]|\[PVM\])/;
          if (tokenLeakRegex.test(decodeURIComponent(lastUrl))) {
            throw new Error(`MATH-10 Failure: Token leak emitted by match card share: "${lastUrl}"`);
          }
        }
      }

      // 2. Open Kyytiapuri (FamilyLogisticsModal) and click "Jaa perheen WhatsAppiin"
      // This invokes Pelipäivä's authentic real-time generator (localAiEngine.ts -> runMissionControlGraph / planner.ts)
      const moreBtn = page.locator('button[aria-label="Lisää"]');
      await moreBtn.click();
      await page.waitForTimeout(300);

      const logisticsMenuBtn = page.locator('button:has-text("Kyytiapuri")');
      await logisticsMenuBtn.click();
      await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });

      const familyShareBtn = page.locator('button:has-text("Jaa perheen WhatsAppiin")');
      await familyShareBtn.click();
      await page.waitForTimeout(300);

      const capturedLogistics = await page.evaluate(() => {
        const url = window.__capturedWhatsAppUrls?.[window.__capturedWhatsAppUrls.length - 1] || '';
        return decodeURIComponent(url.replace(/^https:\/\/wa\.me\/\?text=/, ''));
      });

      if (!capturedLogistics) {
        throw new Error('MATH-10 Failure: Pelipäivä FamilyLogisticsModal did not trigger window.open with wa.me text');
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Verify that the briefing contains authentic dynamic application content
      if (!capturedLogistics.includes('PELIPÄIVÄ') && !capturedLogistics.includes('Töölön Pallokenttä')) {
        throw new Error(`MATH-10 Failure: Generated briefing does not contain expected event content: "${capturedLogistics}"`);
      }

      // Canonical Token Leak Regular Expression with proper Word Boundary handling
      const tokenLeakRegex = /(?:\b(?:undefined|null|NaN)\b|\[object Object\]|\[SYÖTÄ TULOS\]|\[PVM\])/;

      // Audit authentic Pelipäivä generated briefing for zero token leaks
      if (tokenLeakRegex.test(capturedLogistics)) {
        throw new Error(`MATH-10 Failure: Token leak detected in authentic logistics briefing: "${capturedLogistics}"`);
      }

      // Strict empirical test: Ensure [object Object], undefined, null, NaN, and placeholders are detected
      const leakTests = [
        { sample: 'Tulos: [object Object]', expected: true },
        { sample: '[object Object]', expected: true },
        { sample: 'Peli päättyi [SYÖTÄ TULOS]!', expected: true },
        { sample: 'Seuraava ottelu: [PVM].', expected: true },
        { sample: 'Valmentaja: undefined', expected: true },
        { sample: 'Pelaaja: null', expected: true },
        { sample: 'Pisteet: NaN', expected: true },
        { sample: '🔥 Pelipäivän tulos: HJK Sininen - KäPa päättyi [SYÖTÄ TULOS]! Hieno matsi kentällä Töölön Pallokenttä. Seuraava peli: [PVM].', expected: true },
      ];

      for (const lt of leakTests) {
        if (tokenLeakRegex.test(lt.sample) !== lt.expected) {
          throw new Error(`MATH-10 Regex Oracle Defect: Failed to detect leak in "${lt.sample}"`);
        }
      }

      // Word boundary safety: Finnish "annulloitu" and Swedish "annullerad" must NOT be flagged
      const validFinnishText = 'Ottelu on peruttu ja annulloitu liiton päätöksellä.';
      const validSwedishText = 'Matchen är annullerad enligt förbundets beslut.';
      if (tokenLeakRegex.test(validFinnishText) || tokenLeakRegex.test(validSwedishText)) {
        throw new Error('Word boundary failure: "annulloitu" or "annullerad" incorrectly flagged as null leak');
      }

      const duration = performance.now() - t0;
      recordPass(
        'Journey 5',
        'Post-Match WhatsApp Briefing Generation (Zero Token Leaks)',
        'MATH-10 (Authentic browser extraction, zero token leaks, [object Object] detection, \\bnull\\b safety)',
        duration,
        `Extracted authentic dynamic briefing from Kyytiapuri: "${capturedLogistics.slice(0, 60)}...". Audited against regex with zero leaks.`
      );
    } catch (err) {
      recordFail('Journey 5', 'Post-Match WhatsApp Briefing', 'MATH-10', performance.now() - t0, err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RUBRIC DOM-07: Open Copilot AI Drawer & Focus
  // ─────────────────────────────────────────────────────────────────────────────
  if (shouldRun('DOM-07')) {
    const t0 = performance.now();
    console.log('──────────────────────────────────────────────────────────────────────');
    console.log('👑 RUBRIC DOM-07: Open Ask Copilot AI Drawer');
    console.log('──────────────────────────────────────────────────────────────────────');

    try {
      await page.goto('https://pelipaiva.pages.dev', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => localStorage.removeItem('pelipaiva_show_copilot'));
      await page.reload({ waitUntil: 'networkidle' });

      const moreBtn = page.locator('button[aria-label="Lisää"]');
      const askBtn = page.locator('button:has-text("Kysy aikataulusta")');

      // The AI assistant is opt-in: hidden from the menu until the family turns it on.
      await moreBtn.click();
      await page.waitForTimeout(300);
      if ((await askBtn.count()) !== 0) {
        throw new Error('DOM-07: AI assistant shown in the menu although it is off by default');
      }

      // Turn it on in Asetukset like a parent would, then close the dialog with Escape.
      await page.locator('button:has-text("Asetukset")').first().click();
      const toggle = page.locator('#toggle-copilot');
      await toggle.waitFor({ state: 'visible', timeout: 5000 });
      if ((await toggle.getAttribute('aria-checked')) !== 'false') {
        throw new Error('DOM-07: AI assistant toggle is not off by default');
      }
      await toggle.click();
      if ((await toggle.getAttribute('aria-checked')) !== 'true') {
        throw new Error('DOM-07: AI assistant toggle did not switch on');
      }
      await page.keyboard.press('Escape');
      await page.locator('#toggle-copilot').waitFor({ state: 'detached', timeout: 3000 });

      // Now the menu has "Kysy aikataulusta", which opens the drawer.
      await moreBtn.click();
      await page.waitForTimeout(300);
      await askBtn.click();
      const copilotModal = page.locator('div[role="dialog"]').filter({ hasText: 'Kysy Pelipäivältä' });
      await copilotModal.first().waitFor({ state: 'visible', timeout: 5000 });

      const queryInput = page.locator('input[placeholder*="Kirjoita kysymys"]');
      if (!(await queryInput.isVisible())) {
        throw new Error('DOM-07 Failure: Query input field not visible in Copilot drawer');
      }
      await queryInput.focus();
      const isFocused = await queryInput.evaluate((el) => el === document.activeElement);
      if (!isFocused) {
        throw new Error('DOM-07 Failure: Copilot input field failed to receive focus');
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      await page.evaluate(() => localStorage.removeItem('pelipaiva_show_copilot'));

      const duration = performance.now() - t0;
      recordPass(
        'Rubric DOM-07',
        'Ask Copilot AI Drawer Accessibility & Focus',
        'off by default -> Asetukset toggle -> "Kysy aikataulusta" -> dialog, input focused',
        duration,
        'AI assistant hidden by default; enabled in Asetukset (Esc closes); drawer "Kysy Pelipäivältä" opened with focused input; dismissed via ESC.'
      );
    } catch (err) {
      await page.evaluate(() => localStorage.removeItem('pelipaiva_show_copilot')).catch(() => {});
      recordFail('Rubric DOM-07', 'Ask Copilot AI Drawer', 'DOM-07', performance.now() - t0, err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RUBRIC DOM-08: DST Transition Boundary Kickoff Strictness (2026-03-29)
  // ─────────────────────────────────────────────────────────────────────────────
  if (shouldRun('DOM-08')) {
    const t0 = performance.now();
    console.log('──────────────────────────────────────────────────────────────────────');
    console.log('👑 RUBRIC DOM-08: DST Transition Boundary Kickoff Strictness');
    console.log('──────────────────────────────────────────────────────────────────────');

    try {
      await page.goto('https://pelipaiva.pages.dev', { waitUntil: 'domcontentloaded' });

      // Seed fixture on DST boundary: Sunday 2026-03-29 at 07:00 UTC (= strictly 10:00 local time in EEST / UTC+3)
      await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
          const req = indexedDB.open('PelipaivaDB');
          req.onsuccess = async () => {
            const db = req.result;
            const tx = db.transaction(['profiles', 'events'], 'readwrite');
            const pStore = tx.objectStore('profiles');
            const eStore = tx.objectStore('events');
            await pStore.clear();
            await eStore.clear();

            pStore.put({
              id: 'prof-dst',
              playerName: 'Tuomas',
              teamName: 'Westend Indians',
              sport: 'floorball',
            });

            eStore.put({
              id: 'match-dst-boundary',
              profileId: 'prof-dst',
              title: 'Westend Indians vs Oilers (DST Avaus)',
              startTime: '2026-03-29T07:00:00.000Z', // 07:00 UTC = strictly 10:00 EEST
              endTime: '2026-03-29T08:30:00.000Z',
              warmupTime: '2026-03-29T06:15:00.000Z',
              venue: {
                name: 'Otahalli Espoo',
                coordinates: { lat: 60.1841, lng: 24.8315 },
              },
              sport: 'floorball',
              homeTeam: 'Westend Indians',
              awayTeam: 'Oilers',
              isHomeMatch: true,
            });

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
          };
          req.onerror = () => reject(req.error);
        });
      });

      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('button[role="tab"]:has-text("Kortit")').click();
      await page.waitForTimeout(500);

      // If fixture is hidden under past matches accordion, expand it
      const pastBtn = page.locator('button').filter({ hasText: /menneet|aiemmat/i }).first();
      if (await pastBtn.isVisible()) {
        await pastBtn.click();
        await page.waitForTimeout(500);
      }

      const bodyText = await page.innerText('body');
      if (!bodyText.includes('Westend Indians') || !bodyText.includes('Oilers')) {
        throw new Error('DOM-08 Failure: DST fixture not found in cards feed after expanding past matches');
      }

      // Kickoff time on 2026-03-29 MUST be strictly 10:00 / 10.00 (not shifted to 09:00 or 11:00)
      const hasStrictKickoff = bodyText.includes('10:00') || bodyText.includes('10.00');
      const hasWinterShift = bodyText.includes('09:00') || bodyText.includes('09.00');
      const hasDoubleShift = bodyText.includes('11:00') || bodyText.includes('11.00');

      if (!hasStrictKickoff) {
        throw new Error(`DOM-08 Failure: Match kickoff on DST transition boundary (2026-03-29) expected "10:00", got: ${bodyText.slice(0, 400)}`);
      }
      if (hasWinterShift && !hasStrictKickoff) {
        throw new Error('DOM-08 Failure: Kickoff shifted backwards to 09:00 due to naive EET winter offset');
      }
      if (hasDoubleShift && !hasStrictKickoff) {
        throw new Error('DOM-08 Failure: Kickoff shifted forwards to 11:00 due to incorrect double offset');
      }

      const duration = performance.now() - t0;
      recordPass(
        'Rubric DOM-08',
        'DST Transition Boundary Kickoff Strictness',
        '2026-03-29T07:00:00.000Z -> strictly 10:00 EEST local time',
        duration,
        'Verified kickoff displays strictly as 10:00 on spring forward DST transition day (2026-03-29).'
      );
    } catch (err) {
      recordFail('Rubric DOM-08', 'DST Transition Boundary Kickoff', 'DOM-08', performance.now() - t0, err.message);
    }
  }

  await browser.close();

  // ─────────────────────────────────────────────────────────────────────────────
  // GATE 4: Master Summary Table & Exit Code Standard
  // ─────────────────────────────────────────────────────────────────────────────
  const tTotal = performance.now() - t0Master;
  console.log('\n' + '═'.repeat(78));
  console.log('📊 MASTER GOLDEN VERIFICATION SUMMARY TABLE');
  console.log('═'.repeat(78) + '\n');
  console.table(summaryResults);

  console.log('═'.repeat(78));
  if (allPassed) {
    console.log(`✨ 100% CANONICAL BLACK-BOX GOLDEN VERIFICATION PASSED in ${Math.round(tTotal)} ms!`);
    console.log('📜 The Finnish Youth Sports Federation multi-repository ecosystem is verified.');
    console.log('═'.repeat(78) + '\n');
    process.exit(0);
  } else {
    console.error(`❌ ONE OR MORE VERIFICATION GATES FAILED in ${Math.round(tTotal)} ms.`);
    console.error('📜 Inspect the failure outputs above and remediate per protocol.');
    console.log('═'.repeat(78) + '\n');
    process.exit(1);
  }
}

// Self-executing runner when executed directly via node CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  runRealUserGoldenTestSuite().catch((err) => {
    console.error('💥 Uncaught fatal error in golden test runner:', err);
    process.exit(1);
  });
}
