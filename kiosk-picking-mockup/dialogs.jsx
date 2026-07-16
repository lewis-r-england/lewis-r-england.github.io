/* dialogs.jsx — modal dialogs for PickFarm */
const { useState: useStateDlg, useRef: useRefDlg, useEffect: useEffDlg } = React;

/* generic splash placeholder dialog */
function SplashDialog({ title, sub, icon, onClose }) {
  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose} />
      <div className="dialog">
        <div className="dialog-bar">
          <div>
            <h2>{title}</h2>
            <div className="sub">{sub}</div>
          </div>
          <button className="dialog-x" onClick={onClose}>×</button>
        </div>
        <div className="dialog-body">
          <div className="splash">
            <div className="icon">{icon}</div>
            <div className="big">{title}</div>
            <div className="mono">[ placeholder — content to be added ]</div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

function WorkersDialog({ onClose }) {
  return <SplashDialog title="Workers Settings"
    sub="Manage pickers, badges & assignments for this field"
    icon={<Icon.people />} onClose={onClose} />;
}

function AddRemovePickersDialog({ onClose, pickers, stats, signedOut, pickerTimes, startTime, stopTime,
                                    onRemovePicker, onOpenSignOut, onOpenEditTimes }) {
  const canSO = (badge) => {
    const pt = pickerTimes[badge];
    return !!((pt && pt.start && pt.stop) || (startTime && stopTime));
  };
  const trLabel = { done: "Complete", ongoing: "In progress", none: "None" };
  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose} />
      <div className="modal arp-modal">
        <div className="modal-head">
          <div>
            <h2>Add / remove pickers</h2>
            <div className="msub">North Block 4 · {pickers.length} assigned</div>
          </div>
          <div className="arp-head-r">
            <button className="m-btn solid" style={{fontSize:13,padding:'7px 14px'}}>+ Add new picker</button>
            <button className="dialog-x" onClick={onClose}>×</button>
          </div>
        </div>
        <div className="modal-body arp-body">
          <table className="arp-table">
            <thead><tr>
              <th>Badge</th><th>Name</th><th>Training</th><th className="arp-th-act">Actions</th>
            </tr></thead>
            <tbody>
              {pickers.map((p) => {
                const st    = stats[p.badge] || {};
                const isSO  = !!signedOut[p.badge];
                const hasPx = (st.kg || 0) > 0;
                const okSO  = canSO(p.badge);
                const tc    = trainingColor(p.training);
                return (
                  <tr key={p.badge} className={"arp-row" + (isSO ? " arp-so" : "")}>
                    <td>
                      <span className="arp-chip"
                        style={{background: colorFor(p.badge), color: isDarkText(p.badge)?'#33371f':'#fff'}}>
                        {p.badge}
                      </span>
                    </td>
                    <td className="arp-name">{p.name}</td>
                    <td>
                      <span className="arp-train" style={{background: tc+'22', color: tc}}>
                        {trLabel[p.training] || "None"}
                      </span>
                    </td>
                    <td className="arp-acts">
                      <button className="arp-btn" onClick={() => onOpenEditTimes(p)}>Edit times</button>
                      {isSO
                        ? <span className="arp-so-tag"><Icon.lock /> Signed out</span>
                        : hasPx
                          ? <button className="arp-btn arp-primary" disabled={!okSO}
                              title={!okSO ? 'Set field start & stop times first' : undefined}
                              onClick={() => onOpenSignOut(p)}>Sign out</button>
                          : <button className="arp-btn arp-danger" onClick={() => onRemovePicker(p.badge)}>Remove</button>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </React.Fragment>
  );
}

/* placeholder tool dialogs opened from the worker popover */
function PickerToolDialog({ kind, picker, onClose }) {
  const map = {
    training:  { title: "Training record",    sub: "Modules, certificates & sign-off",        icon: <Icon.cap /> },
    clock:     { title: "Hours & clock-ins",  sub: "Clock-in / out history for today",          icon: <Icon.clock /> },
    warning:   { title: "Warnings & notes",   sub: "Conduct, safety & supervisor notes",        icon: <Icon.warn /> },
    signature: { title: "Signature",          sub: "Capture worker signature for today’s sheet", icon: <Icon.pen /> },
    editentry: { title: "Edit entry",         sub: "Adjust trays / punnets for this record",     icon: <Icon.edit /> },
  }[kind] || { title: "", sub: "", icon: null };
  const who = picker ? "#" + picker.badge + " · " + picker.name : "";
  return <SplashDialog title={map.title}
    sub={map.sub + (who ? " — " + who : "")}
    icon={map.icon} onClose={onClose} />;
}

/* ---- small centered modal shell ---- */
function Modal({ title, sub, onClose, children, footer, accent, className }) {
  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose} />
      <div className={"modal" + (className ? " " + className : "")}>
        <div className="modal-head" style={accent ? { "--accent": accent } : null}>
          <div>
            <h2>{title}</h2>
            {sub && <div className="msub">{sub}</div>}
          </div>
          <button className="dialog-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </React.Fragment>
  );
}

/* ================= Add field waste ================= */
function WasteDialog({ onClose, onAdd }) {
  const [kg, setKg] = useStateDlg("");
  const num = parseFloat(kg);
  const valid = !isNaN(num) && num > 0;
  const submit = () => { if (valid) { onAdd(num); onClose(); } };
  const chip = (v) => setKg(String(v));
  return (
    <Modal title="Field rubbish" accent="#d4243b"
      sub="Logged against the field. Quantity is distributed for back-end processing."
      onClose={onClose}
      footer={
        <React.Fragment>
          <button className="m-btn ghost" onClick={onClose}>Cancel</button>
          <button className="m-btn solid" disabled={!valid} onClick={submit}>Add waste</button>
        </React.Fragment>
      }>
      <label className="m-field-lbl">Waste amount</label>
      <div className="kg-input">
        <input type="number" inputMode="decimal" min="0" step="0.1" autoFocus
          placeholder="0.0" value={kg} onChange={(e) => setKg(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
        <span className="kg-unit">kg</span>
      </div>
      <div className="chips">
        {[2, 5, 10, 25].map((v) => (
          <button key={v} className="chip" onClick={() => chip(v)}>{v} kg</button>
        ))}
      </div>
    </Modal>
  );
}

/* ================= Request pickup ================= */
function RequestPickupDialog({ onClose, onRequest }) {
  return (
    <Modal title="Request pickup" accent="#3a78e0"
      sub="Choose which class is ready for collection."
      onClose={onClose}>
      <div className="pick-class">
        <button className="pc-btn c1" onClick={() => { onRequest("Class 1"); onClose(); }}>
          <span className="pc-tag">Class 1</span>
          <span className="pc-sub">250g · premium</span>
          <span className="pc-go"><Icon.truck /> Request</span>
        </button>
        <button className="pc-btn c2" onClick={() => { onRequest("Class 2"); onClose(); }}>
          <span className="pc-tag">Class 2</span>
          <span className="pc-sub">240g · standard</span>
          <span className="pc-go"><Icon.truck /> Request</span>
        </button>
      </div>
    </Modal>
  );
}

/* ================= Sign Out ================= */
function SignOutDialog({ picker, records, removedRecs, st, packsPerTray,
                         fieldStart, fieldStop, fieldBreak, pickerTimes,
                         onClose, onConfirmSignOut }) {
  const canvasRef = useRefDlg(null);
  const ctxRef   = useRefDlg(null);
  const drawRef  = useRefDlg(false);
  const [hasSig, setHasSig] = useStateDlg(false);

  const c = colorFor(picker.badge);

  // effective times: individual picker times override field defaults
  const pt       = pickerTimes && pickerTimes[picker.badge];
  const effStart = (pt && pt.start) || fieldStart || "—";
  const effStop  = (pt && pt.stop)  || fieldStop  || "—";
  const effBreak = (pt && pt.breakMins != null) ? pt.breakMins : (fieldBreak || 0);

  // merge active + removed records, sort by time
  const allRecs = [
    ...records.filter(r => !r.waste).map(r => ({ ...r, _removed: false })),
    ...(removedRecs || []).filter(r => !r.waste).map(r => ({ ...r, _removed: true })),
  ].sort((a, b) => a.ts - b.ts);

  const { c1, c2 } = pickerClassKg(picker, packsPerTray);
  const totalPay   = st ? st.payPerHour * st.hours : 0;

  useEffDlg(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width  = Math.round(width  * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctxRef.current = ctx;
  }, []);

  const getXY = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return [src.clientX - rect.left, src.clientY - rect.top];
  };

  const onDown = (e) => {
    e.preventDefault();
    drawRef.current = true;
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.strokeStyle = "#1d2630";
    ctx.lineWidth   = 2.2;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    const [x, y] = getXY(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const onMove = (e) => {
    if (!drawRef.current || !ctxRef.current) return;
    e.preventDefault();
    const [x, y] = getXY(e);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
    if (!hasSig) setHasSig(true);
  };
  const onUp = () => { drawRef.current = false; };

  const clearSig = () => {
    const { width, height } = canvasRef.current.getBoundingClientRect();
    ctxRef.current.clearRect(0, 0, width, height);
    setHasSig(false);
  };

  const submit = () => {
    const sig = canvasRef.current.toDataURL("image/png");
    onConfirmSignOut(picker.badge, sig);
    onClose();
  };

  return (
    <Modal title="Sign out" accent={c}
      className="so-modal" onClose={onClose}
      footer={
        <React.Fragment>
          <button className="m-btn ghost" onClick={onClose}>Cancel</button>
          <button className="m-btn solid" disabled={!hasSig} onClick={submit}>Sign out</button>
        </React.Fragment>
      }>

      <div className="so-layout">
        <div className="so-col-left">
          <div className="so-who">
            <span className="so-who-chip"
              style={{background:c,color:isDarkText(picker.badge)?'#33371f':'#fff'}}>
              {picker.badge}
            </span>
            <div className="so-who-detail">
              <div className="so-who-name">{picker.name}</div>
              <div className="so-who-times">
                <span>{effStart}</span>
                <span className="so-arrow">→</span>
                <span>{effStop}</span>
                <span className="so-wt-dot">·</span>
                <span>{effBreak} min break</span>
              </div>
            </div>
          </div>

          <div className="so-sec-lbl">Today's picking record</div>
          <div className="so-records">
            {allRecs.length === 0
              ? <div className="so-empty">No records today</div>
              : (
                <table className="so-table">
                  <thead><tr><th>Time</th><th>Type</th><th>Amount</th></tr></thead>
                  <tbody>
                    {allRecs.map((r) => (
                      <tr key={r.id} className={"so-row" + (r._removed ? " void" : "")}>
                        <td className="so-time">{clockOf(r.ts)}</td>
                        <td><span className={"type-pill " + (r.type === "Cl I" ? "t1" : "t2")}>{r.type}</span></td>
                        <td>{amountLabel(r)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </div>
        </div>

        <div className="so-col-right">
          <div className="so-sec-lbl">Summary</div>
          <div className="so-totals">
            <div className="so-tot-item">
              <span className="so-tot-lbl">Class 1</span>
              <span className="so-tot-val">{fmtKg(c1)}</span>
            </div>
            <div className="so-tot-item">
              <span className="so-tot-lbl">Class 2</span>
              <span className="so-tot-val">{fmtKg(c2)}</span>
            </div>
            <div className="so-tot-item">
              <span className="so-tot-lbl">Total pay</span>
              <span className="so-tot-val so-pay">{fmtGbp(totalPay)}</span>
            </div>
          </div>

          <div className="so-sig-section">
            <div className="so-sig-header">
              <div>
                <div className="so-sig-title">Your signature</div>
                <div className="so-sig-sub">By signing you confirm the above record is correct.</div>
              </div>
              {hasSig && <button className="so-clear-btn" onClick={clearSig}>Clear</button>}
            </div>
            <div className="so-sig-pad">
              {!hasSig && <span className="so-sig-hint">Sign here</span>}
              <canvas ref={canvasRef} className="so-canvas"
                onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
                onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp} />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ================= Edit individual picker times ================= */
const PICKER_REASONS = [
  { value: "",              label: "Standard hours" },
  { value: "late-arrival",  label: "Late arrival" },
  { value: "early-finish",  label: "Early finish" },
  { value: "sickness",      label: "Sickness" },
  { value: "training",      label: "Training" },
  { value: "other",         label: "Other" },
];
function EditTimesDialog({ picker, fieldStart, fieldStop, fieldBreak, pickerTimes, onClose, onSave }) {
  const ex = pickerTimes[picker.badge] || {};
  const [start,  setStart]  = useStateDlg(ex.start  || fieldStart || "");
  const [stop,   setStop]   = useStateDlg(ex.stop   || fieldStop  || "");
  const [brk,    setBrk]    = useStateDlg(ex.breakMins != null ? ex.breakMins : (fieldBreak || 0));
  const [reason, setReason] = useStateDlg(ex.reason || "");
  const valid = !!(start && stop);
  const submit = () => { onSave(picker.badge, { start, stop, breakMins: Number(brk), reason }); onClose(); };
  const c = colorFor(picker.badge);
  return (
    <Modal title="Edit times" sub={picker.badge + " · " + picker.name} accent={c} className="et-modal" onClose={onClose}
      footer={
        <React.Fragment>
          <button className="m-btn ghost" onClick={onClose}>Cancel</button>
          <button className="m-btn solid" disabled={!valid} onClick={submit}>Save times</button>
        </React.Fragment>
      }>
      <div className="et-row">
        <div className="time-field">
          <label>Start time</label>
          <input className="time-input" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div className="time-field">
          <label>Stop time</label>
          <input className="time-input" type="time" value={stop} onChange={(e) => setStop(e.target.value)} />
        </div>
        <div className="time-field">
          <label>Break</label>
          <div className="break-input">
            <input type="number" min="0" step="5" value={brk}
              onChange={(e) => setBrk(Math.max(0, Number(e.target.value) || 0))} />
            <span className="break-unit">min</span>
          </div>
        </div>
      </div>
      <div className="et-reason">
        <label className="m-field-lbl">Reason for adjusted hours</label>
        <select className="et-select" value={reason} onChange={(e) => setReason(e.target.value)}>
          {PICKER_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
    </Modal>
  );
}

/* ================= Unlock confirm ================= */
function UnlockConfirmDialog({ picker, onClose, onConfirm }) {
  return (
    <Modal title="Remove sign-out?" accent="#e5821e"
      sub={picker.badge + " · " + picker.name} onClose={onClose}
      footer={
        <React.Fragment>
          <button className="m-btn ghost" onClick={onClose}>Keep signed out</button>
          <button className="m-btn solid" style={{ background: "#e5821e" }} onClick={() => { onConfirm(); onClose(); }}>
            Remove sign-out
          </button>
        </React.Fragment>
      }>
      <div className="confirm-row">
        <span className="confirm-ic" style={{ fontSize: "26px", background: "#fef3e6", color: "#e5821e" }}>🔓</span>
        <div>
          <div className="confirm-t">Allow editing for {picker.name}?</div>
          <div className="confirm-s">This removes their signature and allows changes to picking records.</div>
        </div>
      </div>
    </Modal>
  );
}

/* ================= Complete field ================= */
function CompleteFieldDialog({ onClose, onConfirm }) {
  return (
    <Modal title="Complete field" accent="#2f9e44"
      sub="Closes North Block 4 for the day and locks all picking entry."
      onClose={onClose}
      footer={
        <React.Fragment>
          <button className="m-btn ghost" onClick={onClose}>Not yet</button>
          <button className="m-btn solid green" onClick={() => { onConfirm && onConfirm(); onClose(); }}>
            Complete &amp; finish field
          </button>
        </React.Fragment>
      }>
      <div className="confirm-row">
        <span className="confirm-ic"><Icon.check /></span>
        <div>
          <div className="confirm-t">Finish picking for North Block 4?</div>
          <div className="confirm-s">A summary is sent to the office. You can still view rates after closing.</div>
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, {
  SplashDialog, WorkersDialog, AddRemovePickersDialog, PickerToolDialog, Modal,
  WasteDialog, RequestPickupDialog, CompleteFieldDialog,
  SignOutDialog, UnlockConfirmDialog, EditTimesDialog,
});
