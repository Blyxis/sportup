import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect, useRef, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const supabaseUrl = 'https://rnypcpzblmnpirwpregh.supabase.co';
const supabaseKey = 'sb_publishable_URXAdXQihgYxTNwsOoOd3A_Qy7RR_D5';
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Standard Themes ──────────────────────────────────────────────────────────
const THEMES = {
  'obsidian': {
    name: 'Noir Obsidian',
    accent: '#8ba5bf',
    grad: 'linear-gradient(145deg,#9fb8d0,#7090aa,#4a6880)',
    logoGrad: 'linear-gradient(135deg,#9fb8d0 0%,#6888a4 50%,#d0dce8 100%)',
    stopA: '#9fb8d0', stopB: '#6888a4', stopC: '#d0dce8',
  },
  'editorial': {
    name: 'Lumière Éditoriale',
    accent: '#c8a96e',
    grad: 'linear-gradient(145deg,#ddc080,#c8a96e,#a07840)',
    logoGrad: 'linear-gradient(135deg,#ddc080 0%,#a87840 50%,#f0e0c0 100%)',
    stopA: '#ddc080', stopB: '#a87840', stopC: '#f0e0c0',
  },
  'brutal': {
    name: 'Brutalisme Raw',
    accent: '#e8e020',
    grad: 'linear-gradient(145deg,#f8f040,#e0d800,#a8a000)',
    logoGrad: 'linear-gradient(135deg,#f0e830 0%,#b0a800 50%,#f8f4a0 100%)',
    stopA: '#f0e830', stopB: '#b0a800', stopC: '#f8f4a0',
  },
  'pastel': {
    name: 'Douceur Pastel',
    accent: '#d890b8',
    grad: 'linear-gradient(145deg,#eca8cc,#d880b0,#b05888)',
    logoGrad: 'linear-gradient(135deg,#eca8cc 0%,#c06898 50%,#f8d0e8 100%)',
    stopA: '#eca8cc', stopB: '#c06898', stopC: '#f8d0e8',
  },
  'carbone': {
    name: 'Carbone & Chrome',
    accent: '#a8b8c4',
    grad: 'linear-gradient(145deg,#c0d0d8,#98aab8,#607080)',
    logoGrad: 'linear-gradient(135deg,#c8d8e0 0%,#708090 50%,#e0e8ec 100%)',
    stopA: '#c8d8e0', stopB: '#708090', stopC: '#e0e8ec',
  },
  'redimpact': {
    name: 'Red Impact',
    accent: '#e03030',
    grad: 'linear-gradient(145deg,#f05050,#e03030,#b01818)',
    logoGrad: 'linear-gradient(135deg,#f05050 0%,#b81818 50%,#f8b0b0 100%)',
    stopA: '#f05050', stopB: '#b81818', stopC: '#f8b0b0',
  },
};

