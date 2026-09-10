/**
 * 🏛️ MASTER FEDERATION RUNNER: Sovereign Monastic Quality Gates
 * Executes each monastery's sovereign verification check (npm run check),
 * asserting TypeScript type safety, zero-warning linting, and domain invariants.
 */
import { execSync } from 'node:child_process';
import { resolve, join } from 'node:path';

const ROOT = resolve(process.cwd());

const MONASTERIES = [
  { name: '📱 Pelipäivä', dir: 'pelipaiva', cmd: 'npm run check' },
  { name: '🅿️ ParkkiS', dir: 'Parkkis', cmd: 'npm run check' },
  { name: '⚽ Football Stats', dir: 'football-stats', cmd: 'npm run check' },
  { name: '🏑 Floorball Stats', dir: 'floorball-stats', cmd: 'npm run check' },
  { name: '🏀 Basketball Stats', dir: 'basketball-stats', cmd: 'npm run check' },
  { name: '🏐 Volleyball Stats', dir: 'volleyball-stats', cmd: 'npm run check' },
  { name: '🌦️ Weather Stats', dir: 'weather-stats', cmd: 'npm run check' },
];

console.log('\n' + '═'.repeat(78));
console.log('🏛️ MASTER FEDERATION QUALITY GATES: ALL 7 SOVEREIGN MONASTERIES');
console.log('═'.repeat(78) + '\n');


const results = [];
let allPassed = true;

for (const mon of MONASTERIES) {
  const cwd = join(ROOT, mon.dir);
  const t0 = performance.now();
  process.stdout.write(`⏳ Verifying ${mon.name} (${mon.cmd})... `);

  try {
    execSync(mon.cmd, { cwd, stdio: 'pipe' });
    const duration = Math.round(performance.now() - t0);
    console.log(`✅ PASS (${duration} ms)`);
    results.push({ Monastery: mon.name, Command: mon.cmd, Status: '✅ PASSED', 'Time (ms)': duration });
  } catch (err) {
    const duration = Math.round(performance.now() - t0);
    allPassed = false;
    console.log(`❌ FAIL (${duration} ms)`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    results.push({ Monastery: mon.name, Command: mon.cmd, Status: '❌ FAILED', 'Time (ms)': duration });
  }
}

console.log('\n' + '─'.repeat(78));
console.table(results);
console.log('─'.repeat(78) + '\n');

if (!allPassed) {
  console.error('❌ [FEDERATION] One or more sovereign monastic quality gates failed!\n');
  process.exit(1);
}

console.log('✨ [FEDERATION] All 7 sovereign monasteries verified 100% green!\n');
process.exit(0);
