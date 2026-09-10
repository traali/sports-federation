#!/usr/bin/env node
/**
 * ⚡ Sovereign Weather-Stats Monastery — Empirical Challenger Stress Runner
 * Executes the adversarial stress test suite verifying domain mathematical invariants & physical boundaries.
 */

import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..', 'weather-stats');

console.log('══════════════════════════════════════════════════════════════════════════════');
console.log('⚡ EMPIRICAL CHALLENGER: DOMAIN MATHEMATICAL INVARIANTS & PHYSICAL BOUNDARIES');
console.log('══════════════════════════════════════════════════════════════════════════════\n');

try {
  const output = execSync('npx vitest run tests/adversarialStress.test.ts', {
    cwd: projectRoot,
    encoding: 'utf-8',
    stdio: 'pipe',
  });
  console.log(output);
  console.log('══════════════════════════════════════════════════════════════════════════════');
  console.log('🏆 EMPIRICAL CHALLENGER VERDICT: CONFIRMED');
  console.log('══════════════════════════════════════════════════════════════════════════════');
  process.exit(0);
} catch (err) {
  console.error(err.stdout || err.message);
  console.log('══════════════════════════════════════════════════════════════════════════════');
  console.log('❌ EMPIRICAL CHALLENGER VERDICT: DISCONFIRMED');
  console.log('══════════════════════════════════════════════════════════════════════════════');
  process.exit(1);
}
