import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const supabaseUrl = 'https://rnypcpzblmnpirwpregh.supabase.co';
const supabaseKey = 'sb_publishable_URXAdXQihgYxTNwsOoOd3A_Qy7RR_D5';
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Auth Form ────────────────────────────────────────────────────────────────
const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (type) => {
    setLoading(true);
    const { error } = type === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else if (type === 'signup') alert("Inscription réussie ! Connecte-toi maintenant.");
    setLoading(false);
  };

  return (
    <div style={{ padding:'40px 20px', textAlign:'center', background:'#111', color:'white', height:'100vh', display:'flex', flexDirection:'column', justifyContent:'center', fontFamily:"'DM Sans', sans-serif" }}>
      <h1 style={{ color:'#e8924a', marginBottom:'30px', fontSize:28, fontWeight:700, letterSpacing:-0.5 }}>SPORTUP</h1>
      <div style={{ maxWidth:'300px', margin:'0 auto', width:'100%' }}>
        <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)}
          style={{ width:'100%', padding:'13px', marginBottom:'10px', borderRadius:'9px', border:'1px solid #333', background:'#1a1a1a', color:'white', fontSize:15, fontFamily:"'DM Sans', sans-serif" }} />
        <input type="password" placeholder="Mot de passe" onChange={e => setPassword(e.target.value)}
          style={{ width:'100%', padding:'13px', marginBottom:'20px', borderRadius:'9px', border:'1px solid #333', background:'#1a1a1a', color:'white', fontSize:15, fontFamily:"'DM Sans', sans-serif" }} />
        <button onClick={() => handleAuth('login')} disabled={loading}
          style={{ width:'100%', padding:'13px', marginBottom:'10px', background:'#e8924a', color:'white', border:'none', borderRadius:'9px', fontWeight:700, cursor:'pointer', fontSize:15, fontFamily:"'DM Sans', sans-serif" }}>
          {loading ? 'Chargement...' : 'Se connecter'}
        </button>
        <button onClick={() => handleAuth('signup')} disabled={loading}
          style={{ width:'100%', padding:'13px', background:'transparent', color:'#888', border:'1px solid #333', borderRadius:'9px', cursor:'pointer', fontSize:14, fontFamily:"'DM Sans', sans-serif" }}>
          Créer un compte
        </button>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const seed = { groups: [], sessions: [] };
const uid = () => Date.now() + Math.random();

