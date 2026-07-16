/* fieldsetup.jsx — Field Setup tab + Field Info tab */

function InfoLine({ k, v }) {
  return (
    <div className="info-line">
      <span className="info-k">{k}</span>
      <span className="info-v">{v}</span>
    </div>
  );
}

function TargetCard({ cls, est, grams, packsPerTray, totalKg, totalTrays }) {
  return (
    <div className="target">
      <div className="target-head">
        <span className="target-cls">{cls}</span>
        <span className="target-est">est. {est.toLocaleString()} kg</span>
      </div>
      <div className="target-grid">
        <div><span className="t-l">Pack size</span><span className="t-v">{grams} g</span></div>
        <div><span className="t-l">Packs / tray</span><span className="t-v">{packsPerTray}</span></div>
        <div><span className="t-l">Value</span><span className="t-v">£{PRICE_PER_KG} / kg</span></div>
        <div><span className="t-l">Target rate</span><span className="t-v">{TRAYS_PER_HOUR_TGT} trays / hr</span></div>
      </div>
      <div className="target-foot">
        <span className="tf-l">Picked so far</span>
        <span className="tf-v">{fmtKg(totalKg)} · {totalTrays} trays</span>
      </div>
    </div>
  );
}

/* ===== Field Info — standalone full-page tab ===== */
function FieldInfo({ start, pickers, packsPerTray }) {
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  let c1kg = 0, c1tr = 0, c2kg = 0, c2tr = 0;
  pickers.forEach((p) => p.records.forEach((r) => {
    if (r.waste) return;
    const kg = recordKg(r, packsPerTray);
    if (r.type === "Cl I") { c1kg += kg; c1tr += r.trays; }
    else { c2kg += kg; c2tr += r.trays; }
  }));

  return (
    <div className="fi-page">
      <div className="fi-identity">
        <div className="fi-icard">
          <span className="fi-il">Date</span>
          <span className="fi-iv">{today}</span>
        </div>
        <div className="fi-icard">
          <span className="fi-il">Field</span>
          <span className="fi-iv">North Block 4</span>
        </div>
        <div className="fi-icard">
          <span className="fi-il">Crop &amp; variety</span>
          <span className="fi-iv">Strawberries · Malling Centenary</span>
        </div>
        <div className="fi-icard">
          <span className="fi-il">Planned start</span>
          <span className="fi-iv">{start || "—"}</span>
        </div>
      </div>

      <div className="fi-targets">
        <div className="fi-targets-head">Picking targets</div>
        <div className="fi-targets-row">
          <div className="fi-tcard c1">
            <div className="fitc-head">
              <span className="fitc-cls">Class 1 · 250 g</span>
              <span className="fitc-est">target {(1200).toLocaleString()} kg</span>
            </div>
            <div className="fitc-progress">
              <div className="fitc-bar"><div className="fitc-fill" style={{ width: Math.min(100, c1kg / 12) + "%" }} /></div>
              <span className="fitc-pct">{Math.round(c1kg / 12)}%</span>
            </div>
            <div className="fitc-stats">
              <div><span className="t-l">Picked so far</span><span className="t-v c1v">{fmtKg(c1kg)}</span></div>
              <div><span className="t-l">Trays</span><span className="t-v">{c1tr}</span></div>
              <div><span className="t-l">Pack size</span><span className="t-v">250 g</span></div>
              <div><span className="t-l">Packs / tray</span><span className="t-v">{packsPerTray}</span></div>
              <div><span className="t-l">Value / kg</span><span className="t-v">£{PRICE_PER_KG}</span></div>
              <div><span className="t-l">Target rate</span><span className="t-v">{TRAYS_PER_HOUR_TGT} tr/hr</span></div>
            </div>
          </div>

          <div className="fi-tcard c2">
            <div className="fitc-head">
              <span className="fitc-cls">Class 2 · 240 g</span>
              <span className="fitc-est">target {(480).toLocaleString()} kg</span>
            </div>
            <div className="fitc-progress">
              <div className="fitc-bar"><div className="fitc-fill" style={{ width: Math.min(100, c2kg / 4.8) + "%" }} /></div>
              <span className="fitc-pct">{Math.round(c2kg / 4.8)}%</span>
            </div>
            <div className="fitc-stats">
              <div><span className="t-l">Picked so far</span><span className="t-v c2v">{fmtKg(c2kg)}</span></div>
              <div><span className="t-l">Trays</span><span className="t-v">{c2tr}</span></div>
              <div><span className="t-l">Pack size</span><span className="t-v">240 g</span></div>
              <div><span className="t-l">Packs / tray</span><span className="t-v">{packsPerTray}</span></div>
              <div><span className="t-l">Value / kg</span><span className="t-v">£{PRICE_PER_KG}</span></div>
              <div><span className="t-l">Target rate</span><span className="t-v">{TRAYS_PER_HOUR_TGT} tr/hr</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Field Setup tab ===== */
function FieldSetup({ start, setStart, stop, setStop, breakMins, setBreakMins,
                      pickers, stats, packsPerTray, onStub, onComplete, onAddRemove, timesLocked }) {
  const running = !!start && !stop;

  return (
    <div className="setup">
      <div className="setup-grid">

        {/* ---- Field times + break ---- */}
        <div className="scard">
          <h3>Field Times</h3>
          <p className="desc">Set when picking opens and closes, and total break time, for this field today.</p>
          {timesLocked && (
            <div className="times-locked-note">
              <span style={{display:'inline-flex',verticalAlign:'middle',width:15,height:15,marginRight:6}}><Icon.lock /></span>
              Field times are locked — pickers have been signed out on these hours.
            </div>
          )}
          <div className="time-row">
            <div className="time-field">
              <label>Start time</label>
              <input className="time-input" type="time" value={start} disabled={timesLocked}
                onChange={(e) => setStart(e.target.value)} />
            </div>
            <div className="time-field">
              <label>Stop time</label>
              <input className="time-input" type="time" value={stop} disabled={timesLocked}
                onChange={(e) => setStop(e.target.value)} />
            </div>
            <div className="time-field break">
              <label>Break</label>
              <div className="break-input">
                <input type="number" min="0" step="5" value={breakMins} disabled={timesLocked}
                  onChange={(e) => setBreakMins(Math.max(0, Number(e.target.value) || 0))} />
                <span className="break-unit">min</span>
              </div>
            </div>
          </div>
          {running ? (
            <span className="status-pill"><span className="d" />Field open — started {start}</span>
          ) : stop ? (
            <span className="status-pill off"><span className="d" />Field closed at {stop}</span>
          ) : (
            <span className="status-pill off"><span className="d" />Not started</span>
          )}
        </div>

        {/* ---- Compliance (swapped up) ---- */}
        <div className="scard">
          <h3>Compliance</h3>
          <p className="desc">Record blue plaster issue &amp; return for first-aid compliance.</p>
          <div className="btn-stack">
            <button className="big-btn" onClick={() => onStub("Blue Plasters")}>
              <span className="bic plaster"><Icon.cross /></span>
              <span className="bt"><span className="b1">Blue Plasters</span><span className="b2">Issue &amp; log plasters</span></span>
              <span className="chev">›</span>
            </button>
          </div>
        </div>

        {/* ---- Checklists ---- */}
        <div className="scard">
          <h3>Checklists</h3>
          <p className="desc">Complete the required safety &amp; quality checks at the start and end of the day.</p>
          <div className="btn-stack">
            <button className="big-btn" onClick={() => onStub("Start-of-day checklist")}>
              <span className="bic start"><Icon.list /></span>
              <span className="bt"><span className="b1">Start checklist</span><span className="b2">5 items · not started</span></span>
              <span className="chev">›</span>
            </button>
            <button className="big-btn" onClick={() => onStub("End-of-day checklist")}>
              <span className="bic stop"><Icon.list /></span>
              <span className="bt"><span className="b1">Stop checklist</span><span className="b2">4 items · not started</span></span>
              <span className="chev">›</span>
            </button>
          </div>
        </div>

        {/* ---- Day Actions (side-by-side with Checklists) ---- */}
        <div className="scard">
          <h3>Day Actions</h3>
          <p className="desc">Manage the crew and close out the field at the end of the day.</p>
          <div className="btn-stack">
            <button className="big-btn" onClick={onAddRemove}>
              <span className="bic people"><Icon.people /></span>
              <span className="bt"><span className="b1">Add / remove pickers</span><span className="b2">{pickers.length} assigned</span></span>
              <span className="chev">›</span>
            </button>
            <button className="big-btn complete" onClick={onComplete}>
              <span className="bic done"><Icon.check /></span>
              <span className="bt"><span className="b1">Complete field</span><span className="b2">Finish &amp; submit day summary</span></span>
              <span className="chev">›</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

Object.assign(window, { InfoLine, TargetCard, FieldInfo, FieldSetup });
