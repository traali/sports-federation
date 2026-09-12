# Understand Anything — federation graphs

We use the [Egonex Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) graph schema (MIT) so any UA dashboard, Claude Code plugin, or `jq` query works on every monastery.

Each house vendors `scripts/understand.mjs` and commits `.ua/`:

| File | Role |
|---|---|
| `.ua/knowledge-graph.json` | Files, exports, imports, CI, contracts (structural) |
| `.ua/domain-graph.json` | Matchday / TASO cache / visitation + peer `depends_on` |
| `.ua/meta.json` | Node/edge counts + commit |
| `.ua/intermediate/` | gitignored |

```bash
npm run understand          # refresh this house
jq '.nodes[] | select(.type=="endpoint")' .ua/knowledge-graph.json
```

Open with UA: `/understand-dashboard` in a clone that already has `.ua/` (no LLM needed for viewing).

Regenerate after a visitation that changes public surface (contracts, TASO cache, pages). The graph is deterministic — same tree, same edges.