// ─── Premium Themes ───────────────────────────────────────────────────────────
const PREMIUM_THEMES = {

  // ── 1. AURORA ──
  'aurora': {
    name: 'Aurora Borealis',
    tagline: 'Lumières du Nord',
    accent: '#5effc8',
    grad: 'linear-gradient(135deg,#00c896,#5effc8,#a78bfa)',
    logoGrad: 'linear-gradient(135deg,#00c896 0%,#5effc8 50%,#a78bfa 100%)',
    stopA: '#00c896', stopB: '#5effc8', stopC: '#a78bfa',
    bg: '#030b10',
    surface: '#071520',
    card: '#0b1e2e',
    border: '#102838',
    text: '#e8fffa',
    muted: '#4db896',
    faint: '#0d2030',
    sub: '#3a9a7a',
    fontFamily: "'Space Grotesk', -apple-system, sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap",
    bgEffect: `
      background: #030b10;
      background-image: 
        radial-gradient(ellipse at 15% 40%, rgba(0,200,150,0.14) 0%, transparent 55%),
        radial-gradient(ellipse at 85% 15%, rgba(167,139,250,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 90%, rgba(0,150,120,0.06) 0%, transparent 40%);
    `,
    cardBg: 'linear-gradient(135deg, rgba(0,200,150,0.07) 0%, rgba(11,30,46,1) 100%)',
    borderStyle: '1px solid rgba(94,255,200,0.18)',
    navGlow: '0 -1px 40px rgba(0,200,150,0.15)',
    btnGlow: '0 4px 28px rgba(94,255,200,0.45)',
    headerBg: 'rgba(3,11,16,0.97)',
    headerBorder: '1px solid rgba(94,255,200,0.12)',
    textGradient: 'linear-gradient(135deg,#5effc8,#a78bfa)',
  },

  // ── 2. VELVET ──
  'velvet': {
    name: 'Velvet Noir',
    tagline: 'Luxe & Profondeur',
    accent: '#c084fc',
    grad: 'linear-gradient(135deg,#7c3aed,#c084fc,#f0abfc)',
    logoGrad: 'linear-gradient(135deg,#7c3aed 0%,#c084fc 50%,#f0abfc 100%)',
    stopA: '#7c3aed', stopB: '#c084fc', stopC: '#f0abfc',
    bg: '#07040f',
    surface: '#0f0820',
    card: '#160c2e',
    border: '#241438',
    text: '#f5eeff',
    muted: '#9d6ec0',
    faint: '#1a1030',
    sub: '#7a4aaa',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap",
    bgEffect: `
      background: #07040f;
      background-image: 
        radial-gradient(ellipse at 25% 25%, rgba(124,58,237,0.18) 0%, transparent 55%),
        radial-gradient(ellipse at 75% 75%, rgba(192,132,252,0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 0%, rgba(240,171,252,0.05) 0%, transparent 40%);
    `,
    cardBg: 'linear-gradient(145deg, rgba(124,58,237,0.1) 0%, rgba(22,12,46,1) 100%)',
    borderStyle: '1px solid rgba(192,132,252,0.22)',
    navGlow: '0 -1px 50px rgba(124,58,237,0.2)',
    btnGlow: '0 4px 32px rgba(192,132,252,0.5)',
    headerBg: 'rgba(7,4,15,0.98)',
    headerBorder: '1px solid rgba(192,132,252,0.18)',
    textGradient: 'linear-gradient(135deg,#c084fc,#f0abfc)',
  },

  // ── 3. TITANIUM ──
  'titanium': {
    name: 'Titanium Pro',
    tagline: 'Précision industrielle',
    accent: '#a8c4d8',
    grad: 'linear-gradient(135deg,#607080,#a8c4d8,#d0e4f0)',
    logoGrad: 'linear-gradient(135deg,#607080 0%,#a8c4d8 50%,#d0e4f0 100%)',
    stopA: '#607080', stopB: '#a8c4d8', stopC: '#d0e4f0',
    bg: '#0a0b0d',
    surface: '#111316',
    card: '#171a1e',
    border: '#222830',
    text: '#dde6ee',
    muted: '#6a8090',
    faint: '#1a1e24',
    sub: '#5a7080',
    fontFamily: "'DM Mono', 'Courier New', monospace",
    fontImport: "https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap",
    bgEffect: `
      background: #0a0b0d;
      background-image: 
        repeating-linear-gradient(0deg, transparent, transparent 48px, rgba(168,196,216,0.025) 48px, rgba(168,196,216,0.025) 49px),
        repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(168,196,216,0.018) 48px, rgba(168,196,216,0.018) 49px),
        radial-gradient(ellipse at 80% 20%, rgba(168,196,216,0.04) 0%, transparent 50%);
    `,
    cardBg: 'linear-gradient(145deg, rgba(168,196,216,0.06) 0%, rgba(23,26,30,1) 100%)',
    borderStyle: '1px solid rgba(168,196,216,0.14)',
    navGlow: '0 -1px 20px rgba(168,196,216,0.07)',
    btnGlow: '0 4px 22px rgba(168,196,216,0.3)',
    headerBg: 'rgba(10,11,13,0.98)',
    headerBorder: '1px solid rgba(168,196,216,0.08)',
    textGradient: 'linear-gradient(135deg,#a8c4d8,#d0e4f0)',
  },

  // ── 4. EMBER ──
  'ember': {
    name: 'Ember Forge',
    tagline: 'Feu & Puissance',
    accent: '#ff7040',
    grad: 'linear-gradient(135deg,#cc2200,#ff5522,#ffaa00)',
    logoGrad: 'linear-gradient(135deg,#cc2200 0%,#ff5522 50%,#ffaa00 100%)',
    stopA: '#cc2200', stopB: '#ff5522', stopC: '#ffaa00',
    bg: '#0a0500',
    surface: '#150a00',
    card: '#1e0e00',
    border: '#301800',
    text: '#ffe8d0',
    muted: '#aa6030',
    faint: '#220f00',
    sub: '#883318',
    fontFamily: "'Bebas Neue', 'Impact', sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap",
    bgEffect: `
      background: #0a0500;
      background-image: 
        radial-gradient(ellipse at 50% 110%, rgba(255,80,0,0.22) 0%, rgba(255,40,0,0.08) 35%, transparent 60%),
        radial-gradient(ellipse at 20% 80%, rgba(200,50,0,0.1) 0%, transparent 40%),
        radial-gradient(ellipse at 80% 90%, rgba(255,120,0,0.08) 0%, transparent 35%),
        radial-gradient(ellipse at 50% 0%, rgba(80,20,0,0.4) 0%, transparent 50%);
    `,
    cardBg: 'linear-gradient(165deg, rgba(255,100,30,0.1) 0%, rgba(30,14,0,1) 60%)',
    borderStyle: '1px solid rgba(255,100,40,0.2)',
    navGlow: '0 -2px 50px rgba(255,80,0,0.25)',
    btnGlow: '0 4px 30px rgba(255,112,64,0.6), 0 0 60px rgba(255,80,0,0.2)',
    headerBg: 'rgba(10,5,0,0.99)',
    headerBorder: '1px solid rgba(255,100,40,0.16)',
    textGradient: 'linear-gradient(135deg,#ff7040,#ffaa00)',
  },

  // ── 5. GLACIER ──
  'glacier': {
    name: 'Glacier Ice',
    tagline: 'Clarté cristalline',
    accent: '#60c8f0',
    grad: 'linear-gradient(135deg,#0a6090,#60c8f0,#b0e8ff)',
    logoGrad: 'linear-gradient(135deg,#0a6090 0%,#60c8f0 50%,#b0e8ff 100%)',
    stopA: '#0a6090', stopB: '#60c8f0', stopC: '#b0e8ff',
    bg: '#040c14',
    surface: '#081624',
    card: '#0c1e30',
    border: '#102840',
    text: '#d8f0ff',
    muted: '#4a90b8',
    faint: '#0e2030',
    sub: '#3a7898',
    fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
    bgEffect: `
      background: #040c14;
      background-image: 
        radial-gradient(ellipse at 60% 10%, rgba(96,200,240,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 10% 60%, rgba(10,96,144,0.15) 0%, transparent 45%),
        radial-gradient(ellipse at 90% 90%, rgba(176,232,255,0.05) 0%, transparent 40%);
    `,
    cardBg: 'linear-gradient(145deg, rgba(96,200,240,0.08) 0%, rgba(12,30,48,1) 100%)',
    borderStyle: '1px solid rgba(96,200,240,0.18)',
    navGlow: '0 -1px 40px rgba(10,96,144,0.2)',
    btnGlow: '0 4px 26px rgba(96,200,240,0.45)',
    headerBg: 'rgba(4,12,20,0.98)',
    headerBorder: '1px solid rgba(96,200,240,0.14)',
    textGradient: 'linear-gradient(135deg,#60c8f0,#b0e8ff)',
  },

  // ── 6. MIDNIGHT ──
  'midnight': {
    name: 'Minuit Circuit',
    tagline: 'Néon & Data',
    accent: '#00f090',
    grad: 'linear-gradient(135deg,#00b870,#00f090,#00d4ff)',
    logoGrad: 'linear-gradient(135deg,#00b870 0%,#00f090 50%,#00d4ff 100%)',
    stopA: '#00b870', stopB: '#00f090', stopC: '#00d4ff',
    bg: '#010408',
    surface: '#030810',
    card: '#050d18',
    border: '#0a1828',
    text: '#d0ffe8',
    muted: '#2a8860',
    faint: '#071020',
    sub: '#1a7050',
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontImport: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap",
    bgEffect: `
      background: #010408;
      background-image: 
        repeating-linear-gradient(0deg, transparent, transparent 58px, rgba(0,240,144,0.022) 58px, rgba(0,240,144,0.022) 59px),
        repeating-linear-gradient(90deg, transparent, transparent 58px, rgba(0,240,144,0.012) 58px, rgba(0,240,144,0.012) 59px),
        radial-gradient(ellipse at 50% 0%, rgba(0,240,144,0.1) 0%, transparent 45%),
        radial-gradient(ellipse at 50% 100%, rgba(0,180,112,0.06) 0%, transparent 40%);
    `,
    cardBg: 'linear-gradient(145deg, rgba(0,240,144,0.06) 0%, rgba(5,13,24,1) 100%)',
    borderStyle: '1px solid rgba(0,240,144,0.14)',
    navGlow: '0 -1px 50px rgba(0,240,144,0.18)',
    btnGlow: '0 0 28px rgba(0,240,144,0.55), 0 0 70px rgba(0,200,120,0.2)',
    headerBg: 'rgba(1,4,8,0.99)',
    headerBorder: '1px solid rgba(0,240,144,0.1)',
    textGradient: 'linear-gradient(135deg,#00f090,#00d4ff)',
  },

  // ── 7. DESERT SAND ──
  'sand': {
    name: 'Desert Sand',
    tagline: 'Dune & Sérénité',
    accent: '#c8963c',
    grad: 'linear-gradient(135deg,#9a6018,#c8963c,#e8c070)',
    logoGrad: 'linear-gradient(135deg,#9a6018 0%,#c8963c 50%,#e8c070 100%)',
    stopA: '#9a6018', stopB: '#c8963c', stopC: '#e8c070',
    bg: '#1a1208',
    surface: '#221808',
    card: '#2a1e0a',
    border: '#382810',
    text: '#f0e0c0',
    muted: '#9a7840',
    faint: '#2e2210',
    sub: '#7a5a28',
    fontFamily: "'Playfair Display', Georgia, serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap",
    bgEffect: `
      background: #1a1208;
      background-image: 
        radial-gradient(ellipse at 30% 20%, rgba(200,150,60,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 80%, rgba(154,96,24,0.1) 0%, transparent 50%),
        repeating-linear-gradient(
          102deg,
          transparent,
          transparent 80px,
          rgba(200,150,60,0.015) 80px,
          rgba(200,150,60,0.015) 81px
        );
    `,
    cardBg: 'linear-gradient(155deg, rgba(200,150,60,0.1) 0%, rgba(42,30,10,1) 60%)',
    borderStyle: '1px solid rgba(200,150,60,0.22)',
    navGlow: '0 -2px 30px rgba(154,96,24,0.2)',
    btnGlow: '0 4px 24px rgba(200,150,60,0.45)',
    headerBg: 'rgba(26,18,8,0.98)',
    headerBorder: '1px solid rgba(200,150,60,0.18)',
    textGradient: 'linear-gradient(135deg,#c8963c,#e8c070)',
  },

  // ── 8. COBALT ──
  'cobalt': {
    name: 'Cobalt Deep',
    tagline: 'Abyssal & Précis',
    accent: '#5aaeff',
    grad: 'linear-gradient(135deg,#1a4aaa,#5aaeff,#90ccff)',
    logoGrad: 'linear-gradient(135deg,#1a4aaa 0%,#5aaeff 50%,#90ccff 100%)',
    stopA: '#1a4aaa', stopB: '#5aaeff', stopC: '#90ccff',
    bg: '#020408',
    surface: '#04080e',
    card: '#060c18',
    border: '#0c1830',
    text: '#c8e0ff',
    muted: '#4878a8',
    faint: '#080e20',
    sub: '#346090',
    fontFamily: "'Syne', -apple-system, sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap",
    bgEffect: `
      background: #020408;
      background-image: 
        radial-gradient(ellipse at 5% 95%, rgba(26,74,170,0.28) 0%, transparent 50%),
        radial-gradient(ellipse at 95% 5%, rgba(90,174,255,0.12) 0%, transparent 45%),
        radial-gradient(ellipse at 50% 50%, rgba(26,74,170,0.06) 0%, transparent 60%);
    `,
    cardBg: 'linear-gradient(145deg, rgba(90,174,255,0.08) 0%, rgba(6,12,24,1) 100%)',
    borderStyle: '1px solid rgba(90,174,255,0.16)',
    navGlow: '0 -1px 50px rgba(26,74,170,0.25)',
    btnGlow: '0 4px 30px rgba(90,174,255,0.5)',
    headerBg: 'rgba(2,4,8,0.99)',
    headerBorder: '1px solid rgba(90,174,255,0.12)',
    textGradient: 'linear-gradient(135deg,#5aaeff,#90ccff)',
  },

  // ── 9. SAKURA ──
  'sakura': {
    name: 'Sakura Studio',
    tagline: 'Zen & Raffinement',
    accent: '#f080a0',
    grad: 'linear-gradient(135deg,#a02050,#f080a0,#ffc0d8)',
    logoGrad: 'linear-gradient(135deg,#a02050 0%,#f080a0 50%,#ffc0d8 100%)',
    stopA: '#a02050', stopB: '#f080a0', stopC: '#ffc0d8',
    bg: '#0e060a',
    surface: '#180a10',
    card: '#200c16',
    border: '#301020',
    text: '#ffe0ec',
    muted: '#b05070',
    faint: '#280e18',
    sub: '#8a3858',
    fontFamily: "'Noto Serif JP', Georgia, serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;600;700&display=swap",
    bgEffect: `
      background: #0e060a;
      background-image: 
        radial-gradient(ellipse at 80% 10%, rgba(240,128,160,0.14) 0%, transparent 45%),
        radial-gradient(ellipse at 20% 80%, rgba(160,32,80,0.12) 0%, transparent 45%),
        radial-gradient(ellipse at 50% 50%, rgba(255,192,216,0.03) 0%, transparent 60%);
    `,
    cardBg: 'linear-gradient(145deg, rgba(240,128,160,0.09) 0%, rgba(32,12,22,1) 100%)',
    borderStyle: '1px solid rgba(240,128,160,0.2)',
    navGlow: '0 -1px 40px rgba(160,32,80,0.2)',
    btnGlow: '0 4px 28px rgba(240,128,160,0.5)',
    headerBg: 'rgba(14,6,10,0.98)',
    headerBorder: '1px solid rgba(240,128,160,0.15)',
    textGradient: 'linear-gradient(135deg,#f080a0,#ffc0d8)',
  },

  // ── 10. ABYSS ──
  'abyss': {
    name: 'Abyss Matter',
    tagline: 'Graphite & Vide',
    accent: '#b0b8c0',
    grad: 'linear-gradient(135deg,#404850,#b0b8c0,#e8ecf0)',
    logoGrad: 'linear-gradient(135deg,#404850 0%,#b0b8c0 50%,#e8ecf0 100%)',
    stopA: '#404850', stopB: '#b0b8c0', stopC: '#e8ecf0',
    bg: '#060606',
    surface: '#0e0e0e',
    card: '#141414',
    border: '#1e1e1e',
    text: '#eeeeee',
    muted: '#666666',
    faint: '#161616',
    sub: '#444444',
    fontFamily: "'Outfit', -apple-system, sans-serif",
    fontImport: "https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700&display=swap",
    bgEffect: `
      background: #060606;
      background-image: 
        repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.008) 1px, rgba(255,255,255,0.008) 2px),
        radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.02) 0%, transparent 60%),
        radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.01) 0%, transparent 50%);
      background-size: 100% 100%, 100% 100%, 100% 100%;
    `,
    cardBg: 'linear-gradient(145deg, rgba(255,255,255,0.035) 0%, rgba(20,20,20,1) 100%)',
    borderStyle: '1px solid rgba(255,255,255,0.08)',
    navGlow: '0 -2px 20px rgba(0,0,0,0.9)',
    btnGlow: '0 2px 20px rgba(176,184,192,0.25)',
    headerBg: 'rgba(6,6,6,0.99)',
    headerBorder: '1px solid rgba(255,255,255,0.055)',
    textGradient: 'linear-gradient(135deg,#b0b8c0,#e8ecf0)',
  },
};

