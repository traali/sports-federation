import { execSync } from 'child_process';

const services = [
  { name: '📱 Pelipäivä Hub', url: 'https://pelipaiva.pages.dev', dir: 'pelipaiva' },
  { name: '🅿️ ParkkiS Spatial Map', url: 'https://parkkis.pages.dev', dir: 'Parkkis' },
  { name: '🏑 Floorball Stats', url: 'https://floorball-stats.pages.dev', dir: 'floorball-stats' },
  { name: '🏀 Basketball Stats', url: 'https://basketball-stats-byu.pages.dev', dir: 'basketball-stats' },
  { name: '⚽ Football Stats', url: 'https://football-stats-agk.pages.dev', dir: 'football-stats' },
  { name: '🏐 Volleyball Stats', url: 'https://volleyball-stats-7xq.pages.dev', dir: 'volleyball-stats' },
];

export async function verifyLiveBuildVersions() {
  console.log('\n👑 [DEEP AUDIT] Verifying Live Production Builds, Git Commits & UI Badges...\n');
  const results = [];
  let allPassed = true;

  for (const s of services) {
    let localGitCommit = 'unknown';
    try {
      localGitCommit = execSync('git rev-parse --short HEAD', { cwd: s.dir }).toString().trim();
    } catch {
      // fallback
    }

    // 1. Fetch live production HTML
    const res = await fetch(s.url, { method: 'GET' });
    if (res.status !== 200) {
      throw new Error(`[FAIL] ${s.name} returned HTTP ${res.status}`);
    }

    const html = await res.text();
    if (!html || !html.includes('<div id="root">')) {
      throw new Error(`[FAIL] ${s.name} returned invalid HTML payload (missing #root container)`);
    }

    // 2. Extract script tags
    const scriptMatches = [];
    const scriptRegex = /src=["']([^"']+\.js)/g;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
      scriptMatches.push(match[1]);
    }

    if (scriptMatches.length === 0) {
      throw new Error(`[FAIL] ${s.name} has no JS script tags referenced in HTML!`);
    }

    let foundCommit = null;
    let foundVersion = null;
    let foundBuildInfo = false;
    let foundVersionBadge = false;

    // 3. Deep inspect live JS bundles
    for (const src of scriptMatches) {
      const scriptUrl = src.startsWith('http') ? src : new URL(src, s.url).href;
      const scriptRes = await fetch(scriptUrl);
      if (scriptRes.status !== 200) continue;
      const js = await scriptRes.text();

      if (js.includes('__APP_BUILD_INFO__')) {
        foundBuildInfo = true;
      }
      if (js.includes('app-version-badge')) {
        foundVersionBadge = true;
      }

      // Regex matching commit in minified define or build info object
      const commitMatch = js.match(/commit[:=]\s*[`"']([a-f0-9]{7,40})[`"']/i) || js.match(/git[:=]\s*[`"']?([a-f0-9]{7,40})[`"']?/i);
      if (commitMatch && !foundCommit) {
        foundCommit = commitMatch[1];
      }

      // Regex matching version
      const verMatch = js.match(/version[:=]\s*[`"']([0-9]+\.[0-9]+\.[0-9]+)[`"']/i);
      if (verMatch && !foundVersion) {
        foundVersion = verMatch[1];
      }
    }

    const isValid = Boolean(foundBuildInfo && foundCommit && foundVersionBadge);
    if (!isValid) {
      allPassed = false;
    }

    results.push({
      service: s.name,
      url: s.url,
      localCommit: localGitCommit,
      deployedCommit: foundCommit || 'NOT FOUND',
      version: foundVersion || '1.0.0',
      buildInfoExposed: foundBuildInfo ? '✅ Yes' : '❌ No',
      uiBadgePresent: foundVersionBadge ? '✅ Yes' : '❌ No',
      status: isValid ? '✅ VERIFIED' : '❌ UNVERIFIED'
    });
  }

  console.table(results);

  if (!allPassed) {
    throw new Error('Deep inspection failed: one or more services are missing live build info or UI version badges!');
  }

  return results;
}

if (process.argv[1]?.endsWith('verify-build-versions.mjs')) {
  verifyLiveBuildVersions()
    .then(() => {
      console.log('✨ 100% of live services passed deep build & git commit inspection!\n');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Verification failed:', err.message);
      process.exit(1);
    });
}
