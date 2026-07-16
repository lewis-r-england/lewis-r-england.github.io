/* data.jsx — picker seed data, palette by last digit, weight/value/rate helpers */

// Saturated palette keyed by last digit of badge id.
const DIGIT_COLORS = {
  0: "#0f9d8f", // teal
  1: "#5b86c9", // periwinkle
  2: "#e5821e", // orange
  3: "#94a0a8", // slate
  4: "#f0c419", // yellow  (dark text)
  5: "#16a6e8", // sky
  6: "#5ba85b", // green
  7: "#8e44ad", // purple
  8: "#12305e", // navy
  9: "#ed1c24", // red
};
const DARK_TEXT_DIGITS = new Set([4]); // yellow needs dark text

function colorFor(badge) {
  return DIGIT_COLORS[Number(String(badge).slice(-1))];
}
function isDarkText(badge) {
  return DARK_TEXT_DIGITS.has(Number(String(badge).slice(-1)));
}

// Concrete pastel (32% colour + 68% white) so background-color transitions
// can actually interpolate (color-mix() endpoints don't animate in some engines).
function pastelFor(badge) {
  const hex = colorFor(badge).replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const mix = (c) => Math.round(c * 0.32 + 255 * 0.68);
  return `rgb(${mix(r)},${mix(g)},${mix(b)})`;
}

/* ---- crop / commercial constants ---- */
const PACKSIZES = [
  { id: "c1-250", label: "Class 1 — 250g", short: "Cl I", cls: "Class 1", grams: 250 },
  { id: "c2-240", label: "Class 2 — 240g", short: "Cl II", cls: "Class 2", grams: 240 },
];
const PACKS_PER_TRAY = 8;     // packs (punnets) per tray
const PRICE_PER_KG = 32;      // £ crop value / kg  → drives "value / hour"
const PIECE_RATE_PER_KG = 2.4;// £ picker piece-rate / kg → drives min-wage check
const TRAYS_PER_HOUR_TGT = 0.24;
const MIN_WAGE = 12.21;       // £/hr national living wage

function gramsFor(short) {
  const ps = PACKSIZES.find((p) => p.short === short);
  return ps ? ps.grams : 250;
}
// kg for one record given current packs-per-tray
function recordKg(r, packsPerTray) {
  const packs = r.trays * (packsPerTray || PACKS_PER_TRAY) + r.punnets;
  return (packs * gramsFor(r.type)) / 1000;
}

// minutes-ago -> seed timestamps relative to load
function minsAgo(m) { return Date.now() - m * 60000; }