// ─── Design tokens (mutable) ──────────────────────────────────────────────────
let C = {
  bg:"#0a0a0a", surface:"#141414", card:"#1c1c1c", border:"#2a2a2a",
  text:"#f0f0f0", muted:"#777", faint:"#3a3a3a", sub:"#999",
  danger:"#c47070", accent:"#8ba5bf",
  font:"'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
};
let CURRENT_THEME = THEMES['obsidian'];
let CURRENT_THEME_ID = 'obsidian';
let CURRENT_PREMIUM = null;

function applyPremiumToC(pt) {
  if(!pt) return;
  C.bg = pt.bg;
  C.surface = pt.surface;
  C.card = pt.card;
  C.border = pt.border;
  C.text = pt.text;
  C.muted = pt.muted;
  C.faint = pt.faint;
  C.sub = pt.sub;
  C.accent = pt.accent;
  C.font = pt.fontFamily;
}

const globalCss = `
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
  @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
  .page-enter { animation:slideUp 0.18s ease both; }
  .fade-in    { animation:fadeIn 0.14s ease both; }
  .date-btn:hover { background:#1a1a1a !important; border-color:#3a3a3a !important; }
`;

function buildStyles(pt) {
  const isLight = pt?.isLight;
  const bg = pt?.bg || C.bg;
  const surface = pt?.surface || C.surface;
  const card = pt?.card || C.card;
  const border = pt?.border || C.border;
  const text = pt?.text || C.text;
  const muted = pt?.muted || C.muted;
  const sub = pt?.sub || C.sub;
  const accent = pt?.accent || C.accent;
  const font = pt?.fontFamily || C.font;
  const cardBg = pt?.cardBg || card;
  const cardBorder = pt?.borderStyle || `1px solid ${border}`;
  const headerBg = pt?.headerBg || bg;
  const headerBorder = pt?.headerBorder || `1px solid #222`;

  return {
    app:      { minHeight:"100vh", background:bg, color:text, fontFamily:font, maxWidth:480, margin:"0 auto", paddingBottom:110 },
    hdr:      { borderBottom:headerBorder, padding:"13px 20px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:headerBg, zIndex:10, backdropFilter:"blur(12px)" },
    body:     { padding:"22px 20px" },
    h1:       { fontSize:26, fontWeight:700, letterSpacing:-0.5, lineHeight:1.15, marginBottom:5, color:text },
    sub:      { fontSize:14, color:muted, marginBottom:22 },
    sec:      { fontSize:11, fontWeight:600, color:isLight?"#999":"#444", textTransform:"uppercase", letterSpacing:2, marginBottom:11, marginTop:24 },
    btn:      { background:isLight?"#1a1a1a":"#e8e8e8", color:isLight?"#f0f0f0":"#111", border:"none", borderRadius:10, padding:"14px 20px", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:font, width:"100%", marginBottom:10, display:"block" },
    ghost:    { background:"transparent", color:text, border:cardBorder, borderRadius:10, padding:"13px 20px", fontSize:14, fontWeight:400, cursor:"pointer", fontFamily:font, width:"100%", marginBottom:10, display:"block" },
    btnSave:  { background:pt?"rgba(255,255,255,0.08)":"#2a2a2a", color:text, border:cardBorder, borderRadius:9, padding:"11px 16px", fontSize:14, fontWeight:500, cursor:"pointer", fontFamily:font },
    danger:   { background:"none", color:"#c47070", border:"1px solid #2a1818", borderRadius:9, padding:"12px 16px", fontSize:14, fontWeight:400, cursor:"pointer", fontFamily:font, width:"100%", marginTop:8 },
    input:    { background:surface, border:cardBorder, borderRadius:9, color:text, padding:"13px 15px", fontSize:15, width:"100%", fontFamily:font, outline:"none" },
    back:     { background:"none", border:"none", color:muted, fontSize:14, fontWeight:400, cursor:"pointer", fontFamily:font, padding:0, marginBottom:22 },
    tag:      { background:card, border:cardBorder, borderRadius:8, padding:"6px 11px", fontSize:13, color:muted, textAlign:"center", minWidth:50 },
    tagVal:   { fontSize:15, fontWeight:600, color:text, display:"block" },
    tagLabel: { fontSize:10, color:isLight?"#aaa":"#444", display:"block", marginTop:1, textTransform:"uppercase", letterSpacing:1 },
    statBox:  { background:surface, border:cardBorder, borderRadius:11, padding:"13px 8px", textAlign:"center" },
    statNum:  { fontSize:28, fontWeight:700, color:text, lineHeight:1 },
    statLabel:{ fontSize:10, color:isLight?"#aaa":"#444", marginTop:4, textTransform:"uppercase", letterSpacing:1 },
    toggle:   (active) => ({ flex:1, padding:"10px", borderRadius:8, fontSize:14, fontWeight:active?600:400, cursor:"pointer", fontFamily:font, background:active?(pt?"rgba(255,255,255,0.12)":"#2a2a2a"):"transparent", color:active?text:muted, border:`1px solid ${active?(pt?"rgba(255,255,255,0.2)":border):border}` }),
    _cardBg: cardBg,
    _cardBorder: cardBorder,
    _accent: accent,
    _text: text,
    _muted: muted,
    _surface: surface,
    _bg: bg,
    _isLight: isLight,
    _font: font,
    _btnGlow: pt?.btnGlow,
    _navGlow: pt?.navGlow,
    _headerBg: headerBg,
    _sub: sub,
  };
}

let S = buildStyles(null);

// ─── Cloud sync helpers ───────────────────────────────────────────────────────
async function loadFromCloud(userId) {
  const { data, error } = await supabase.from('user_data').select('data').eq('user_id', userId).single();
  if (error && error.code !== 'PGRST116') { console.error('Cloud load error:', error); return null; }
  return data?.data || null;
}
async function saveToCloud(userId, db) {
  const { error } = await supabase.from('user_data').upsert({ user_id: userId, data: db, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) console.error('Cloud save error:', error);
}

// ─── Timer helpers ────────────────────────────────────────────────────────────
// Converts total seconds to { min, sec }
function secsToMinSec(totalSecs) {
  const s = Math.max(0, totalSecs);
  return { min: Math.floor(s / 60), sec: s % 60 };
}
// Converts { min, sec } to total seconds
function minSecToSecs(min, sec) {
  return (parseInt(min) || 0) * 60 + (parseInt(sec) || 0);
}
// Formats total seconds to a readable string: "50 sec", "1 min", "1 min 10 sec", etc.
function formatDuration(totalSecs) {
  const s = Math.max(0, totalSecs);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m === 0) return `${sec} sec`;
  if (sec === 0) return `${m} min`;
  return `${m} min ${sec} sec`;
}

// ─── BottomNav ────────────────────────────────────────────────────────────────
function BottomNav({ cur, onNav }) {
  const t = CURRENT_PREMIUM || CURRENT_THEME;
  const bg = S._bg;
  const text = S._text;
  const muted = S._muted;
  const font = S._font;
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:480, background:S._headerBg || bg, borderTop:CURRENT_PREMIUM?.headerBorder || "1px solid #222", display:"flex", alignItems:"center", justifyContent:"space-around", zIndex:100, paddingTop:10, paddingBottom:22, boxShadow:S._navGlow, backdropFilter:"blur(12px)" }}>
      <button onClick={() => onNav("groups")} style={{ background:"none", border:"none", color:cur==="groups"?text:muted, fontSize:11, fontWeight:cur==="groups"?600:400, cursor:"pointer", fontFamily:font, display:"flex", flexDirection:"column", alignItems:"center", gap:5, flex:1, padding:"4px 0" }}>
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 4V2M16 4V2"/>
        </svg>
        Séances
      </button>
      <button onClick={() => onNav("home")} style={{ background:t.grad, border:"none", borderRadius:"50%", width:56, height:56, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:S._btnGlow || `0 4px 20px ${t.accent}70`, transform:"translateY(-10px)", flexShrink:0 }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill={S._isLight?"#111":"white"}><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      </button>
      <button onClick={() => onNav("history")} style={{ background:"none", border:"none", color:cur==="history"?text:muted, fontSize:11, fontWeight:cur==="history"?600:400, cursor:"pointer", fontFamily:font, display:"flex", flexDirection:"column", alignItems:"center", gap:5, flex:1, padding:"4px 0" }}>
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
  const t = CURRENT_PREMIUM || CURRENT_THEME;
  const gradId = `logo-grad-${CURRENT_THEME_ID}`;
  const textStyle = CURRENT_PREMIUM
    ? { fontSize:16, fontWeight:700, letterSpacing:-0.3, background:t.textGradient, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", fontFamily:CURRENT_PREMIUM.fontFamily }
    : { fontSize:16, fontWeight:700, letterSpacing:-0.3, background:t.logoGrad, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" };
  return (
    <div style={{ display:"flex", alignItems:"center", gap:7 }}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={t.stopA}/>
            <stop offset="55%" stopColor={t.stopB}/>
            <stop offset="100%" stopColor={t.stopC}/>
          </linearGradient>
        </defs>
        <rect x="1" y="7" width="5.5" height="14" rx="2" fill={`url(#${gradId})`}/>
        <rect x="6" y="9.5" width="3.5" height="9" rx="1.5" fill={`url(#${gradId})`}/>
        <rect x="9.5" y="12" width="9" height="4" rx="1.5" fill={`url(#${gradId})`}/>
        <rect x="18.5" y="9.5" width="3.5" height="9" rx="1.5" fill={`url(#${gradId})`}/>
        <rect x="21.5" y="7" width="5.5" height="14" rx="2" fill={`url(#${gradId})`}/>
      </svg>
      <span style={textStyle}>
        Sport'Up
      </span>
    </div>
  );
}

// ─── SettingsIcon ─────────────────────────────────────────────────────────────
function SettingsIcon({ onNavigate }) {
  return (
    <button onClick={() => onNavigate("settings")} style={{ background:"transparent", border:S._cardBorder || "1px solid #2a2a2a", borderRadius:8, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:S._muted, flexShrink:0 }}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ onClick, children, style }) {
  const [hov, setHov] = useState(false);
  const pt = CURRENT_PREMIUM;
  const baseCard = pt ? pt.card : C.card;
  const baseHover = pt?.isLight ? "#f0e8ea" : (pt ? pt.surface : "#202020");
  const borderN = pt ? pt.borderStyle : "1px solid #2a2a2a";
  const borderH = pt ? pt.borderStyle.replace(/rgba\([^)]+\)/, `rgba(${hexToRgb(pt.accent)},0.25)`) : "1px solid #3a3a3a";
  return (
    <div style={{ background:hov&&onClick?baseHover:baseCard, border:hov&&onClick?borderH:borderN, borderRadius:12, padding:"14px 16px", marginBottom:10, cursor:onClick?"pointer":"default", transition:"background 0.12s, border-color 0.12s", ...style }}
      onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {children}
    </div>
  );
}

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : '255,255,255';
}

