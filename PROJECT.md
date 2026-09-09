# Project: Sovereign Monastic Verification Suites & Deterministic Hooks

## Architecture
The Finnish Youth Sports Federation multi-repository ecosystem comprises an umbrella governance repository (`sports-federation` at `c:\compdev`) and 6 sovereign monasteries, each being an autonomous git repository:
1. **Pelipäivä** (`pelipaiva`): Core Matchday Hub PWA
2. **ParkkiS** (`Parkkis`): Spatial Parking Intelligence & Navigation
3. **Football Stats** (`football-stats`): Palloliitto (SPL)
4. **Floorball Stats** (`floorball-stats`): Salibandyliitto (SSBL)
5. **Basketball Stats** (`basketball-stats`): Basket.fi Koripallo
6. **Volleyball Stats** (`volleyball-stats`): Lentopalloliitto

### Monastic Quality Gate Architecture
Each monastery owns a fully autonomous quality gate (`npm test` and `npm run check`) requiring:
- 100% deterministic local execution without network calls or external API tokens.
- Zero cross-monastery path dependencies (e.g. eliminating `../contracts` dependencies from monastery test scripts).
- Strict TypeScript compile-time verification (`tsc --noEmit` or `tsc -b --noEmit`).
- Zero-warning linter enforcement (`--max-warnings=0` on ESLint / Biome).
- In-memory domain-specific invariant suites verifying mathematical, scheduling, and protocol invariants.

### Prevention & Hook Architecture
- Universal Lefthook configuration installed across all 7 repositories (root + 6 monasteries).
- Pre-commit (< 2s): Anti-slop token scanner (`[object Object]`, `[PVM]`, `[SYÖTÄ TULOS]`, `undefined`, `null`, `NaN` with Finnish/Swedish word-boundary whitelist like `annulloitu`), secret scanner, and fast staged linter/typecheck.
- Commit-msg (< 50ms): Conventional Commits regex validation.
- Pre-push (< 5s): Sovereign quality gate (`npm run check`) and contract validation.

### Master Federation Pipeline
Root `npm test` orchestrates:
1. Monastic sovereign quality gates across all 6 monasteries (`scripts/run-federation-checks.mjs`).
2. Canonical contract verification (`contracts/verify-contracts.mjs`).
3. Supreme golden test suite (`scripts/supreme-golden-test.mjs`).
4. Production golden test suite (`scripts/webmcp-prod-golden-test.mjs`).
5. Real-user golden test suite (`scripts/real-user-golden-test.mjs`).

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Pelipäivä Sovereign Quality Gate | Equip `pelipaiva` with `"check": "npm run lint && npm run check:types && npm test"`, `"check:types": "tsc -b"`, 515 Vitest tests, and zero-warning ESLint | M1 | R1, Survey Exp 1 |
| 2 | ParkkiS Sovereign Quality Gate & Biome Config | Add `Parkkis/tests/domain-invariants.test.mjs` (`node --test`), non-mutating `npm run check`, typecheck (`tsc -b web/tsconfig.json`), and resolve Biome lint errors/warnings | M1 | R1, Survey Exp 1 & 3 |
| 3 | Football Stats Sovereign Quality Gate & Lint Remediation | Add `football-stats/src/domain/footballInvariants.test.ts`, resolve ESLint errors (`@typescript-eslint/no-explicit-any` & route export), configure `"check"` | M1 | R1, Survey Exp 2 & 3 |
| 4 | Floorball Stats Sovereign Quality Gate | Add `floorball-stats/tests/floorballInvariants.test.mjs`, wire `"test"` (`node --test`) and `"check"`, verify tsc and zero-warning ESLint | M1 | R1, Survey Exp 2 |
| 5 | Basketball Stats Sovereign Quality Gate | Add `basketball-stats/tests/basketInvariants.test.mjs`, wire `"test"` (`node --test`) and `"check"`, verify `tsc -b --noEmit` and zero-warning ESLint | M1 | R1, Survey Exp 2 |
| 6 | Volleyball Stats Sovereign Quality Gate | Add `volleyball-stats/src/domain/volleyballInvariants.test.ts` (Vitest), wire `"check"`, verify tsc and zero-warning ESLint | M1 | R1, Survey Exp 2 |
| 7 | Pelipäivä Domain Invariant Test Suite | Assert family conflict engine bounds (overlap/tight transit), arrival time math (warmup/volunteer offsets), Dexie v2 schema, and DST boundary stability | M1 | R3, Survey Exp 1 |
| 8 | ParkkiS Domain Invariant Test Suite | Assert spatial coordinate sanity (Helsinki bbox, sports presets), Tieliikennelaki § 40 arrival disc rounding (14:05->14:30, 14:35->15:00), MapLibre layers, and DuckDB-WASM query safety | M1 | R3, Survey Exp 1 |
| 9 | Football Stats Domain Invariant Test Suite | Assert Palloliitto 3-1-0 standings math, halves progression (`fs >= hts`), substitution event structure (`code: "vaihto"`), and WhatsApp briefing token safety | M1 | R3, Survey Exp 2 |
| 10 | Floorball Stats Domain Invariant Test Suite | Assert SSBL 3-period math, F-liiga 3-2-1-0 points, overtime/shootout taxonomy, forfeit 5-0, goalie save % zero-shot division guard (MATH-04), and WhatsApp token safety | M1 | R3, Survey Exp 2 |
| 11 | Basketball Stats Domain Invariant Test Suite | Assert 4-quarter scoring sums, play-by-play scoring grammar (1p/2p/3p), team foul bonus thresholds (>= 5 fouls), zero-draw invariant, and WhatsApp token safety | M1 | R3, Survey Exp 2 |
| 12 | Volleyball Stats Domain Invariant Test Suite | Assert 25-point regular / 15-point tiebreak thresholds, 2-point margin deuces, Lentopalloliitto 3-1 / 3-2 standings point rules, and WhatsApp token safety | M1 | R3, Survey Exp 2 |
| 13 | Fast Pre-Commit / Commit-Msg Git Guard | Implement zero-dependency `scripts/git-guard.mjs` checking template token leaks (with `annulloitu` word boundary whitelist), secret leaks, and Conventional Commits in < 50ms | M1 | R2, Survey Exp 1, 2, 3 |
| 14 | Standardized Lefthook Configurations Across Repos | Deploy standardized `lefthook.yml` in root and all 6 monasteries with ultra-fast pre-commit and pre-push hooks (< 5s) | M1 | R2, Survey Exp 1, 2, 3 |
| 15 | Universal Hook Installer Script | Implement `scripts/install-all-hooks.mjs` installing active hooks across all 7 repositories | M1 | R2, Survey Exp 3 |
| 16 | Master Federation Pipeline Orchestrator | Implement `scripts/run-federation-checks.mjs` and wire into root `package.json` `test` script, executing all 6 monastery checks before golden tests | M1 | Acceptance Criteria, Survey Exp 3 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Sovereign Monastic Quality Gates, Invariant Suites, Hooks & Master Pipeline | Implement Features 1–16 across all 6 monasteries and root, install hooks, verify zero regressions | Survey complete | DONE |

