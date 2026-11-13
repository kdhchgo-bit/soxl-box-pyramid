---
name: "soxl-box-pyramid"
description: "Isolated box-pyramid limit grid engine. N boxes, G spacing, S-step rungs, W weights, anchor high/low/fib, one reduce-only trim per round. SOXL 6-box preset included as example. Use for any grid, high tracking, or break-even trim."
---

# Box pyramid (generic)

Prices are never hand-computed. Use `scripts/ladder.mjs` only.

## Parameters

- `symbol`, `exchange` (e.g. SOXL, bingx)
- `boxes N`: box count. Each box holds `total / N` coins
- `gap G`: box-top spacing. `top[i+1] = top[i] * (1 - G)`
- `steps S`: rung drops inside a box (e.g. 0, 0.5, 1, 1.5%)
- `weights W`: rung sizes top to bottom (e.g. 1:2:3:4). Never fill the whole G band with S steps
- `anchor`: `box1top = round(high - fib * (high - low), 2)`. `low` fixed, `high` ratchets up only
- `boxQty`: coins per box. Splits Max Long while unfilled only
- `leverage L`: isolated, never lowered to buy room
- `state`: per-symbol state file (e.g. one file per market), not one global path

```sh
node scripts/ladder.mjs --config configs/soxl.json --high <high>
node scripts/ladder.mjs --symbol TQQQ --exchange bingx --high 85.2 --low 52.1 --fib 0.618 --boxes 5 --gap 0.07 --steps 0,0.5,1,1.5 --weights 1:2:3:4 --boxQty 30 --leverage 5
```

## Tracking (any market)

Read the 1-minute high and the page 24h high. If above the stored high, ratchet the anchor up. Judge prices from kline high/close only, never the tab title or mark.

If the new box-1 top is at least 0.02 above the resting top, cancel all unfilled buys and rebuild with the same weights. Never move filled quantity. If equal or lower, touch nothing. Only place rungs at least 0.05 below the current price.

With no position and a higher top: Cancel All, confirm the dialog, verify open count is 0, then rebuild. With a position: never Cancel All. Cancel only this grid's open longs row by row.

## Break-even trims (any market)

Sells are reduce-only limit orders at the average of that moment. Denominator is the holding at that moment. One per round, earliest rounds first. Never pre-place. No position means no sell.

1. After boxes 1 and 2 fill and price is at or above the average, sell 50% once.
2. After that 50% and box 3 fills and price is at or above the new average, sell 35% of the holding once.
3. After that 35% and box 4 fills and price is at or above the new average, sell 15% of the holding once.
4. Then stop. No further sells even if boxes 5 and 6 fill.

Never sell on box 1 alone. All three at holding basis leaves about 27.6% of the pre-first-trim quantity.

## Orders and log

Exchange specifics (BingX preset): tab `https://bingx.com/en/tradfi/perpetual/SOXL-USDT`, kline symbol per market (SOXL: `NCSKSOXL2USD-USDT`, descending object `data[0]` latest, retry once on code 100410), inputs price then amount, USDT amount is qty * price to 2 decimals, Open Long, no confirm dialog, success is open count +1. Closes are Close tab, Limit, by-coin, Close Long, must be Reduce Only.

Log one line per round plus the header together. If the header guard fails, report instead of overwriting. On rebuilds or trims record old top, new top, tops, current price, filled boxes, and trim ratio.

## Appendix: SOXL preset (example, not the rule)

- N=6, G=7%, S=0.5% x 4 rungs, W=1:2:3:4, L=isolated 7x
- anchor low=41.37 fixed, fib=0.66 (0.786 retired 2026-11-14 00:01, 0.618 retired 2026-11-12), high ratchets up only
- state file `memory/routines/soxl-fib-grid/STATE.md`, watcher `routines/Xpr2GmIoOxgkWlVb`
- This section is an example. Rules above win on any conflict.
