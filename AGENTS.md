# AGENTS.md — Rule of the Sports Federation (kattorepo)

Supreme rule for `traali/sports-federation`. Word cap: 1,500.

## §0 Identity
This is the **kattorepo**, not an app. It owns canonical contracts, the neighbor graph, the Supreme Golden Test, and the gap ledger. Apps live in sovereign houses (`pelipaiva`, `*-stats`, `Parkkis`, `weather-stats`).

## §1 Do not
- Put house UI/API fixes here. File the issue in that monastery (`docs/ISSUE_DIVISION.md` canon).
- Remove or rename required fields of a v1 contract. Widen with optional fields only.
- Skip `npm run visit` / `npm run test:neighbors` after changing `contracts/` or `contracts/neighbors.json`.

## §2 Must
- `contracts/index.ts` is the treaty. Houses copy adapters; they must keep every **required** field of the interfaces they provide.
- `contracts/neighbors.json` is the dependency graph. Adding a house = one row + an adapter + a live URL.
- `scripts/check-neighbors.mjs` (`npm run test:neighbors`) verifies peers are in line, working, and that 5-point plans still exist. Hooked from each house `npm run visit` so **future changes fail closed**.
- `docs/plans/TEST_PLAN_STANDARD.md` is the 5-point spec every `HOUSE_TEST_SPEC.md` follows.

## §3 Offices
Abbas Primas (congregation), Legate (treaty), Cellarer (Cloudflare tokens — never in this repo).

## Neighbor check
`node scripts/check-neighbors.mjs --all` probes every house AGENTS.md, contract adapter, live Pages URL, and TASO origin. Blocking = contract/rule break. Advisory = prod/token lag.
