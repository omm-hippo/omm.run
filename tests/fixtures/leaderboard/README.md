# Arena leaderboard test fixtures

Synthetic data for tests and `npm run dev` previews only. **The numbers are
invented** — never show them as real (DIRECTION.md §5.10).

- `ranked.json` / `collecting.json`: produced by omm's real aggregator
  (`scripts/aggregate_arena_votes.py --quality-gate`) from `make_votes.py`
  output (1800 and 40 synthetic votes).
- `*.manifest.json`: signed by `scripts/sign_catalog.py` with a throwaway key
  whose public half is `test-public-key.txt`. It is not the production
  catalog key.
