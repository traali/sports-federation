import { chromium } from "../pelipaiva/node_modules/playwright/index.mjs";
import path from "path";
import fs from "fs";

const SCREENSHOT_DIR = "C:/Users/aoinonen/.gemini/antigravity/brain/762e3f78-1395-478c-9b87-99a672b17e04";

const services = [
  { name: "📱 Pelipäivä Hub", key: "pelipaiva", url: "https://pelipaiva.pages.dev" },
  { name: "🅿️ ParkkiS Spatial Map", key: "parkkis", url: "https://parkkis.pages.dev" },
  { name: "🏑 Floorball Stats", key: "floorball", url: "https://floorball-stats.pages.dev/match/Indians-Oilers" },
  { name: "🏀 Basketball Stats", key: "basketball", url: "https://basketball-stats-byu.pages.dev/match/Honka-LePy" },
  { name: "⚽ Football Stats", key: "football", url: "https://football-stats-agk.pages.dev/#/match/HJK-K%C3%A4Pa" },
  { name: "🏐 Volleyball Stats", key: "volleyball", url: "https://volleyball-stats-7xq.pages.dev/match/KaLe-Vantaa" }
];

async function run() {
  console.log("════════════════════════════════════════════════════════════════════════");
  console.log("🌐 REAL BROWSER (CHROME) LIVE PRODUCTION AUDIT");
  console.log("════════════════════════════════════════════════════════════════════════\n");
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
      await page.waitForTimeout(2000);
      const title = await page.title();
      const buildInfo = await page.evaluate(() => window.__APP_BUILD_INFO__);
      const badgeText = await page.evaluate(() => {
        const el = document.querySelector("[data-testid=\"app-version-badge\"]");
        return el ? el.textContent.trim() : null;
      });
      const shotName = `browser_${s.key}.png`;
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, shotName) });
      const passed = status === 200 && pageErrors.length === 0 && Boolean(buildInfo);
      results.push({ service: s.name, status: passed ? "✅ PASSED" : "❌ FAILED", http: status, commit: buildInfo?.commit || "N/A", badge: badgeText || "N/A", pageErrors: pageErrors.length, shot: shotName });
      console.log(`   ✅ Loaded: ${title} | Commit: ${buildInfo?.commit} | Badge: ${badgeText} | Errors: ${pageErrors.length}`);
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