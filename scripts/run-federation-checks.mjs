/**
 * MASTER FEDERATION RUNNER: Sovereign Monastic Quality Gates
 *
 * Layout (local multi-checkout, NOT a monorepo):
 *   <parent>/
 *     sports-federation/   <- this repo (cwd)
 *     pelipaiva/
 *     Parkkis/
 *     football-stats/
 *     floorball-stats/
 *     basketball-stats/
 *     volleyball-stats/
 *     weather-stats/
 *
 * Also accepts nested clones at sports-federation/<dir> if present.
 * Missing houses are SKIPPED with an advisory — they are GitHub remotes, not submodules.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

const FED_ROOT = resolve(process.cwd());
const SIBLING_ROOT = resolve(FED_ROOT, '..');

const MONASTERIES = [
  { name: 'Pelipäivä', dir: 'pelipaiva', cmd: 'npm run check' },
  { name: 'ParkkiS', dir: 'Parkkis', cmd: 'npm run check' },
  { name: 'Football Stats', dir: 'football-stats', cmd: 'npm run check' },
  { name: 'Floorball Stats', dir: 'floorball-stats', cmd: 'npm run check' },
  { name: 'Basketball Stats', dir: 'basketball-stats', cmd: 'npm run check' },
  { name: 'Volleyball Stats', dir: 'volleyball-stats', cmd: 'npm run check' },
  { name: 'Weather Stats', dir: 'weather-stats', cmd: 'npm run check' },
];

function monasteryCwd(dir) {
  const nested = join(FED_ROOT, dir);
  const sibling = join(SIBLING_ROOT, dir);
  if (existsSync(join(nested, 'package.json'))) return nested;
  if (existsSync(join(sibling, 'package.json'))) return sibling;
  return null;
}

console.log('\n' + '═'.repeat(78));
console.log('MASTER FEDERATION QUALITY GATES: ALL 7 SOVEREIGN MONASTERIES');
console.log('═'.repeat(78) + '\n');

const results = [];
let allPassed = true;
let found = 0;

for (const mon of MONASTERIES) {
  const cwd = monasteryCwd(mon.dir);
  const t0 = performance.now();
  process.stdout.write(`Verifying ${mon.name} (${mon.cmd})... `);

  if (!cwd) {
    console.log('SKIP (clone sibling next to sports-federation, or nest under it)');
    results.push({ Monastery: mon.name, Command: mon.cmd, Status: 'SKIPPED', 'Time (ms)': 0 });
    continue;
  }

  found += 1;
  try {
    execSync(mon.cmd, { cwd, stdio: 'pipe' });
    const duration = Math.round(performance.now() - t0);
    console.log(`PASS (${duration} ms)`);
    results.push({ Monastery: mon.name, Command: mon.cmd, Status: 'PASSED', 'Time (ms)': duration });
  } catch (err) {
    const duration = Math.round(performance.now() - t0);
    allPassed = false;
    console.log(`FAIL (${duration} ms)`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    results.push({ Monastery: mon.name, Command: mon.cmd, Status: 'FAILED', 'Time (ms)': duration });
  }
}

console.log('\n' + '─'.repeat(78));
console.table(results);
console.log('─'.repeat(78) + '\n');

if (found === 0) {
  console.error('[FEDERATION] No monastery checkouts found. Clone the 7 remotes as siblings of sports-federation.\n');
  process.exit(1);
}

if (!allPassed) {
  console.error('[FEDERATION] One or more sovereign monastic quality gates failed!\n');
  process.exit(1);
}

console.log(`[FEDERATION] ${found}/7 sovereign monasteries verified green (others skipped).\n`);
process.exit(0);
