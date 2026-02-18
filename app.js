import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const SK = "ironlog_v5";

const seed = {
  groups: [
    {
      id: 1, name: "DOS",
      exercises: [
        { id: 101, name: "Tractions", defaultKg: 0, bodyweight: true, defaultLeste: 0 },
        { id: 102, name: "Rowing barre", defaultKg: 60, bodyweight: false },
      ]
    },
    {
      id: 2, name: "GAINAGE",
      exercises: [
        { id: 201, name: "Planche", defaultKg: 0, bodyweight: true },
      ]
    }
  ],
  sessions: []
};

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

const C = {
  bg: "#000", surface: "#111", card: "#161616", border: "#2a2a2a",
  text: "#ffffff", muted: "#888", faint: "#444",
  accent: "#ff4500", green: "#22c55e", blue: "#60a5fa",
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #000; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
  input[type=number] { -moz-appearance: textfield; }
  button:active { opacity: 0.8; }
`;

const S = {
  app: { minHeight: "100vh", background: C.bg, color: C.text, fontFamily: C.font, maxWidth: 480, margin: "0 auto", paddingBottom: 60 },
  hdr: { borderBottom: `1px solid ${C.border}`, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#000", zIndex: 10 },
  logo: { fontSize: 15, fontWeight: 800, color: C.text, letterSpacing: -0.5 },
  logoAccent: { color: C.accent },
  body: { padding: "20px" },
  h1: { fontSize: 28, fontWeight: 800, letterSpacing: -1, lineHeight: 1.1, marginBottom: 4 },
  sub: { fontSize: 13, color: C.muted, marginBottom: 24 },
  sec: { fontSize: 11, fontWeight: 600, color: C.faint, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12, marginTop: 24 },
  btn: { background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: C.font, width: "100%", marginBottom: 10, display: "block" },
  btnGreen: { background: C.green, color: "#000", border: "none", borderRadius: 10, padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: C.font, width: "100%", marginBottom: 10, display: "block" },
  btnSmall: (color) => ({ background: color || C.surface, color: color ? "#000" : C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: C.font }),
  ghost: { background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 20px", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: C.font, width: "100%", marginBottom: 10, display: "block" },
  danger: { background: "none", color: "#ef4444", border: `1px solid #3f0000`, borderRadius: 8, padding: "11px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: C.font, width: "100%", marginTop: 8 },
  input: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, padding: "12px 14px", fontSize: 15, width: "100%", fontFamily: C.font, outline: "none" },
  back: { background: "none", border: "none", color: C.muted, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: C.font, padding: 0, marginBottom: 20 },
  navBtn: (active) => ({ background: "none", border: "none", color: active ? C.text : C.muted, fontSize: 14, fontWeight: active ? 600 : 400, cursor: "pointer", fontFamily: C.font, padding: "4px 0" }),
  tag: { background: C.card, borderRadius: 6, padding: "6px 10px", fontSize: 12, color: C.muted, textAlign: "center", minWidth: 52 },
  tagVal: { fontSize: 16, fontWeight: 700, color: C.text, display: "block" },
  tagLabel: { fontSize: 10, color: C.faint, display: "block", marginTop: 1 },
  statBox: { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 10px", textAlign: "center" },
  statNum: { fontSize: 30, fontWeight: 800, color: C.accent, lineHeight: 1 },
  statLabel: { fontSize: 11, color: C.faint, marginTop: 3 },
  toggle: (active) => ({ flex: 1, padding: "10px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: C.font, background: active ? C.accent : C.surface, color: active ? "#fff" : C.muted, border: `1px solid ${active ? C.accent : C.border}` }),
};

// ── Card ───────────────────────────────────────────────────────────────
function Card({ onClick, children, style }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ background: C.card, border: `1px solid ${hov && onClick ? C.accent : C.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, cursor: onClick ? "pointer" : "default", transition: "border-color 0.15s", ...style }}
      onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      {children}
    </div>
  );
}

// ── Stepper ────────────────────────────────────────────────────────────
function Stepper({ label, value, onChange, step = 1, min = 0, unit = "" }) {
  const dec = () => onChange(Math.max(min, Math.round((parseFloat(value || 0) - step) * 100) / 100));
  const inc = () => onChange(Math.round((parseFloat(value || 0) + step) * 100) / 100);
  const btnS = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 40, height: 40, fontSize: 22, fontWeight: 300, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: C.font };
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontSize: 11, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button style={btnS} onClick={dec}>−</button>
        <div style={{ textAlign: "center" }}>
          <input type="number" value={value} onChange={e => onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
            style={{ ...S.input, textAlign: "center", fontSize: 22, fontWeight: 800, padding: "8px 4px", width: 72, border: "none", background: "transparent" }} />
          {unit && <div style={{ fontSize: 11, color: C.faint, marginTop: -4 }}>{unit}</div>}
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
        <span style={{ fontSize: 14, fontWeight: 700 }}>{calDate.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</span>
        <button onClick={() => setCalDate(new Date(y, m + 1, 1))} style={S.back}>→</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
        {["L","M","M","J","V","S","D"].map((d, i) => <div key={i} style={{ fontSize: 11, color: C.faint, textAlign: "center", paddingBottom: 6, fontWeight: 600 }}>{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const iso = `${y}-${m}-${d}`;
          const isT = today.getDate() === d && today.getMonth() === m && today.getFullYear() === y;
          const isSel = calDate.getDate() === d && calDate.getMonth() === m && calDate.getFullYear() === y;
          const hasSess = sessionDays.has(iso);
          return (
            <div key={i} onClick={() => setCalDate(new Date(y, m, d))} style={{ height: 34, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: isSel || isT ? 700 : 400, cursor: "pointer", borderRadius: 8, background: isSel ? C.accent : hasSess ? "#1a0800" : "transparent", color: isSel ? "#fff" : isT ? C.accent : hasSess ? "#ff8040" : C.muted, border: isT && !isSel ? `1px solid ${C.accent}` : "1px solid transparent" }}>
              {d}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: C.muted, textAlign: "right", marginTop: 10 }}>
        Séance le <span style={{ color: C.text, fontWeight: 600 }}>{calDate.toLocaleDateString("fr-FR")}</span>
      </div>
    </Card>
  );
}

// ── LogFormWidget ──────────────────────────────────────────────────────
function LogFormWidget({ logForm, setLogForm, exo }) {
  const mode = logForm.mode || "reps";
  const series = parseInt(logForm.series) || 1;
  const sets = logForm.sets && logForm.sets.length === series ? logForm.sets : Array(series).fill(parseInt(logForm.reps) || 10);

  function updateSeries(v) {
    const n = Math.max(1, parseInt(v) || 1);
    const newSets = Array(n).fill(0).map((_, i) => sets[i] !== undefined ? sets[i] : (parseInt(logForm.reps) || 10));
    setLogForm({ ...logForm, series: n, sets: newSets });
  }
  function updateSetRep(idx, delta) {
    const newSets = [...sets];
    newSets[idx] = Math.max(0, (newSets[idx] || 0) + delta);
    setLogForm({ ...logForm, sets: newSets });
  }

  // Bodyweight display
  const isBodyweight = exo?.bodyweight;
  const leste = logForm.leste !== undefined ? logForm.leste : (exo?.defaultLeste || 0);

  return (
    <div>
      {/* Mode toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button style={S.toggle(mode === "reps")} onClick={() => setLogForm({ ...logForm, mode: "reps" })}>💪 Reps / Poids</button>
        <button style={S.toggle(mode === "time")} onClick={() => setLogForm({ ...logForm, mode: "time" })}>⏱ Temps</button>
      </div>

      {mode === "reps" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 24 }}>
            <Stepper label="Séries" value={logForm.series} onChange={updateSeries} step={1} min={1} />
            {isBodyweight ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 11, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Leste</div>
                <div style={{ background: "#0d1f00", border: `1px solid #2a4a00`, borderRadius: 10, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 12, color: C.green, fontWeight: 600, marginBottom: 6 }}>Poids du corps</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button onClick={() => setLogForm({ ...logForm, leste: Math.max(0, leste - 2.5) })} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, width: 28, height: 28, color: C.text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <div style={{ fontSize: 16, fontWeight: 800, minWidth: 48, textAlign: "center" }}>
                      {leste > 0 ? `+${leste}kg` : "0kg"}
                    </div>
                    <button onClick={() => setLogForm({ ...logForm, leste: leste + 2.5 })} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, width: 28, height: 28, color: C.text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                </div>
              </div>
            ) : (
              <Stepper label="Poids" value={logForm.kg} onChange={v => setLogForm({ ...logForm, kg: v })} step={2.5} min={0} unit="kg" />
            )}
          </div>

          {/* Reps par série */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Reps par série</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {sets.map((reps, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 11, color: C.faint }}>S{idx + 1}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button onClick={() => updateSetRep(idx, -1)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, width: 30, height: 30, color: C.text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <div style={{ background: C.card, borderRadius: 8, padding: "6px 10px", fontSize: 18, fontWeight: 800, color: C.text, minWidth: 44, textAlign: "center" }}>{reps}</div>
                    <button onClick={() => updateSetRep(idx, 1)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, width: 30, height: 30, color: C.text, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>
                </div>
              ))}
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
        <div style={{ fontSize: 12, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Note (optionnel)</div>
        <input style={S.input} placeholder="Sensation, fatigue…" value={logForm.note || ""} onChange={e => setLogForm({ ...logForm, note: e.target.value })} />
      </div>
    </div>
  );
}

// ── PerfTags ───────────────────────────────────────────────────────────
function PerfTags({ entry }) {
  const mode = entry.mode || "reps";
  if (mode === "time") {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
        <div style={S.tag}><span style={S.tagVal}>{entry.series || "—"}</span><span style={S.tagLabel}>SÉRIES</span></div>
        <div style={S.tag}><span style={S.tagVal}>{entry.timeMin || 0}:{String(entry.timeSec || 0).padStart(2,"0")}</span><span style={S.tagLabel}>TEMPS</span></div>
        {entry.note && <div style={{ fontSize: 12, color: C.muted, alignSelf: "center", fontStyle: "italic" }}>💬 {entry.note}</div>}
      </div>
    );
  }
  const sets = entry.sets || [];
  const setsStr = sets.length > 0 ? sets.join(" / ") : (entry.reps || "—");
  const isBodyweight = entry.bodyweight || (entry.leste !== undefined && entry.kg === undefined);
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8, alignItems: "center" }}>
      <div style={S.tag}><span style={S.tagVal}>{entry.series || "—"}</span><span style={S.tagLabel}>SÉRIES</span></div>
      <div style={{ ...S.tag, minWidth: "auto", padding: "6px 12px" }}><span style={{ ...S.tagVal, fontSize: 13 }}>{setsStr}</span><span style={S.tagLabel}>REPS</span></div>
      {isBodyweight
        ? <div style={{ ...S.tag, borderColor: "#1a3a00" }}><span style={{ ...S.tagVal, color: C.green, fontSize: 13 }}>PDC{entry.leste > 0 ? ` +${entry.leste}kg` : ""}</span><span style={S.tagLabel}>POIDS</span></div>
        : <div style={S.tag}><span style={S.tagVal}>{entry.kg ? `${entry.kg}` : "—"}</span><span style={S.tagLabel}>KG</span></div>
      }
      {entry.note && <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>💬 {entry.note}</div>}
    </div>
  );
}