function fmt(iso) {
  return new Date(iso).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" });
}
function fmtDateLong(date) {
  return date.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
}
function normalize(s) { return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/g,""); }
function levenshtein(a, b) {
  const m=a.length, n=b.length;
  const dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j:j===0?i:0));
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) dp[i][j]=a[i-1]===b[j-1]?dp[i-1][j-1]:1+Math.min(dp[i-1][j],dp[i][j-1],dp[i-1][j-1]);
  return dp[m][n];
}
function isSimilar(a, b) {
  const na=normalize(a), nb=normalize(b);
  if(na===nb||na.includes(nb)||nb.includes(na)) return true;
  return Math.max(na.length,nb.length)>0 && levenshtein(na,nb)/Math.max(na.length,nb.length)<0.35;
}
function findSimilarExos(db, name, excludeExoId) {
  const matches=[];
  db.groups.forEach(g=>g.exercises.forEach(e=>{
    if(e.id!==excludeExoId && isSimilar(e.name,name)) matches.push({exo:e,group:g});
  }));
  return matches;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:"#0a0a0a", surface:"#141414", card:"#1c1c1c", border:"#2a2a2a",
  text:"#f0f0f0", muted:"#777", faint:"#3a3a3a", sub:"#999",
  danger:"#c47070", accent:"#e8924a",
  font:"'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
};

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0a0a0a; }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
  input[type=number] { -moz-appearance:textfield; }
  button { transition:opacity 0.1s ease, transform 0.1s ease, background 0.15s ease, border-color 0.15s ease; }
  button:active { opacity:0.65; transform:scale(0.97); }
  input:focus { outline:none; border-color:#555 !important; }
  @keyframes slideUp { from{opacity:0;transform:translateY(9px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  .page-enter { animation:slideUp 0.18s ease both; }
  .fade-in    { animation:fadeIn 0.14s ease both; }
  .date-btn:hover { background:#1a1a1a !important; border-color:#3a3a3a !important; }
`;

const S = {
  app:      { minHeight:"100vh", background:C.bg, color:C.text, fontFamily:C.font, maxWidth:480, margin:"0 auto", paddingBottom:110 },
  hdr:      { borderBottom:"1px solid #222", padding:"13px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:C.bg, zIndex:10 },
  body:     { padding:"22px 20px" },
  h1:       { fontSize:26, fontWeight:700, letterSpacing:-0.5, lineHeight:1.15, marginBottom:5, color:C.text },
  sub:      { fontSize:14, color:C.muted, marginBottom:22 },
  sec:      { fontSize:11, fontWeight:600, color:"#444", textTransform:"uppercase", letterSpacing:2, marginBottom:11, marginTop:24 },
  btn:      { background:"#e8e8e8", color:"#111", border:"none", borderRadius:10, padding:"14px 20px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:C.font, width:"100%", marginBottom:10, display:"block" },
  ghost:    { background:"transparent", color:C.text, border:"1px solid #2a2a2a", borderRadius:10, padding:"13px 20px", fontSize:14, fontWeight:400, cursor:"pointer", fontFamily:C.font, width:"100%", marginBottom:10, display:"block" },
  btnSave:  { background:"#2a2a2a", color:C.text, border:"1px solid #333", borderRadius:9, padding:"11px 16px", fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:C.font },
  danger:   { background:"none", color:"#c47070", border:"1px solid #2a1818", borderRadius:9, padding:"12px 16px", fontSize:14, fontWeight:400, cursor:"pointer", fontFamily:C.font, width:"100%", marginTop:8 },
  input:    { background:C.surface, border:"1px solid #2a2a2a", borderRadius:9, color:C.text, padding:"13px 15px", fontSize:15, width:"100%", fontFamily:C.font, outline:"none" },
  back:     { background:"none", border:"none", color:C.muted, fontSize:14, fontWeight:400, cursor:"pointer", fontFamily:C.font, padding:0, marginBottom:22 },
  tag:      { background:C.card, border:"1px solid #2a2a2a", borderRadius:8, padding:"6px 11px", fontSize:13, color:C.muted, textAlign:"center", minWidth:50 },
  tagVal:   { fontSize:15, fontWeight:600, color:C.text, display:"block" },
  tagLabel: { fontSize:10, color:"#444", display:"block", marginTop:1, textTransform:"uppercase", letterSpacing:1 },
  statBox:  { background:C.surface, border:"1px solid #2a2a2a", borderRadius:11, padding:"13px 8px", textAlign:"center" },
  statNum:  { fontSize:28, fontWeight:700, color:C.text, lineHeight:1 },
  statLabel:{ fontSize:10, color:"#444", marginTop:4, textTransform:"uppercase", letterSpacing:1 },
  toggle:   (active) => ({ flex:1, padding:"10px", borderRadius:8, fontSize:14, fontWeight:active?600:400, cursor:"pointer", fontFamily:C.font, background:active?"#2a2a2a":"transparent", color:active?C.text:C.muted, border:"1px solid " + (active?"#444":"#2a2a2a") }),
};

// ─── Cloud sync helpers ───────────────────────────────────────────────────────
// Données stockées dans Supabase table "user_data" : { user_id, data (jsonb) }
async function loadFromCloud(userId) {
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') {
    console.error('Cloud load error:', error);
    return null;
  }
  return data?.data || null;
}

async function saveToCloud(userId, db) {
  const { error } = await supabase
    .from('user_data')
    .upsert({ user_id: userId, data: db, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) console.error('Cloud save error:', error);
}

// ─── BottomNav ────────────────────────────────────────────────────────────────
function BottomNav({ cur, onNav }) {
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:C.bg, borderTop:"1px solid #222", display:"flex", alignItems:"center", justifyContent:"space-around", zIndex:100, paddingTop:10, paddingBottom:22 }}>
      <button onClick={() => onNav("groups")} style={{ background:"none", border:"none", color:cur==="groups"?C.text:C.muted, fontSize:11, fontWeight:cur==="groups"?600:400, cursor:"pointer", fontFamily:C.font, display:"flex", flexDirection:"column", alignItems:"center", gap:5, flex:1, padding:"4px 0" }}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 4V2M16 4V2"/>
        </svg>
        Séances
      </button>
      <button onClick={() => onNav("home")} style={{ background:"linear-gradient(145deg,#f0a060,#e8924a,#d07840)", border:"none", borderRadius:"50%", width:56, height:56, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:"0 4px 20px rgba(232,146,74,0.45)", transform:"translateY(-10px)", flexShrink:0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      </button>
      <button onClick={() => onNav("history")} style={{ background:"none", border:"none", color:cur==="history"?C.text:C.muted, fontSize:11, fontWeight:cur==="history"?600:400, cursor:"pointer", fontFamily:C.font, display:"flex", flexDirection:"column", alignItems:"center", gap:5, flex:1, padding:"4px 0" }}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
        </svg>
        Historique
      </button>
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <defs>
          <linearGradient id="dg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8924a"/><stop offset="55%" stopColor="#d07840"/><stop offset="100%" stopColor="#f2ede6"/>
          </linearGradient>
        </defs>
        <rect x="1" y="7" width="5.5" height="14" rx="2" fill="url(#dg)"/>
        <rect x="6" y="9.5" width="3.5" height="9" rx="1.5" fill="url(#dg)"/>
        <rect x="9.5" y="12" width="9" height="4" rx="1.5" fill="url(#dg)"/>
        <rect x="18.5" y="9.5" width="3.5" height="9" rx="1.5" fill="url(#dg)"/>
        <rect x="21.5" y="7" width="5.5" height="14" rx="2" fill="url(#dg)"/>
      </svg>
      <span style={{ fontSize:16, fontWeight:700, letterSpacing:-0.3, background:"linear-gradient(135deg,#e8924a 0%,#d07840 40%,#f0ece6 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
        Sport'Up
      </span>
    </div>
  );
}

// ─── AccountIcon ──────────────────────────────────────────────────────────────
function AccountIcon({ session }) {
  const [open, setOpen] = useState(false);
  const email = session?.user?.email || "";
  const createdAt = session?.user?.created_at ? new Date(session.user.created_at) : null;

  function daysAgo(date) {
    const diff = Math.floor((Date.now() - date.getTime()) / (1000*60*60*24));
    if(diff === 0) return "aujourd'hui";
    if(diff === 1) return "il y a 1 jour";
    return `il y a ${diff} jours`;
  }

  return (
    <div style={{ position:"relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{ background:open?"#222":"transparent", border:"1px solid "+(open?"#3a3a3a":"#2a2a2a"), borderRadius:8, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:open?C.text:C.muted }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, zIndex:199 }}/>
          <div className="fade-in" style={{ position:"absolute", top:44, right:0, background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:12, padding:"15px 17px", minWidth:230, boxShadow:"0 10px 40px rgba(0,0,0,0.7)", zIndex:200 }}>
            <div style={{ fontSize:11, color:"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, marginBottom:9 }}>Mon compte</div>
            <div style={{ fontSize:14, color:C.text, fontWeight:500, marginBottom:4, wordBreak:"break-all" }}>{email}</div>
            {createdAt && <div style={{ fontSize:12, color:C.muted, marginBottom:16 }}>Membre depuis {daysAgo(createdAt)}</div>}
            <button onClick={() => supabase.auth.signOut()} style={{ width:"100%", background:"transparent", border:"1px solid #2a1818", borderRadius:8, padding:"10px 12px", fontSize:14, fontWeight:500, color:"#c47070", cursor:"pointer", fontFamily:C.font, textAlign:"left" }}>
              Se déconnecter
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ onClick, children, style }) {
  const [hov, setHov] = useState(false);
  return (
    <div style={{ background:hov&&onClick?"#202020":C.card, border:"1px solid "+(hov&&onClick?"#3a3a3a":"#2a2a2a"), borderRadius:12, padding:"14px 16px", marginBottom:10, cursor:onClick?"pointer":"default", transition:"background 0.12s, border-color 0.12s", ...style }}
      onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {children}
    </div>
  );
}

// ─── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ label, value, onChange, step=1, min=0, unit="" }) {
  const dec = () => onChange(Math.max(min, Math.round((parseFloat(value||0)-step)*100)/100));
  const inc = () => onChange(Math.round((parseFloat(value||0)+step)*100)/100);
  const bS = { background:C.surface, border:"1px solid #2a2a2a", borderRadius:8, width:38, height:38, fontSize:18, fontWeight:300, color:C.text, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 };
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <div style={{ fontSize:11, color:"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <button style={bS} onClick={dec}>−</button>
        <div style={{ textAlign:"center" }}>
          <input type="number" value={value} onChange={e=>onChange(e.target.value===""?"":parseFloat(e.target.value))}
            style={{ ...S.input, textAlign:"center", fontSize:22, fontWeight:700, padding:"5px 4px", width:66, border:"none", background:"transparent" }} />
          {unit && <div style={{ fontSize:11, color:"#444", marginTop:-4 }}>{unit}</div>}
        </div>
        <button style={bS} onClick={inc}>+</button>
      </div>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────
function Calendar({ calDate, setCalDate, sessions }) {
  const y=calDate.getFullYear(), m=calDate.getMonth();
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const today=new Date();
  const sessSet=new Set(sessions.map(s=>{const d=new Date(s.date);return d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate();}));
  const cells=[];
  const off=(first+6)%7;
  for(let i=0;i<off;i++) cells.push(null);
  for(let d=1;d<=days;d++) cells.push(d);
  return (
    <Card style={{ marginBottom:18, cursor:"default" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
        <button onClick={()=>setCalDate(new Date(y,m-1,1))} style={S.back}>←</button>
        <span style={{ fontSize:14, fontWeight:500 }}>{calDate.toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}</span>
        <button onClick={()=>setCalDate(new Date(y,m+1,1))} style={S.back}>→</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
        {["L","M","M","J","V","S","D"].map((d,i)=><div key={i} style={{ fontSize:11, color:"#444", textAlign:"center", paddingBottom:6, fontWeight:600 }}>{d}</div>)}
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const iso=y+"-"+m+"-"+d;
          const isT=today.getDate()===d&&today.getMonth()===m&&today.getFullYear()===y;
          const isSel=calDate.getDate()===d&&calDate.getMonth()===m&&calDate.getFullYear()===y;
          const hasSess=sessSet.has(iso);
          return (
            <div key={i} onClick={()=>setCalDate(new Date(y,m,d))} style={{ height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:isSel||isT?600:400, cursor:"pointer", borderRadius:7, background:isSel?"#e8e8e8":hasSess?"#252525":"transparent", color:isSel?"#111":isT?C.text:hasSess?"#bbb":C.muted, border:isT&&!isSel?"1px solid #555":"1px solid transparent" }}>
              {d}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize:12, color:C.muted, textAlign:"right", marginTop:9 }}>
        Séance le <span style={{ color:C.text, fontWeight:600 }}>{calDate.toLocaleDateString("fr-FR")}</span>
      </div>
    </Card>
  );
}

// ─── LogFormWidget ────────────────────────────────────────────────────────────
function LogFormWidget({ logForm, setLogForm, exo }) {
  const mode = exo?.mode || "reps";
  const series = parseInt(logForm.series) || 1;

  function buildSets(n, existing, defReps, defKg) {
    return Array.from({length:n}, (_,i) => {
      const ex = existing && existing[i];
      if(ex && typeof ex === "object") return ex;
      const r = typeof ex === "number" ? ex : (parseInt(defReps)||10);
      return { reps:r, kg:parseFloat(defKg)||0 };
    });
  }

  const sets = buildSets(series, logForm.sets, logForm.reps, logForm.kg);

  function updateSeries(v) {
    const n = Math.max(1, parseInt(v)||1);
    setLogForm({...logForm, series:n, sets:buildSets(n, sets, logForm.reps, logForm.kg)});
  }
  function updateReps(idx, delta) {
    const s = sets.map((x,i) => i===idx ? {...x, reps:Math.max(0,(x.reps||0)+delta)} : x);
    setLogForm({...logForm, sets:s});
  }
  function updateWeight(idx, delta) {
    const s = sets.map((x,i) => i<idx ? x : {...x, kg:Math.max(0,Math.round(((x.kg||0)+delta)*10)/10)});
    setLogForm({...logForm, sets:s});
  }

  const iBtn = { background:C.card, border:"1px solid #2a2a2a", borderRadius:7, width:30, height:30, color:C.text, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" };

  return (
    <div>
      {mode==="reps" && (
        <>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <Stepper label="Séries" value={logForm.series} onChange={updateSeries} step={1} min={1}/>
          </div>
          <div style={{ fontSize:11, color:"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, marginBottom:9 }}>Détail par série</div>
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:18 }}>
            {sets.map((s,idx) => (
              <div key={idx} style={{ background:C.surface, border:"1px solid #2a2a2a", borderRadius:10, padding:"10px 13px", display:"flex", alignItems:"center", gap:9 }}>
                <div style={{ fontSize:11, color:"#444", fontWeight:600, minWidth:22 }}>S{idx+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Reps</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <button onClick={()=>updateReps(idx,-1)} style={iBtn}>−</button>
                    <div style={{ fontSize:18, fontWeight:700, minWidth:28, textAlign:"center" }}>{s.reps||0}</div>
                    <button onClick={()=>updateReps(idx,1)} style={iBtn}>+</button>
                  </div>
                </div>
                <div style={{ width:1, height:34, background:"#2a2a2a", flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Poids (kg)</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <button onClick={()=>updateWeight(idx,-2.5)} style={iBtn}>−</button>
                    <div style={{ fontSize:15, fontWeight:700, minWidth:42, textAlign:"center" }}>{s.kg||0}<span style={{ fontSize:10, color:"#444", fontWeight:400 }}>kg</span></div>
                    <button onClick={()=>updateWeight(idx,2.5)} style={iBtn}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {mode==="time" && (
        <div style={{ display:"flex", justifyContent:"space-around", marginBottom:22 }}>
          <Stepper label="Séries" value={logForm.series} onChange={v=>setLogForm({...logForm,series:Math.max(1,parseInt(v)||1)})} step={1} min={1}/>
          <Stepper label="Minutes" value={logForm.timeMin||0} onChange={v=>setLogForm({...logForm,timeMin:Math.max(0,parseInt(v)||0)})} step={1} min={0} unit="min"/>
          <Stepper label="Secondes" value={logForm.timeSec||0} onChange={v=>setLogForm({...logForm,timeSec:Math.min(59,Math.max(0,parseInt(v)||0))})} step={5} min={0} unit="sec"/>
        </div>
      )}
      <div style={{ marginBottom:4 }}>
        <div style={{ fontSize:11, color:"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, marginBottom:7 }}>Note</div>
        <input style={S.input} placeholder="Sensation, ressenti…" value={logForm.note||""} onChange={e=>setLogForm({...logForm,note:e.target.value})}/>
      </div>
    </div>
  );
}

// ─── PerfTags ─────────────────────────────────────────────────────────────────
function PerfTags({ entry }) {
  const mode = entry.mode || "reps";
  if(mode==="time") return (
    <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginTop:8 }}>
      <div style={S.tag}><span style={S.tagVal}>{entry.series||"—"}</span><span style={S.tagLabel}>séries</span></div>
      <div style={S.tag}><span style={S.tagVal}>{entry.timeMin||0}:{String(entry.timeSec||0).padStart(2,"0")}</span><span style={S.tagLabel}>temps</span></div>
      {entry.note && <div style={{ fontSize:12, color:C.muted, alignSelf:"center", fontStyle:"italic" }}>{entry.note}</div>}
    </div>
  );
  const sets = entry.sets || [];
  const isObj = sets.length > 0 && typeof sets[0] === "object";
  if(isObj) {
    const groups = [];
    sets.forEach(s => {
      const w = s.kg||0; const key = s.reps+"-"+w; const last = groups[groups.length-1];
      if(last && last.key===key) last.count++;
      else groups.push({key, reps:s.reps, w, count:1});
    });
    return (
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginTop:8, alignItems:"center" }}>
        {groups.map((g,i) => (
          <div key={i} style={{ ...S.tag, minWidth:"auto", padding:"5px 10px" }}>
            <span style={{ ...S.tagVal, fontSize:13 }}>{g.count>1?g.count+"×":""}{g.reps}r<span style={{ fontSize:11, color:C.muted, fontWeight:400 }}> {g.w}kg</span></span>
          </div>
        ))}
        {entry.note && <div style={{ fontSize:12, color:C.muted, fontStyle:"italic" }}>{entry.note}</div>}
      </div>
    );
  }
  const setsStr = sets.length>0 ? sets.join(" / ") : (entry.reps||"—");
  return (
    <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginTop:8, alignItems:"center" }}>
      <div style={S.tag}><span style={S.tagVal}>{entry.series||"—"}</span><span style={S.tagLabel}>séries</span></div>
      <div style={{ ...S.tag, minWidth:"auto" }}><span style={{ ...S.tagVal, fontSize:14 }}>{setsStr}</span><span style={S.tagLabel}>reps</span></div>
      <div style={S.tag}><span style={S.tagVal}>{entry.kg||"—"}</span><span style={S.tagLabel}>kg</span></div>
      {entry.note && <div style={{ fontSize:12, color:C.muted, fontStyle:"italic" }}>{entry.note}</div>}
    </div>
  );
}

// ─── ExoSettingsCard ──────────────────────────────────────────────────────────
function ExoSettingsCard({ exo, onSave, onDelete, onNavigate, defaultOpen, forceCollapse }) {
  const [open, setOpen] = useState(defaultOpen ? true : false);
  const [mode, setMode] = useState(exo.mode || "reps");
  const [kg, setKg] = useState(exo.defaultKg || 0);

  useEffect(() => { if(forceCollapse) setOpen(false); }, [forceCollapse]);
  useEffect(() => { if(defaultOpen) setOpen(true); }, [defaultOpen]);

  function save() { onSave({...exo, mode, defaultKg:kg}); setOpen(false); }

  return (
    <div style={{ background:C.card, border:"1px solid #2a2a2a", borderRadius:12, marginBottom:10, overflow:"hidden" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display:"flex", alignItems:"center", padding:"14px 16px", gap:10, cursor:"pointer" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:500 }}>{exo.name}</div>
          <div style={{ fontSize:12, color:C.muted, marginTop:3 }}>
            {exo.mode==="time"?"Temps":"Reps / KG"}{exo.defaultKg>0&&exo.mode!=="time" ? " · "+exo.defaultKg+"kg habituel" : ""}
          </div>
          {exo.canonicalId && <div style={{ fontSize:11, color:C.sub, marginTop:2 }}>données partagées</div>}
        </div>
        <button onClick={e=>{e.stopPropagation();onNavigate(exo.id);}} style={{ background:"transparent", border:"1px solid #2a2a2a", borderRadius:8, padding:"6px 12px", color:C.accent, fontSize:13, cursor:"pointer", fontWeight:500, flexShrink:0 }}>
          Performances
        </button>
        <span style={{ color:"#3a3a3a", fontSize:14, display:"inline-block", transform:open?"rotate(90deg)":"rotate(0deg)", transition:"transform 0.2s" }}>›</span>
      </div>
      {open && (
        <div style={{ padding:"0 16px 16px", borderTop:"1px solid #2a2a2a" }} className="fade-in">
          <div style={{ paddingTop:14 }}>
            <div style={{ fontSize:11, color:"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, marginBottom:9 }}>Type d'exercice</div>
            <div style={{ display:"flex", gap:7, marginBottom:18 }}>
              <button style={S.toggle(mode==="reps")} onClick={()=>setMode("reps")}>Répétitions / KG</button>
              <button style={S.toggle(mode==="time")} onClick={()=>setMode("time")}>Temps</button>
            </div>
            {mode==="reps" && (
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:11, color:"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, marginBottom:9 }}>Poids habituel</div>
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <button onClick={()=>setKg(v=>Math.max(0,Math.round((v-2.5)*10)/10))} style={{ background:C.surface, border:"1px solid #2a2a2a", borderRadius:8, width:38, height:38, fontSize:18, color:C.text, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                  <input type="number" value={kg} onChange={e=>setKg(parseFloat(e.target.value)||0)} style={{ ...S.input, textAlign:"center", fontSize:18, fontWeight:700, width:90 }}/>
                  <span style={{ color:C.muted, fontSize:14 }}>kg</span>
                  <button onClick={()=>setKg(v=>Math.round((v+2.5)*10)/10)} style={{ background:C.surface, border:"1px solid #2a2a2a", borderRadius:8, width:38, height:38, fontSize:18, color:C.text, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:7 }}>
              <button onClick={save} style={{ ...S.btnSave, flex:1, padding:"11px" }}>Enregistrer</button>
              <button onClick={()=>onDelete(exo.id)} style={{ background:"none", color:"#c47070", border:"1px solid #2a1818", borderRadius:9, padding:"11px 15px", fontSize:14, cursor:"pointer" }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const [view, setView] = useState("home");
  const [selGroupId, setSelGroupId] = useState(null);
  const [selExoId, setSelExoId] = useState(null);
  const [selSessionId, setSelSessionId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [calDate, setCalDate] = useState(new Date());
  const [showCal, setShowCal] = useState(false);
  const [newGName, setNewGName] = useState("");
  const [newEName, setNewEName] = useState("");
  const [lastAddedExoId, setLastAddedExoId] = useState(null);
  const [collapseVersion, setCollapseVersion] = useState(0);
  const [logForm, setLogForm] = useState({ series:4, reps:10, kg:0, sets:[], timeMin:1, timeSec:0, note:"" });
  const [mergePrompt, setMergePrompt] = useState(null);
  const pageKey = useRef(0);
  const exoTopRef = useRef(null);
  const saveTimeout = useRef(null);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}}) => { setSession(session); setAuthLoading(false); });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // CSS
  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = globalCss;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  // ── Chargement depuis le cloud au login ──
  useEffect(() => {
    if(!session) return;
    setSyncing(true);
    loadFromCloud(session.user.id).then(cloudData => {
      if(cloudData) {
        setDb(cloudData);
      } else {
        // Première connexion : essaye de récupérer localStorage comme migration
        try {
          const local = localStorage.getItem("sportup_v1");
          const localData = local ? JSON.parse(local) : seed;
          setDb(localData);
          // Sauvegarde immédiate du localStorage vers le cloud
          saveToCloud(session.user.id, localData);
        } catch { setDb(seed); }
      }
      setSyncing(false);
    });
  }, [session]);

  // ── Écoute en temps réel des changements Supabase ──
  useEffect(() => {
    if(!session) return;
    const channel = supabase
      .channel('user_data_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_data',
        filter: `user_id=eq.${session.user.id}`
      }, (payload) => {
        // Mise à jour reçue depuis un autre appareil
        if(payload.new?.data) setDb(payload.new.data);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [session]);

  // ── Sauvegarde cloud debouncée (300ms après chaque changement) ──
  const saveDb = useCallback((next) => {
    setDb(next);
    if(!session) return;
    if(saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveToCloud(session.user.id, next);
    }, 300);
  }, [session]);

  function navigate(newView, fn) {
    pageKey.current += 1;
    if(fn) fn();
    setView(newView);
  }
  function navTo(v) { setNewGName(""); navigate(v); }

  if(authLoading) return <div style={{ background:'#0a0a0a', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#555', fontFamily:C.font }}>Vérification…</div>;
  if(!session) return <AuthForm/>;
  if(syncing || !db) return (
    <div style={{ background:'#0a0a0a', height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#555', fontFamily:C.font, gap:12 }}>
      <Logo/>
      <div style={{ fontSize:13, marginTop:8 }}>Chargement de tes données…</div>
    </div>
  );

  const selGroup = db.groups.find(g => g.id===selGroupId) || null;
  const selSession = db.sessions.find(s => s.id===selSessionId) || null;

  function getAllLinkedIds(exoId) {
    let canon = exoId;
    db.groups.forEach(g=>g.exercises.forEach(e=>{ if(e.id===exoId&&e.canonicalId) canon=e.canonicalId; }));
    const ids = new Set([exoId]);
    db.groups.forEach(g=>g.exercises.forEach(e=>{ if(e.id===exoId||e.canonicalId===canon||e.id===canon) ids.add(e.id); }));
    return ids;
  }

  function perfsForExo(exoId) {
    const ids=getAllLinkedIds(exoId), res=[];
    db.sessions.forEach(s=>(s.entries||[]).forEach(e=>{ if(ids.has(e.exoId)) res.push({date:s.date,dateLabel:fmt(s.date),...e}); }));
    return res.sort((a,b)=>new Date(a.date)-new Date(b.date));
  }

  function makeDefaultForm(exo, lastPerf) {
    const mode=exo?.mode||"reps";
    const series=lastPerf?(parseInt(lastPerf.series)||4):4;
    const reps=lastPerf?(parseInt(lastPerf.reps)||10):10;
    const kg=lastPerf?(lastPerf.kg!==undefined?lastPerf.kg:(exo?.defaultKg||0)):(exo?.defaultKg||0);
    let sets;
    if(lastPerf&&lastPerf.sets&&lastPerf.sets.length>0) {
      sets=lastPerf.sets.map(s=>typeof s==="object"?s:{reps:s,kg});
      while(sets.length<series) sets.push(sets[sets.length-1]||{reps,kg});
      sets=sets.slice(0,series);
    } else { sets=Array(series).fill(null).map(()=>({reps,kg})); }
    return {series,reps,kg,sets,mode,timeMin:lastPerf?.timeMin||1,timeSec:lastPerf?.timeSec||0,note:""};
  }

  function addGroup() {
    if(!newGName.trim()) return;
    const newId = uid();
    saveDb({...db, groups:[...db.groups, {id:newId, name:newGName.trim().toUpperCase(), exercises:[]}]});
    setNewGName(""); setSelGroupId(newId); setNewEName(""); navigate("group");
  }
  function deleteGroup(gid) {
    saveDb({...db, groups:db.groups.filter(g=>g.id!==gid)});
    navigate("groups", ()=>setSelGroupId(null));
  }
  function addExercise(forceName) {
    const name = (forceName||newEName).trim();
    if(!name||!selGroupId) return;
    const newExoId = uid();
    const newExo = {id:newExoId, name, defaultKg:0, mode:"reps"};
    const similar = findSimilarExos(db, name, null);
    if(similar.length>0) { setMergePrompt({newExo, groupId:selGroupId, matches:similar, linked:[]}); setNewEName(""); return; }
    setCollapseVersion(v => v+1); setLastAddedExoId(newExoId);
    saveDb({...db, groups:db.groups.map(g=>g.id===selGroupId ? {...g, exercises:[newExo,...g.exercises]} : g)});
    setNewEName("");
    setTimeout(() => { exoTopRef.current?.scrollIntoView({behavior:"smooth", block:"start"}); }, 80);
  }
  function confirmAddExercise(linkedIds) {
    if(!mergePrompt) return;
    const {newExo, groupId} = mergePrompt;
    let finalExo = {...newExo};
    if(linkedIds.length>0) {
      let canon = linkedIds[0];
      db.groups.forEach(g=>g.exercises.forEach(e=>{ if(e.id===linkedIds[0]&&e.canonicalId) canon=e.canonicalId; }));
      finalExo.canonicalId = canon;
    }
    setCollapseVersion(v => v+1); setLastAddedExoId(finalExo.id);
    saveDb({...db, groups:db.groups.map(g=>g.id===groupId ? {...g, exercises:[finalExo,...g.exercises]} : g)});
    setMergePrompt(null);
    setTimeout(() => { exoTopRef.current?.scrollIntoView({behavior:"smooth", block:"start"}); }, 80);
  }
  function updateExercise(gid, updatedExo) {
    if(updatedExo.id===lastAddedExoId) setLastAddedExoId(null);
    saveDb({...db, groups:db.groups.map(g=>g.id===gid ? {...g, exercises:g.exercises.map(e=>e.id===updatedExo.id?updatedExo:e)} : g)});
  }
  function deleteExercise(gid, eid) {
    saveDb({...db, groups:db.groups.map(g=>g.id===gid ? {...g, exercises:g.exercises.filter(e=>e.id!==eid)} : g)});
  }
  function deleteSession(sid) {
    saveDb({...db, sessions:db.sessions.filter(s=>s.id!==sid)});
    navigate("history", ()=>setSelSessionId(null));
  }
  function startSession(gid) {
    const g = db.groups.find(x=>x.id===gid);
    if(!g||g.exercises.length===0) return;
    const name = g.name + " — " + calDate.toLocaleDateString("fr-FR",{day:"numeric",month:"short"});
    const queue = g.exercises.map(exo => {
      const perfs = perfsForExo(exo.id);
      const last = perfs[perfs.length-1];
      return {exoId:exo.id, groupId:gid, form:makeDefaultForm(exo, last||null)};
    });
    const first = queue[0];
    const sess = {id:uid(), name, date:calDate.toISOString(), entries:[], step:"logExo", pickedGroup:gid, pickedExo:first.exoId, importQueue:queue.slice(1)};
    setActiveSession(sess); setLogForm(first.form); navigate("doSession");
  }
  function finishAndSave(entries) {
    const sess = {id:activeSession.id, name:activeSession.name, date:activeSession.date, entries};
    saveDb({...db, sessions:[sess, ...db.sessions]});
    setActiveSession(null); navigate("home");
  }
  function logEntry() {
    const g = db.groups.find(grp=>grp.exercises.some(e=>e.id===activeSession.pickedExo));
    const exo = g?.exercises.find(e=>e.id===activeSession.pickedExo);
    const entry = {exoId:activeSession.pickedExo, ...logForm, mode:exo?.mode||"reps"};
    advanceQueue([...activeSession.entries, entry]);
  }
  function skipEntry() { advanceQueue(activeSession.entries); }
  function advanceQueue(newEntries) {
    const queue = activeSession.importQueue || [];
    if(queue.length>0) {
      const next = queue[0];
      setLogForm(next.form);
      setActiveSession({...activeSession, entries:newEntries, step:"logExo", pickedGroup:next.groupId, pickedExo:next.exoId, importQueue:queue.slice(1)});
    } else { finishAndSave(newEntries); }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HOME
  // ═══════════════════════════════════════════════════════════════════════════
  if(view==="home") return (
    <div style={S.app}>
      <div style={S.hdr}>
        <Logo/>
        <AccountIcon session={session}/>
      </div>
      <div style={S.body} className="page-enter" key={pageKey.current}>

        {/* ── Date cliquable avec affordance visuelle ── */}
        <button
          className="date-btn"
          onClick={() => setShowCal(!showCal)}
          style={{
            background: showCal ? "#1a1a1a" : "#161616",
            border: "1px solid " + (showCal ? "#3a3a3a" : "#252525"),
            borderRadius: 11,
            cursor: "pointer",
            padding: "12px 15px",
            marginBottom: 0,
            textAlign: "left",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            fontFamily: C.font,
          }}
        >
          <div>
            <div style={{ fontSize:11, color:"#555", fontWeight:600, textTransform:"uppercase", letterSpacing:1.8, marginBottom:4 }}>
              Date de la séance
            </div>
            <div style={{ fontSize:16, fontWeight:600, color: showCal ? C.text : "#ccc" }}>
              {fmtDateLong(calDate)}
            </div>
          </div>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={showCal ? C.text : "#444"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink:0, transform: showCal ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s" }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {showCal && (
          <div style={{ marginTop:10 }}>
            <Calendar calDate={calDate} setCalDate={setCalDate} sessions={db.sessions}/>
          </div>
        )}

        {/* ── Titre de section ── */}
        <div style={{ marginTop: 28, marginBottom: 16 }}>
          <span style={{
            fontSize: 20,
            fontWeight: 700,
            color: C.text,
            textTransform: "uppercase",
            letterSpacing: 0.8,
            display: "block",
          }}>
            On bosse quoi aujourd'hui ?
          </span>
        </div>

        {db.groups.length > 0 && db.groups.map(g => (
          <Card key={g.id} onClick={() => startSession(g.id)}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:16, fontWeight:600 }}>{g.name}</div>
                <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>{g.exercises.length} exercice{g.exercises.length>1?"s":""}</div>
              </div>
              <span style={{ color:"#3a3a3a", fontSize:18 }}>›</span>
            </div>
          </Card>
        ))}

        {db.groups.length === 0 && (
          <div style={{ background:C.surface, border:"1px solid #2a2a2a", borderRadius:12, padding:"22px 18px", textAlign:"center", marginTop:10 }}>
            <div style={{ fontSize:15, color:C.muted, marginBottom:14 }}>Aucune séance créée</div>
            <button style={{ ...S.btn, width:"auto", padding:"11px 22px", margin:0, display:"inline-block" }} onClick={() => navTo("groups")}>
              Créer ma première séance
            </button>
          </div>
        )}
      </div>
      <BottomNav cur="home" onNav={navTo}/>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // GROUPS
  // ═══════════════════════════════════════════════════════════════════════════
  if(view==="groups") return (
    <div style={S.app}>
      <div style={S.hdr}><Logo/></div>
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <h1 style={S.h1}>Mes séances</h1>
        <p style={S.sub}>Crée tes types de séances et leurs exercices</p>
        <div style={S.sec}>Nouvelle séance</div>
        <input style={{ ...S.input, marginBottom:10 }} placeholder="ex : DOS, BRAS, FULL BODY…" value={newGName}
          onChange={e=>setNewGName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addGroup()}/>
        <button style={{ ...S.btn, marginBottom:24 }} onClick={addGroup}>Créer la séance</button>
        <div style={S.sec}>Séances existantes</div>
        {db.groups.map(g => (
          <Card key={g.id} onClick={()=>{setSelGroupId(g.id);setNewEName("");navigate("group");}}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:15, fontWeight:500 }}>{g.name}</div>
                <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>{g.exercises.length} exercice{g.exercises.length>1?"s":""}</div>
              </div>
              <span style={{ color:"#3a3a3a", fontSize:18 }}>›</span>
            </div>
          </Card>
        ))}
        {db.groups.length===0 && <p style={{ color:C.muted, fontSize:14 }}>Aucune séance. Crée-en une !</p>}
      </div>
      <BottomNav cur="groups" onNav={navTo}/>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // GROUP DETAIL
  // ═══════════════════════════════════════════════════════════════════════════
  if(view==="group" && selGroup) return (
    <div style={S.app}>
      <div style={S.hdr}>
        <Logo/>
        <button style={S.back} onClick={()=>navigate("groups")}>← Séances</button>
      </div>
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <h1 style={S.h1}>{selGroup.name}</h1>
        <p style={S.sub}>{selGroup.exercises.length} exercice{selGroup.exercises.length>1?"s":""}</p>
        <div style={S.sec}>Ajouter un exercice</div>

        {mergePrompt && mergePrompt.groupId===selGroupId && (
          <div style={{ background:"#181818", border:"1px solid #333", borderRadius:12, padding:16, marginBottom:15 }} className="fade-in">
            <div style={{ fontSize:15, fontWeight:600, marginBottom:5 }}>Exercice similaire détecté</div>
            <div style={{ fontSize:13, color:C.muted, marginBottom:14 }}>
              <span style={{ color:C.text, fontWeight:500 }}>"{mergePrompt.newExo.name}"</span> ressemble à :
            </div>
            {mergePrompt.matches.map(({exo,group}) => {
              const isLinked = mergePrompt.linked.includes(exo.id);
              return (
                <div key={exo.id} style={{ display:"flex", alignItems:"center", gap:10, background:isLinked?"#1e2a1e":C.card, border:"1px solid "+(isLinked?"#3a5a3a":"#2a2a2a"), borderRadius:10, padding:"10px 14px", marginBottom:8, cursor:"pointer" }}
                  onClick={()=>{ const linked=isLinked?mergePrompt.linked.filter(id=>id!==exo.id):[...mergePrompt.linked,exo.id]; setMergePrompt({...mergePrompt,linked}); }}>
                  <div style={{ width:19, height:19, borderRadius:5, border:"2px solid "+(isLinked?"#5a9a5a":"#2a2a2a"), background:isLinked?"#5a9a5a":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {isLinked && <span style={{ color:"#0a1410", fontSize:12, fontWeight:700 }}>✓</span>}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:500 }}>{exo.name}</div>
                    <div style={{ fontSize:12, color:C.muted }}>{group.name}</div>
                  </div>
                </div>
              );
            })}
            <div style={{ fontSize:12, color:C.muted, marginBottom:13 }}>
              {mergePrompt.linked.length>0 ? "Coché = historique partagé" : "Coche pour partager l'historique"}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>confirmAddExercise(mergePrompt.linked)} style={{ flex:1, background:"#2a2a2a", color:C.text, border:"1px solid #444", borderRadius:9, padding:"11px", fontSize:14, fontWeight:500, cursor:"pointer" }}>
                {mergePrompt.linked.length>0?"Lier & ajouter":"Ajouter sans lier"}
              </button>
              <button onClick={()=>setMergePrompt(null)} style={{ background:"transparent", color:C.muted, border:"1px solid #2a2a2a", borderRadius:9, padding:"11px 15px", fontSize:14, cursor:"pointer" }}>Annuler</button>
            </div>
          </div>
        )}

        {!mergePrompt && (
          <>
            <input style={{ ...S.input, marginBottom:10 }} placeholder="ex : Tractions, Développé couché…" value={newEName}
              onChange={e=>setNewEName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addExercise()}/>
            <button style={{ ...S.btn, marginBottom:24 }} onClick={()=>addExercise()}>Ajouter l'exercice</button>
          </>
        )}

        <div style={S.sec} ref={exoTopRef}>Exercices</div>
        {selGroup.exercises.map((e) => (
          <ExoSettingsCard key={e.id} exo={e} defaultOpen={e.id===lastAddedExoId}
            forceCollapse={e.id!==lastAddedExoId && collapseVersion > 0}
            onSave={updated => updateExercise(selGroup.id, updated)}
            onDelete={eid => deleteExercise(selGroup.id, eid)}
            onNavigate={eid => { setSelExoId(eid); navigate("exo"); }}
          />
        ))}
        {selGroup.exercises.length===0 && <p style={{ color:C.muted, fontSize:14 }}>Aucun exercice. Ajoute-en un !</p>}
        <button style={S.danger} onClick={()=>deleteGroup(selGroup.id)}>Supprimer la séance "{selGroup.name}"</button>
      </div>
      <BottomNav cur="groups" onNav={navTo}/>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // EXO STATS
  // ═══════════════════════════════════════════════════════════════════════════
  if(view==="exo") {
    const group = db.groups.find(g=>g.exercises.some(e=>e.id===selExoId));
    const exo = group?.exercises.find(e=>e.id===selExoId);
    const perfs = perfsForExo(selExoId);
    const last = perfs[perfs.length-1];
    const chartData = perfs.map(p => {
      let avgReps=0, avgKg=0;
      if(p.sets && p.sets.length>0) {
        if(typeof p.sets[0]==="object") {
          avgReps=Math.round(p.sets.reduce((a,s)=>a+(s.reps||0),0)/p.sets.length);
          avgKg=Math.round(p.sets.reduce((a,s)=>a+(s.kg||0),0)/p.sets.length*10)/10;
        } else { avgReps=Math.round(p.sets.reduce((a,b)=>a+b,0)/p.sets.length); avgKg=parseFloat(p.kg)||0; }
      }
      return {date:p.dateLabel, kg:avgKg, reps:avgReps};
    });
    return (
      <div style={S.app}>
        <div style={S.hdr}><Logo/></div>
        <div style={S.body} className="page-enter" key={pageKey.current}>
          <button style={S.back} onClick={()=>navigate("group")}>← {group?.name}</button>
          <h1 style={S.h1}>{exo?.name}</h1>
          <p style={S.sub}>{perfs.length} enregistrement{perfs.length>1?"s":""} · {exo?.mode==="time"?"Temps":"Reps / KG"}</p>
          {last && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:24 }}>
              <div style={S.statBox}><div style={S.statNum}>{last.series||"—"}</div><div style={S.statLabel}>séries</div></div>
              {last.mode==="time"
                ? <div style={S.statBox}><div style={{ ...S.statNum, fontSize:19 }}>{last.timeMin}:{String(last.timeSec||0).padStart(2,"0")}</div><div style={S.statLabel}>temps</div></div>
                : <div style={S.statBox}><div style={{ ...S.statNum, fontSize:14 }}>{last.sets&&typeof last.sets[0]==="object"?last.sets.map(s=>s.reps).join("/"):(last.sets?last.sets.join("/"):last.reps||"—")}</div><div style={S.statLabel}>reps</div></div>
              }
              <div style={S.statBox}><div style={S.statNum}>{last.kg||"—"}</div><div style={S.statLabel}>kg</div></div>
            </div>
          )}
          {chartData.length>=2 && (
            <>
              {chartData.some(d=>d.kg>0) && (
                <>
                  <div style={S.sec}>Progression poids (kg)</div>
                  <Card style={{ marginBottom:20, cursor:"default", padding:"15px 6px 6px" }}>
                    <ResponsiveContainer width="100%" height={130}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" tick={{ fontSize:10, fill:C.muted }}/>
                        <YAxis tick={{ fontSize:10, fill:C.muted }} width={30}/>
                        <Tooltip contentStyle={{ background:C.card, border:"1px solid #2a2a2a", color:C.text, fontSize:12, borderRadius:8 }}/>
                        <Line type="monotone" dataKey="kg" stroke={C.accent} strokeWidth={1.5} dot={{ fill:C.accent, r:3 }}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              )}
              {chartData.some(d=>d.reps>0) && (
                <>
                  <div style={S.sec}>Progression reps (moy/série)</div>
                  <Card style={{ marginBottom:24, cursor:"default", padding:"15px 6px 6px" }}>
                    <ResponsiveContainer width="100%" height={110}>
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" tick={{ fontSize:10, fill:C.muted }}/>
                        <YAxis tick={{ fontSize:10, fill:C.muted }} width={30}/>
                        <Tooltip contentStyle={{ background:C.card, border:"1px solid #2a2a2a", color:C.text, fontSize:12, borderRadius:8 }}/>
                        <Line type="monotone" dataKey="reps" stroke="#aaa" strokeWidth={1.5} dot={{ fill:"#aaa", r:3 }}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              )}
            </>
          )}
          {chartData.length<2 && <p style={{ color:C.muted, fontSize:13, marginBottom:20 }}>Encore {2-chartData.length} séance{chartData.length===0?"s":""} pour voir le graphique.</p>}
          {perfs.length>0 && (
            <>
              <div style={S.sec}>Historique</div>
              {[...perfs].reverse().map((p,i) => (
                <Card key={i} style={{ cursor:"default" }}>
                  <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{p.dateLabel}</div>
                  <PerfTags entry={p}/>
                </Card>
              ))}
            </>
          )}
          {perfs.length===0 && <p style={{ color:C.muted, fontSize:14 }}>Pas encore de données.</p>}
          <button style={S.danger} onClick={()=>{deleteExercise(group?.id, selExoId); navigate("group");}}>Supprimer "{exo?.name}"</button>
        </div>
        <BottomNav cur="groups" onNav={navTo}/>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION EN COURS
  // ═══════════════════════════════════════════════════════════════════════════
  if(view==="doSession" && activeSession && activeSession.step==="logExo") {
    const g = db.groups.find(x=>x.id===activeSession.pickedGroup);
    const exo = g?.exercises.find(x=>x.id===activeSession.pickedExo);
    const perfs = perfsForExo(activeSession.pickedExo);
    const last = perfs[perfs.length-1];
    const queue = activeSession.importQueue || [];
    const total = g?.exercises.length || 0;
    const done = total - queue.length - 1;
    const nextName = queue.length>0 ? db.groups.find(x=>x.id===queue[0]?.groupId)?.exercises.find(e=>e.id===queue[0]?.exoId)?.name : null;

    return (
      <div style={S.app}>
        <div style={S.hdr}>
          <Logo/>
          <span style={{ fontSize:11, color:C.sub, fontWeight:600, background:"#1a1a1a", padding:"5px 11px", borderRadius:20, letterSpacing:1.5, textTransform:"uppercase", border:"1px solid #2a2a2a" }}>En cours</span>
        </div>
        <div style={S.body} className="page-enter">
          {total>1 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:12, color:C.muted }}>{activeSession.name}</span>
                <span style={{ fontSize:12, color:C.muted, fontWeight:600 }}>{done+1} / {total}</span>
              </div>
              <div style={{ background:"#222", borderRadius:3, height:2 }}>
                <div style={{ background:C.accent, borderRadius:3, height:2, width:((done+1)/total*100)+"%", transition:"width 0.25s" }}/>
              </div>
            </div>
          )}
          <h1 style={{ ...S.h1, marginBottom:5 }}>{exo?.name}</h1>
          {last && (
            <Card style={{ cursor:"default", marginBottom:18, background:"#161616", borderColor:"#2a2a2a" }}>
              <div style={{ fontSize:12, color:C.sub, fontWeight:500, marginBottom:4 }}>Dernière fois — {fmt(last.date)}</div>
              <PerfTags entry={last}/>
            </Card>
          )}
          {activeSession.entries.length>0 && (
            <div style={{ marginBottom:16 }}>
              <div style={S.sec}>Déjà enregistré</div>
              {activeSession.entries.map((e,i) => {
                const eg = db.groups.find(g=>g.exercises.some(x=>x.id===e.exoId));
                const ee = eg?.exercises.find(x=>x.id===e.exoId);
                return <div key={i} style={{ fontSize:13, color:C.muted, marginBottom:4 }}>✓ {ee?.name||"—"}</div>;
              })}
            </div>
          )}
          <LogFormWidget logForm={logForm} setLogForm={setLogForm} exo={exo}/>
          <div style={{ height:18 }}/>

          {/* Valider la séance — toujours visible */}
          <button
            style={{ ...S.ghost, borderColor:C.accent, color:C.accent, fontWeight:700, marginBottom:8 }}
            onClick={() => finishAndSave(activeSession.entries)}
          >
            ✓ Valider la séance
          </button>

          <button style={S.btn} onClick={logEntry}>
            {nextName ? "Valider → " + nextName : "Valider cet exercice"}
          </button>

          <button style={{ ...S.ghost, color:C.muted, borderColor:"#2a2a2a", marginBottom:8 }} onClick={skipEntry}>
            {nextName ? "Passer → "+nextName : "Passer sans enregistrer"}
          </button>
          <button style={S.danger} onClick={()=>{setActiveSession(null); navigate("home");}}>Annuler la séance</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HISTORY
  // ═══════════════════════════════════════════════════════════════════════════
  if(view==="history") return (
    <div style={S.app}>
      <div style={S.hdr}><Logo/></div>
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <h1 style={S.h1}>Historique</h1>
        <p style={S.sub}>{db.sessions.length} séance{db.sessions.length>1?"s":""}</p>
        {db.sessions.length===0 && <p style={{ color:C.muted, fontSize:14 }}>Aucune séance enregistrée.</p>}
        {[...db.sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(s => (
          <Card key={s.id} onClick={()=>{setSelSessionId(s.id); navigate("sessionDetail");}}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:15, fontWeight:500 }}>{s.name}</div>
                <div style={{ fontSize:13, color:C.muted, marginTop:3 }}>{s.entries?.length||0} exercice{(s.entries?.length||0)>1?"s":""}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:13, color:C.muted }}>{fmt(s.date)}</div>
                <span style={{ color:"#3a3a3a", fontSize:18 }}>›</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav cur="history" onNav={navTo}/>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION DETAIL
  // ═══════════════════════════════════════════════════════════════════════════
  if(view==="sessionDetail" && selSession) return (
    <div style={S.app}>
      <div style={S.hdr}><Logo/></div>
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <button style={S.back} onClick={()=>navigate("history")}>← Historique</button>
        <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>{fmt(selSession.date)}</div>
        <h1 style={{ ...S.h1, marginBottom:20 }}>{selSession.name}</h1>
        {(selSession.entries||[]).map((e,i) => {
          const g = db.groups.find(g=>g.exercises.some(x=>x.id===e.exoId));
          const exo = g?.exercises.find(x=>x.id===e.exoId);
          return (
            <Card key={i} style={{ cursor:"default" }}>
              <div style={{ fontSize:14, fontWeight:500, marginBottom:4 }}>{exo?.name||"Exercice supprimé"}</div>
              <PerfTags entry={e}/>
            </Card>
          );
        })}
        {(selSession.entries||[]).length===0 && <p style={{ color:C.muted, fontSize:14 }}>Aucun exercice enregistré.</p>}
        <button style={S.danger} onClick={()=>deleteSession(selSession.id)}>Supprimer cette séance</button>
      </div>
      <BottomNav cur="history" onNav={navTo}/>
    </div>
  );

  return null;
}
