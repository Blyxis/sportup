import { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SK = "sportup_v1";

const seed = { groups: [], sessions: [] };

const uid = () => Date.now() + Math.random();
function fmt(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Similarité de noms (Levenshtein normalisé) ─────────────────────────
function normalize(s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,""); }
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, (_, i) => Array.from({length: n+1}, (_, j) => i===0?j:j===0?i:0));
  for (let i=1;i<=m;i++) for (let j=1;j<=n;j++) dp[i][j] = a[i-1]===b[j-1] ? dp[i-1][j-1] : 1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}
function isSimilar(a, b) {
  const na = normalize(a), nb = normalize(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const dist = levenshtein(na, nb);
  const maxLen = Math.max(na.length, nb.length);
  return maxLen > 0 && dist / maxLen < 0.35;
}
function findSimilarExos(db, name, excludeGroupId, excludeExoId) {
  const matches = [];
  db.groups.forEach(g => {
    g.exercises.forEach(e => {
      if (e.id === excludeExoId) return;
      if (isSimilar(e.name, name)) matches.push({ exo: e, group: g });
    });
  });
  return matches;
}

// ── Palette minimaliste ────────────────────────────────────────────────
const C = {
  bg: "#0a0a0a",
  surface: "#141414",
  card: "#1a1a1a",
  border: "#272727",
  borderLight: "#333",
  text: "#f0f0f0",
  muted: "#6b6b6b",
  faint: "#3a3a3a",
  accent: "#8b9dcc",
  accentDim: "#1e2540",
  accentText: "#b8c5e8",
  green: "#7aaa8a",
  greenDim: "#1a2820",
  greenText: "#a8c8b0",
  danger: "#c47070",
  dangerDim: "#2a1818",
  font: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
};

// ── CSS global + transitions ───────────────────────────────────────────
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0a0a0a; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }
  button { transition: background 0.1s ease, border-color 0.1s ease, opacity 0.1s ease, transform 0.1s ease; }
  button:active { opacity: 0.7; transform: scale(0.97); }
  input:focus { outline: none; border-color: #8b9dcc !important; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(8px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .page-enter { animation: slideUp 0.16s ease both; }
  .slide-in   { animation: slideIn 0.14s ease both; }
`;

const S = {
  app: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: C.font, maxWidth: 480, margin: "0 auto", paddingBottom: 80 },
  hdr: { borderBottom: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: C.bg, zIndex: 10 },
  body: { padding: "20px" },
  h1: { fontSize: 26, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.15, marginBottom: 4, color: C.text },
  sub: { fontSize: 13, color: C.muted, marginBottom: 24 },
  sec: { fontSize: 10, fontWeight: 600, color: C.faint, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12, marginTop: 24 },
  btn: { background: C.accent, color: "#0a0f1e", border: "none", borderRadius: 10, padding: "14px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: C.font, width: "100%", marginBottom: 10, display: "block", letterSpacing: 0.2 },
  btnGreen: { background: C.green, color: "#0a1410", border: "none", borderRadius: 10, padding: "14px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: C.font, width: "100%", marginBottom: 10, display: "block" },
  btnSmall: (color) => ({ background: color || C.surface, color: color ? "#0a0a0a" : C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: C.font }),
  ghost: { background: "transparent", color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: C.font, width: "100%", marginBottom: 10, display: "block" },
  danger: { background: "none", color: C.danger, border: `1px solid ${C.dangerDim}`, borderRadius: 8, padding: "11px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: C.font, width: "100%", marginTop: 8 },
  input: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "12px 14px", fontSize: 15, width: "100%", fontFamily: C.font, outline: "none", transition: "border-color 0.15s" },
  back: { background: "none", border: "none", color: C.muted, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: C.font, padding: 0, marginBottom: 20, display: "flex", alignItems: "center", gap: 4 },
  navBtn: (active) => ({ background: "none", border: "none", color: active ? C.text : C.muted, fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: C.font, padding: "4px 0", borderBottom: active ? `1.5px solid ${C.accent}` : "1.5px solid transparent", transition: "color 0.15s, border-color 0.15s", paddingBottom: 2 }),
  tag: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", fontSize: 12, color: C.muted, textAlign: "center", minWidth: 52 },
  tagVal: { fontSize: 15, fontWeight: 700, color: C.text, display: "block" },
  tagLabel: { fontSize: 9, color: C.faint, display: "block", marginTop: 1, textTransform: "uppercase", letterSpacing: 1 },
  statBox: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 10px", textAlign: "center" },
  statNum: { fontSize: 28, fontWeight: 800, color: C.accent, lineHeight: 1 },
  statLabel: { fontSize: 10, color: C.faint, marginTop: 3, textTransform: "uppercase", letterSpacing: 1 },
  toggle: (active) => ({ flex: 1, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: C.font, background: active ? C.accentDim : C.surface, color: active ? C.accentText : C.muted, border: `1px solid ${active ? C.accent : C.border}`, transition: "all 0.15s" }),
};

// ── Logo Sport'Up ──────────────────────────────────────────────────────
function Logo({ onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 7, cursor: onClick ? "pointer" : "default" }}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8924a"/>
            <stop offset="55%" stopColor="#d07840"/>
            <stop offset="100%" stopColor="#f2ede6"/>
          </linearGradient>
        </defs>
        {/* Plaques gauche */}
        <rect x="1" y="7" width="5.5" height="14" rx="2" fill="url(#dg)"/>
        <rect x="6" y="9.5" width="3.5" height="9" rx="1.5" fill="url(#dg)"/>
        {/* Barre centrale */}
        <rect x="9.5" y="12" width="9" height="4" rx="1.5" fill="url(#dg)"/>
        {/* Plaques droite */}
        <rect x="18.5" y="9.5" width="3.5" height="9" rx="1.5" fill="url(#dg)"/>
        <rect x="21.5" y="7" width="5.5" height="14" rx="2" fill="url(#dg)"/>
      </svg>
      <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.3, background: "linear-gradient(135deg, #e8924a 0%, #d07840 40%, #f0ece6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        Sport'Up
      </span>
    </div>
  );
}

// ── Card ───────────────────────────────────────────────────────────────
function Card({ onClick, children, style }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ border: `1px solid ${hov && onClick ? C.borderLight : C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: onClick ? "pointer" : "default", transition: "border-color 0.12s, background 0.12s", background: hov && onClick ? "#1e1e1e" : C.card, ...style }}
      onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </div>
  );
}