// ── ExoSettingsCard : formulaire dans group detail ─────────────────────
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
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 10 }}>
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", padding: "14px 16px", gap: 10 }}>
        <div style={{ flex: 1, cursor: "pointer" }} onClick={() => onNavigate(exo.id)}>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{exo.name}</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
            {exo.bodyweight ? `Poids du corps${exo.defaultLeste > 0 ? ` + leste par défaut ${exo.defaultLeste}kg` : ""}` : (exo.defaultKg > 0 ? `Poids habituel : ${exo.defaultKg}kg` : "Pas de poids défini")}
          </div>
          {exo.canonicalId && <div style={{ fontSize: 11, color: "#60a5fa", marginTop: 3 }}>🔗 Données partagées</div>}
        </div>
        <button onClick={() => setOpen(!open)} style={{ background: open ? C.border : C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: C.font, fontWeight: 600 }}>
          {open ? "Fermer" : "⚙️ Régler"}
        </button>
        <span style={{ color: C.faint, fontSize: 20, cursor: "pointer" }} onClick={() => onNavigate(exo.id)}>›</span>
      </div>

      {/* Settings panel */}
      {open && (
        <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ paddingTop: 14 }}>
            {/* Bodyweight toggle */}
            <div style={{ fontSize: 12, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Type de poids</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button style={S.toggle(!bw)} onClick={() => setBw(false)}>🏋️ Poids en kg</button>
              <button style={S.toggle(bw)} onClick={() => setBw(true)}>🧍 Poids du corps</button>
            </div>

            {!bw && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Poids habituel (valeur par défaut)</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setKg(v => Math.max(0, Math.round((v - 2.5) * 10) / 10))} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 40, height: 40, fontSize: 20, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <input type="number" value={kg} onChange={e => setKg(parseFloat(e.target.value) || 0)} style={{ ...S.input, textAlign: "center", fontSize: 20, fontWeight: 800, width: 100 }} />
                  <span style={{ color: C.muted, fontSize: 14 }}>kg</span>
                  <button onClick={() => setKg(v => Math.round((v + 2.5) * 10) / 10)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 40, height: 40, fontSize: 20, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            )}

            {bw && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: C.faint, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Leste par défaut (si tu en portes un habituellement)</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setLeste(v => Math.max(0, Math.round((v - 2.5) * 10) / 10))} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 40, height: 40, fontSize: 20, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <input type="number" value={leste} onChange={e => setLeste(parseFloat(e.target.value) || 0)} style={{ ...S.input, textAlign: "center", fontSize: 20, fontWeight: 800, width: 100 }} />
                  <span style={{ color: C.muted, fontSize: 14 }}>kg</span>
                  <button onClick={() => setLeste(v => Math.round((v + 2.5) * 10) / 10)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, width: 40, height: 40, fontSize: 20, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
                {leste === 0 && <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>Laisser à 0 si pas de leste habituel</div>}
              </div>
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={save} style={{ ...S.btnSmall(C.green), flex: 1, padding: "10px" }}>✓ Enregistrer</button>
              <button onClick={() => onDelete(exo.id)} style={{ background: "none", color: "#ef4444", border: `1px solid #3f0000`, borderRadius: 8, padding: "10px 14px", fontSize: 13, cursor: "pointer", fontFamily: C.font }}>Supprimer</button>
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
  const [logForm, setLogForm] = useState({ mode: "reps", series: 4, reps: 10, kg: 20, sets: [10,10,10,10], leste: 0, timeMin: 1, timeSec: 0, note: "" });
  const [importConfirm, setImportConfirm] = useState(null); // groupId en attente de confirm
  const [mergePrompt, setMergePrompt] = useState(null); // { newExo, pendingName, matches: [{exo, group}] }

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

  if (!db) return <div style={{ ...S.app, padding: 40, color: C.muted, fontSize: 16 }}>Chargement…</div>;

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
    if (lastPerf) {
      const series = parseInt(lastPerf.series) || 4;
      const reps = parseInt(lastPerf.reps) || 10;
      return {
        mode: lastPerf.mode || "reps",
        series,
        reps,
        kg: lastPerf.kg !== undefined ? lastPerf.kg : (exo?.defaultKg || 20),
        leste: lastPerf.leste !== undefined ? lastPerf.leste : (exo?.defaultLeste || 0),
        sets: lastPerf.sets || Array(series).fill(reps),
        timeMin: lastPerf.timeMin || 1,
        timeSec: lastPerf.timeSec || 0,
        note: ""
      };
    }
    const series = 4;
    const reps = 10;
    return {
      mode: "reps", series, reps,
      kg: exo?.bodyweight ? 0 : (exo?.defaultKg || 20),
      leste: exo?.defaultLeste || 0,
      sets: Array(series).fill(reps),
      timeMin: 1, timeSec: 0, note: ""
    };
  }

  function addGroup() {
    if (!newGName.trim()) return;
    saveDb({ ...db, groups: [...db.groups, { id: uid(), name: newGName.trim().toUpperCase(), exercises: [] }] });
    setNewGName("");
  }
  function deleteGroup(gid) {
    saveDb({ ...db, groups: db.groups.filter(g => g.id !== gid) });
    setSelGroupId(null); setView("groups");
  }
  function addExercise(forceName) {
    const name = (forceName || newEName).trim();
    if (!name || !selGroupId) return;
    const newExoId = uid();
    const newExo = { id: newExoId, name, defaultKg: 0, bodyweight: false, defaultLeste: 0 };
    // Check for similar existing exercises
    const similar = findSimilarExos(db, name, selGroupId, null);
    if (similar.length > 0) {
      // Temporarily store the exo to add, prompt user
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
    // If user chose to link, set canonicalId on new exo = first linked exo's canonical (or its own id)
    let finalExo = { ...newExo };
    if (linkedIds.length > 0) {
      // Find canonical of first linked
      const firstLinked = linkedIds[0];
      let canon = firstLinked;
      db.groups.forEach(g => g.exercises.forEach(e => {
        if (e.id === firstLinked && e.canonicalId) canon = e.canonicalId;
      }));
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
    setSelSessionId(null); setView("history");
  }

  function startDoSession() {
    const name = `Séance ${calDate.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}`;
    setActiveSession({ id: uid(), name, date: calDate.toISOString(), entries: [], step: "pickGroup" });
    setImportConfirm(null);
    setView("doSession");
  }

  // Importer tout un groupe → file d'attente à valider un par un
  function importGroup(gid) {
    const g = db.groups.find(x => x.id === gid);
    if (!g || g.exercises.length === 0) return;
    // Construire la file : chaque exercice avec ses valeurs par défaut pré-remplies
    const queue = g.exercises.map(exo => {
      const perfs = perfsForExo(exo.id);
      const last = perfs[perfs.length - 1];
      return { exoId: exo.id, groupId: gid, form: makeDefaultForm(exo, last || null) };
    });
    // On passe au premier exo de la file
    const first = queue[0];
    setLogForm(first.form);
    setActiveSession(prev => ({
      ...prev,
      step: "logExo",
      pickedGroup: gid,
      pickedExo: first.exoId,
      importQueue: queue.slice(1), // reste à valider
    }));
    setImportConfirm(null);
  }

  async function finishSession() {
    const sess = { id: activeSession.id, name: activeSession.name, date: activeSession.date, entries: activeSession.entries };
    await saveDb({ ...db, sessions: [sess, ...db.sessions] });
    setActiveSession(null); setView("home");
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
      <span style={S.logo}>Iron<span style={S.logoAccent}>Log</span></span>
      <div style={{ display: "flex", gap: 20 }}>
        <button style={S.navBtn(cur === "home")} onClick={() => setView("home")}>Accueil</button>
        <button style={S.navBtn(cur === "history")} onClick={() => setView("history")}>Historique</button>
        <button style={S.navBtn(cur === "groups")} onClick={() => { setNewGName(""); setView("groups"); }}>Groupes</button>
      </div>
    </div>
  );

  // ── HOME ──────────────────────────────────────────────────────────────
  if (view === "home") return (
    <div style={S.app}>
      {navBar("home")}
      <div style={S.body}>
        <div style={{ fontSize: 12, color: C.accent, fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>
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
        <button style={S.ghost} onClick={() => { setNewGName(""); setView("groups"); }}>✏️ Gérer mes groupes & exercices</button>
      </div>
    </div>
  );

  // ── GROUPS ────────────────────────────────────────────────────────────
  if (view === "groups") return (
    <div style={S.app}>
      {navBar("groups")}
      <div style={S.body}>
        <h1 style={S.h1}>Mes groupes</h1>
        <p style={S.sub}>Banque d'exercices permanente</p>
        <div style={S.sec}>Nouveau groupe</div>
        <input style={{ ...S.input, marginBottom: 10 }} placeholder="ex : ÉPAULES, BRAS, CARDIO…" value={newGName}
          onChange={e => setNewGName(e.target.value)} onKeyDown={e => e.key === "Enter" && addGroup()} />
        <button style={{ ...S.btn, marginBottom: 24 }} onClick={addGroup}>+ Créer le groupe</button>
        <div style={S.sec}>Groupes existants</div>
        {db.groups.map(g => (
          <Card key={g.id} onClick={() => { setSelGroupId(g.id); setNewEName(""); setView("group"); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{g.name}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{g.exercises.length} exercice{g.exercises.length > 1 ? "s" : ""}</div>
              </div>
              <span style={{ color: C.faint, fontSize: 20 }}>›</span>
            </div>
          </Card>
        ))}
        {db.groups.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>Aucun groupe. Crée-en un !</p>}
      </div>
    </div>
  );

  // ── GROUP DETAIL ──────────────────────────────────────────────────────
  if (view === "group" && selGroup) return (
    <div style={S.app}>
      {navBar("groups")}
      <div style={S.body}>
        <button style={S.back} onClick={() => setView("groups")}>← Groupes</button>
        <h1 style={S.h1}>{selGroup.name}</h1>
        <p style={S.sub}>{selGroup.exercises.length} exercice{selGroup.exercises.length > 1 ? "s" : ""}</p>

        <div style={S.sec}>Ajouter un exercice</div>

        {/* Merge prompt */}
        {mergePrompt && mergePrompt.groupId === selGroupId && (
          <div style={{ background: "#0d1a2e", border: `1px solid #1e3a5e`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Exercice similaire détecté</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
              <span style={{ color: C.text, fontWeight: 600 }}>"{mergePrompt.newExo.name}"</span> ressemble à :
            </div>
            {mergePrompt.matches.map(({ exo, group }) => {
              const isLinked = mergePrompt.linked.includes(exo.id);
              return (
                <div key={exo.id} style={{ display: "flex", alignItems: "center", gap: 10, background: isLinked ? "#0a2000" : C.card, border: `1px solid ${isLinked ? "#1a4a00" : C.border}`, borderRadius: 10, padding: "10px 14px", marginBottom: 8, cursor: "pointer" }}
                  onClick={() => {
                    const linked = isLinked ? mergePrompt.linked.filter(id => id !== exo.id) : [...mergePrompt.linked, exo.id];
                    setMergePrompt({ ...mergePrompt, linked });
                  }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${isLinked ? C.green : C.border}`, background: isLinked ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isLinked && <span style={{ color: "#000", fontSize: 14, fontWeight: 800 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{exo.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{group.name}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>
              {mergePrompt.linked.length > 0
                ? "✓ Coché = même puit de données (historique et graphiques partagés)"
                : "Coche les exercices identiques pour partager les données"}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => confirmAddExercise(mergePrompt.linked)} style={{ flex: 1, background: C.green, color: "#000", border: "none", borderRadius: 8, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: C.font }}>
                {mergePrompt.linked.length > 0 ? "✓ Lier & ajouter" : "Ajouter sans lier"}
              </button>
              <button onClick={() => setMergePrompt(null)} style={{ background: C.surface, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px 16px", fontSize: 14, cursor: "pointer", fontFamily: C.font }}>Annuler</button>
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
        {mergePrompt && mergePrompt.groupId === selGroupId && <div style={{ height: 8 }} />}

        <div style={S.sec}>Exercices</div>
        {selGroup.exercises.map(e => (
          <ExoSettingsCard
            key={e.id}
            exo={e}
            onSave={(updated) => updateExercise(selGroup.id, updated)}
            onDelete={(eid) => deleteExercise(selGroup.id, eid)}
            onNavigate={(eid) => { setSelExoId(eid); setView("exo"); }}
          />
        ))}
        {selGroup.exercises.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>Aucun exercice. Ajoute-en un !</p>}
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
    const chartData = perfs.map(p => ({
      date: p.dateLabel,
      kg: parseFloat(p.kg) || (p.leste ? parseFloat(p.leste) : 0),
      reps: p.sets ? Math.round(p.sets.reduce((a, b) => a + b, 0) / p.sets.length) : (parseFloat(p.reps) || 0),
      time: p.mode === "time" ? (parseInt(p.timeMin || 0) * 60 + parseInt(p.timeSec || 0)) : null,
    }));
    return (
      <div style={S.app}>
        {navBar("groups")}
        <div style={S.body}>
          <button style={S.back} onClick={() => setView("group")}>← {group?.name}</button>
          <h1 style={S.h1}>{exo?.name}</h1>
          {exo?.bodyweight && <div style={{ background: "#0d1f00", border: `1px solid #1a3a00`, borderRadius: 8, padding: "8px 12px", fontSize: 13, color: C.green, fontWeight: 600, marginBottom: 12, display: "inline-block" }}>🧍 Poids du corps{exo.defaultLeste > 0 ? ` + leste ${exo.defaultLeste}kg` : ""}</div>}
          <p style={S.sub}>{perfs.length} enregistrement{perfs.length > 1 ? "s" : ""}</p>

          {last && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
              <div style={S.statBox}><div style={S.statNum}>{last.series || "—"}</div><div style={S.statLabel}>SÉRIES</div></div>
              {last.mode === "time"
                ? <div style={S.statBox}><div style={{ ...S.statNum, fontSize: 20 }}>{last.timeMin}:{String(last.timeSec || 0).padStart(2,"0")}</div><div style={S.statLabel}>TEMPS</div></div>
                : <div style={S.statBox}><div style={{ ...S.statNum, fontSize: 16 }}>{last.sets ? last.sets.join("/") : last.reps || "—"}</div><div style={S.statLabel}>REPS</div></div>
              }
              <div style={S.statBox}>
                {exo?.bodyweight
                  ? <><div style={{ ...S.statNum, fontSize: 16, color: C.green }}>PDC{last.leste > 0 ? `+${last.leste}` : ""}</div><div style={S.statLabel}>POIDS</div></>
                  : <><div style={S.statNum}>{last.kg || "—"}</div><div style={S.statLabel}>KG</div></>
                }
              </div>
            </div>
          )}

          {chartData.length >= 2 && (
            <>
              {chartData.some(d => d.kg > 0) && (
                <>
                  <div style={S.sec}>{exo?.bodyweight ? "Progression leste (kg)" : "Progression poids (kg)"}</div>
                  <Card style={{ marginBottom: 20, cursor: "default", padding: "16px 8px 8px" }}>
                    <ResponsiveContainer width="100%" height={150}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.muted, fontFamily: C.font }} />
                        <YAxis tick={{ fontSize: 10, fill: C.muted, fontFamily: C.font }} width={32} />
                        <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 12, fontFamily: C.font, borderRadius: 8 }} />
                        <Line type="monotone" dataKey="kg" stroke={C.accent} strokeWidth={2.5} dot={{ fill: C.accent, r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              )}
              {chartData.some(d => d.reps > 0) && (
                <>
                  <div style={S.sec}>Progression reps (moy/série)</div>
                  <Card style={{ marginBottom: 24, cursor: "default", padding: "16px 8px 8px" }}>
                    <ResponsiveContainer width="100%" height={130}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.muted, fontFamily: C.font }} />
                        <YAxis tick={{ fontSize: 10, fill: C.muted, fontFamily: C.font }} width={32} />
                        <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 12, fontFamily: C.font, borderRadius: 8 }} />
                        <Line type="monotone" dataKey="reps" stroke={C.blue} strokeWidth={2.5} dot={{ fill: C.blue, r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              )}
            </>
          )}
          {chartData.length < 2 && <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>Encore {2 - chartData.length} séance{chartData.length === 0 ? "s" : ""} pour voir le graphique.</p>}

          {perfs.length > 0 && (
            <>
              <div style={S.sec}>Historique</div>
              {[...perfs].reverse().map((p, i) => (
                <Card key={i} style={{ cursor: "default" }}>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 4, fontWeight: 500 }}>{p.dateLabel}</div>
                  <PerfTags entry={p} />
                </Card>
              ))}
            </>
          )}
          {perfs.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>Pas encore de données. Fais une séance !</p>}
          <button style={S.danger} onClick={() => { deleteExercise(group?.id, selExoId); setView("group"); }}>Supprimer "{exo?.name}"</button>
        </div>
      </div>
    );
  }

  // ── SÉANCE EN COURS ───────────────────────────────────────────────────
  if (view === "doSession" && activeSession) {
    const step = activeSession.step;

    const SessionHeader = () => (
      <div style={S.hdr}>
        <span style={S.logo}>Iron<span style={S.logoAccent}>Log</span></span>
        <span style={{ fontSize: 12, color: C.accent, fontWeight: 700, background: "#1a0800", padding: "4px 10px", borderRadius: 20 }}>EN COURS</span>
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
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{g?.name}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{exo?.name}</div>
              <PerfTags entry={e} />
            </Card>
          );
        })}
      </div>
    ) : null;

    // ── pickGroup
    if (step === "pickGroup") return (
      <div style={S.app}>
        <SessionHeader />
        <div style={S.body}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginBottom: 4 }}>{fmt(activeSession.date)}</div>
          <h1 style={{ ...S.h1, marginBottom: 4 }}>{activeSession.name}</h1>
          <p style={S.sub}>{activeSession.entries.length} exercice{activeSession.entries.length > 1 ? "s" : ""}</p>
          <EntriesSummary />

          <div style={S.sec}>Ajouter des exercices</div>

          {/* Confirm import groupe */}
          {importConfirm && (
            <div style={{ background: "#0a1f00", border: `1px solid #2a5000`, borderRadius: 12, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                Importer tous les exos de {db.groups.find(g => g.id === importConfirm)?.name} ?
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>
                {db.groups.find(g => g.id === importConfirm)?.exercises.length} exercice{db.groups.find(g => g.id === importConfirm)?.exercises.length > 1 ? "s" : ""} seront ajoutés avec leurs valeurs habituelles pré-remplies.
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => importGroup(importConfirm)} style={{ flex: 1, background: C.green, color: "#000", border: "none", borderRadius: 8, padding: "11px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: C.font }}>✓ Importer</button>
                <button onClick={() => setImportConfirm(null)} style={{ flex: 1, background: C.surface, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "11px", fontSize: 14, cursor: "pointer", fontFamily: C.font }}>Annuler</button>
              </div>
            </div>
          )}

          {db.groups.map(g => (
            <div key={g.id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, marginBottom: 10, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ flex: 1, padding: "14px 16px", cursor: "pointer" }}
                  onClick={() => setActiveSession({ ...activeSession, step: "pickExo", pickedGroup: g.id })}>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{g.name}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{g.exercises.length} exo{g.exercises.length > 1 ? "s" : ""}</div>
                </div>
                <button
                  onClick={() => setImportConfirm(importConfirm === g.id ? null : g.id)}
                  style={{ background: importConfirm === g.id ? C.green : "#0a2000", color: importConfirm === g.id ? "#000" : C.green, border: "none", borderLeft: `1px solid ${C.border}`, padding: "0 16px", height: "100%", minHeight: 60, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: C.font, whiteSpace: "nowrap" }}>
                  ⚡ Tout importer
                </button>
              </div>
            </div>
          ))}
          {db.groups.length === 0 && <p style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>Aucun groupe. Crée d'abord des groupes.</p>}

          <div style={{ marginTop: 16 }}>
            <button style={S.btnGreen} onClick={finishSession}>✓ Terminer & sauvegarder</button>
            <button style={S.ghost} onClick={() => { setActiveSession(null); setView("home"); }}>Annuler la séance</button>
          </div>
        </div>
      </div>
    );

    // ── pickExo
    if (step === "pickExo") {
      const g = db.groups.find(x => x.id === activeSession.pickedGroup);
      return (
        <div style={S.app}>
          <SessionHeader />
          <div style={S.body}>
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
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{e.name}</div>
                      <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                        {e.bodyweight ? "Poids du corps" : (e.defaultKg > 0 ? `Poids habituel : ${e.defaultKg}kg` : "")}
                        {last ? ` · Dernière fois : ${fmt(last.date)}` : ""}
                      </div>
                    </div>
                    {last && (
                      <div style={{ fontSize: 13, color: C.muted, textAlign: "right", flexShrink: 0 }}>
                        {last.sets ? last.sets.join("/") : ""}<br />
                        {e.bodyweight ? (last.leste > 0 ? `+${last.leste}kg` : "PDC") : (last.kg ? `${last.kg}kg` : "")}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
            {g?.exercises.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>Aucun exercice dans ce groupe.</p>}
          </div>
        </div>
      );
    }

    // ── logExo
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
          <div style={S.body}>
            <button style={S.back} onClick={() => setActiveSession({ ...activeSession, step: "pickGroup", importQueue: [] })}>← Retour</button>
            <h1 style={{ ...S.h1, marginBottom: 4 }}>{exo?.name}</h1>

            {showProgress && totalInGroup > 1 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>Import {g?.name}</span>
                  <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{doneInGroup + 1} / {totalInGroup}</span>
                </div>
                <div style={{ background: C.border, borderRadius: 4, height: 5 }}>
                  <div style={{ background: C.accent, borderRadius: 4, height: 5, width: `${((doneInGroup + 1) / totalInGroup) * 100}%`, transition: "width 0.3s" }} />
                </div>
              </div>
            )}

            {last && (
              <Card style={{ cursor: "default", marginBottom: 20, background: "#0a1800", borderColor: "#1a3000" }}>
                <div style={{ fontSize: 12, color: C.green, fontWeight: 600, marginBottom: 4 }}>Dernière séance — {fmt(last.date)}</div>
                <PerfTags entry={last} />
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
      <div style={S.body}>
        <h1 style={S.h1}>Historique</h1>
        <p style={S.sub}>{db.sessions.length} séance{db.sessions.length > 1 ? "s" : ""}</p>
        {db.sessions.length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>Aucune séance. Lance-toi !</p>}
        {[...db.sessions].sort((a, b) => new Date(b.date) - new Date(a.date)).map(s => (
          <Card key={s.id} onClick={() => { setSelSessionId(s.id); setView("sessionDetail"); }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{s.entries?.length || 0} exercice{(s.entries?.length || 0) > 1 ? "s" : ""}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: C.muted }}>{fmt(s.date)}</div>
                <span style={{ color: C.faint, fontSize: 20 }}>›</span>
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
      <div style={S.body}>
        <button style={S.back} onClick={() => setView("history")}>← Historique</button>
        <div style={{ fontSize: 12, color: C.muted, fontWeight: 500, marginBottom: 4 }}>{fmt(selSession.date)}</div>
        <h1 style={{ ...S.h1, marginBottom: 20 }}>{selSession.name}</h1>
        {(selSession.entries || []).map((e, i) => {
          const g = db.groups.find(g => g.exercises.some(x => x.id === e.exoId));
          const exo = g?.exercises.find(x => x.id === e.exoId);
          return (
            <Card key={i} style={{ cursor: "default" }}>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{g?.name}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{exo?.name || "Exercice supprimé"}</div>
              <PerfTags entry={e} />
            </Card>
          );
        })}
        {(selSession.entries || []).length === 0 && <p style={{ color: C.muted, fontSize: 14 }}>Aucun exercice.</p>}
        <button style={S.danger} onClick={() => deleteSession(selSession.id)}>Supprimer cette séance</button>
      </div>
    </div>
  );

  return null;
}
