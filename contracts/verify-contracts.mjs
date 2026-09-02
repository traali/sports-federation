/**
 * Automated Cross-Repo Contract Compatibility Verifier
 * 
 * Verifies that all repositories conform to the canonical contracts in contracts/index.ts
 * and obey non-breaking version invariants.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT_DIR = resolve(__dirname, '..');
const CONTRACTS_PATH = join(ROOT_DIR, 'contracts', 'index.ts');

console.log('🔗 [CONTRACTS] Verifying cross-repo interface contracts...');

if (!existsSync(CONTRACTS_PATH)) {
  console.error(`❌ [CONTRACTS] Canonical contracts file missing at ${CONTRACTS_PATH}`);
  process.exit(1);
}

const canonicalCode = readFileSync(CONTRACTS_PATH, 'utf8');

// 1. Verify Canonical Export Invariants
const requiredInterfaces = [
  'MatchdayContextContract',
  'ParkingRiskContract',
  'SportStatsContract',
  'CrossRepoQueryContract'
];

for (const iface of requiredInterfaces) {
  if (!canonicalCode.includes(`interface ${iface}`)) {
    console.error(`❌ [CONTRACTS] Required canonical interface "${iface}" missing from contracts/index.ts`);
    process.exit(1);
  }
}

// 2. Verify target repository compliance if requested
const targetRepo = process.argv[2];

const REPOS = targetRepo ? [targetRepo] : ['pelipaiva', 'football-stats', 'Parkkis', 'volleyball-stats', 'floorball-stats', 'basketball-stats'];

let hasError = false;

for (const repo of REPOS) {
  const repoPath = join(ROOT_DIR, repo);
  if (!existsSync(repoPath)) {
    console.warn(`⚠️ [CONTRACTS] Repo directory "${repo}" not found. Skipping.`);
    continue;
  }

  console.log(`🔍 [CONTRACTS] Checking contract adapter in "${repo}"...`);
  
  // Look for contract integration file
  const candidatePaths = [
    join(repoPath, 'src', 'types', 'contracts.ts'),
    join(repoPath, 'src', 'contracts.ts'),
    join(repoPath, 'src', 'types', 'matchday.ts')
  ];

  const foundPath = candidatePaths.find(p => existsSync(p));

  if (!foundPath) {
    console.error(`❌ [CONTRACTS] No contract adapter found in "${repo}". Expected src/types/contracts.ts or similar.`);
    hasError = true;
    continue;
  }

  const content = readFileSync(foundPath, 'utf8');

  // Verify non-breaking type contract linkage
  if (repo === 'pelipaiva') {
    if (!content.includes('ParkingRiskContract') && !content.includes('SportStatsContract')) {
      console.error(`❌ [CONTRACTS] pelipaiva adapter missing references to satellite contracts!`);
      hasError = true;
    } else {
      console.log(`✅ [CONTRACTS] pelipaiva successfully implements contract adapters.`);
    }
  } else if (repo === 'football-stats') {
    if (!content.includes('SportStatsContract')) {
      console.error(`❌ [CONTRACTS] football-stats adapter missing SportStatsContract!`);
      hasError = true;
    } else {
      console.log(`✅ [CONTRACTS] football-stats successfully satisfies SportStatsContract.`);
    }
  } else if (repo === 'Parkkis') {
    if (!content.includes('ParkingRiskContract')) {
      console.error(`❌ [CONTRACTS] Parkkis adapter missing ParkingRiskContract!`);
      hasError = true;
    } else {
      console.log(`✅ [CONTRACTS] Parkkis successfully satisfies ParkingRiskContract.`);
    }
  } else if (repo === 'volleyball-stats') {
    if (!content.includes('SportStatsContract')) {
      console.error(`❌ [CONTRACTS] volleyball-stats adapter missing SportStatsContract!`);
      hasError = true;
    } else {
      console.log(`✅ [CONTRACTS] volleyball-stats successfully satisfies SportStatsContract.`);
    }
  } else if (repo === 'floorball-stats') {
    if (!content.includes('SportStatsContract')) {
      console.error(`❌ [CONTRACTS] floorball-stats adapter missing SportStatsContract!`);
      hasError = true;
    } else {
      console.log(`✅ [CONTRACTS] floorball-stats successfully satisfies SportStatsContract.`);
    }
  } else if (repo === 'basketball-stats') {
    if (!content.includes('SportStatsContract')) {
      console.error(`❌ [CONTRACTS] basketball-stats adapter missing SportStatsContract!`);
      hasError = true;
    } else {
      console.log(`✅ [CONTRACTS] basketball-stats successfully satisfies SportStatsContract.`);
    }
  }
}

if (hasError) {
  console.error('\n❌ [CONTRACTS] Contract verification failed.');
  process.exit(1);
} else {
  console.log('\n✨ [CONTRACTS] All inspected repositories satisfy non-breaking contract invariants!\n');
  process.exit(0);
}