// ─── Stepper ──────────────────────────────────────────────────────────────────
function Stepper({ label, value, onChange, step=1, min=0, unit="" }) {
  const dec = () => onChange(Math.max(min, Math.round((parseFloat(value||0)-step)*100)/100));
  const inc = () => onChange(Math.round((parseFloat(value||0)+step)*100)/100);
  const bS = { background:C.surface, border:"1px solid "+C.border, borderRadius:8, width:38, height:38, fontSize:18, fontWeight:300, color:C.text, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 };
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
      <div style={{ fontSize:11, color:S._isLight?"#999":"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <button style={bS} onClick={dec}>−</button>
        <div style={{ textAlign:"center" }}>
          <input type="number" value={value} onChange={e=>onChange(e.target.value===""?"":parseFloat(e.target.value))}
            style={{ ...S.input, textAlign:"center", fontSize:22, fontWeight:700, padding:"5px 4px", width:66, border:"none", background:"transparent" }} />
          {unit && <div style={{ fontSize:11, color:S._isLight?"#aaa":"#444", marginTop:-4 }}>{unit}</div>}
        </div>
        <button style={bS} onClick={inc}>+</button>
      </div>
    </div>
  );
}

// ─── TimerStepper — displays total seconds with smart formatting ──────────────
function TimerStepper({ label, totalSecs, onChange }) {
  const dec = () => onChange(Math.max(0, totalSecs - 10));
  const inc = () => onChange(totalSecs + 10);
  const bS = { background:C.surface, border:"1px solid "+C.border, borderRadius:8, width:42, height:42, fontSize:20, fontWeight:300, color:C.text, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 };
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <div style={{ fontSize:11, color:S._isLight?"#999":"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <button style={bS} onClick={dec}>−</button>
        <div style={{ textAlign:"center", minWidth:90 }}>
          <div style={{ fontSize:22, fontWeight:700, color:S._text, lineHeight:1.1 }}>{formatDuration(totalSecs)}</div>
          <div style={{ fontSize:10, color:S._isLight?"#aaa":"#444", marginTop:3, letterSpacing:1, textTransform:"uppercase" }}>par séance</div>
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
  const accent = S._accent;
  const isLight = S._isLight;
  return (
    <Card style={{ marginBottom:18, cursor:"default" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
        <button onClick={()=>setCalDate(new Date(y,m-1,1))} style={S.back}>←</button>
        <span style={{ fontSize:14, fontWeight:500 }}>{calDate.toLocaleDateString("fr-FR",{month:"long",year:"numeric"})}</span>
        <button onClick={()=>setCalDate(new Date(y,m+1,1))} style={S.back}>→</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:2 }}>
        {["L","M","M","J","V","S","D"].map((d,i)=><div key={i} style={{ fontSize:11, color:isLight?"#bbb":"#444", textAlign:"center", paddingBottom:6, fontWeight:600 }}>{d}</div>)}
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const iso=y+"-"+m+"-"+d;
          const isT=today.getDate()===d&&today.getMonth()===m&&today.getFullYear()===y;
          const isSel=calDate.getDate()===d&&calDate.getMonth()===m&&calDate.getFullYear()===y;
          const hasSess=sessSet.has(iso);
          return (
            <div key={i} onClick={()=>setCalDate(new Date(y,m,d))} style={{ height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:isSel||isT?600:400, cursor:"pointer", borderRadius:7, background:isSel?accent:hasSess?S._surface:"transparent", color:isSel?(isLight?"#fff":"#111"):isT?S._text:hasSess?S._text:S._muted, border:isT&&!isSel?`1px solid ${accent}`:"1px solid transparent" }}>
              {d}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize:12, color:S._muted, textAlign:"right", marginTop:9 }}>
        Séance le <span style={{ color:S._text, fontWeight:600 }}>{calDate.toLocaleDateString("fr-FR")}</span>
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
      const r = typeof ex === "number" ? ex : (parseInt(defReps)||12);
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

  // Timer: totalSecs stored in logForm.timeTotalSecs (default 60 = 1 min)
  const timeTotalSecs = logForm.timeTotalSecs !== undefined ? logForm.timeTotalSecs : 60;

  const iBtn = { background:C.card, border:"1px solid "+C.border, borderRadius:7, width:30, height:30, color:C.text, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" };
  return (
    <div>
      {mode==="reps" && (
        <>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
            <Stepper label="Séries" value={logForm.series} onChange={updateSeries} step={1} min={1}/>
          </div>
          <div style={{ fontSize:11, color:S._isLight?"#999":"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, marginBottom:9 }}>Détail par série</div>
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:18 }}>
            {sets.map((s,idx) => (
              <div key={idx} style={{ background:C.surface, border:S._cardBorder, borderRadius:10, padding:"10px 13px", display:"flex", alignItems:"center", gap:9 }}>
                <div style={{ fontSize:11, color:S._isLight?"#bbb":"#444", fontWeight:600, minWidth:22 }}>S{idx+1}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:S._isLight?"#aaa":"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Reps</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <button onClick={()=>updateReps(idx,-1)} style={iBtn}>−</button>
                    <div style={{ fontSize:18, fontWeight:700, minWidth:28, textAlign:"center" }}>{s.reps||0}</div>
                    <button onClick={()=>updateReps(idx,1)} style={iBtn}>+</button>
                  </div>
                </div>
                <div style={{ width:1, height:34, background:C.border, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10, color:S._isLight?"#aaa":"#444", textTransform:"uppercase", letterSpacing:1, marginBottom:5 }}>Poids (kg)</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <button onClick={()=>updateWeight(idx,-2.5)} style={iBtn}>−</button>
                    <div style={{ fontSize:15, fontWeight:700, minWidth:42, textAlign:"center" }}>{s.kg||0}<span style={{ fontSize:10, color:S._muted, fontWeight:400 }}>kg</span></div>
                    <button onClick={()=>updateWeight(idx,2.5)} style={iBtn}>+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {mode==="time" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:22, marginBottom:22 }}>
          <div style={{ display:"flex", justifyContent:"space-around", width:"100%", gap:16 }}>
            <Stepper label="Séries" value={logForm.series} onChange={v=>setLogForm({...logForm,series:Math.max(1,parseInt(v)||1)})} step={1} min={1}/>
          </div>
          <TimerStepper
            label="Durée"
            totalSecs={timeTotalSecs}
            onChange={secs => setLogForm({...logForm, timeTotalSecs: secs})}
          />
        </div>
      )}
      <div style={{ marginBottom:4 }}>
        <div style={{ fontSize:11, color:S._isLight?"#999":"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, marginBottom:7 }}>Note</div>
        <input style={S.input} placeholder="Sensation, ressenti…" value={logForm.note||""} onChange={e=>setLogForm({...logForm,note:e.target.value})}/>
      </div>
    </div>
  );
}

// ─── PerfTags ─────────────────────────────────────────────────────────────────
function PerfTags({ entry }) {
  const mode = entry.mode || "reps";
  if(mode==="time") {
    // Support both old (timeMin/timeSec) and new (timeTotalSecs) format
    const totalSecs = entry.timeTotalSecs !== undefined
      ? entry.timeTotalSecs
      : minSecToSecs(entry.timeMin || 0, entry.timeSec || 0);
    return (
      <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginTop:8 }}>
        <div style={S.tag}><span style={S.tagVal}>{entry.series||"—"}</span><span style={S.tagLabel}>séries</span></div>
        <div style={S.tag}><span style={S.tagVal}>{formatDuration(totalSecs)}</span><span style={S.tagLabel}>durée</span></div>
        {entry.note && <div style={{ fontSize:12, color:S._muted, alignSelf:"center", fontStyle:"italic" }}>{entry.note}</div>}
      </div>
    );
  }
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
            <span style={{ ...S.tagVal, fontSize:13 }}>{g.count>1?g.count+"×":""}{g.reps}r<span style={{ fontSize:11, color:S._muted, fontWeight:400 }}> {g.w}kg</span></span>
          </div>
        ))}
        {entry.note && <div style={{ fontSize:12, color:S._muted, fontStyle:"italic" }}>{entry.note}</div>}
      </div>
    );
  }
  const setsStr = sets.length>0 ? sets.join(" / ") : (entry.reps||"—");
  return (
    <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginTop:8, alignItems:"center" }}>
      <div style={S.tag}><span style={S.tagVal}>{entry.series||"—"}</span><span style={S.tagLabel}>séries</span></div>
      <div style={{ ...S.tag, minWidth:"auto" }}><span style={{ ...S.tagVal, fontSize:14 }}>{setsStr}</span><span style={S.tagLabel}>reps</span></div>
      <div style={S.tag}><span style={S.tagVal}>{entry.kg||"—"}</span><span style={S.tagLabel}>kg</span></div>
      {entry.note && <div style={{ fontSize:12, color:S._muted, fontStyle:"italic" }}>{entry.note}</div>}
    </div>
  );
}

