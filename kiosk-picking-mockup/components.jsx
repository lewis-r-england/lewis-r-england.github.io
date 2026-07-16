/* components.jsx — PickFarm UI components */
const { useState, useRef, useEffect, useLayoutEffect, useCallback } = React;

/* ---- tiny inline icons ---- */
const Icon = {
  check: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  people: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M16 6.5a3 3 0 0 1 0 5.8M17 19a5.5 5.5 0 0 0-2.2-4.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>),
  list: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>),
  cross: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>),
  truck: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M2 6h11v9H2zM13 9h4l4 3v3h-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="2"/><circle cx="17" cy="18" r="2" stroke="currentColor" strokeWidth="2"/></svg>),
  waste: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  trophy: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 19h6M12 13v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  plus: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg>),
  // graduation cap (mortarboard)
  cap: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 4 2.5 8.2 12 12.4l9.5-4.2z" fill="currentColor"/><path d="M6.4 11v3.6c0 1.4 2.5 2.4 5.6 2.4s5.6-1 5.6-2.4V11" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round"/><path d="M21.5 8.2v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>),
  // slow picking: clock + berry
  slow: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="11" cy="12" r="7.2" stroke="currentColor" strokeWidth="1.8"/><path d="M11 8.4V12l2.6 1.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="19" cy="6" r="2.4" fill="currentColor"/><path d="M19 3.4v-1.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>),
  edit: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M4 20h4L18 10l-4-4L4 16v4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M13 7l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>),
  clock: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="2"/><path d="M12 7.4V12l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>),
  warn: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M12 3.4 1.7 21h20.6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M12 9.6v4.6M12 17.7v.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>),
  pen: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 16.8c2.1.4 3.2-1.1 4.6-3.6 1.1-2 1.8-2.4 2.4-2 .8.5.2 2.9 1.4 3.5 1 .5 2-.9 3.2-.9" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.6 8.6l3.4-3.4 2 2-3.4 3.4z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round"/><path d="M4 20.6h16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>),
  eye: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 12c2.4-4.5 5-6.5 9-6.5s6.6 2 9 6.5c-2.4 4.5-5 6.5-9 6.5S5.4 16.5 3 12z" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="2.6" fill="currentColor"/></svg>),
  lock: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><rect x="5" y="11" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="16" r="1.5" fill="currentColor"/></svg>),
  eyeOff: (p) => (<svg viewBox="0 0 24 24" fill="none" {...p}><path d="M3 12c2.4-4.5 5-6.5 9-6.5s6.6 2 9 6.5c-2.4 4.5-5 6.5-9 6.5S5.4 16.5 3 12z" stroke="currentColor" strokeWidth="2" opacity=".35"/><path d="M4.5 4.5l15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>),
};

/* ---- status flag badge (top-right of cards / rows) ---- */
function StatusBadge({ kind, size = 22 }) {
  const cfg = {
    "cap-none":    { bg: "#ed1c24", el: <Icon.cap />,    title: "No training" },
    "cap-ongoing": { bg: "#eab308", el: <Icon.cap />,    title: "Training ongoing" },
    "cap-done":    { bg: "#2f9e44", el: <Icon.cap />,    title: "Training complete" },
    "wage":        { bg: "#d4243b", el: <span className="gbp">£</span>, title: "Below minimum wage" },
    "slow":        { bg: "#3a4654", el: <Icon.slow />,   title: "Bottom 10% by speed" },
    "top":         { bg: "#0f9d8f", el: <Icon.trophy />, title: "Top 10% by speed" },
  }[kind];
  if (!cfg) return null;
  return (
    <span className="sbadge" style={{ background: cfg.bg, width: size, height: size }} title={cfg.title}>
      {cfg.el}
    </span>
  );
}

// Build the ordered list of badge kinds for a picker given its stats.
// leagueGreenOnly: in the league table only show the cap when training is done.
function flagKinds(p, st, leagueGreenOnly) {
  const out = [];
  const tr = p.training;
  if (leagueGreenOnly) {
    if (tr === "done") out.push("cap-done");
  } else {
    out.push("cap-" + tr);
  }
  if (st) {
    if (st.belowMinWage) out.push("wage");
    if (st.slow) out.push("slow");
    if (st.top) out.push("top");
  }
  return out;
}

