 // box-pyramid ladder - generic isolated limit-grid engine.
 // SOXL values are one example config (see configs/soxl.json), not hardcoded for one bot.
 // Pure node, no model-specific calls: works from any agent host or a cron watcher.
 const fs = await import("node:fs");
 function parseArgs(argv) {
   const out = {};
   for (let i = 2; i < argv.length; i++) {
     const a = argv[i];
     if (a.startsWith("--")) {
       const eq = a.indexOf("=");
       if (eq > -1) out[a.slice(2, eq)] = a.slice(eq + 1);
       else { out[a.slice(2)] = argv[i + 1]; i++; }
     } else if (out._pos === undefined) out._pos = [a];
     else out._pos.push(a);
   }
   return out;
 }
 let cfg = {};
 const args = parseArgs(process.argv);
 if (args.config) {
   cfg = JSON.parse(fs.readFileSync(args.config, "utf8"));
 }
 const pick = (k, fb) => (args[k] !== undefined ? args[k] : (cfg[k] !== undefined ? String(cfg[k]) : fb));
 if (args._pos && args._pos.length && args.high === undefined) {
   const pPos = args._pos;
   if (pPos[0] !== undefined) args.high = pPos[0];
   if (pPos[1] !== undefined) args.low = pPos[1];
   if (pPos[2] !== undefined) args.boxQty = pPos[2];
 }
 const symbol = pick("symbol", cfg.symbol || "SOXL");
 const exchange = pick("exchange", cfg.exchange || "bingx");
 const high = Number(pick("high", undefined));
 const low = Number(pick("low", cfg.low !== undefined ? cfg.low : 41.37));
 const fib = Number(pick("fib", cfg.fib !== undefined ? cfg.fib : 0.66));
 const boxes = Number(pick("boxes", cfg.boxes !== undefined ? cfg.boxes : 5));
 const gap = Number(pick("gap", cfg.gap !== undefined ? cfg.gap : 0.055));
 const boxQty = Number(pick("boxQty", cfg.boxQty !== undefined ? cfg.boxQty : 51.2104));
 const leverage = Number(pick("leverage", cfg.leverage !== undefined ? cfg.leverage : 7));
 const stepsRaw = pick("steps", cfg.steps || "0,0.34,0.68,1.02");
 const weightsRaw = pick("weights", cfg.weights || "1:2:3:4");
 if (!Number.isFinite(high) || !Number.isFinite(low) || high <= low) {
   console.error("usage: node ladder.mjs --symbol SOXL --exchange bingx --high <high> --low <low> [--fib 0.66] [--boxes 5] [--gap 0.055] [--steps 0,0.34,0.68,1.02] [--weights 1:2:3:4] [--boxQty 51.2104] [--leverage 7] [--config configs/soxl.json]");
   console.error("   legacy: node ladder.mjs <high> [low=41.37] [boxQty=51.2104]");
   process.exit(1);
 }
 const stepsPct = String(stepsRaw).split(",").map(Number);
 const weightParts = String(weightsRaw).split(":").map(Number);
 if (stepsPct.some((v) => !Number.isFinite(v)) || weightParts.some((v) => !Number.isFinite(v) || v <= 0) || stepsPct.length !== weightParts.length) {
   console.error("steps and weights must have the same length, e.g. --steps 0,0.34,0.68,1.02 --weights 1:2:3:4");
   process.exit(1);
 }
 const wSum = weightParts.reduce((a, b) => a + b, 0);
 const weights = weightParts.map((w) => w / wSum);
 const steps = stepsPct.map((p) => p / 100);
 const round2 = (n) => Math.round(n * 100) / 100;
 const round4 = (n) => Math.round(n * 10000) / 10000;
 const top0 = round2(high - fib * (high - low));
 const tops = [top0];
 for (let i = 1; i < boxes; i++) tops.push(round2(tops[i - 1] * (1 - gap)));
 const slices = weights.slice(0, -1).map((w) => Math.floor(boxQty * w * 10000) / 10000);
 slices.push(round4(boxQty - slices.reduce((a, b) => a + b, 0)));
 const boxesOut = tops.map((top, box) => ({
   box: box + 1,
   top,
   orders: steps.map((step, k) => {
     const price = round2(top * (1 - step));
     const qty = slices[k];
     return { k, dropPct: round4(step * 100), weightPct: round4(weights[k] * 100), price, qty, value: round2(qty * price) };
   })
 }));
 console.log(JSON.stringify({ symbol, exchange, high, low, fib, boxCount: boxes, gapPct: round4(gap * 100), innerStepsPct: stepsPct, weightsPct: weightParts, boxQty, leverage, slices, boxes: boxesOut }, null, 2));

