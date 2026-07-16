/* app.jsx — PickFarm root */
const { useState: useS, useEffect: useE, useRef: useR, useCallback: useCB, useMemo: useM } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "quickAddQty": 5,
  "columns": 5,
  "liveTimers": true,
  "packsPerTray": 8,
  "minWage": 12.21,
  "pieceRate": 3
} /*EDITMODE-END*/;

let toastSeq = 0;

// timestamp for hh:mm today
function todayAt(hhmm) {
  const [h, m] = (hhmm || "06:30").split(":").map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d.getTime();
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [tab, setTab] = useS("picking");
  const [pickers, setPickers] = useS(() => buildPickers());
  const [now, setNow] = useS(() => Date.now());

  const [selBadge, setSelBadge] = useS(null);
  const [showBadges, setShowBadges] = useS(true);
  const [packId, setPackId] = useS(PACKSIZES[0].id);
  const [trays, setTrays] = useS(0);
  const [punnets, setPunnets] = useS(0);

  const [toasts, setToasts] = useS([]);
  const [pop, setPop] = useS(null); // { badge, anchor }

  // dialogs
  const [dialog, setDialog] = useS(null); // "workers" | "waste" | "pickup" | "complete" | "addremove" | null
  const [toolDlg, setToolDlg] = useS(null); // "training" | "clock" | "warning" | "signature" | "editentry"
  const [dlgPicker, setDlgPicker] = useS(null);

  // field setup state
  const [startTime, setStartTime] = useS("06:30");
  const [stopTime, setStopTime] = useS("");
  const [breakMins, setBreakMins] = useS(30);

  // pickups on the way, per class -> timestamp requested
  const [pickups, setPickups] = useS({}); // { "Class 1": ts, "Class 2": ts }

  const [signedOut, setSignedOut] = useS({}); // badge -> { ts, sig }
  const [removedRecs, setRemovedRecs] = useS({}); // badge -> [record, ...]
  const [unlockBadge, setUnlockBadge] = useS(null); // badge awaiting unlock confirm
  const [pickerTimes, setPickerTimes] = useS({}); // badge -> { start, stop, breakMins, reason }

  // field times are locked if any picker was signed out on field times (no individual times set)
  const fieldTimesLocked = Object.keys(signedOut).some((b) => {
    const pt = pickerTimes[b];return !(pt && pt.start && pt.stop);
  });

  // live timers (5s) — drives "last added" labels and stats reference time
  useE(() => {
    const id = setInterval(() => {if (t.liveTimers) setNow(Date.now());}, 5000);
    return () => clearInterval(id);
  }, [t.liveTimers]);

  const selected = pickers.find((p) => p.badge === selBadge) || null;
  const pack = PACKSIZES.find((x) => x.id === packId) || PACKSIZES[0];

  /* ---- stats (weight / value / min-wage / speed flags) ---- */
  const stats = useM(() => computeStats(pickers, {
    startTs: todayAt(startTime),
    breakMins,
    now: now,
    pricePerKg: PRICE_PER_KG,
    packsPerTray: t.packsPerTray,
    pieceRate: t.pieceRate,
    minWage: t.minWage
  }), [pickers, startTime, breakMins, now, t.packsPerTray, t.pieceRate, t.minWage]);

  /* ---- field-level totals (drives idle dashboard) ---- */
  const fieldTotals = useM(() => computeFieldTotals(pickers, stats, t.packsPerTray),
  [pickers, stats, t.packsPerTray]);

  /* ---- toast helpers ---- */
  const pushToast = useCB((toast) => {
    const id = ++toastSeq;
    const ttl = toast.ttl || 4200;
    setToasts((cur) => [...cur, { ...toast, id, undoReady: false }]);
    if (toast.undo) {
      setTimeout(() => setToasts((cur) => cur.map((x) => x.id === id ? { ...x, undoReady: true } : x)), 1000);
    }
    setTimeout(() => dismiss(id), ttl);
    return id;
  }, []);
  const dismiss = useCB((id) => {
    setToasts((cur) => cur.map((x) => x.id === id ? { ...x, leaving: true } : x));
    setTimeout(() => setToasts((cur) => cur.filter((x) => x.id !== id)), 260);
  }, []);

  /* ---- core add ---- */
  const addRecord = useCB((badge, addTrays, addPunnets, ps) => {
    if (!badge || addTrays === 0 && addPunnets === 0) return;
    const rec = { id: badge + "-" + Date.now(), ts: Date.now(), type: ps.short, trays: addTrays, punnets: addPunnets };
    setPickers((cur) => cur.map((p) => p.badge === badge ?
    { ...p, lastAddedTs: rec.ts, records: [...p.records, rec] } :
    p));
    setNow(Date.now());
    const parts = [];
    if (addTrays) parts.push(addTrays + (addTrays === 1 ? " Tray" : " Trays"));
    if (addPunnets) parts.push(addPunnets + (addPunnets === 1 ? " Punnet" : " Punnets"));
    pushToast({
      title: parts.join(", ") + " " + ps.short,
      sub: "Added to <b>" + badge + "</b>",
      undo: { badge, recId: rec.id }
    });
  }, [pushToast]);

  const onAdd = useCB(() => {
    if (!selected) return;
    addRecord(selected.badge, trays, punnets, pack);
    setTrays(0);setPunnets(0);
    setSelBadge(null); // deselect after adding
  }, [selected, trays, punnets, pack, addRecord]);
  const onQuick = useCB(() => {
    if (!selected) return;
    addRecord(selected.badge, t.quickAddQty, 0, pack);
    setSelBadge(null); // deselect after adding
  }, [selected, t.quickAddQty, pack, addRecord]);

  const openWaste = useCB(() => setDialog("waste"), []);
  const openPickup = useCB(() => setDialog("pickup"), []);

  const onUndo = (toast) => {
    const u = toast.undo;
    if (!u) return;
    setPickers((cur) => cur.map((p) => {
      if (p.badge !== u.badge) return p;
      const records = p.records.filter((r) => r.id !== u.recId);
      const lastAddedTs = records.length ? records[records.length - 1].ts : p.lastAddedTs;
      return { ...p, records, lastAddedTs };
    }));
    dismiss(toast.id);
    pushToast({ mini: true, title: "Removed from " + u.badge, ttl: 1800 });
  };

  /* ---- field waste -> random worker ---- */
  const onAddWaste = (kg) => {
    const i = Math.floor(Math.random() * pickers.length);
    const badge = pickers[i].badge;
    const rec = { id: badge + "-w" + Date.now(), ts: Date.now(), type: pack.short, waste: true, kg, trays: 0, punnets: 0 };
    setPickers((cur) => cur.map((p) => p.badge === badge ? { ...p, records: [...p.records, rec] } : p));
    pushToast({ title: kg + " kg waste logged", sub: "Recorded for the field" });
  };

  /* ---- pickup ---- */
  const onRequestPickup = (cls) => {
    setPickups((cur) => ({ ...cur, [cls]: Date.now() }));
    pushToast({ title: cls + " pickup requested", sub: "Collection is on the way" });
  };
  const resetPickups = () => {setPickups({});pushToast({ mini: true, title: "Pickups reset", ttl: 1600 });};

  const onLongPress = (p, rect) => {
    setPop({ badge: p.badge, anchor: { left: rect.left, top: rect.top, width: rect.width } });
  };

  /* ---- record edit / remove + picker tool dialogs ---- */
  const onRemoveRecord = (badge, recId) => {
    // save removed record for sign-out audit trail
    const src = pickers.find((p) => p.badge === badge);
    const rec = src ? src.records.find((r) => r.id === recId) : null;
    if (rec) setRemovedRecs((rm) => ({ ...rm, [badge]: [...(rm[badge] || []), rec] }));
    setPickers((cur) => cur.map((p) => p.badge !== badge ?
    p :
    { ...p, records: p.records.filter((r) => r.id !== recId) }));
    pushToast({ mini: true, title: "Entry removed from " + badge, ttl: 1700 });
  };

  const onSavePickerTimes = (badge, times) => setPickerTimes((cur) => ({ ...cur, [badge]: times }));
  const onRemovePicker = (badge) => {
    setPickers((cur) => cur.filter((p) => p.badge !== badge));
    pushToast({ mini: true, title: "Picker " + badge + " removed from field", ttl: 1800 });
  };

  const onSignOut = (badge, sig) => {
    setSignedOut((cur) => ({ ...cur, [badge]: { ts: Date.now(), sig } }));
    setPop(null);
    pushToast({ mini: true, title: "Signed out — " + badge, ttl: 2200 });
  };
  const onUnlock = (badge) => {
    setSignedOut((cur) => {const n = { ...cur };delete n[badge];return n;});
    pushToast({ mini: true, title: "Sign-out removed — " + badge, ttl: 1800 });
  };
  const openTool = (kind, picker) => {
    setPop(null);
    setDlgPicker(picker || null);
    setToolDlg(kind);
  };

  const stub = (name) => pushToast({ mini: true, title: name + " — coming soon", ttl: 1900 });
  const changeTab = (next) => {setTab(next);setPop(null);setSelBadge(null);};

  const popPicker = pop ? pickers.find((p) => p.badge === pop.badge) : null;

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <div className="mark">M</div>
          <div>
            <div className="name">Field Mockup</div>
            <div className="field">North Block 4 · Strawberries</div>
          </div>
        </div>
        <div className="tabs">
          <button className={"tab" + (tab === "info" ? " active" : "")} onClick={() => changeTab("info")}>Field Info</button>
          <button className={"tab" + (tab === "setup" ? " active" : "")} onClick={() => changeTab("setup")}>Field Setup</button>
          <button className={"tab" + (tab === "picking" ? " active" : "")} onClick={() => changeTab("picking")}>Picking Entry</button>
          <button className={"tab" + (tab === "rates" ? " active" : "")} onClick={() => changeTab("rates")}>Picking Rates</button>
        </div>
        <button
          className={"badge-toggle" + (!showBadges ? " off" : "")}
          onClick={() => setShowBadges((v) => !v)}
          title={showBadges ? "Hide status badges" : "Show status badges"}>
          
            {showBadges ? <Icon.eye /> : <Icon.eyeOff />}
          </button>
          <Clock />
      </div>

      <div className="panel">
        {tab === "info" &&
        <FieldInfo
          start={startTime}
          pickers={pickers} packsPerTray={t.packsPerTray} />

        }

        {tab === "picking" &&
        <React.Fragment>
            <div className="grid-area">
              <div className="grid-wrap">
                <div className="grid" style={{ "--cols": t.columns }}>
                  {pickers.map((p) =>
                <PickerCard
                  key={p.badge}
                  p={p}
                  st={stats[p.badge]}
                  now={now}
                  selected={selBadge === p.badge}
                  anySelected={selBadge !== null}
                  onSelect={(pp) => {
                    if (signedOut[pp.badge]) {setUnlockBadge(pp.badge);return;}
                    setSelBadge((cur) => cur === pp.badge ? null : pp.badge);
                  }}
                  onLongPress={onLongPress}
                  showBadges={showBadges && !selBadge}
                  isSignedOut={!!signedOut[p.badge]} />

                )}
                </div>
              </div>
              <ToastStack toasts={toasts} onUndo={onUndo} filter={(t) => !!t.undo} />
            </div>
            <Footer
            selected={selected}
            selSt={stats[selBadge]}
            packId={packId} setPackId={setPackId}
            trays={trays} setTrays={setTrays}
            punnets={punnets} setPunnets={setPunnets}
            onAdd={onAdd}
            quickQty={t.quickAddQty}
            onQuick={onQuick}
            onEditWaste={openWaste}
            onPickup={openPickup}
            pickups={pickups}
            totals={fieldTotals}
            onClose={() => setSelBadge(null)} />
          
          </React.Fragment>
        }

        {tab === "rates" && <PickingRates pickers={pickers} stats={stats} />}

        {tab === "setup" &&
        <FieldSetup
          start={startTime} setStart={setStartTime}
          stop={stopTime} setStop={setStopTime}
          breakMins={breakMins} setBreakMins={setBreakMins}
          pickers={pickers} stats={stats} packsPerTray={t.packsPerTray}
          onStub={stub}
          onComplete={() => setDialog("complete")}
          onAddRemove={() => setDialog("addremove")}
          timesLocked={fieldTimesLocked} />

        }
      </div>

      <ToastStack toasts={toasts} onUndo={onUndo} filter={(t) => !t.undo} className="toast-global" />

      {popPicker &&
      <RecordsPopover
        p={popPicker} st={stats[popPicker.badge]} now={now} start={startTime} stop={stopTime}
        pickerTimes={pickerTimes} anchor={pop.anchor}
        onClose={() => setPop(null)}
        onRemoveRecord={onRemoveRecord}
        onOpen={openTool} />

      }
      {dialog === "workers" && <WorkersDialog onClose={() => setDialog(null)} />}
      {dialog === "addremove" &&
      <AddRemovePickersDialog
        onClose={() => setDialog(null)}
        pickers={pickers} stats={stats}
        signedOut={signedOut} pickerTimes={pickerTimes}
        startTime={startTime} stopTime={stopTime}
        onRemovePicker={onRemovePicker}
        onOpenSignOut={(p) => {setDialog(null);setDlgPicker(p);setToolDlg("signout");}}
        onOpenEditTimes={(p) => {setDialog(null);setDlgPicker(p);setToolDlg("edittime");}} />

      }
      {dialog === "waste" && <WasteDialog onClose={() => setDialog(null)} onAdd={onAddWaste} />}
      {dialog === "pickup" && <RequestPickupDialog onClose={() => setDialog(null)} onRequest={onRequestPickup} />}
      {dialog === "complete" && <CompleteFieldDialog onClose={() => setDialog(null)} onConfirm={() => setStopTime(clockOf(Date.now()))} />}
      {toolDlg === "edittime" && dlgPicker &&
      <EditTimesDialog
        picker={pickers.find((px) => px.badge === dlgPicker.badge) || dlgPicker}
        fieldStart={startTime} fieldStop={stopTime} fieldBreak={breakMins}
        pickerTimes={pickerTimes}
        onClose={() => {setToolDlg(null);setDlgPicker(null);}}
        onSave={onSavePickerTimes} />

      }
      {toolDlg === "signout" && dlgPicker &&
      <SignOutDialog
        picker={pickers.find((px) => px.badge === dlgPicker.badge) || dlgPicker}
        records={(pickers.find((px) => px.badge === dlgPicker.badge) || dlgPicker).records || []}
        removedRecs={removedRecs[dlgPicker.badge] || []}
        st={stats[dlgPicker.badge]}
        packsPerTray={t.packsPerTray}
        fieldStart={startTime} fieldStop={stopTime} fieldBreak={breakMins}
        pickerTimes={pickerTimes}
        onClose={() => {setToolDlg(null);setDlgPicker(null);}}
        onConfirmSignOut={onSignOut} />

      }
      {toolDlg && toolDlg !== "signout" && toolDlg !== "edittime" &&
      <PickerToolDialog kind={toolDlg} picker={dlgPicker} onClose={() => {setToolDlg(null);setDlgPicker(null);}} />
      }
      {unlockBadge && pickers.find((x) => x.badge === unlockBadge) &&
      <UnlockConfirmDialog
        picker={pickers.find((x) => x.badge === unlockBadge)}
        onClose={() => setUnlockBadge(null)}
        onConfirm={() => onUnlock(unlockBadge)} />

      }

      <TweaksPanel>
        <TweakSection label="Entry" />
        <TweakNumber label="Quick-add default (trays)" value={t.quickAddQty} min={1} max={50} step={1}
        onChange={(v) => setTweak("quickAddQty", v)} />
        <TweakSection label="Grid" />
        <TweakRadio label="Columns" value={t.columns} options={[4, 5, 6]}
        onChange={(v) => setTweak("columns", Number(v))} />
        <TweakToggle label="Live 'last added' timers" value={t.liveTimers}
        onChange={(v) => setTweak("liveTimers", v)} />
        <TweakSection label="Rates &amp; flags" />
        <TweakNumber label="Packs / tray" value={t.packsPerTray} min={4} max={16} step={1}
        onChange={(v) => setTweak("packsPerTray", v)} />
        <TweakNumber label="Min wage (£/hr)" value={t.minWage} min={8} max={20} step={0.01}
        onChange={(v) => setTweak("minWage", v)} />
        <TweakNumber label="Piece rate (£/kg)" value={t.pieceRate} min={0.5} max={6} step={0.1}
        onChange={(v) => setTweak("pieceRate", v)} />
        <TweakSection label="Pickups" />
        <TweakButton label="Reset pickups on the way" onClick={resetPickups} secondary />
      </TweaksPanel>
    </div>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);