// ── Stepper ────────────────────────────────────────────────────────────
function Stepper({ label, value, onChange, step = 1, min = 0, unit = "" }) {
  const dec = () => onChange(Math.max(min, Math.round((parseFloat(value || 0) - step) * 100) / 100));
  const inc = () => onChange(Math.round((parseFloat(value || 0) + step) * 100) / 100);
  const btnS = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 38, height: 38, fontSize: 20, fontWeight: 300, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: C.font };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontSize: 10, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button style={btnS} onClick={dec}>−</button>
        <div style={{ textAlign: "center" }}>
          <input type="number" value={value} onChange={e => onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
            style={{ ...S.input, textAlign: "center", fontSize: 22, fontWeight: 800, padding: "6px 4px", width: 68, border: "none", background: "transparent" }} />
          {unit && <div style={{ fontSize: 10, color: C.faint, marginTop: -4 }}>{unit}</div>}
        </div>
        <button style={btnS} onClick={inc}>+</button>
      </div>
    </div>
  );
}

// ── Calendar ───────────────────────────────────────────────────────────
function Calendar({ calDate, setCalDate, sessions }) {
  const y = calDate.getFullYear(), m = calDate.getMonth();
  const first = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = new Date();
  const sessionDays = new Set(sessions.map(s => { const d = new Date(s.date); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; }));
  const cells = [];
  const offset = (first + 6) % 7;
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return (
    <Card style={{ marginBottom: 20, cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <button onClick={() => setCalDate(new Date(y, m - 1, 1))} style={S.back}>←</button>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{calDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
        <button onClick={() => setCalDate(new Date(y, m + 1, 1))} style={S.back}>→</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {["L","M","M","J","V","S","D"].map((d, i) => <div key={i} style={{ fontSize: 10, color: C.faint, textAlign: "center", paddingBottom: 6, fontWeight: 600 }}>{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = `${y}-${m}-${d}`;
          const isT = today.getDate() === d && today.getMonth() === m && today.getFullYear() === y;
          const isSel = calDate.getDate() === d && calDate.getMonth() === m && calDate.getFullYear() === y;
          const hasSess = sessionDays.has(iso);
          return (
            <div key={i} onClick={() => setCalDate(new Date(y, m, d))} style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: isSel || isT ? 700 : 400, cursor: "pointer", borderRadius: 7, background: isSel ? C.accent : hasSess ? C.accentDim : "transparent", color: isSel ? "#0a0f1e" : isT ? C.accentText : hasSess ? C.accentText : C.muted, border: isT && !isSel ? `1px solid ${C.accent}` : "1px solid transparent", transition: "background 0.1s" }}>
              {d}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: C.muted, textAlign: "right", marginTop: 10 }}>
        Séance le <span style={{ color: C.text, fontWeight: 600 }}>{calDate.toLocaleDateString("fr-FR")}</span>
      </div>
    </Card>
  );
}

// ── LogFormWidget — poids ET reps modifiables par série ────────────────
function LogFormWidget({ logForm, setLogForm, exo }) {
  const mode = logForm.mode || "reps";
  const series = parseInt(logForm.series) || 1;
  const isBodyweight = exo?.bodyweight;

  // Normalise les sets en objets {reps, kg} ou {reps, leste}
  function buildSets(n, existing, defReps, defKg, defLeste) {
    const arr = [];
    for (let i = 0; i < n; i++) {
      const ex = existing && existing[i];
      if (ex && typeof ex === "object") {
        arr.push(ex);
      } else {
        const r = typeof ex === "number" ? ex : (parseInt(defReps) || 10);
        arr.push(isBodyweight ? { reps: r, leste: parseFloat(defLeste) || 0 } : { reps: r, kg: parseFloat(defKg) || 0 });
      }
    }
    return arr;
  }

  const currentSets = buildSets(series, logForm.sets, logForm.reps, logForm.kg, logForm.leste);

  function updateSeries(v) {
    const n = Math.max(1, parseInt(v) || 1);
    const newSets = buildSets(n, currentSets, logForm.reps, logForm.kg, logForm.leste);
    setLogForm({ ...logForm, series: n, sets: newSets });
  }

  function updateReps(idx, delta) {
    const s = currentSets.map((x, i) => i === idx ? { ...x, reps: Math.max(0, (x.reps || 0) + delta) } : x);
    setLogForm({ ...logForm, sets: s });
  }

  function updateWeight(idx, delta) {
    const s = currentSets.map((x, i) => {
      if (i !== idx) return x;
      return isBodyweight
        ? { ...x, leste: Math.max(0, Math.round(((x.leste || 0) + delta) * 10) / 10) }
        : { ...x, kg: Math.max(0, Math.round(((x.kg || 0) + delta) * 10) / 10) };
    });
    setLogForm({ ...logForm, sets: s });
  }

  // Appliquer un poids global à toutes les séries
  function applyGlobalWeight(val) {
    const parsed = parseFloat(val) || 0;
    const s = currentSets.map(x => isBodyweight ? { ...x, leste: parsed } : { ...x, kg: parsed });
    setLogForm({ ...logForm, sets: s, kg: parsed, leste: parsed });
  }

  const globalWeight = currentSets.length > 0
    ? (isBodyweight ? (currentSets[0].leste || 0) : (currentSets[0].kg || 0))
    : 0;

  const iconBtn = (onClick) => ({
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 6,
    width: 28, height: 28, color: C.text, cursor: "pointer", fontSize: 16,
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.font
  });

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button style={S.toggle(mode === "reps")} onClick={() => setLogForm({ ...logForm, mode: "reps" })}>💪 Reps / Poids</button>
        <button style={S.toggle(mode === "time")} onClick={() => setLogForm({ ...logForm, mode: "time" })}>⏱ Temps</button>
      </div>

      {mode === "reps" && (
        <>
          {/* Séries */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
            <Stepper label="Séries" value={logForm.series} onChange={updateSeries} step={1} min={1} />
          </div>

          {/* Poids global rapide */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
              {isBodyweight ? "Leste (appliqué à toutes)" : "Poids global (toutes les séries)"}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => applyGlobalWeight(Math.max(0, Math.round((globalWeight - 2.5) * 10) / 10))} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, width: 34, height: 34, color: C.text, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <div style={{ flex: 1, textAlign: "center", fontSize: 18, fontWeight: 800 }}>
                {isBodyweight ? (globalWeight > 0 ? `+${globalWeight}kg` : "PDC") : `${globalWeight}kg`}
              </div>
              <button onClick={() => applyGlobalWeight(Math.round((globalWeight + 2.5) * 10) / 10)} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, width: 34, height: 34, color: C.text, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
          </div>

          {/* Tableau séries */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 10, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
              Détail par série
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {currentSets.map((s, idx) => {
                const w = isBodyweight ? (s.leste || 0) : (s.kg || 0);
                return (
                  <div key={idx} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                    {/* Numéro */}
                    <div style={{ fontSize: 10, color: C.faint, fontWeight: 700, minWidth: 22, textTransform: "uppercase", letterSpacing: 1 }}>S{idx+1}</div>

                    {/* Reps */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: C.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Reps</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => updateReps(idx, -1)} style={iconBtn()}>−</button>
                        <div style={{ fontSize: 18, fontWeight: 800, minWidth: 28, textAlign: "center" }}>{s.reps || 0}</div>
                        <button onClick={() => updateReps(idx, 1)} style={iconBtn()}>+</button>
                      </div>
                    </div>

                    <div style={{ width: 1, height: 34, background: C.border, flexShrink: 0 }} />

                    {/* Poids */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 9, color: C.faint, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>{isBodyweight ? "Leste" : "Poids"}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => updateWeight(idx, -2.5)} style={iconBtn()}>−</button>
                        <div style={{ fontSize: 14, fontWeight: 800, minWidth: 44, textAlign: "center", color: isBodyweight && w === 0 ? C.muted : C.text }}>
                          {isBodyweight ? (w > 0 ? `+${w}` : "PDC") : `${w}`}
                          {!isBodyweight && <span style={{ fontSize: 10, color: C.faint, fontWeight: 400 }}>kg</span>}
                        </div>
                        <button onClick={() => updateWeight(idx, 2.5)} style={iconBtn()}>+</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {mode === "time" && (
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 24 }}>
          <Stepper label="Séries" value={logForm.series} onChange={v => setLogForm({ ...logForm, series: Math.max(1, parseInt(v) || 1) })} step={1} min={1} />
          <Stepper label="Minutes" value={logForm.timeMin || 0} onChange={v => setLogForm({ ...logForm, timeMin: Math.max(0, parseInt(v) || 0) })} step={1} min={0} unit="min" />
          <Stepper label="Secondes" value={logForm.timeSec || 0} onChange={v => setLogForm({ ...logForm, timeSec: Math.min(59, Math.max(0, parseInt(v) || 0)) })} step={5} min={0} unit="sec" />
        </div>
      )}

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 10, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Note (optionnel)</div>
        <input style={S.input} placeholder="Sensation, fatigue…" value={logForm.note || ""} onChange={e => setLogForm({ ...logForm, note: e.target.value })} />
      </div>
    </div>
  );
}

// ── PerfTags ───────────────────────────────────────────────────────────
function PerfTags({ entry, isBodyweight: bwProp }) {
  const mode = entry.mode || "reps";
  const isBodyweight = bwProp !== undefined ? bwProp : (entry.bodyweight || (entry.leste !== undefined && entry.kg === undefined));

  if (mode === "time") {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <div style={S.tag}><span style={S.tagVal}>{entry.series || "—"}</span><span style={S.tagLabel}>SÉRIES</span></div>
        <div style={S.tag}><span style={S.tagVal}>{entry.timeMin || 0}:{String(entry.timeSec || 0).padStart(2,"0")}</span><span style={S.tagLabel}>TEMPS</span></div>
        {entry.note && <div style={{ fontSize: 11, color: C.muted, alignSelf: "center", fontStyle: "italic" }}>💬 {entry.note}</div>}
      </div>
    );
  }

  const sets = entry.sets || [];
  const isNewFormat = sets.length > 0 && typeof sets[0] === "object";

  if (isNewFormat) {
    // Regrouper les séries ayant mêmes reps+poids
    const groups = [];
    sets.forEach(s => {
      const w = isBodyweight ? (s.leste || 0) : (s.kg || 0);
      const key = `${s.reps}-${w}`;
      const last = groups[groups.length - 1];
      if (last && last.key === key) { last.count++; }
      else { groups.push({ key, reps: s.reps, w, count: 1 }); }
    });
    return (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
        {groups.map((g, i) => (
          <div key={i} style={{ ...S.tag, minWidth: "auto", padding: "5px 9px" }}>
            <span style={{ ...S.tagVal, fontSize: 12 }}>
              {g.count > 1 ? `${g.count}×` : ""}{g.reps}<span style={{ fontSize: 10, color: C.faint, fontWeight: 400 }}>r</span>
              {" "}<span style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>
                {isBodyweight ? (g.w > 0 ? `+${g.w}kg` : "PDC") : `${g.w}kg`}
              </span>
            </span>
          </div>
        ))}
        {entry.note && <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>💬 {entry.note}</div>}
      </div>
    );
  }

  // Legacy
  const setsStr = sets.length > 0 ? sets.join(" / ") : (entry.reps || "—");
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
      <div style={S.tag}><span style={S.tagVal}>{entry.series || "—"}</span><span style={S.tagLabel}>SÉRIES</span></div>
      <div style={{ ...S.tag, minWidth: "auto" }}><span style={{ ...S.tagVal, fontSize: 13 }}>{setsStr}</span><span style={S.tagLabel}>REPS</span></div>
      {isBodyweight
        ? <div style={S.tag}><span style={{ ...S.tagVal, color: C.greenText, fontSize: 13 }}>PDC{entry.leste > 0 ? ` +${entry.leste}kg` : ""}</span><span style={S.tagLabel}>POIDS</span></div>
        : <div style={S.tag}><span style={S.tagVal}>{entry.kg || "—"}</span><span style={S.tagLabel}>KG</span></div>
      }
      {entry.note && <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic" }}>💬 {entry.note}</div>}
    </div>
  );
}

// ── ExoSettingsCard ────────────────────────────────────────────────────
function ExoSettingsCard({ exo, onSave, onDelete, onNavigate }) {
  const [open, setOpen] = useState(false);
  const [bw, setBw] = useState(exo.bodyweight || false);
  const [kg, setKg] = useState(exo.defaultKg || 0);
  const [leste, setLeste] = useState(exo.defaultLeste || 0);

  function save() {
    onSave({ ...exo, bodyweight: bw, defaultKg: bw ? 0 : kg, defaultLeste: bw ? leste : 0 });
    setOpen(false);
  }

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 10 }}>
        <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onNavigate(exo.id)}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{exo.name}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
            {exo.bodyweight ? `Poids du corps${exo.defaultLeste > 0 ? ` · leste ${exo.defaultLeste}kg` : ""}` : (exo.defaultKg > 0 ? `Poids habituel : ${exo.defaultKg}kg` : "Pas de poids défini")}
          </div>
          {exo.canonicalId && <div style={{ fontSize: 10, color: C.accent, marginTop: 3 }}>🔗 Données partagées</div>}
        </div>
        <button onClick={() => setOpen(!open)} style={{ background: open ? C.accentDim : C.surface, border: `1px solid ${open ? C.accent : C.border}`, borderRadius: 8, padding: "6px 12px", color: open ? C.accentText : C.muted, fontSize: 12, cursor: "pointer", fontFamily: C.font, fontWeight: 600, transition: "all 0.15s" }}>
          {open ? "Fermer" : "⚙️"}
        </button>
        <span style={{ color: C.faint, fontSize: 18, cursor: "pointer" }} onClick={() => onNavigate(exo.id)}>›</span>
      </div>

      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }} className="slide-in">
          <div style={{ paddingTop: 14 }}>
            <div style={{ fontSize: 10, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Type de poids</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button style={S.toggle(!bw)} onClick={() => setBw(false)}>🏋️ Poids en kg</button>
              <button style={S.toggle(bw)} onClick={() => setBw(true)}>🧍 Poids du corps</button>
            </div>
            {!bw && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Poids habituel</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setKg(v => Math.max(0, Math.round((v - 2.5) * 10) / 10))} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 38, height: 38, fontSize: 18, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <input type="number" value={kg} onChange={e => setKg(parseFloat(e.target.value) || 0)} style={{ ...S.input, textAlign: "center", fontSize: 18, fontWeight: 800, width: 90 }} />
                  <span style={{ color: C.muted, fontSize: 13 }}>kg</span>
                  <button onClick={() => setKg(v => Math.round((v + 2.5) * 10) / 10)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 38, height: 38, fontSize: 18, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            )}
            {bw && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>Leste par défaut</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setLeste(v => Math.max(0, Math.round((v - 2.5) * 10) / 10))} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 38, height: 38, fontSize: 18, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <input type="number" value={leste} onChange={e => setLeste(parseFloat(e.target.value) || 0)} style={{ ...S.input, textAlign: "center", fontSize: 18, fontWeight: 800, width: 90 }} />
                  <span style={{ color: C.muted, fontSize: 13 }}>kg</span>
                  <button onClick={() => setLeste(v => Math.round((v + 2.5) * 10) / 10)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 38, height: 38, fontSize: 18, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} style={{ ...S.btnSmall(C.green), flex: 1, padding: "10px" }}>✓ Enregistrer</button>
              <button onClick={() => onDelete(exo.id)} style={{ background: "none", color: C.danger, border: `1px solid ${C.dangerDim}`, borderRadius: 8, padding: "10px 14px", fontSize: 13, cursor: "pointer", fontFamily: C.font }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────
export default function App() {
  const [db, setDb] = useState(null);
  const [view, setView] = useState("home");
  const [selGroupId, setSelGroupId] = useState(null);
  const [selExoId, setSelExoId] = useState(null);
  const [selSessionId, setSelSessionId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [calDate, setCalDate] = useState(new Date());
  const [showCal, setShowCal] = useState(false);
  const [newGName, setNewGName] = useState("");
  const [newEName, setNewEName] = useState("");
  const [logForm, setLogForm] = useState({ mode: "reps", series: 4, reps: 10, kg: 20, sets: [], leste: 0, timeMin: 1, timeSec: 0, note: "" });
  const [importConfirm, setImportConfirm] = useState(null);
  const [mergePrompt, setMergePrompt] = useState(null);
  const pageKey = useRef(0);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = globalCss;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(SK);
        setDb(r ? JSON.parse(r.value) : seed);
      } catch { setDb(seed); }
    })();
  }, []);

  async function saveDb(next) {
    setDb(next);
    try { await window.storage.set(SK, JSON.stringify(next)); } catch {}
  }

  function navigate(newView, fn) {
    pageKey.current += 1;
    if (fn) fn();
    setView(newView);
  }

  if (!db) return <div style={{ ...S.app, padding: 40, color: C.muted, fontSize: 14 }}>Chargement…</div>;

  const selGroup = db.groups.find(g => g.id === selGroupId) || null;
  const selSession = db.sessions.find(s => s.id === selSessionId) || null;

  function getCanonicalId(exoId) {
    let canon = null;
    db.groups.forEach(g => g.exercises.forEach(e => { if (e.id === exoId) canon = e.canonicalId || exoId; }));
    return canon || exoId;
  }
  function getAllLinkedIds(exoId) {
    const canon = getCanonicalId(exoId);
    const ids = new Set([exoId]);
    db.groups.forEach(g => g.exercises.forEach(e => {
      if (e.id === exoId || e.canonicalId === canon || e.id === canon) ids.add(e.id);
    }));
    return ids;
  }
  function perfsForExo(exoId) {
    const linkedIds = getAllLinkedIds(exoId);
    const res = [];
    db.sessions.forEach(s => (s.entries || []).forEach(e => {
      if (linkedIds.has(e.exoId)) res.push({ date: s.date, dateLabel: fmt(s.date), ...e });
    }));
    return res.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  function makeDefaultForm(exo, lastPerf) {
    const series = lastPerf ? (parseInt(lastPerf.series) || 4) : 4;
    const reps = lastPerf ? (parseInt(lastPerf.reps) || 10) : 10;
    const kg = lastPerf ? (lastPerf.kg !== undefined ? lastPerf.kg : (exo?.defaultKg || 0)) : (exo?.bodyweight ? 0 : (exo?.defaultKg || 20));
    const leste = lastPerf ? (lastPerf.leste !== undefined ? lastPerf.leste : (exo?.defaultLeste || 0)) : (exo?.defaultLeste || 0);
    const isBw = exo?.bodyweight;

    let newSets;
    if (lastPerf && lastPerf.sets && lastPerf.sets.length > 0) {
      newSets = lastPerf.sets.map(s => {
        if (typeof s === "object") return s;
        return isBw ? { reps: s, leste } : { reps: s, kg };
      });
      while (newSets.length < series) newSets.push(newSets[newSets.length - 1] || (isBw ? { reps, leste } : { reps, kg }));
      newSets = newSets.slice(0, series);
    } else {
      newSets = Array(series).fill(null).map(() => isBw ? { reps, leste } : { reps, kg });
    }

    return { mode: lastPerf?.mode || "reps", series, reps, kg, leste, sets: newSets, timeMin: lastPerf?.timeMin || 1, timeSec: lastPerf?.timeSec || 0, note: "" };
  }

  function addGroup() {
    if (!newGName.trim()) return;
    saveDb({ ...db, groups: [...db.groups, { id: uid(), name: newGName.trim().toUpperCase(), exercises: [] }] });
    setNewGName("");
  }
  function deleteGroup(gid) {
    saveDb({ ...db, groups: db.groups.filter(g => g.id !== gid) });
    navigate("groups", () => setSelGroupId(null));
  }
  function addExercise(forceName) {
    const name = (forceName || newEName).trim();
    if (!name || !selGroupId) return;
    const newExoId = uid();
    const newExo = { id: newExoId, name, defaultKg: 0, bodyweight: false, defaultLeste: 0 };
    const similar = findSimilarExos(db, name, selGroupId, null);
    if (similar.length > 0) {
      setMergePrompt({ newExo, groupId: selGroupId, matches: similar, linked: [] });
      setNewEName("");
      return;
    }
    saveDb({ ...db, groups: db.groups.map(g => g.id === selGroupId ? { ...g, exercises: [...g.exercises, newExo] } : g) });
    setNewEName("");
  }
  function confirmAddExercise(linkedIds) {
    if (!mergePrompt) return;
    const { newExo, groupId } = mergePrompt;
    let finalExo = { ...newExo };
    if (linkedIds.length > 0) {
      const firstLinked = linkedIds[0];
      let canon = firstLinked;
      db.groups.forEach(g => g.exercises.forEach(e => { if (e.id === firstLinked && e.canonicalId) canon = e.canonicalId; }));
      finalExo.canonicalId = canon;
    }
    saveDb({ ...db, groups: db.groups.map(g => g.id === groupId ? { ...g, exercises: [...g.exercises, finalExo] } : g) });
    setMergePrompt(null);
  }
  function updateExercise(gid, updatedExo) {
    saveDb({ ...db, groups: db.groups.map(g => g.id === gid ? { ...g, exercises: g.exercises.map(e => e.id === updatedExo.id ? updatedExo : e) } : g) });
  }
  function deleteExercise(gid, eid) {
    saveDb({ ...db, groups: db.groups.map(g => g.id === gid ? { ...g, exercises: g.exercises.filter(e => e.id !== eid) } : g) });
  }
  function deleteSession(sid) {
    saveDb({ ...db, sessions: db.sessions.filter(s => s.id !== sid) });
    navigate("history", () => setSelSessionId(null));
  }
  function startDoSession() {
    const name = `Séance ${calDate.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}`;
    setActiveSession({ id: uid(), name, date: calDate.toISOString(), entries: [], step: "pickGroup" });
    setImportConfirm(null);
    navigate("doSession");
  }
  function importGroup(gid) {
    const g = db.groups.find(x => x.id === gid);
    if (!g || g.exercises.length === 0) return;
    const queue = g.exercises.map(exo => {
      const perfs = perfsForExo(exo.id);
      const last = perfs[perfs.length - 1];
      return { exoId: exo.id, groupId: gid, form: makeDefaultForm(exo, last || null) };
    });
    const first = queue[0];
    setLogForm(first.form);
    setActiveSession(prev => ({ ...prev, step: "logExo", pickedGroup: gid, pickedExo: first.exoId, importQueue: queue.slice(1) }));
    setImportConfirm(null);
  }
  async function finishSession() {
    const sess = { id: activeSession.id, name: activeSession.name, date: activeSession.date, entries: activeSession.entries };
    await saveDb({ ...db, sessions: [sess, ...db.sessions] });
    setActiveSession(null);
    navigate("home");
  }
  function logEntry() {
    const g = db.groups.find(grp => grp.exercises.some(e => e.id === activeSession.pickedExo));
    const exo = g?.exercises.find(e => e.id === activeSession.pickedExo);
    const entry = { exoId: activeSession.pickedExo, bodyweight: exo?.bodyweight || false, ...logForm };
    const newEntries = [...activeSession.entries, entry];
    const queue = activeSession.importQueue || [];
    if (queue.length > 0) {
      const next = queue[0];
      setLogForm(next.form);
      setActiveSession({ ...activeSession, entries: newEntries, step: "logExo", pickedGroup: next.groupId, pickedExo: next.exoId, importQueue: queue.slice(1) });
    } else {
      setActiveSession({ ...activeSession, entries: newEntries, step: "pickGroup", pickedGroup: null, pickedExo: null, importQueue: [] });
    }
  }

  const navBar = (cur) => (
    <div style={S.hdr}>
      <Logo onClick={() => navigate("home")} />
      <div style={{ display: "flex", gap: 20 }}>
        <button style={S.navBtn(cur === "home")} onClick={() => navigate("home")}>Accueil</button>
        <button style={S.navBtn(cur === "history")} onClick={() => navigate("history")}>Historique</button>
        <button style={S.navBtn(cur === "groups")} onClick={() => { setNewGName(""); navigate("groups"); }}>Groupes</button>
      </div>
    </div>
  );

  // ── HOME ──────────────────────────────────────────────────────────────
  if (view === "home") return (
    <div style={S.app}>
      {navBar("home")}
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1.5 }}>
          {calDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <h1 style={S.h1}>Prêt à soulever ?</h1>
        <p style={S.sub}>{db.groups.length} groupe{db.groups.length > 1 ? "s" : ""} · {db.sessions.length} séance{db.sessions.length > 1 ? "s" : ""}</p>
        <button style={S.ghost} onClick={() => setShowCal(!showCal)}>
          {showCal ? "▲ Masquer le calendrier" : "📅 Choisir la date de la séance"}
        </button>
        {showCal && <Calendar calDate={calDate} setCalDate={setCalDate} sessions={db.sessions} />}
        <div style={S.sec}>Que veux-tu faire ?</div>
        <button style={S.btn} onClick={startDoSession}>💪 Démarrer une séance</button>
        <button style={S.ghost} onClick={() => { setNewGName(""); navigate("groups"); }}>✏️ Gérer mes groupes & exercices</button>
      </div>
    </div>
  );

  // ── GROUPS ────────────────────────────────────────────────────────────
  if (view === "groups") return (
    <div style={S.app}>
      {navBar("groups")}
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <h1 style={S.h1}>Mes groupes</h1>
        <p style={S.sub}>Banque d'exercices permanente</p>
        <div style={S.sec}>Nouveau groupe</div>
        <input style={{ ...S.input, marginBottom: 10 }} placeholder="ex : ÉPAULES, BRAS, CARDIO…" value={newGName}
          onChange={e => setNewGName(e.target.value)} onKeyDown={e => e.key === "Enter" && addGroup()} />
        <button style={{ ...S.btn, marginBottom: 24 }} onClick={addGroup}>+ Créer le groupe</button>
        <div style={S.sec}>Groupes existants</div>
        {db.groups.map(g => (
          <Card key={g.id} onClick={() => { setSelGroupId(g.id); setNewEName(""); navigate("group"); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{g.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{g.exercises.length} exercice{g.exercises.length > 1 ? "s" : ""}</div>
              </div>
              <span style={{ color: C.faint, fontSize: 18 }}>›</span>
            </div>
          </Card>
        ))}
        {db.groups.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>Aucun groupe. Crée-en un !</p>}
      </div>
    </div>
  );

  // ── GROUP DETAIL ──────────────────────────────────────────────────────
  if (view === "group" && selGroup) return (
    <div style={S.app}>
      {navBar("groups")}
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <button style={S.back} onClick={() => navigate("groups")}>← Groupes</button>
        <h1 style={S.h1}>{selGroup.name}</h1>
        <p style={S.sub}>{selGroup.exercises.length} exercice{selGroup.exercises.length > 1 ? "s" : ""}</p>
        <div style={S.sec}>Ajouter un exercice</div>

        {mergePrompt && mergePrompt.groupId === selGroupId && (
          <div style={{ background: C.accentDim, border: `1px solid ${C.accent}`, borderRadius: 12, padding: 16, marginBottom: 16 }} className="slide-in">
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Exercice similaire détecté</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
              <span style={{ color: C.text, fontWeight: 600 }}>"{mergePrompt.newExo.name}"</span> ressemble à :
            </div>
            {mergePrompt.matches.map(({ exo, group }) => {
              const isLinked = mergePrompt.linked.includes(exo.id);
              return (
                <div key={exo.id} style={{ display: "flex", alignItems: "center", gap: 10, background: isLinked ? C.greenDim : C.card, border: `1px solid ${isLinked ? C.green : C.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8, cursor: "pointer", transition: "all 0.15s" }}
                  onClick={() => {
                    const linked = isLinked ? mergePrompt.linked.filter(id => id !== exo.id) : [...mergePrompt.linked, exo.id];
                    setMergePrompt({ ...mergePrompt, linked });
                  }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${isLinked ? C.green : C.border}`, background: isLinked ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                    {isLinked && <span style={{ color: "#0a1410", fontSize: 12, fontWeight: 800 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{exo.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{group.name}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>
              {mergePrompt.linked.length > 0 ? "✓ Coché = historique & graphiques partagés" : "Coche les exercices identiques pour partager les données"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => confirmAddExercise(mergePrompt.linked)} style={{ flex: 1, background: C.green, color: "#0a1410", border: "none", borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: C.font }}>
                {mergePrompt.linked.length > 0 ? "✓ Lier & ajouter" : "Ajouter sans lier"}
              </button>
              <button onClick={() => setMergePrompt(null)} style={{ background: C.surface, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 16px", fontSize: 13, cursor: "pointer", fontFamily: C.font }}>Annuler</button>
            </div>
          </div>
        )}

        {!mergePrompt && (
          <>
            <input style={{ ...S.input, marginBottom: 10 }} placeholder="ex : Tractions, Tirage poulie…" value={newEName}
              onChange={e => setNewEName(e.target.value)} onKeyDown={e => e.key === "Enter" && addExercise()} />
            <button style={{ ...S.btn, marginBottom: 24 }} onClick={() => addExercise()}>+ Ajouter</button>
          </>
        )}

        <div style={S.sec}>Exercices</div>
        {selGroup.exercises.map(e => (
          <ExoSettingsCard key={e.id} exo={e}
            onSave={(updated) => updateExercise(selGroup.id, updated)}
            onDelete={(eid) => deleteExercise(selGroup.id, eid)}
            onNavigate={(eid) => { setSelExoId(eid); navigate("exo"); }}
          />
        ))}
        {selGroup.exercises.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>Aucun exercice. Ajoute-en un !</p>}
        <button style={S.danger} onClick={() => deleteGroup(selGroup.id)}>Supprimer le groupe "{selGroup.name}"</button>
      </div>
    </div>
  );

  // ── EXO STATS ─────────────────────────────────────────────────────────
  if (view === "exo") {
    const group = db.groups.find(g => g.exercises.some(e => e.id === selExoId));
    const exo = group?.exercises.find(e => e.id === selExoId);
    const perfs = perfsForExo(selExoId);
    const last = perfs[perfs.length - 1];
    const chartData = perfs.map(p => {
      let avgReps = 0, avgKg = 0;
      if (p.sets && p.sets.length > 0) {
        if (typeof p.sets[0] === "object") {
          avgReps = Math.round(p.sets.reduce((a, s) => a + (s.reps || 0), 0) / p.sets.length);
          avgKg = Math.round(p.sets.reduce((a, s) => a + (exo?.bodyweight ? (s.leste || 0) : (s.kg || 0)), 0) / p.sets.length * 10) / 10;
        } else {
          avgReps = Math.round(p.sets.reduce((a, b) => a + b, 0) / p.sets.length);
          avgKg = parseFloat(p.kg) || 0;
        }
      }
      return { date: p.dateLabel, kg: avgKg, reps: avgReps };
    });

    return (
      <div style={S.app}>
        {navBar("groups")}
        <div style={S.body} className="page-enter" key={pageKey.current}>
          <button style={S.back} onClick={() => navigate("group")}>← {group?.name}</button>
          <h1 style={S.h1}>{exo?.name}</h1>
          {exo?.bodyweight && (
            <div style={{ background: C.greenDim, border: `1px solid ${C.green}`, borderRadius: 8, padding: "7px 12px", fontSize: 12, color: C.greenText, fontWeight: 600, marginBottom: 12, display: "inline-block" }}>
              🧍 Poids du corps{exo.defaultLeste > 0 ? ` + leste ${exo.defaultLeste}kg` : ""}
            </div>
          )}
          <p style={S.sub}>{perfs.length} enregistrement{perfs.length > 1 ? "s" : ""}</p>

          {last && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
              <div style={S.statBox}><div style={S.statNum}>{last.series || "—"}</div><div style={S.statLabel}>SÉRIES</div></div>
              {last.mode === "time"
                ? <div style={S.statBox}><div style={{ ...S.statNum, fontSize: 18 }}>{last.timeMin}:{String(last.timeSec||0).padStart(2,"0")}</div><div style={S.statLabel}>TEMPS</div></div>
                : <div style={S.statBox}>
                    <div style={{ ...S.statNum, fontSize: 14 }}>
                      {last.sets && typeof last.sets[0] === "object" ? last.sets.map(s => s.reps).join("/") : (last.sets ? last.sets.join("/") : last.reps || "—")}
                    </div>
                    <div style={S.statLabel}>REPS</div>
                  </div>
              }
              <div style={S.statBox}>
                {exo?.bodyweight
                  ? <><div style={{ ...S.statNum, fontSize: 14, color: C.greenText }}>PDC{last.leste > 0 ? `+${last.leste}` : ""}</div><div style={S.statLabel}>POIDS</div></>
                  : <><div style={S.statNum}>{last.kg || "—"}</div><div style={S.statLabel}>KG</div></>
                }
              </div>
            </div>
          )}

          {chartData.length >= 2 && (
            <>
              {chartData.some(d => d.kg > 0) && (
                <>
                  <div style={S.sec}>{exo?.bodyweight ? "Progression leste" : "Progression poids (kg)"}</div>
                  <Card style={{ marginBottom: 20, cursor: "default", padding: "16px 8px 8px" }}>
                    <ResponsiveContainer width="100%" height={140}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: C.muted, fontFamily: C.font }} />
                        <YAxis tick={{ fontSize: 9, fill: C.muted, fontFamily: C.font }} width={30} />
                        <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 11, fontFamily: C.font, borderRadius: 8 }} />
                        <Line type="monotone" dataKey="kg" stroke={C.accent} strokeWidth={2} dot={{ fill: C.accent, r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              )}
              {chartData.some(d => d.reps > 0) && (
                <>
                  <div style={S.sec}>Progression reps (moy/série)</div>
                  <Card style={{ marginBottom: 24, cursor: "default", padding: "16px 8px 8px" }}>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: C.muted, fontFamily: C.font }} />
                        <YAxis tick={{ fontSize: 9, fill: C.muted, fontFamily: C.font }} width={30} />
                        <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 11, fontFamily: C.font, borderRadius: 8 }} />
                        <Line type="monotone" dataKey="reps" stroke={C.green} strokeWidth={2} dot={{ fill: C.green, r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              )}
            </>
          )}
          {chartData.length < 2 && <p style={{ color: C.muted, fontSize: 12, marginBottom: 20 }}>Encore {2 - chartData.length} séance{chartData.length === 0 ? "s" : ""} pour voir le graphique.</p>}

          {perfs.length > 0 && (
            <>
              <div style={S.sec}>Historique</div>
              {[...perfs].reverse().map((p, i) => (
                <Card key={i} style={{ cursor: "default" }}>
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4, fontWeight: 500 }}>{p.dateLabel}</div>
                  <PerfTags entry={p} isBodyweight={exo?.bodyweight} />
                </Card>
              ))}
            </>
          )}
          {perfs.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>Pas encore de données. Fais une séance !</p>}
          <button style={S.danger} onClick={() => { deleteExercise(group?.id, selExoId); navigate("group"); }}>Supprimer "{exo?.name}"</button>
        </div>
      </div>
    );
  }

  // ── SÉANCE EN COURS ───────────────────────────────────────────────────
  if (view === "doSession" && activeSession) {
    const step = activeSession.step;

    const SessionHeader = () => (
      <div style={S.hdr}>
        <Logo onClick={() => navigate("home")} />
        <span style={{ fontSize: 10, color: C.accentText, fontWeight: 700, background: C.accentDim, padding: "4px 10px", borderRadius: 20, letterSpacing: 1.5, textTransform: "uppercase" }}>En cours</span>
      </div>
    );

    const EntriesSummary = () => activeSession.entries.length > 0 ? (
      <div style={{ marginBottom: 20 }}>
        <div style={S.sec}>Déjà enregistré ({activeSession.entries.length})</div>
        {activeSession.entries.map((e, i) => {
          const g = db.groups.find(g => g.exercises.some(x => x.id === e.exoId));
          const exo = g?.exercises.find(x => x.id === e.exoId);
          return (
            <Card key={i} style={{ cursor: "default" }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{g?.name}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{exo?.name}</div>
              <PerfTags entry={e} isBodyweight={exo?.bodyweight} />
            </Card>
          );
        })}
      </div>
    ) : null;

    if (step === "pickGroup") return (
      <div style={S.app}>
        <SessionHeader />
        <div style={S.body} className="page-enter">
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginBottom: 4 }}>{fmt(activeSession.date)}</div>
          <h1 style={{ ...S.h1, marginBottom: 4 }}>{activeSession.name}</h1>
          <p style={S.sub}>{activeSession.entries.length} exercice{activeSession.entries.length > 1 ? "s" : ""}</p>
          <EntriesSummary />
          <div style={S.sec}>Ajouter des exercices</div>

          {importConfirm && (
            <div style={{ background: C.greenDim, border: `1px solid ${C.green}`, borderRadius: 12, padding: 16, marginBottom: 14 }} className="slide-in">
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                Importer tous les exos de {db.groups.find(g => g.id === importConfirm)?.name} ?
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
                {db.groups.find(g => g.id === importConfirm)?.exercises.length} exercice(s) pré-remplis.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => importGroup(importConfirm)} style={{ flex: 1, background: C.green, color: "#0a1410", border: "none", borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: C.font }}>✓ Importer</button>
                <button onClick={() => setImportConfirm(null)} style={{ flex: 1, background: C.surface, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px", fontSize: 13, cursor: "pointer", fontFamily: C.font }}>Annuler</button>
              </div>
            </div>
          )}

          {db.groups.map(g => (
            <div key={g.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ flex: 1, padding: "14px 16px", cursor: "pointer" }}
                  onClick={() => setActiveSession({ ...activeSession, step: "pickExo", pickedGroup: g.id })}>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{g.exercises.length} exo{g.exercises.length > 1 ? "s" : ""}</div>
                </div>
                <button
                  onClick={() => setImportConfirm(importConfirm === g.id ? null : g.id)}
                  style={{ background: importConfirm === g.id ? C.green : C.greenDim, color: importConfirm === g.id ? "#0a1410" : C.greenText, border: "none", borderLeft: `1px solid ${C.border}`, padding: "0 14px", height: "100%", minHeight: 56, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: C.font, whiteSpace: "nowrap", transition: "all 0.15s" }}>
                  ⚡ Tout
                </button>
              </div>
            </div>
          ))}
          {db.groups.length === 0 && <p style={{ color: C.muted, fontSize: 13, marginBottom: 16 }}>Aucun groupe. Crée d'abord des groupes.</p>}

          <div style={{ marginTop: 16 }}>
            <button style={S.btnGreen} onClick={finishSession}>✓ Terminer & sauvegarder</button>
            <button style={S.ghost} onClick={() => { setActiveSession(null); navigate("home"); }}>Annuler la séance</button>
          </div>
        </div>
      </div>
    );

    if (step === "pickExo") {
      const g = db.groups.find(x => x.id === activeSession.pickedGroup);
      return (
        <div style={S.app}>
          <SessionHeader />
          <div style={S.body} className="page-enter">
            <button style={S.back} onClick={() => setActiveSession({ ...activeSession, step: "pickGroup" })}>← Groupes</button>
            <h1 style={S.h1}>{g?.name}</h1>
            <p style={S.sub}>Choisir un exercice</p>
            {g?.exercises.map(e => {
              const perfs = perfsForExo(e.id);
              const last = perfs[perfs.length - 1];
              return (
                <Card key={e.id} onClick={() => {
                  setLogForm(makeDefaultForm(e, last || null));
                  setActiveSession({ ...activeSession, step: "logExo", pickedExo: e.id });
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{e.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                        {e.bodyweight ? "Poids du corps" : (e.defaultKg > 0 ? `Habituel : ${e.defaultKg}kg` : "")}
                        {last ? ` · Dernière fois : ${fmt(last.date)}` : ""}
                      </div>
                    </div>
                    {last && (
                      <div style={{ fontSize: 11, color: C.muted, textAlign: "right", flexShrink: 0 }}>
                        {last.sets && typeof last.sets[0] === "object" ? last.sets.map(s => s.reps).join("/") : (last.sets ? last.sets.join("/") : "")}<br />
                        {e.bodyweight ? (last.leste > 0 ? `+${last.leste}kg` : "PDC") : (last.kg ? `${last.kg}kg` : "")}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
            {g?.exercises.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>Aucun exercice dans ce groupe.</p>}
          </div>
        </div>
      );
    }

    if (step === "logExo") {
      const g = db.groups.find(x => x.id === activeSession.pickedGroup);
      const exo = g?.exercises.find(x => x.id === activeSession.pickedExo);
      const perfs = perfsForExo(activeSession.pickedExo);
      const last = perfs[perfs.length - 1];
      const queue = activeSession.importQueue || [];
      const totalInGroup = g?.exercises.length || 0;
      const doneInGroup = totalInGroup - queue.length - 1;
      const showProgress = queue.length > 0 || (activeSession.importQueue !== undefined && totalInGroup > 1 && doneInGroup >= 0);
      const nextExoName = queue.length > 0
        ? db.groups.find(x => x.id === queue[0]?.groupId)?.exercises.find(e => e.id === queue[0]?.exoId)?.name
        : null;
      return (
        <div style={S.app}>
          <SessionHeader />
          <div style={S.body} className="page-enter">
            <button style={S.back} onClick={() => setActiveSession({ ...activeSession, step: "pickGroup", importQueue: [] })}>← Retour</button>
            <h1 style={{ ...S.h1, marginBottom: 4 }}>{exo?.name}</h1>

            {showProgress && totalInGroup > 1 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>Import {g?.name}</span>
                  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{doneInGroup + 1} / {totalInGroup}</span>
                </div>
                <div style={{ background: C.border, borderRadius: 3, height: 3 }}>
                  <div style={{ background: C.accent, borderRadius: 3, height: 3, width: `${((doneInGroup + 1) / totalInGroup) * 100}%`, transition: "width 0.3s" }} />
                </div>
              </div>
            )}

            {last && (
              <Card style={{ cursor: "default", marginBottom: 20, background: C.greenDim, borderColor: C.green }}>
                <div style={{ fontSize: 11, color: C.greenText, fontWeight: 600, marginBottom: 4 }}>Dernière séance — {fmt(last.date)}</div>
                <PerfTags entry={last} isBodyweight={exo?.bodyweight} />
              </Card>
            )}
            <LogFormWidget logForm={logForm} setLogForm={setLogForm} exo={exo} />
            <div style={{ height: 20 }} />
            <button style={S.btn} onClick={logEntry}>
              {nextExoName ? `✓ Valider → ${nextExoName}` : "✓ Enregistrer cet exercice"}
            </button>
            <button style={S.ghost} onClick={() => setActiveSession({ ...activeSession, step: "pickGroup", importQueue: [] })}>
              {queue.length > 0 ? "Passer les exercices restants" : "Annuler"}
            </button>
          </div>
        </div>
      );
    }
  }

  // ── HISTORY ───────────────────────────────────────────────────────────
  if (view === "history") return (
    <div style={S.app}>
      {navBar("history")}
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <h1 style={S.h1}>Historique</h1>
        <p style={S.sub}>{db.sessions.length} séance{db.sessions.length > 1 ? "s" : ""}</p>
        {db.sessions.length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>Aucune séance. Lance-toi !</p>}
        {[...db.sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).map(s => (
          <Card key={s.id} onClick={() => { setSelSessionId(s.id); navigate("sessionDetail"); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{s.entries?.length || 0} exercice{(s.entries?.length || 0) > 1 ? "s" : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: C.muted }}>{fmt(s.date)}</div>
                <span style={{ color: C.faint, fontSize: 18 }}>›</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // ── SESSION DETAIL ────────────────────────────────────────────────────
  if (view === "sessionDetail" && selSession) return (
    <div style={S.app}>
      {navBar("history")}
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <button style={S.back} onClick={() => navigate("history")}>← Historique</button>
        <div style={{ fontSize: 11, color: C.muted, fontWeight: 500, marginBottom: 4 }}>{fmt(selSession.date)}</div>
        <h1 style={{ ...S.h1, marginBottom: 20 }}>{selSession.name}</h1>
        {(selSession.entries || []).map((e, i) => {
          const g = db.groups.find(g => g.exercises.some(x => x.id === e.exoId));
          const exo = g?.exercises.find(x => x.id === e.exoId);
          return (
            <Card key={i} style={{ cursor: "default" }}>
              <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{g?.name}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{exo?.name || "Exercice supprimé"}</div>
              <PerfTags entry={e} isBodyweight={exo?.bodyweight} />
            </Card>
          );
        })}
        {(selSession.entries || []).length === 0 && <p style={{ color: C.muted, fontSize: 13 }}>Aucun exercice.</p>}
        <button style={S.danger} onClick={() => deleteSession(selSession.id)}>Supprimer cette séance</button>
      </div>
    </div>
  );

  return null;
}