/* ================= Flag chips (used in detail header + popover) ================= */
const FLAG_LABELS = {
  "cap-none":    "No training",
  "cap-ongoing": "Training in progress",
  "cap-done":    "Training complete",
  "wage":        "Below minimum wage",
  "slow":        "Slowest 10% of pickers",
  "top":         "Top 10% picker",
};
const FLAG_COLORS = {
  "cap-none":    "#ed1c24",
  "cap-ongoing": "#c9920a",
  "cap-done":    "#2f9e44",
  "wage":        "#d4243b",
  "slow":        "#3a4654",
  "top":         "#0f9d8f",
};
function FlagChips({ p, st, compact }) {
  const kinds = flagKinds(p, st).filter(k => k !== 'cap-done');
  if (!kinds.length) return null;
  return (
    <span className={"flag-chips" + (compact ? " compact" : "")}>
      {kinds.map((k) => (
        <span key={k} className="flag-chip" style={{ background: FLAG_COLORS[k] }}>
          <StatusBadge kind={k} size={compact ? 16 : 18} />
          <span className="fc-lbl">{FLAG_LABELS[k]}</span>
        </span>
      ))}
    </span>
  );
}

/* ================= Picker Card ================= */
function PickerCard({ p, st, now, selected, anySelected, onSelect, onLongPress, showBadges = true, isSignedOut = false }) {
  const c = colorFor(p.badge);
  const timer = useRef(null);
  const fired = useRef(false);
  const [pressing, setPressing] = useState(false);

  const start = (e) => {
    fired.current = false;
    setPressing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    timer.current = setTimeout(() => {
      fired.current = true;
      setPressing(false);
      if (navigator.vibrate) navigator.vibrate(12);
      onLongPress(p, rect);
    }, 500);
  };
  const end = () => {
    clearTimeout(timer.current);
    setPressing(false);
    if (!fired.current) onSelect(p);
  };
  const cancel = () => { clearTimeout(timer.current); setPressing(false); };

  const cls = ["card"];
  if (isSignedOut) cls.push("signed-out");
  else if (selected) cls.push("selected");
  else if (anySelected) cls.push("dim");
  if (pressing) cls.push("lp-on");
  // always white text on cards — removed isDarkText / text-dark

  // training cap: top-right, only when NOT complete (green never shown on cards)
  const trainKind = p.training !== "done" ? "cap-" + p.training : null;
  // performance flags: bottom-right
  const perfKinds = [];
  if (st) {
    if (st.belowMinWage) perfKinds.push("wage");
    if (st.slow) perfKinds.push("slow");
    if (st.top) perfKinds.push("top");
  }

  return (
    <button
      className={cls.join(" ")}
      style={{ "--c": c, "--c-dim": pastelFor(p.badge) }}
      onPointerDown={start}
      onPointerUp={end}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="lp" />
      {isSignedOut ? (
        <React.Fragment>
          <span className="so-lock-overlay"><Icon.lock /></span>
          <span className="num">{p.badge}</span>
          <span className="meta">
            <span className="pname">{p.name}</span>
            <span className="metarow"><span className="so-signed-lbl">Signed out</span></span>
          </span>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <span className="check"><Icon.check /></span>
          {showBadges && trainKind && (
            <span className="flags flags-top">
              <StatusBadge kind={trainKind} size={31} />
            </span>
          )}
          <span className="num">{p.badge}</span>
          <span className="meta">
            <span className="pname">{p.name}</span>
            <span className="metarow">
              <span className="lbl">Last</span>
              <span className="val">{lastAddedLabel(p.lastAddedTs, now)}</span>
            </span>
          </span>
          {showBadges && perfKinds.length > 0 && (
            <span className="flags flags-bottom">
              {perfKinds.map((k) => <StatusBadge key={k} kind={k} size={32} />)}
            </span>
          )}
        </React.Fragment>
      )}
    </button>
  );
}

/* ================= Stepper ================= */
function Stepper({ label, value, onChange }) {
  const hold = useRef(null);
  const step = (d) => onChange(Math.max(0, value + d));
  const startHold = (d) => {
    step(d);
    let delay = 320;
    const run = () => { step(d); delay = Math.max(60, delay - 50); hold.current = setTimeout(run, delay); };
    hold.current = setTimeout(run, delay);
  };
  const stopHold = () => clearTimeout(hold.current);
  return (
    <div className="stepper">
      <span className="slabel">{label}</span>
      <div className="control">
        <button onPointerDown={() => startHold(-1)} onPointerUp={stopHold} onPointerLeave={stopHold}>−</button>
        <span className="qty">{value}</span>
        <button onPointerDown={() => startHold(1)} onPointerUp={stopHold} onPointerLeave={stopHold}>+</button>
      </div>
    </div>
  );
}

/* ================= Clock (isolated so its 1s tick never re-renders App) ================= */
function Clock() {
  const [c, setC] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setC(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="clock">
      <div className="time">{String(c.getHours()).padStart(2, "0")}:{String(c.getMinutes()).padStart(2, "0")}</div>
      <div className="date">{c.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }).toUpperCase()}</div>
    </div>
  );
}

