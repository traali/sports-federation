import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const ROOT = resolve(process.cwd());
const LEFTHOOK_BIN = join(ROOT, 'pelipaiva', 'node_modules', 'lefthook-windows-x64', 'bin', 'lefthook.exe');

if (!existsSync(LEFTHOOK_BIN)) {
  console.error(`❌ [HOOKS] Lefthook binary not found at: ${LEFTHOOK_BIN}`);
  process.exit(1);
}

const REPOS = [
  ROOT,
  join(ROOT, 'pelipaiva'),
  join(ROOT, 'Parkkis'),
  join(ROOT, 'football-stats'),
  join(ROOT, 'floorball-stats'),
  join(ROOT, 'basketball-stats'),
  join(ROOT, 'volleyball-stats')
];

console.log('🔗 [HOOKS] Installing Lefthook git hooks across all 7 repositories...\n');

let failed = 0;
for (const repo of REPOS) {
  const repoName = repo === ROOT ? 'sports-federation (root)' : repo.split(/[\\/]/).pop();
  try {
    const output = execSync(`"${LEFTHOOK_BIN}" install -f`, { cwd: repo, stdio: 'pipe' }).toString();
    console.log(`✅ [HOOKS] Installed hooks in: ${repoName}`);
  } catch (err) {
    console.error(`❌ [HOOKS] Failed installing hooks in ${repoName}:`, err.message);
    failed++;
  }
}

if (failed > 0) {
  console.error(`\n⚠️ [HOOKS] ${failed} repository hook installations failed.`);
  process.exit(1);
}

console.log('\n✨ [HOOKS] All 7 repositories successfully equipped with active Lefthook pre-commit and pre-push hooks!\n');