// hh:mm for a timestamp
function clockOf(ts) {
  const d = new Date(ts);
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

const BADGES = [
  5528, 5542, 5629, 5636, 5641,
  5643, 5644, 5645, 5646, 5647,
  5648, 5649, 5651, 5652, 5653,
];

const NAMES = {
  5528: "Maria P.",   5542: "Andrei C.",  5629: "Sofia R.",  5636: "Janusz K.",
  5641: "Elena V.",   5643: "Petru M.",   5644: "Ana D.",    5645: "Ivan S.",
  5646: "Lucia B.",   5647: "Marek W.",   5648: "Dragos I.", 5649: "Kasia N.",
  5651: "Tomas L.",   5652: "Irina G.",   5653: "Bogdan T.",
};

// training: "none" | "ongoing" | "done"
const TRAINING = {
  5528: "done",    5542: "ongoing", 5629: "done",  5636: "none",
  5641: "done",    5643: "ongoing", 5644: "done",  5645: "done",
  5646: "none",    5647: "ongoing", 5648: "done",  5649: "done",
  5651: "ongoing", 5652: "done",    5653: "none",
};
// clock-in time (HH:MM). Pickers absent from this map are treated as on time.
const CLOCK_IN = {
  5636: "07:05", 5646: "06:58", 5653: "07:34",
};
function nameFor(badge) { return NAMES[badge] || ("Picker " + badge); }
function trainingFor(badge) { return TRAINING[badge] || "none"; }
function clockInFor(badge) { return CLOCK_IN[badge] || null; }

// minutes from a -> b given two "HH:MM" strings (positive if b is later)
function minsBetweenHHMM(a, b) {
  if (!a || !b) return 0;
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  return (bh * 60 + bm) - (ah * 60 + am);
}

// training status colour — matches the cap StatusBadge backgrounds
function trainingColor(status) {
  return status === "done" ? "#2f9e44" : status === "ongoing" ? "#eab308" : "#ed1c24";
}

// build a believable record history for one picker
function seedRecords(badge, lastMins) {
  const n = 2 + (badge % 4); // 2..5 records
  const recs = [];
  let t = lastMins + n * 15;
  for (let i = 0; i < n; i++) {
    const ps = PACKSIZES[(badge + i) % PACKSIZES.length];
    const trays = [3, 4, 5, 5, 6][(badge + i) % 5];
    const punnets = i === n - 1 && badge % 2 === 0 ? [4, 5, 8][badge % 3] : 0;
    recs.push({
      id: badge + "-" + i,
      ts: minsAgo(t),
      type: ps.short,
      trays,
      punnets,
    });
    t -= 15;
  }
  // newest last in time order -> show as entered (oldest first like the sketch)
  return recs.reverse();
}

function buildPickers() {
  return BADGES.map((badge, i) => {
    const lastMins = [5, 5, 5, 8, 12, 5, 9, 5, 14, 7, 5, 11, 6, 5, 18][i];
    return {
      badge,
      name: nameFor(badge),
      training: trainingFor(badge),
      clockIn: clockInFor(badge),
      lastAddedTs: minsAgo(lastMins),
      records: seedRecords(badge, lastMins),
    };
  });
}

function relMinutes(ts, now) {
  const m = Math.max(0, Math.round((now - ts) / 60000));
  return m;
}
function lastAddedLabel(ts, now) {
  const m = relMinutes(ts, now);
  if (m < 1) return "just now";
  if (m < 60) return m + " min";
  const h = Math.floor(m / 60);
  return h + "h " + (m % 60) + "m";
}

function amountLabel(r) {
  if (r.waste) return r.kg + " kg waste";
  const parts = [];
  if (r.trays) parts.push(r.trays + (r.trays === 1 ? " Tray" : " Trays"));
  if (r.punnets) parts.push(r.punnets + (r.punnets === 1 ? " Punnet" : " Punnets"));
  return parts.join(", ") || "—";
}

/* ===== Field-level totals split by class (+ rubbish + avg pay) ===== */
function computeFieldTotals(pickers, stats, packsPerTray) {
  let c1Kg = 0, c2Kg = 0, c1Trays = 0, c2Trays = 0, c1Pun = 0, c2Pun = 0, wasteKg = 0;
  pickers.forEach((p) => {
    p.records.forEach((r) => {
      if (r.waste) { wasteKg += r.kg || 0; return; }
      const kg = recordKg(r, packsPerTray);
      if (r.type === "Cl I") { c1Kg += kg; c1Trays += r.trays || 0; c1Pun += r.punnets || 0; }
      else { c2Kg += kg; c2Trays += r.trays || 0; c2Pun += r.punnets || 0; }
    });
  });
  const active = pickers.filter((p) => stats[p.badge] && stats[p.badge].kg > 0);
  const avgPay = active.length
    ? active.reduce((s, p) => s + stats[p.badge].payPerHour, 0) / active.length
    : 0;
  return { c1Kg, c2Kg, c1Trays, c2Trays, c1Pun, c2Pun, wasteKg, avgPay };
}

// per-picker class split (kg) from records
function pickerClassKg(p, packsPerTray) {
  let c1 = 0, c2 = 0;
  p.records.forEach((r) => {
    if (r.waste) return;
    const kg = recordKg(r, packsPerTray);
    if (r.type === "Cl I") c1 += kg; else c2 += kg;
  });
  return { c1, c2 };
}

/* ===== Per-picker stats + minimum-wage / speed flags =====
   ctx: { startTs, breakMins, now, pricePerKg, packsPerTray, pieceRate, minWage }
   returns map badge -> { kg, trays, value, valuePerHour, payPerHour,
                          speed, hours, belowMinWage, slow, top } */
function computeStats(pickers, ctx) {
  const packsPerTray = ctx.packsPerTray || PACKS_PER_TRAY;
  const pricePerKg = ctx.pricePerKg || PRICE_PER_KG;
  const pieceRate = ctx.pieceRate || PIECE_RATE_PER_KG;
  const minWage = ctx.minWage || MIN_WAGE;
  const hours = Math.max(0.25, (ctx.now - ctx.startTs) / 3600000 - (ctx.breakMins || 0) / 60);

  const out = {};
  pickers.forEach((p) => {
    let kg = 0, trays = 0;
    p.records.forEach((r) => { kg += recordKg(r, packsPerTray); trays += r.trays; });
    const value = kg * pricePerKg;
    const pay = kg * pieceRate;
    out[p.badge] = {
      kg, trays,
      value,
      valuePerHour: value / hours,
      payPerHour: pay / hours,
      speed: kg / hours,
      hours,
      belowMinWage: kg > 0 && pay / hours < minWage,
      slow: false, top: false,
    };
  });

  // rank by speed among active pickers, flag bottom/top ~10%
  const active = pickers.map((p) => p.badge).filter((b) => out[b].kg > 0);
  active.sort((a, b) => out[a].speed - out[b].speed);
  const nFlag = Math.max(1, Math.round(active.length * 0.1));
  active.slice(0, nFlag).forEach((b) => { out[b].slow = true; });
  active.slice(active.length - nFlag).forEach((b) => { out[b].top = true; });
  return out;
}

function fmtKg(kg) {
  if (kg >= 100) return Math.round(kg) + " kg";
  return (Math.round(kg * 10) / 10).toFixed(1) + " kg";
}
function fmtGbp(n) {
  return "£" + (Math.round(n * 100) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtGbp0(n) {
  return "£" + Math.round(n).toLocaleString();
}

Object.assign(window, {
  DIGIT_COLORS, PACKSIZES, BADGES, NAMES, TRAINING,
  PACKS_PER_TRAY, PRICE_PER_KG, PIECE_RATE_PER_KG, TRAYS_PER_HOUR_TGT, MIN_WAGE,
  colorFor, isDarkText, pastelFor, buildPickers, nameFor, trainingFor,
  clockInFor, minsBetweenHHMM, trainingColor,
  relMinutes, lastAddedLabel, amountLabel, clockOf,
  recordKg, gramsFor, computeStats, computeFieldTotals, pickerClassKg,
  fmtKg, fmtGbp, fmtGbp0,
});