---

## Interface Contracts
### Monastic Quality Gate Protocol
- `npm test`: Runs sovereign automated tests (exit code 0).
- `npm run check`: Composite deterministic check (`typecheck` + `lint` with 0 warnings + `test`).
- Zero cross-monastery path dependencies: no `../contracts` or peer monastery paths in `package.json`.

### Pre-Commit Prevention Hook Protocol
- `node scripts/git-guard.mjs tokens {staged_files}`: Exits code 1 if unrendered template placeholders exist.
- `node scripts/git-guard.mjs secrets {staged_files}`: Exits code 1 if credentials or `.env` files are staged.
- `node scripts/git-guard.mjs commit-msg <file>`: Exits code 1 if commit message does not conform to Conventional Commits.

### Master Federation Pipeline Protocol
- Command: `node scripts/run-federation-checks.mjs`
- Exit Code: 0 if all 6 monasteries pass their local quality gate; 1 if any fails.
- Integrated into root `package.json`: `"test": "npm run test:monasteries && npm run test:contracts && npm run test:golden && npm run test:prod && npm run test:real-user"`.

---

## Code Layout
- `scripts/git-guard.mjs` (Exclusive write ownership: Worker M1)
- `scripts/install-all-hooks.mjs` (Exclusive write ownership: Worker M1)
- `scripts/run-federation-checks.mjs` (Exclusive write ownership: Worker M1)
- `package.json` (Exclusive write ownership: Worker M1)
- `lefthook.yml` (Exclusive write ownership: Worker M1)
- `pelipaiva/package.json`, `pelipaiva/lefthook.yml`, `pelipaiva/scripts/` (Exclusive write ownership: Worker M1)
- `Parkkis/package.json`, `Parkkis/biome.json`, `Parkkis/lefthook.yml`, `Parkkis/tests/` (Exclusive write ownership: Worker M1)
- `Parkkis/web/src/components/ReservationsDrawer.tsx` (Exclusive write ownership: Worker M1)
- `football-stats/package.json`, `football-stats/eslint.config.js`, `football-stats/lefthook.yml`, `football-stats/src/domain/` (Exclusive write ownership: Worker M1)
- `football-stats/src/mcp-app.ts` (Exclusive write ownership: Worker M1)
- `floorball-stats/package.json`, `floorball-stats/lefthook.yml`, `floorball-stats/tests/` (Exclusive write ownership: Worker M1)
- `basketball-stats/package.json`, `basketball-stats/lefthook.yml`, `basketball-stats/tests/` (Exclusive write ownership: Worker M1)
- `volleyball-stats/package.json`, `volleyball-stats/lefthook.yml`, `volleyball-stats/src/domain/` (Exclusive write ownership: Worker M1)
- Application runtime logic in `pelipaiva/src`, `Parkkis/web/src` (except a11y button fix), `football-stats/src` (except type annotations), `floorball-stats/src`, `basketball-stats/src`, `volleyball-stats/src`: **READ ONLY**
