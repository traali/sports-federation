/**
 * Real browser (Chrome) audit of the live apps.
 *
 * Every sport app is opened at a real TASO match, checked on 2026-10-08 against that
 * federation's TASO API, and the page must show that match's real teams and score.
 *
 * Screenshots go to $AUDIT_SCREENSHOT_DIR, or <os tmpdir>/sports-federation-audit.
 */
import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SCREENSHOT_DIR = process.env.AUDIT_SCREENSHOT_DIR || path.join(os.tmpdir(), "sports-federation-audit");

async function loadChromium() {
  try {
    return (await import("playwright")).chromium;
  } catch {
    const nested = path.join(ROOT, "pelipaiva", "node_modules", "playwright", "index.mjs");
    return (await import(pathToFileURL(nested).href)).chromium;
  }
}

const services = [
  { name: "📱 Pelipäivä Hub", key: "pelipaiva", url: "https://pelipaiva.pages.dev", expect: [] },
  { name: "🅿️ ParkkiS Spatial Map", key: "parkkis", url: "https://parkkis.pages.dev/venue/Otahalli%20Espoo?lat=60.1841&lon=24.8315", expect: [] },
  // salibandy 929721: Indians 4–5 SPV, F-liiga miehet, Otahalli Espoo, 2026-10-03
  { name: "🏑 Floorball Stats", key: "floorball", url: "https://floorball-stats.pages.dev/match/929721", expect: ["Indians", "SPV", /4\s*[–-]\s*5/] },
  // basket 970996: Honka 59–35 LePy, 14-vuotiaat tytöt II div, 2025-09-20
  { name: "🏀 Basketball Stats", key: "basketball", url: "https://basketball-stats-byu.pages.dev/#/match/970996", expect: ["Honka", "LePy", /59\s*[–-]?\s*35/] },
  // palloliitto 4208631: EsPa/Keltainen 3 2–3 PPJ/Laru sin, P13 Kolmonen, 2026-10-04
  { name: "⚽ Football Stats", key: "football", url: "https://football-stats-agk.pages.dev/#/match/4208631", expect: ["EsPa/Keltainen 3", "PPJ/Laru sin", /2\s*:\s*3/] },
  // lentopallo 803471: Pfeifer Kuusamo 3–1 Puijo Wolley, Naisten Mestaruusliiga, 2026-10-02
  { name: "🏐 Volleyball Stats", key: "volleyball", url: "https://volleyball-stats-7xq.pages.dev/#/match/803471", expect: ["Pfeifer Kuusamo", "Puijo Wolley", /3\s*[–-]\s*1/] },
];

async function run() {
  console.log("════════════════════════════════════════════════════════════════════════");
  console.log("🌐 REAL BROWSER (CHROME) LIVE PRODUCTION AUDIT");
  console.log(`   Screenshots: ${SCREENSHOT_DIR}`);
  console.log("════════════════════════════════════════════════════════════════════════\n");
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const results = [];
  for (const s of services) {
    console.log(`🚀 [BROWSER] Visiting ${s.name} at ${s.url}...`);
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const pageErrors = [];
    page.on("pageerror", err => pageErrors.push(err.message));
    try {
      const res = await page.goto(s.url, { waitUntil: "networkidle", timeout: 30000 });
      const status = res ? res.status() : 0;
      // Wait until the real match is on screen (the data comes from TASO after load).
      const firstTeam = s.expect.find(e => typeof e === "string");
      if (firstTeam) {
        await page.getByText(firstTeam, { exact: false }).first().waitFor({ timeout: 20000 }).catch(() => {});
      } else {
        await page.waitForTimeout(2000);
      }
      const title = await page.title();
      const bodyText = await page.evaluate(() => document.body.innerText);
      const missing = s.expect.filter(e => (typeof e === "string" ? !bodyText.includes(e) : !e.test(bodyText))).map(String);
      const buildInfo = await page.evaluate(() => window.__APP_BUILD_INFO__);
      const badgeText = await page.evaluate(() => {
        const el = document.querySelector("[data-testid=\"app-version-badge\"]");
        return el ? el.textContent.trim() : null;
      });
      const shotName = `browser_${s.key}.png`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, shotName) });
      const passed = status === 200 && pageErrors.length === 0 && Boolean(buildInfo) && missing.length === 0;
      results.push({ service: s.name, status: passed ? "✅ PASSED" : "❌ FAILED", http: status, commit: buildInfo?.commit || "N/A", badge: badgeText || "N/A", realMatch: missing.length ? `missing ${missing.join(", ")}` : (s.expect.length ? "✅" : "-"), pageErrors: pageErrors.length, shot: shotName });
      console.log(`   ${passed ? "✅" : "❌"} ${title} | Commit: ${buildInfo?.commit} | Badge: ${badgeText} | Errors: ${pageErrors.length}${missing.length ? ` | Missing on page: ${missing.join(", ")}` : ""}`);
    } catch (e) {
      console.error(`   ❌ Failed to load ${s.name}: ${e.message}`);
      results.push({ service: s.name, status: "❌ FAILED", error: e.message });
    } finally {
      await page.close();
    }
  }
  await browser.close();
  console.log("\n════════════════════════════════════════════════════════════════════════");
  console.log("📊 REAL BROWSER LIVE AUDIT SUMMARY TABLE");
  console.log("════════════════════════════════════════════════════════════════════════\n");
  console.table(results);
  const allPassed = results.every(r => r.status === "✅ PASSED");
  process.exit(allPassed ? 0 : 1);
}
run();
