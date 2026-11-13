const high = Number(process.argv[2]);
const low = Number(process.argv[3] ?? 41.37);
const boxQty = Number(process.argv[4] ?? 42.6753);
const ratio = Number(process.argv[5] ?? 0.66);
if (!Number.isFinite(high) || !Number.isFinite(low) || high <= low) {
  console.error('usage: node ladder.mjs <high> [low=41.37] [boxQty=42.6753] [ratio=0.66]');
  process.exit(1);
}

const round2 = (n) => Math.round(n * 100) / 100;
const round4 = (n) => Math.round(n * 10000) / 10000;
const weights = [0.1, 0.2, 0.3, 0.4];
const steps = [0, 0.005, 0.01, 0.015];
const top0 = round2(high - ratio * (high - low));
const tops = [top0];
for (let i = 1; i < 6; i++) tops.push(round2(tops[i - 1] * 0.93));

const slices = [0.1, 0.2, 0.3].map((w) => Math.floor(boxQty * w * 10000) / 10000);
slices.push(round4(boxQty - slices[0] - slices[1] - slices[2]));

const boxes = tops.map((top, box) => ({
  box: box + 1,
  top,
  orders: steps.map((step, k) => {
    const price = round2(top * (1 - step));
    const qty = slices[k];
    return {
      k,
      dropPct: step * 100,
      weightPct: weights[k] * 100,
      price,
      qty,
      value: round2(qty * price)
    };
  })
}));

console.log(JSON.stringify({
  high, low, boxQty, ratio,
  weightsPct: [10, 20, 30, 40],
  boxGapPct: 7,
  innerStepPct: 0.5,
  slices,
  boxes
}, null, 2));