/* ================= Footer: idle dashboard + slide-up detailed entry ================= */
const Footer = React.memo(function Footer({ selected, selSt, packId, setPackId, trays, setTrays, punnets, setPunnets,
                 onAdd, quickQty, onQuick, onEditWaste, onPickup, pickups, totals, onClose }) {
  const open = !!selected;
  const hasQty = trays > 0 || punnets > 0;
  const pickupPills = PACKSIZES.filter((ps) => pickups[ps.cls]);

  return (
    <div className={"footer-zone" + (open ? " entry-open" : "")}>

      {/* ---- idle dashboard ---- */}
      <div className="dash" aria-hidden={open}>
        <div className="dash-stats">
          <div className="dstat c1">
            <span className="dl">Class 1 picked</span>
            <span className="dv">{fmtKg(totals.c1Kg)}</span>
            <span className="ds">{totals.c1Trays} trays · {totals.c1Pun} punnets</span>
          </div>
          <div className="dstat c2">
            <span className="dl">Class 2 picked</span>
            <span className="dv">{fmtKg(totals.c2Kg)}</span>
            <span className="ds">{totals.c2Trays} trays · {totals.c2Pun} punnets</span>
          </div>
          <div className="dstat pay">
            <span className="dl">Avg pay / hour</span>
            <span className="dv">{fmtGbp(totals.avgPay)}</span>
            <span className="ds">across active pickers</span>
          </div>
          <div className="dstat waste">
            <span className="dl">Total rubbish</span>
            <span className="dv">{fmtKg(totals.wasteKg)}</span>
            <span className="ds">logged for the field</span>
            <button className="dstat-edit" onClick={onEditWaste} aria-label="Edit rubbish"><Icon.edit /></button>
          </div>
        </div>

        {pickupPills.length > 0 && (
          <div className="otw-list">
            {pickupPills.map((ps) => (
              <span key={ps.cls} className="otw-pill">
                <span className="otw-dot" />
                <Icon.truck />
                <span className="otw-tx"><b>{ps.cls}</b> on the way</span>
              </span>
            ))}
          </div>
        )}

        <div className="dash-actions">
          <button className="req-pickup" onClick={onPickup}>
            <Icon.truck /> Request pickup
          </button>
        </div>
      </div>

      {/* ---- detailed entry (slides up) ---- */}
      <div className="detail" aria-hidden={!open}>
        <div className="detail-head">
          <span className="detail-title">Detailed Entry</span>
          {selected && (
            <span className="detail-who">
              Adding to
              <span className="who-chip" style={{ background: colorFor(selected.badge), color: isDarkText(selected.badge) ? "#33371f" : "#fff" }}>{selected.badge}</span>
              <span className="who-name">{selected.name}</span>
            </span>
          )}
          {selected && <FlagChips p={selected} st={selSt} compact />}
        </div>

        <div className={"detail-row" + (hasQty ? " has-qty" : "")}>
          <div className="select">
            <select value={packId} onChange={(e) => setPackId(e.target.value)}>
              {PACKSIZES.map((ps) => <option key={ps.id} value={ps.id}>{ps.label}</option>)}
            </select>
          </div>

          <Stepper label="Trays" value={trays} onChange={setTrays} />
          <Stepper label="Punnets" value={punnets} onChange={setPunnets} />

          <span className="or-mark"><span className="line" /><span className="or-txt">OR</span><span className="line" /></span>

          <div className="action-swap">
            <button className="btn-quick" onClick={onQuick}>{`+${quickQty} Trays`}</button>
            <button className="btn-add" onClick={onAdd}>ADD</button>
          </div>
        </div>
      </div>
    </div>
  );
});

/* ================= Toast stack ================= */
function ToastStack({ toasts, onUndo, filter, className }) {
  const visible = filter ? toasts.filter(filter) : toasts;
  if (!visible.length) return null;
  return (
    <div className={"toast-zone" + (className ? " " + className : "")}>
      {toasts.map((t) => (
        <div key={t.id} className={"toast" + (t.mini ? " mini" : "") + (t.leaving ? " leaving" : "")}>
          <span className="ic"><Icon.check /></span>
          <div className="body">
            <div className="t1">{t.title}</div>
            {t.sub && <div className="t2" dangerouslySetInnerHTML={{ __html: t.sub }} />}
          </div>
          {t.undo && t.undoReady && <button className="undo" onClick={() => onUndo(t)}>UNDO</button>}
        </div>
      ))}
    </div>
  );
}

