# box-pyramid

Generic isolated limit-grid engine. No symbol is hardcoded. SOXL on BingX is one example preset, not the engine itself.

- N boxes, equal coin quantity per box (`total / N`)
- Box-top spacing G (e.g. 7%): `top[i+1] = top[i] * (1 - G)`
- K limit rungs inside each box, stepped S apart (e.g. 4 rungs at 0, 0.5, 1.0, 1.5%)
- Size weights inside a box, top to bottom (e.g. 10 / 20 / 30 / 40)
- Box-1 top from an anchor: `round(high - fib * (high - low), 2)`. High ratchets up only
- Unfilled buys are rebuilt when a new high lifts box-1 top by the gate (e.g. 0.02)
- After boxes 2, 3, and 4 fill, one reduce-only sell each at the average: 50%, then 35%, then 15% of the holding at that moment. No further trims

## Quickstart

```sh
node scripts/ladder.mjs --symbol SOXL --exchange bingx --high 69.78 --low 41.37 --fib 0.786 --boxes 6 --gap 0.07 --steps 0,0.5,1,1.5 --weights 1:2:3:4 --boxQty 42.6753 --leverage 7
node scripts/ladder.mjs --config configs/soxl.json --high 69.78
node scripts/ladder.mjs 69.78 41.37 42.6753
```

## Configs

- `configs/soxl.json`: SOXL example preset on BingX (fib 0.786, 6 boxes, 7% gap, 4 rungs, 1:2:3:4, isolated 7x)
- Add `configs/<symbol>.json` for each new market. Keep live highs and order state out of git

## Scripts

- `scripts/ladder.mjs`: single source of truth for prices and sizes. Never hand-compute levels
- Quantity rule: floor every slice but the last, remainder on the last rung (matches the exchange floor)

## Exchange adapter notes (BingX default)

- Isolated margin only. Cancel-all only when position is zero and the top moved up; with a position, cancel only this grid's open longs row by row
- Kline `data` is a descending object array, `data[0]` is latest. Retry once on `code 100410`
- Order inputs are price first, amount second. A resting buy counts when open-order count rises by one
- Closing orders are reduce-only limit orders at the average, one per round, never pre-placed

## Private repo notice

Keep this repository private. Presets and logs can expose live order levels.
