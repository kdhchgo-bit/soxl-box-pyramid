# SOXL box pyramid

Private skill for managing a six-box SOXL perpetual ladder on BingX.

- Six boxes, equal coin quantity per box
- 7% spacing between box tops
- Four limit orders inside each box, stepped 0.5% apart
- Size weights inside a box, top to bottom: 10% / 20% / 30% / 40%
- The first box top tracks the 0.618 retracement of a fixed low and a high that only ratchets up
- Unfilled buys are replaced when a new high lifts that top
- After boxes 2, 3, and 4 fill, one reduce-only sell fires at the average: 50%, then 35%, then 15% of the holding at that moment. No further trims.

`SKILL.md` is the operating procedure. `scripts/ladder.mjs` prints the 24 prices and quantities from a high, a low, and a per-box quantity.

This repository is private because the skill records live order levels.