/* ================= Records popover (long-press worker) ================= */
function RecordsPopover({ p, st, now, start, stop, pickerTimes, anchor, onClose, onRemoveRecord, onOpen }) {
  const ref = useRef(null);
  const W = 540;
  const [pos, setPos] = useState(() => {
    const vw = window.innerWidth;
    const w = Math.min(W, vw * 0.92);
    let left = anchor ? anchor.left + anchor.width / 2 - w / 2 : vw / 2 - w / 2;
    left = Math.max(14, Math.min(left, vw - w - 14));
    let top = anchor ? anchor.top : 96;
    return { left, top };
  });

  // After render, measure real size and pull fully on-screen.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight, m = 14;
    let left = pos.left, top = pos.top;
    if (left + r.width > vw - m) left = vw - r.width - m;
    if (left < m) left = m;
    if (top + r.height > vh - m) top = vh - r.height - m;
    if (top < m) top = m;
    if (Math.abs(left - pos.left) > 0.5 || Math.abs(top - pos.top) > 0.5) setPos({ left, top });
    // eslint-disable-next-line
  }, [anchor, p.records.length]);

  const c = colorFor(p.badge);
  const recs = [...p.records].reverse(); // newest first
  const { c1, c2 } = pickerClassKg(p, PACKS_PER_TRAY);
  const payHr = st ? st.payPerHour : 0;

  const lateMin = minsBetweenHHMM(start, p.clockIn);
  const late = !!p.clockIn && lateMin > 0;
  const tcol = trainingColor(p.training);

  const tool = (kind) => onOpen(kind, p);
  const pt   = pickerTimes && pickerTimes[p.badge];
  const canSO = !!((pt && pt.start && pt.stop) || (start && stop));

  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose} />
      <div ref={ref} className="pop wide" style={{ left: pos.left, top: pos.top, "--c": c }} role="dialog">
        <button className="pop-close" onClick={onClose} aria-label="Close">×</button>

        <div className="pop-head">
          <span className="pop-chip">{p.badge}</span>
          <div className="pop-id">
            <span className="pname">{p.name}</span>
            <span className="psub">Recent records · today</span>
            <FlagChips p={p} st={st} />
          </div>
        </div>

        {late && (
          <div className="late-box">
            <span className="late-ic"><Icon.warn /></span>
            <div>
              <div className="late-t">Started {lateMin} min late</div>
              <div className="late-s">Clocked in {p.clockIn} · field start {start || "—"}</div>
            </div>
          </div>
        )}

        {recs.length === 0 ? (
          <div className="rec-empty">No records yet today</div>
        ) : (
          <div className="rec-scroll">
            <table className="rec-table">
              <thead><tr>
                <th className="c-time">Time</th>
                <th className="c-type">Type</th>
                <th className="c-amt">Amount</th>
                <th className="c-act"></th>
              </tr></thead>
              <tbody>
                {recs.map((r) => (
                  <tr key={r.id} className={r.waste ? "is-waste" : ""}>
                    <td className="ttime">{clockOf(r.ts)}</td>
                    <td className="ttype">
                      <span className={"type-pill " + (r.type === "Cl I" ? "t1" : "t2")}>{r.type}</span>
                    </td>
                    <td className="tamt">{amountLabel(r)}</td>
                    <td className="tact">
                      <button className="rec-btn edit" onClick={() => onOpen("editentry", p)} aria-label="Edit entry"><Icon.edit /></button>
                      <button className="rec-btn del" onClick={() => onRemoveRecord(p.badge, r.id)} aria-label="Remove entry"><Icon.waste /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pop-totals">
          <span><i className="d1" />Class 1 <b>{fmtKg(c1)}</b></span>
          <span><i className="d2" />Class 2 <b>{fmtKg(c2)}</b></span>
          <span className="pt-pay">Avg pay <b>{fmtGbp(payHr)}/hr</b></span>
        </div>

        <div className="pop-tools">
          <button className="ptool train" style={{ "--tc": tcol }} onClick={() => tool("training")} aria-label="Training">
            <Icon.cap /><span className="pt-lbl">Training</span>
          </button>
          <button className="ptool warn" onClick={() => tool("warning")} aria-label="Warnings">
            <Icon.warn /><span className="pt-lbl">Warning</span>
          </button>
<button className="ptool" onClick={() => tool("edittime")} aria-label="Edit times">
            <Icon.clock /><span className="pt-lbl">Edit times</span>
          </button>
          <button className="ptool" onClick={() => canSO && tool("signout")} disabled={!canSO}
            title={!canSO ? 'Set field start & stop times first' : undefined} aria-label="Sign out">
            <Icon.pen /><span className="pt-lbl">Sign out</span>
          </button>
        </div>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, {
  Icon, StatusBadge, FlagChips, flagKinds, PickerCard, Stepper, Footer, ToastStack, RecordsPopover, Clock,
});
