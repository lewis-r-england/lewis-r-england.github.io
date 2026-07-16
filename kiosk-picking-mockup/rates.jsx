/* rates.jsx — Picking Rates league table */

/* quantile via linear interpolation (same method as numpy/Excel PERCENTILE.INC) */
function quantile(sorted, q) {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0];
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

/* Horizontal box-and-whisker plot of value / hour, with £ amounts marked. */
function ValueBoxPlot({ rows }) {
  const vals = rows.map((r) => r.st.valuePerHour).sort((a, b) => a - b);
  if (vals.length < 1) return null;

  const min = vals[0];
  const max = vals[vals.length - 1];
  const q1 = quantile(vals, 0.25);
  const med = quantile(vals, 0.5);
  const q3 = quantile(vals, 0.75);
  const mean = vals.reduce((s, v) => s + v, 0) / vals.length;

  // nice padded axis domain rounded to a sensible step
  const span = Math.max(max - min, 1);
  const pad = span * 0.12;
  const step = span > 40 ? 10 : span > 16 ? 5 : span > 6 ? 2 : 1;
  const d0 = Math.max(0, Math.floor((min - pad) / step) * step);
  const d1 = Math.ceil((max + pad) / step) * step;
  const dom = Math.max(d1 - d0, 1);
  const pct = (v) => ((v - d0) / dom) * 100;

  const ticks = [];
  for (let t = d0; t <= d1 + 1e-6; t += step) ticks.push(t);

  return (
    <div className="rbox">
      <div className="rbox-head">
        <span className="rbox-t">Value / hour — spread across pickers</span>
        <span className="rbox-leg">
          <i className="lg-box" />box = middle 50% (Q1–Q3)
          <i className="lg-med" />median
          <i className="lg-mean" />mean
        </span>
      </div>

      <div className="rbox-plot">
        {/* whisker line min → max */}
        <div className="bp-whisker" style={{ left: pct(min) + "%", width: (pct(max) - pct(min)) + "%" }} />
        {/* min / max caps */}
        <div className="bp-cap" style={{ left: pct(min) + "%" }} />
        <div className="bp-cap" style={{ left: pct(max) + "%" }} />
        {/* IQR box */}
        <div className="bp-iqr" style={{ left: pct(q1) + "%", width: (pct(q3) - pct(q1)) + "%" }} />
        {/* median */}
        <div className="bp-median" style={{ left: pct(med) + "%" }} />
        {/* mean diamond */}
        <div className="bp-mean" style={{ left: pct(mean) + "%" }} />
        {/* individual pickers as dots */}
        {vals.map((v, i) => (
          <div key={i} className="bp-dot" style={{ left: pct(v) + "%" }} />
        ))}

        {/* monetary value labels */}
        <div className="bp-lab bp-lab-lo" style={{ left: pct(min) + "%" }}>
          <span className="bl-k">Min</span><span className="bl-v">{fmtGbp(min)}</span>
        </div>
        <div className="bp-lab bp-lab-lo" style={{ left: pct(q1) + "%" }}>
          <span className="bl-k">Q1</span><span className="bl-v">{fmtGbp(q1)}</span>
        </div>
        <div className="bp-lab bp-lab-hi" style={{ left: pct(med) + "%" }}>
          <span className="bl-k">Median</span><span className="bl-v">{fmtGbp(med)}</span>
        </div>
        <div className="bp-lab bp-lab-lo" style={{ left: pct(q3) + "%" }}>
          <span className="bl-k">Q3</span><span className="bl-v">{fmtGbp(q3)}</span>
        </div>
        <div className="bp-lab bp-lab-hi" style={{ left: pct(max) + "%" }}>
          <span className="bl-k">Max</span><span className="bl-v">{fmtGbp(max)}</span>
        </div>
      </div>

      {/* £ axis */}
      <div className="rbox-axis">
        {ticks.map((t) => (
          <div key={t} className="ax-tick" style={{ left: pct(t) + "%" }}>
            <span className="ax-mark" />
            <span className="ax-num">{fmtGbp0(t)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PickingRates({ pickers, stats }) {
  // sort by value/hour descending
  const rows = pickers
    .map((p) => ({ p, st: stats[p.badge] }))
    .sort((a, b) => b.st.valuePerHour - a.st.valuePerHour);

  const totalKg = pickers.reduce((s, p) => s + stats[p.badge].kg, 0);
  const avgPerHour = rows.length
    ? rows.reduce((s, r) => s + r.st.valuePerHour, 0) / rows.length : 0;

  return (
    <div className="rates">
      <div className="rates-top">
        <div>
          <h2 className="rates-title">Picking Rates</h2>
          <p className="rates-sub">North Block 4 · live league table · ranked by value / hour</p>
        </div>
        <div className="rates-stats">
          <div className="rstat"><span className="rs-n">{pickers.length}</span><span className="rs-l">Pickers</span></div>
          <div className="rstat"><span className="rs-n">{fmtKg(totalKg)}</span><span className="rs-l">Total picked</span></div>
          <div className="rstat"><span className="rs-n">{fmtGbp0(avgPerHour)}</span><span className="rs-l">Avg / hr</span></div>
        </div>
      </div>

      <div className="rates-scroll">
        <ValueBoxPlot rows={rows} />
        <table className="lt">
          <thead>
            <tr>
              <th className="lt-rank">#</th>
              <th className="lt-num">Number</th>
              <th>Picker</th>
              <th className="lt-r">Total weight</th>
              <th className="lt-r">Value / hour</th>
              <th className="lt-flags">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ p, st }, i) => {
              const kinds = flagKinds(p, st, true); // league: cap only when done
              return (
                <tr key={p.badge}>
                  <td className="lt-rank">{i + 1}</td>
                  <td className="lt-num">
                    <span className="lt-chip" style={{ background: colorFor(p.badge) }}>{p.badge}</span>
                  </td>
                  <td className="lt-name">{p.name}</td>
                  <td className="lt-r lt-kg">{fmtKg(st.kg)}</td>
                  <td className="lt-r lt-val">
                    {fmtGbp(st.valuePerHour)}
                    {st.belowMinWage && <span className="lt-warn">below min wage</span>}
                  </td>
                  <td className="lt-flags">
                    <span className="lt-badges">
                      {kinds.map((k) => <StatusBadge key={k} kind={k} size={24} />)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

Object.assign(window, { PickingRates });