// ─── ExoSettingsCard ──────────────────────────────────────────────────────────
function ExoSettingsCard({ exo, onSave, onDelete, onNavigate, defaultOpen, forceCollapse }) {
  const [open, setOpen] = useState(defaultOpen ? true : false);
  const [mode, setMode] = useState(exo.mode || "reps");
  const [kg, setKg] = useState(exo.defaultKg || 0);
  // Default reps: stored in exo.defaultReps, fallback 12
  const [defaultReps, setDefaultReps] = useState(exo.defaultReps !== undefined ? exo.defaultReps : 12);
  // Default series: stored in exo.defaultSeries, fallback 4
  const [defaultSeries, setDefaultSeries] = useState(exo.defaultSeries !== undefined ? exo.defaultSeries : 4);
  // Default time in total seconds: stored in exo.defaultTimeSecs, fallback 60
  const [defaultTimeSecs, setDefaultTimeSecs] = useState(exo.defaultTimeSecs !== undefined ? exo.defaultTimeSecs : 60);

  useEffect(() => { if(forceCollapse) setOpen(false); }, [forceCollapse]);
  useEffect(() => { if(defaultOpen) setOpen(true); }, [defaultOpen]);

  function save() {
    onSave({...exo, mode, defaultKg:kg, defaultReps, defaultSeries, defaultTimeSecs});
    setOpen(false);
  }

  const iBtn = { background:C.surface, border:"1px solid "+C.border, borderRadius:8, width:38, height:38, fontSize:18, color:C.text, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" };

  return (
    <div style={{ background:S._cardBg, border:S._cardBorder, borderRadius:12, marginBottom:10, overflow:"hidden" }}>
      <div onClick={() => setOpen(o => !o)} style={{ display:"flex", alignItems:"center", padding:"14px 16px", gap:10, cursor:"pointer" }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:500 }}>{exo.name}</div>
          <div style={{ fontSize:12, color:S._muted, marginTop:3 }}>
            {exo.mode==="time"
              ? `Temps · ${formatDuration(exo.defaultTimeSecs !== undefined ? exo.defaultTimeSecs : 60)}`
              : `Reps / KG${exo.defaultKg>0 ? " · "+exo.defaultKg+"kg" : ""}${exo.defaultReps ? " · "+exo.defaultReps+" reps" : ""}`}
          </div>
          {exo.canonicalId && <div style={{ fontSize:11, color:S._sub, marginTop:2 }}>données partagées</div>}
        </div>
        <button onClick={e=>{e.stopPropagation();onNavigate(exo.id);}} style={{ background:"transparent", border:S._cardBorder, borderRadius:8, padding:"6px 12px", color:S._accent, fontSize:13, cursor:"pointer", fontWeight:500, flexShrink:0 }}>
          Performances
        </button>
        <span style={{ color:S._isLight?"#aaa":"#3a3a3a", fontSize:14, display:"inline-block", transform:open?"rotate(90deg)":"rotate(0deg)", transition:"transform 0.2s" }}>›</span>
      </div>
      {open && (
        <div style={{ padding:"0 16px 16px", borderTop:S._cardBorder }} className="fade-in">
          <div style={{ paddingTop:14 }}>
            {/* Type toggle */}
            <div style={{ fontSize:11, color:S._isLight?"#999":"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, marginBottom:9 }}>Type d'exercice</div>
            <div style={{ display:"flex", gap:7, marginBottom:20 }}>
              <button style={S.toggle(mode==="reps")} onClick={()=>setMode("reps")}>Répétitions / KG</button>
              <button style={S.toggle(mode==="time")} onClick={()=>setMode("time")}>Temps</button>
            </div>

            {mode==="reps" && (
              <>
                {/* Series + Reps defaults */}
                <div style={{ fontSize:11, color:S._isLight?"#999":"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>Valeurs par défaut</div>
                <div style={{ display:"flex", gap:12, marginBottom:20, justifyContent:"space-around" }}>
                  {/* Series stepper */}
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    <div style={{ fontSize:10, color:S._isLight?"#aaa":"#444", textTransform:"uppercase", letterSpacing:1.5, fontWeight:600 }}>Séries</div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <button onClick={()=>setDefaultSeries(v=>Math.max(1,v-1))} style={iBtn}>−</button>
                      <div style={{ fontSize:20, fontWeight:700, minWidth:32, textAlign:"center", color:S._text }}>{defaultSeries}</div>
                      <button onClick={()=>setDefaultSeries(v=>v+1)} style={iBtn}>+</button>
                    </div>
                  </div>
                  {/* Reps stepper */}
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    <div style={{ fontSize:10, color:S._isLight?"#aaa":"#444", textTransform:"uppercase", letterSpacing:1.5, fontWeight:600 }}>Reps</div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <button onClick={()=>setDefaultReps(v=>Math.max(1,v-1))} style={iBtn}>−</button>
                      <div style={{ fontSize:20, fontWeight:700, minWidth:32, textAlign:"center", color:S._text }}>{defaultReps}</div>
                      <button onClick={()=>setDefaultReps(v=>v+1)} style={iBtn}>+</button>
                    </div>
                  </div>
                </div>

                {/* Default weight */}
                <div style={{ fontSize:11, color:S._isLight?"#999":"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, marginBottom:9 }}>Poids habituel</div>
                <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:20 }}>
                  <button onClick={()=>setKg(v=>Math.max(0,Math.round((v-2.5)*10)/10))} style={iBtn}>−</button>
                  <input type="number" value={kg} onChange={e=>setKg(parseFloat(e.target.value)||0)} style={{ ...S.input, textAlign:"center", fontSize:18, fontWeight:700, width:90 }}/>
                  <span style={{ color:S._muted, fontSize:14 }}>kg</span>
                  <button onClick={()=>setKg(v=>Math.round((v+2.5)*10)/10)} style={iBtn}>+</button>
                </div>
              </>
            )}

            {mode==="time" && (
              <>
                {/* Series default */}
                <div style={{ fontSize:11, color:S._isLight?"#999":"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1.5, marginBottom:12 }}>Valeurs par défaut</div>
                <div style={{ display:"flex", gap:16, marginBottom:20, justifyContent:"space-around", alignItems:"flex-start" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    <div style={{ fontSize:10, color:S._isLight?"#aaa":"#444", textTransform:"uppercase", letterSpacing:1.5, fontWeight:600 }}>Séries</div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <button onClick={()=>setDefaultSeries(v=>Math.max(1,v-1))} style={iBtn}>−</button>
                      <div style={{ fontSize:20, fontWeight:700, minWidth:32, textAlign:"center", color:S._text }}>{defaultSeries}</div>
                      <button onClick={()=>setDefaultSeries(v=>v+1)} style={iBtn}>+</button>
                    </div>
                  </div>
                  <TimerStepper
                    label="Durée"
                    totalSecs={defaultTimeSecs}
                    onChange={secs => setDefaultTimeSecs(secs)}
                  />
                </div>
              </>
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

// ─── Premium Theme Card ───────────────────────────────────────────────────────
function PremiumThemeCard({ id, t, isActive, onSelect }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => onSelect(id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: isActive ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.01)",
        border: isActive ? `1px solid ${t.accent}55` : "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        transition: "all 0.15s ease",
        marginBottom: 8,
        transform: hov && !isActive ? "translateX(2px)" : "none",
        boxShadow: isActive ? `0 0 30px ${t.accent}20, inset 0 0 30px ${t.accent}05` : "none",
      }}
    >
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: t.grad,
          boxShadow: isActive ? `0 4px 20px ${t.accent}50` : "none",
          transition: "box-shadow 0.2s",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 16,
            background: t.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: 8, color: t.text, fontFamily: t.fontFamily, fontWeight: 600, letterSpacing: 0.5 }}>Aa</span>
          </div>
        </div>
        <div style={{
          position: "absolute",
          top: -3,
          right: -3,
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: t.isLight ? "#f0f0f0" : "#111",
          border: "2px solid rgba(255,255,255,0.15)",
        }}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14,
          fontWeight: isActive ? 700 : 500,
          color: isActive ? t.accent : "rgba(255,255,255,0.85)",
          marginBottom: 2,
          letterSpacing: -0.2,
        }}>
          {t.name}
        </div>
        <div style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.35)",
          fontStyle: "italic",
          letterSpacing: 0.3,
        }}>
          {t.tagline}
        </div>
        <div style={{
          fontSize: 10,
          color: "rgba(255,255,255,0.2)",
          marginTop: 3,
          fontFamily: t.fontFamily,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}>
          {t.fontFamily.split(",")[0].replace(/'/g, "")}
        </div>
      </div>
      <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        {isActive ? (
          <div style={{
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: t.grad,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 2px 10px ${t.accent}50`,
          }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke={t.isLight ? "#111" : "#fff"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ) : (
          <div style={{
            fontSize: 9,
            fontWeight: 700,
            color: "#c8a840",
            background: "rgba(200,168,64,0.12)",
            border: "1px solid rgba(200,168,64,0.25)",
            borderRadius: 5,
            padding: "2px 6px",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}>
            PRO
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [db, setDb] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [themeId, setThemeId] = useState(() => {
    try { return localStorage.getItem("sportup_theme") || 'obsidian'; } catch { return 'obsidian'; }
  });
  const [premiumThemeId, setPremiumThemeId] = useState(() => {
    try { return localStorage.getItem("sportup_premium_theme") || null; } catch { return null; }
  });

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
  const [logForm, setLogForm] = useState({ series:4, reps:12, kg:0, sets:[], timeTotalSecs:60, note:"" });
  const [mergePrompt, setMergePrompt] = useState(null);
  const [popup, setPopup] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const pageKey = useRef(0);
  const exoTopRef = useRef(null);
  const saveTimeout = useRef(null);
  const fontRef = useRef(null);

  // ── Apply theme globally before render ──
  const theme = THEMES[themeId] || THEMES['obsidian'];
  const premiumTheme = premiumThemeId ? PREMIUM_THEMES[premiumThemeId] : null;
  CURRENT_THEME = theme;
  CURRENT_THEME_ID = premiumThemeId ? premiumThemeId : themeId;
  CURRENT_PREMIUM = premiumTheme;

  if(premiumTheme) {
    applyPremiumToC(premiumTheme);
  } else {
    C.bg = "#0a0a0a"; C.surface = "#141414"; C.card = "#1c1c1c"; C.border = "#2a2a2a";
    C.text = "#f0f0f0"; C.muted = "#777"; C.faint = "#3a3a3a"; C.sub = "#999";
    C.accent = theme.accent;
    C.font = "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif";
  }
  S = buildStyles(premiumTheme);

  // Inject premium font
  useEffect(() => {
    if(premiumTheme?.fontImport) {
      if(fontRef.current) fontRef.current.remove();
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = premiumTheme.fontImport;
      document.head.appendChild(link);
      fontRef.current = link;
    }
  }, [premiumThemeId]);

  // Inject premium bg effect
  useEffect(() => {
    if(premiumTheme?.bgEffect) {
      document.body.style.cssText = premiumTheme.bgEffect;
    } else {
      document.body.style.cssText = "background:#0a0a0a";
    }
  }, [premiumThemeId]);

  function applyTheme(id) {
    setPremiumThemeId(null);
    setThemeId(id);
    try { localStorage.setItem("sportup_theme", id); localStorage.removeItem("sportup_premium_theme"); } catch {}
  }
  function applyPremiumTheme(id) {
    setPremiumThemeId(id);
    try { localStorage.setItem("sportup_premium_theme", id); } catch {}
  }

  // ─── Supabase helpers ───
  const loadFromCloudInner = async (uid) => {
    try {
      const { data, error } = await supabase.from('user_data').select('data').eq('user_id', uid).maybeSingle();
      if (error) throw error;
      return data ? data.data : null;
    } catch (e) { console.error("Erreur chargement:", e); return null; }
  };
  const saveToCloudInner = async (uid, dataToSave) => {
    try {
      const { error } = await supabase.from('user_data').upsert({ user_id: uid, data: dataToSave, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (error) { alert("Erreur Supabase : " + error.message); }
    } catch (e) { console.error("Erreur sauvegarde:", e); }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({data:{session}}) => { setSession(session); setAuthLoading(false); });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // ─── Fetch popup config ───
  useEffect(() => {
    supabase.from('app_popup').select('*').eq('id', 1).maybeSingle().then(({ data }) => {
      if (data && data.active && data.image_url) {
        const dismissed = sessionStorage.getItem('sportup_popup_dismissed_' + data.updated_at);
        if (!dismissed) {
          setPopup(data);
          setTimeout(() => setPopupVisible(true), 800);
        }
      }
    });
  }, []);

  useEffect(() => {
    const s = document.createElement("style");
    s.textContent = globalCss;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  useEffect(() => {
    if(!session) return;
    setSyncing(true);
    loadFromCloudInner(session.user.id).then(cloudData => {
      if(cloudData) {
        setDb(cloudData);
      } else {
        try {
          const local = localStorage.getItem("sportup_v1");
          const localData = local ? JSON.parse(local) : { groups: [], sessions: [] };
          setDb(localData);
          saveToCloudInner(session.user.id, localData);
        } catch { setDb({ groups: [], sessions: [] }); }
      }
      setSyncing(false);
    });
  }, [session]);

  useEffect(() => {
    if(!session) return;
    const channel = supabase.channel('user_data_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_data', filter: `user_id=eq.${session.user.id}` },
        (payload) => { if(payload.new?.data) setDb(payload.new.data); })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [session]);

  const saveDb = useCallback((next) => {
    setDb(next);
    try { localStorage.setItem("sportup_v1", JSON.stringify(next)); } catch {}
    if(!session) return;
    if(saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => { saveToCloudInner(session.user.id, next); }, 300);
  }, [session]);

  function navigate(newView, fn) { pageKey.current += 1; if(fn) fn(); setView(newView); }
  function navTo(v) { setNewGName(""); navigate(v); }

  function closePopup() {
    setPopupVisible(false);
    if (popup?.updated_at) {
      sessionStorage.setItem('sportup_popup_dismissed_' + popup.updated_at, '1');
    }
    setTimeout(() => setPopup(null), 350);
  }

  const uid = () => Date.now() + Math.random();
  function fmt(iso) { return new Date(iso).toLocaleDateString("fr-FR", { day:"2-digit", month:"short", year:"numeric" }); }
  function fmtDateLong(date) { return date.toLocaleDateString("fr-FR", { weekday:"long", day:"numeric", month:"long", year:"numeric" }); }
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
  function findSimilarExos(dbRef, name, excludeExoId) {
    const matches=[];
    dbRef.groups.forEach(g=>g.exercises.forEach(e=>{ if(e.id!==excludeExoId && isSimilar(e.name,name)) matches.push({exo:e,group:g}); }));
    return matches;
  }

  if(authLoading) return <div style={{ background:'#0a0a0a', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#555', fontFamily:C.font }}>Vérification…</div>;
  if(!session) return <AuthForm/>;
  if(syncing || !db) return (
    <div style={{ background:'#0a0a0a', height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#555', fontFamily:C.font, gap:12 }}>
      <Logo/><div style={{ fontSize:13, marginTop:8 }}>Chargement de tes données…</div>
    </div>
  );

  const selGroup = db.groups.find(g => g.id===selGroupId) || null;
  const selSession = db.sessions.find(s => s.id===selSessionId) || null;
  const email = session?.user?.email || "";
  const createdAt = session?.user?.created_at ? new Date(session.user.created_at) : null;
  function daysAgo(date) {
    const diff = Math.floor((Date.now() - date.getTime()) / (1000*60*60*24));
    if(diff === 0) return "aujourd'hui";
    if(diff === 1) return "il y a 1 jour";
    return `il y a ${diff} jours`;
  }

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
    const series=lastPerf?(parseInt(lastPerf.series)||4):(exo?.defaultSeries||4);
    const reps=lastPerf?(parseInt(lastPerf.reps)||12):(exo?.defaultReps||12);
    const kg=lastPerf?(lastPerf.kg!==undefined?lastPerf.kg:(exo?.defaultKg||0)):(exo?.defaultKg||0);
    // Time: use last perf's timeTotalSecs, or exo default, or 60s
    const timeTotalSecs = lastPerf
      ? (lastPerf.timeTotalSecs !== undefined ? lastPerf.timeTotalSecs : minSecToSecs(lastPerf.timeMin||0, lastPerf.timeSec||0))
      : (exo?.defaultTimeSecs || 60);
    let sets;
    if(lastPerf&&lastPerf.sets&&lastPerf.sets.length>0) {
      sets=lastPerf.sets.map(s=>typeof s==="object"?s:{reps:s,kg});
      while(sets.length<series) sets.push(sets[sets.length-1]||{reps,kg});
      sets=sets.slice(0,series);
    } else { sets=Array(series).fill(null).map(()=>({reps,kg})); }
    return {series, reps, kg, sets, mode, timeTotalSecs, note:""};
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
    const newExo = {id:newExoId, name, defaultKg:0, defaultReps:12, defaultSeries:4, defaultTimeSecs:60, mode:"reps"};
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
  // RENDER VIEW
  // ═══════════════════════════════════════════════════════════════════════════
  function renderView() {
  // SETTINGS
  if(view==="settings") return (
    <div style={S.app}>
      <div style={S.hdr}><Logo/></div>
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <button style={S.back} onClick={()=>navigate("home")}>← Accueil</button>
        <h1 style={S.h1}>Réglages</h1>

        <div style={S.sec}>Mon compte</div>
        <Card style={{ cursor:"default", marginBottom:6 }}>
          <div style={{ fontSize:10, color:S._isLight?"#aaa":"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Email</div>
          <div style={{ fontSize:15, color:S._text, fontWeight:500, wordBreak:"break-all", marginBottom:14 }}>{email}</div>
          {createdAt && (
            <>
              <div style={{ fontSize:10, color:S._isLight?"#aaa":"#444", fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Membre depuis</div>
              <div style={{ fontSize:14, color:S._muted }}>{daysAgo(createdAt)}</div>
            </>
          )}
        </Card>
        <button onClick={() => supabase.auth.signOut()} style={S.danger}>Se déconnecter</button>

        <div style={S.sec}>Apparence</div>
        <Card onClick={() => navigate("themes")} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:13 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:(premiumTheme||theme).grad, flexShrink:0, boxShadow:`0 2px 12px ${(premiumTheme||theme).accent}55` }}/>
            <div>
              <div style={{ fontSize:15, fontWeight:500 }}>Choisir le visuel</div>
              <div style={{ fontSize:12, color:S._muted, marginTop:2 }}>
                Actuel : <span style={{ color:(premiumTheme||theme).accent, fontWeight:600 }}>
                  {premiumTheme ? premiumTheme.name : theme.name}
                  {premiumTheme && <span style={{ fontSize:10, marginLeft:5, color:"#c8a840", background:"rgba(200,168,64,0.15)", border:"1px solid rgba(200,168,64,0.3)", borderRadius:4, padding:"1px 5px" }}>PRO</span>}
                </span>
              </div>
            </div>
          </div>
          <span style={{ color:S._isLight?"#aaa":"#3a3a3a", fontSize:18 }}>›</span>
        </Card>
      </div>
      <BottomNav cur="settings" onNav={navTo}/>
    </div>
  );

  // THEMES
  if(view==="themes") return (
    <div style={S.app}>
      <div style={S.hdr}><Logo/></div>
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <button style={S.back} onClick={()=>navigate("settings")}>← Réglages</button>
        <h1 style={S.h1}>Choisir le visuel</h1>
        <p style={{ fontSize:14, color:S._muted, marginBottom:24 }}>Sélectionne le thème de couleur de l'application</p>

        <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:32 }}>
          {Object.entries(THEMES).map(([id, t]) => {
            const isActive = !premiumThemeId && themeId === id;
            return (
              <div key={id} onClick={() => applyTheme(id)} style={{ background: isActive ? "#1a1a1a" : C.card, border:`1px solid ${isActive ? t.accent : S._cardBorder.replace("1px solid ","") || "#2a2a2a"}`, borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", transition:"all 0.15s ease" }}>
                <div style={{ width:42, height:42, borderRadius:11, background:t.grad, flexShrink:0, boxShadow: isActive ? `0 3px 16px ${t.accent}55` : "none", transition:"box-shadow 0.15s" }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight: isActive ? 700 : 500, color: isActive ? t.accent : S._text }}>
                    {t.name}
                  </div>
                </div>
                {isActive && (
                  <div style={{ width:22, height:22, borderRadius:"50%", background:t.grad, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke={S._isLight?"#111":"#fff"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#c8a840", textTransform:"uppercase", letterSpacing:2.5 }}>
              ✦ Visuels Premium
            </div>
            <div style={{ flex:1, height:1, background:"linear-gradient(90deg, rgba(200,168,64,0.3) 0%, transparent 100%)" }}/>
          </div>
          <p style={{ fontSize:12, color:S._muted, marginBottom:16, lineHeight:1.5 }}>
            Typographies exclusives, effets visuels uniques & ambiances soignées
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {Object.entries(PREMIUM_THEMES).map(([id, t]) => (
            <PremiumThemeCard key={id} id={id} t={t} isActive={premiumThemeId === id} onSelect={applyPremiumTheme}/>
          ))}
        </div>

        <div style={{ height:20 }}/>
      </div>
      <BottomNav cur="settings" onNav={navTo}/>
    </div>
  );

  // HOME
  if(view==="home") return (
    <div style={S.app}>
      <div style={S.hdr}>
        <Logo/>
        <SettingsIcon onNavigate={navigate}/>
      </div>
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <button className="date-btn" onClick={() => setShowCal(!showCal)} style={{ background: showCal ? S._surface : S._bg, border: S._cardBorder, borderRadius: 11, cursor: "pointer", padding: "12px 15px", marginBottom: 0, textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", fontFamily: S._font }}>
          <div>
            <div style={{ fontSize:11, color:S._isLight?"#bbb":"#555", fontWeight:600, textTransform:"uppercase", letterSpacing:1.8, marginBottom:4 }}>Date de la séance</div>
            <div style={{ fontSize:16, fontWeight:600, color: showCal ? S._text : S._muted }}>{fmtDateLong(calDate)}</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={showCal ? S._text : S._muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, transform: showCal ? "rotate(180deg)" : "rotate(0deg)", transition:"transform 0.2s" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {showCal && <div style={{ marginTop:10 }}><Calendar calDate={calDate} setCalDate={setCalDate} sessions={db.sessions}/></div>}
        <div style={{ marginTop: 28, marginBottom: 16 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: S._text, textTransform: "uppercase", letterSpacing: 0.8, display: "block" }}>On bosse quoi aujourd'hui ?</span>
        </div>
        {db.groups.length > 0 && db.groups.map(g => (
          <Card key={g.id} onClick={() => startSession(g.id)}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:16, fontWeight:600 }}>{g.name}</div>
                <div style={{ fontSize:13, color:S._muted, marginTop:3 }}>{g.exercises.length} exercice{g.exercises.length>1?"s":""}</div>
              </div>
              <span style={{ color:S._isLight?"#bbb":"#3a3a3a", fontSize:18 }}>›</span>
            </div>
          </Card>
        ))}
        {db.groups.length === 0 && (
          <div style={{ background:S._surface, border:S._cardBorder, borderRadius:12, padding:"22px 18px", textAlign:"center", marginTop:10 }}>
            <div style={{ fontSize:15, color:S._muted, marginBottom:14 }}>Aucune séance créée</div>
            <button style={{ ...S.btn, width:"auto", padding:"11px 22px", margin:0, display:"inline-block" }} onClick={() => navTo("groups")}>Créer ma première séance</button>
          </div>
        )}
      </div>
      <BottomNav cur="home" onNav={navTo}/>
    </div>
  );

  // GROUPS
  if(view==="groups") return (
    <div style={S.app}>
      <div style={S.hdr}>
        <Logo/>
        <SettingsIcon onNavigate={navigate}/>
      </div>
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
                <div style={{ fontSize:13, color:S._muted, marginTop:3 }}>{g.exercises.length} exercice{g.exercises.length>1?"s":""}</div>
              </div>
              <span style={{ color:S._isLight?"#bbb":"#3a3a3a", fontSize:18 }}>›</span>
            </div>
          </Card>
        ))}
        {db.groups.length===0 && <p style={{ color:S._muted, fontSize:14 }}>Aucune séance. Crée-en une !</p>}
      </div>
      <BottomNav cur="groups" onNav={navTo}/>
    </div>
  );

  // GROUP DETAIL
  if(view==="group" && selGroup) return (
    <div style={S.app}>
      <div style={S.hdr}><Logo/><button style={S.back} onClick={()=>navigate("groups")}>← Séances</button></div>
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
          <h1 style={{ ...S.h1, marginBottom:0 }}>{selGroup.name}</h1>
          {selGroup.exercises.length >= 1 && (
            <button onClick={() => navigate("groups")} style={{ background:S._accent, color:S._isLight?"#fff":"white", border:"none", borderRadius:9, padding:"9px 16px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:S._font, flexShrink:0, marginLeft:12 }}>
              Valider ✓
            </button>
          )}
        </div>
        <p style={S.sub}>{selGroup.exercises.length} exercice{selGroup.exercises.length>1?"s":""}</p>
        <div style={S.sec}>Ajouter un exercice</div>
        {mergePrompt && mergePrompt.groupId===selGroupId && (
          <div style={{ background:S._surface, border:S._cardBorder, borderRadius:12, padding:16, marginBottom:15 }} className="fade-in">
            <div style={{ fontSize:15, fontWeight:600, marginBottom:5 }}>Exercice similaire détecté</div>
            <div style={{ fontSize:13, color:S._muted, marginBottom:14 }}><span style={{ color:S._text, fontWeight:500 }}>"{mergePrompt.newExo.name}"</span> ressemble à :</div>
            {mergePrompt.matches.map(({exo,group}) => {
              const isLinked = mergePrompt.linked.includes(exo.id);
              return (
                <div key={exo.id} style={{ display:"flex", alignItems:"center", gap:10, background:isLinked?"#1e2a1e":S._card, border:S._cardBorder, borderRadius:10, padding:"10px 14px", marginBottom:8, cursor:"pointer" }}
                  onClick={()=>{ const linked=isLinked?mergePrompt.linked.filter(id=>id!==exo.id):[...mergePrompt.linked,exo.id]; setMergePrompt({...mergePrompt,linked}); }}>
                  <div style={{ width:19, height:19, borderRadius:5, border:"2px solid "+(isLinked?"#5a9a5a":S._border), background:isLinked?"#5a9a5a":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {isLinked && <span style={{ color:"#0a1410", fontSize:12, fontWeight:700 }}>✓</span>}
                  </div>
                  <div><div style={{ fontSize:14, fontWeight:500 }}>{exo.name}</div><div style={{ fontSize:12, color:S._muted }}>{group.name}</div></div>
                </div>
              );
            })}
            <div style={{ fontSize:12, color:S._muted, marginBottom:13 }}>{mergePrompt.linked.length>0 ? "Coché = historique partagé" : "Coche pour partager l'historique"}</div>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>confirmAddExercise(mergePrompt.linked)} style={{ flex:1, background:S._surface, color:S._text, border:S._cardBorder, borderRadius:9, padding:"11px", fontSize:14, fontWeight:500, cursor:"pointer" }}>
                {mergePrompt.linked.length>0?"Lier & ajouter":"Ajouter sans lier"}
              </button>
              <button onClick={()=>setMergePrompt(null)} style={{ background:"transparent", color:S._muted, border:S._cardBorder, borderRadius:9, padding:"11px 15px", fontSize:14, cursor:"pointer" }}>Annuler</button>
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
        {selGroup.exercises.length===0 && <p style={{ color:S._muted, fontSize:14 }}>Aucun exercice. Ajoute-en un !</p>}
        <button style={S.danger} onClick={()=>deleteGroup(selGroup.id)}>Supprimer la séance "{selGroup.name}"</button>
      </div>
      <BottomNav cur="groups" onNav={navTo}/>
    </div>
  );

  // EXO STATS
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
                ? <div style={S.statBox}><div style={{ ...S.statNum, fontSize:16 }}>{formatDuration(last.timeTotalSecs !== undefined ? last.timeTotalSecs : minSecToSecs(last.timeMin||0, last.timeSec||0))}</div><div style={S.statLabel}>durée</div></div>
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
                        <XAxis dataKey="date" tick={{ fontSize:10, fill:S._muted }}/>
                        <YAxis tick={{ fontSize:10, fill:S._muted }} width={30}/>
                        <Tooltip contentStyle={{ background:S._card, border:S._cardBorder, color:S._text, fontSize:12, borderRadius:8 }}/>
                        <Line type="monotone" dataKey="kg" stroke={S._accent} strokeWidth={1.5} dot={{ fill:S._accent, r:3 }}/>
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
                        <XAxis dataKey="date" tick={{ fontSize:10, fill:S._muted }}/>
                        <YAxis tick={{ fontSize:10, fill:S._muted }} width={30}/>
                        <Tooltip contentStyle={{ background:S._card, border:S._cardBorder, color:S._text, fontSize:12, borderRadius:8 }}/>
                        <Line type="monotone" dataKey="reps" stroke="#aaa" strokeWidth={1.5} dot={{ fill:"#aaa", r:3 }}/>
                      </LineChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              )}
            </>
          )}
          {chartData.length<2 && <p style={{ color:S._muted, fontSize:13, marginBottom:20 }}>Encore {2-chartData.length} séance{chartData.length===0?"s":""} pour voir le graphique.</p>}
          {perfs.length>0 && (
            <>
              <div style={S.sec}>Historique</div>
              {[...perfs].reverse().map((p,i) => (
                <Card key={i} style={{ cursor:"default" }}>
                  <div style={{ fontSize:12, color:S._muted, marginBottom:4 }}>{p.dateLabel}</div>
                  <PerfTags entry={p}/>
                </Card>
              ))}
            </>
          )}
          {perfs.length===0 && <p style={{ color:S._muted, fontSize:14 }}>Pas encore de données.</p>}
          <button style={S.danger} onClick={()=>{deleteExercise(group?.id, selExoId); navigate("group");}}>Supprimer "{exo?.name}"</button>
        </div>
        <BottomNav cur="groups" onNav={navTo}/>
      </div>
    );
  }

  // SESSION EN COURS
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
          <span style={{ fontSize:11, color:S._sub, fontWeight:600, background:S._surface, padding:"5px 11px", borderRadius:20, letterSpacing:1.5, textTransform:"uppercase", border:S._cardBorder }}>En cours</span>
        </div>
        <div style={S.body} className="page-enter">
          {total>1 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:12, color:S._muted }}>{activeSession.name}</span>
                <span style={{ fontSize:12, color:S._muted, fontWeight:600 }}>{done+1} / {total}</span>
              </div>
              <div style={{ background:S._faint||"#222", borderRadius:3, height:2 }}>
                <div style={{ background:S._accent, borderRadius:3, height:2, width:((done+1)/total*100)+"%", transition:"width 0.25s" }}/>
              </div>
            </div>
          )}
          <h1 style={{ ...S.h1, marginBottom:5 }}>{exo?.name}</h1>
          {last && (
            <Card style={{ cursor:"default", marginBottom:18 }}>
              <div style={{ fontSize:12, color:S._sub, fontWeight:500, marginBottom:4 }}>Dernière fois — {fmt(last.date)}</div>
              <PerfTags entry={last}/>
            </Card>
          )}
          {activeSession.entries.length>0 && (
            <div style={{ marginBottom:16 }}>
              <div style={S.sec}>Déjà enregistré</div>
              {activeSession.entries.map((e,i) => {
                const eg = db.groups.find(g=>g.exercises.some(x=>x.id===e.exoId));
                const ee = eg?.exercises.find(x=>x.id===e.exoId);
                return <div key={i} style={{ fontSize:13, color:S._muted, marginBottom:4 }}>✓ {ee?.name||"—"}</div>;
              })}
            </div>
          )}
          <LogFormWidget logForm={logForm} setLogForm={setLogForm} exo={exo}/>
          <div style={{ height:18 }}/>
          <button style={{ ...S.ghost, borderColor:S._accent, color:S._accent, fontWeight:700, marginBottom:8 }} onClick={() => finishAndSave(activeSession.entries)}>✓ Valider la séance</button>
          <button style={S.btn} onClick={logEntry}>{nextName ? "Valider → " + nextName : "Valider cet exercice"}</button>
          <button style={{ ...S.ghost, color:S._muted, marginBottom:8 }} onClick={skipEntry}>{nextName ? "Passer → "+nextName : "Passer sans enregistrer"}</button>
          <button style={S.danger} onClick={()=>{setActiveSession(null); navigate("home");}}>Annuler la séance</button>
        </div>
      </div>
    );
  }

  // HISTORY
  if(view==="history") return (
    <div style={S.app}>
      <div style={S.hdr}>
        <Logo/>
        <SettingsIcon onNavigate={navigate}/>
      </div>
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <h1 style={S.h1}>Historique</h1>
        <p style={S.sub}>{db.sessions.length} séance{db.sessions.length>1?"s":""}</p>
        {db.sessions.length===0 && <p style={{ color:S._muted, fontSize:14 }}>Aucune séance enregistrée.</p>}
        {[...db.sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(s => (
          <Card key={s.id} onClick={()=>{setSelSessionId(s.id); navigate("sessionDetail");}}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:15, fontWeight:500 }}>{s.name}</div>
                <div style={{ fontSize:13, color:S._muted, marginTop:3 }}>{s.entries?.length||0} exercice{(s.entries?.length||0)>1?"s":""}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:13, color:S._muted }}>{fmt(s.date)}</div>
                <span style={{ color:S._isLight?"#bbb":"#3a3a3a", fontSize:18 }}>›</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav cur="history" onNav={navTo}/>
    </div>
  );

  // SESSION DETAIL
  if(view==="sessionDetail" && selSession) return (
    <div style={S.app}>
      <div style={S.hdr}><Logo/></div>
      <div style={S.body} className="page-enter" key={pageKey.current}>
        <button style={S.back} onClick={()=>navigate("history")}>← Historique</button>
        <div style={{ fontSize:12, color:S._muted, marginBottom:4 }}>{fmt(selSession.date)}</div>
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
        {(selSession.entries||[]).length===0 && <p style={{ color:S._muted, fontSize:14 }}>Aucun exercice enregistré.</p>}
        <button style={S.danger} onClick={()=>deleteSession(selSession.id)}>Supprimer cette séance</button>
      </div>
      <BottomNav cur="history" onNav={navTo}/>
    </div>
  );

  return null;
  } // end renderView

  // ─── Popup Overlay ─────────────────────────────────────────────────────────
  const renderPopup = () => {
    if (!popup) return null;
    return (
      <div
        onClick={closePopup}
        style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.72)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
          opacity: popupVisible ? 1 : 0,
          transition: "opacity 0.3s ease",
          backdropFilter: popupVisible ? "blur(6px)" : "blur(0px)",
          pointerEvents: popupVisible ? "all" : "none",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 400,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)",
            transform: popupVisible ? "scale(1) translateY(0)" : "scale(0.92) translateY(20px)",
            transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            background: "#111",
          }}
        >
          {/* Bouton fermer */}
          <button
            onClick={closePopup}
            style={{
              position: "absolute", top: 10, right: 10, zIndex: 10,
              width: 32, height: 32, borderRadius: "50%",
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff", fontSize: 18, lineHeight: 1,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
              fontFamily: C.font, fontWeight: 300,
            }}
            aria-label="Fermer"
          >×</button>

          {/* Image cliquable si lien défini */}
          {popup.link_url ? (
            <a href={popup.link_url} target="_blank" rel="noopener noreferrer" onClick={closePopup} style={{ display:"block" }}>
              <img src={popup.image_url} alt="Annonce" style={{ width:"100%", display:"block", maxHeight:520, objectFit:"cover" }} />
            </a>
          ) : (
            <img src={popup.image_url} alt="Annonce" style={{ width:"100%", display:"block", maxHeight:520, objectFit:"cover" }} />
          )}

          {/* ── Label en pied — plus grand et plus impactant ── */}
          {popup.label && (
            <div style={{
              padding: "16px 20px",
              fontSize: 16,
              fontWeight: 700,
              color: "rgba(255,255,255,0.92)",
              textAlign: "center",
              background: "#0d0d0d",
              fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
              letterSpacing: 0.2,
              lineHeight: 1.4,
            }}>
              {popup.label}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderView()}
      {renderPopup()}
    </>
  );
}

// ─── Auth Form ────────────────────────────────────────────────────────────────
function AuthForm() {
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
      <h1 style={{ color:'#8ba5bf', marginBottom:'30px', fontSize:28, fontWeight:700, letterSpacing:-0.5 }}>SPORTUP</h1>
      <div style={{ maxWidth:'300px', margin:'0 auto', width:'100%' }}>
        <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)}
          style={{ width:'100%', padding:'13px', marginBottom:'10px', borderRadius:'9px', border:'1px solid #333', background:'#1a1a1a', color:'white', fontSize:15, fontFamily:"'DM Sans', sans-serif" }} />
        <input type="password" placeholder="Mot de passe" onChange={e => setPassword(e.target.value)}
          style={{ width:'100%', padding:'13px', marginBottom:'20px', borderRadius:'9px', border:'1px solid #333', background:'#1a1a1a', color:'white', fontSize:15, fontFamily:"'DM Sans', sans-serif" }} />
        <button onClick={() => handleAuth('login')} disabled={loading}
          style={{ width:'100%', padding:'13px', marginBottom:'10px', background:'#8ba5bf', color:'white', border:'none', borderRadius:'9px', fontWeight:700, cursor:'pointer', fontSize:15, fontFamily:"'DM Sans', sans-serif" }}>
          {loading ? 'Chargement...' : 'Se connecter'}
        </button>
        <button onClick={() => handleAuth('signup')} disabled={loading}
          style={{ width:'100%', padding:'13px', background:'transparent', color:'#888', border:'1px solid #333', borderRadius:'9px', cursor:'pointer', fontSize:14, fontFamily:"'DM Sans', sans-serif" }}>
          Créer un compte
        </button>
      </div>
    </div>
  );
}
