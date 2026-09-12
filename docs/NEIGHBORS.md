# Chapter of Neighbors

Every monastery runs `node scripts/check-neighbors.mjs` as part of `npm run visit`.

It answers three questions before a change can ship:

1. **In line** — local `contracts` adapter still has every **required** field of the interfaces this house provides. Canonical freeze: `sports-federation/contracts/index.ts`. Removing a field is a major-version treaty break (Legate).
2. **Working** — each `needs[]` neighbor still has `AGENTS.md` on GitHub, still publishes its provided interfaces, and its live Pages URL responds. TASO origin is probed; Cloudflare 403 cache is recovered with `_cb` (see `docs/TASO_PROXY.md`).
3. **Plans & rules** — `AGENTS.md` stays under 1,500 words and still says `visit` + `contract`. Plan files matching `*PLAN*` / `*SPEC*` must contain the 5-point spec from `docs/plans/TEST_PLAN_STANDARD.md` (User Journey / When it succeeds / When it should fail). Old architecture reviews are ignored.

## Graph

`contracts/neighbors.json` is the single graph. Houses vendor a copy as `federation.neighbors.json`. Adding a monastery = one row there + a `src/types/contracts.ts` adapter.

## Severity

| Result | Meaning | Who |
|---|---|---|
| Blocking | Contract field dropped, AGENTS.md gone, neighbor repo 404 | the house that broke it |
| Advisory | Prod HTTP, TASO cache, SHA lag, plan without 5-point | Cellarer / Sacrist — do not fail the author's commit |

Future changes that delete a provided interface or a required field fail visitation on that house **and** on every neighbor that `needs` it.
