import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { proxyImageUrl } from '../lib/proxyImage';
import { apiFetch } from '../lib/api';

/* ─── STYLES ──────────────────────────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=Syne+Mono:wght@400;700&display=swap');

  :root {
    --amber : #D4790A;
    --amber2: #F0920D;
    --cream : #FDFAF5;
    --ink   : #171009;
    --ink2  : #241808;
    --ink3  : #2E1F0C;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  *, *::before, *::after { cursor: none !important; }

  /* ── CUSTOM CROSSHAIR CURSOR ── */
  .gp-cur {
    position: fixed; z-index: 99999; pointer-events: none;
    width: 28px; height: 28px;
    transform: translate(-50%, -50%);
    will-change: left, top;
    mix-blend-mode: exclusion;
  }
  .gp-cur svg { width: 100%; height: 100%; overflow: visible; }
  .gp-cur-dot {
    position: fixed; z-index: 99998; pointer-events: none;
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--amber);
    transform: translate(-50%, -50%);
    will-change: left, top;
    box-shadow: 0 0 10px 3px rgba(212,121,10,0.55);
    transition: width .2s, height .2s;
  }
  body.cur-card .gp-cur-dot { width: 9px; height: 9px; }

  /* ── GRAIN OVERLAY ── */
  .gp-grain {
    position: fixed; inset: 0; z-index: 997; pointer-events: none;
    opacity: 0.042;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)' opacity='1'/%3E%3C/svg%3E");
    background-size: 300px 300px;
  }

  /* ── FILM RAIL STRIPS ── */
  .gp-rail {
    position: fixed; top: 0; bottom: 0; width: 28px;
    z-index: 50; pointer-events: none;
    display: flex; flex-direction: column;
    align-items: center; justify-content: space-around;
    padding: 80px 0;
  }
  .gp-rail.l { left: 0;  border-right: 1px solid rgba(212,121,10,0.09); }
  .gp-rail.r { right: 0; border-left:  1px solid rgba(212,121,10,0.09); }
  .gp-sprocket {
    width: 10px; height: 17px; border-radius: 3px;
    border: 1px solid rgba(212,121,10,0.22);
    background: rgba(212,121,10,0.03);
    flex-shrink: 0;
  }

  /* ── ROOT ── */
  .gp-root {
    min-height: 100vh;
    padding: 80px 0 140px;
    position: relative; overflow-x: hidden;
    font-family: 'Syne Mono', monospace;
    transition: background .5s;
  }
  .gp-root.dark  { background: var(--ink); }
  .gp-root.light { background: #F4EDE0; }

  /* ── CONTENT ── */
  .gp-content {
    position: relative; z-index: 1;
    max-width: 1260px; margin: 0 auto; padding: 0 56px;
  }

  /* ── HEADER ── */
  .gp-header {
    display: grid; grid-template-columns: 1fr auto;
    align-items: end; gap: 24px;
    margin-bottom: 64px; padding-bottom: 36px;
    position: relative;
  }
  .gp-header::after {
    content: '';
    position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, var(--amber) 0%, rgba(212,121,10,.15) 50%, transparent 100%);
  }

  /* eyebrow */
  .gp-eyebrow {
    font-size: 10px; color: var(--amber); letter-spacing: .3em;
    text-transform: uppercase; margin-bottom: 18px;
    display: flex; align-items: center; gap: 12px;
  }
  .gp-eyebrow::before {
    content: ''; width: 36px; height: 1px; background: var(--amber);
  }

  /* big ghosted background word */
  .gp-title-wrap { position: relative; }
  .gp-title-ghost {
    position: absolute; top: -22px; left: -6px; z-index: 0;
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(110px, 15vw, 200px);
    line-height: 1; letter-spacing: -.02em;
    color: var(--amber); opacity: .038;
    pointer-events: none; user-select: none; white-space: nowrap;
    transition: opacity .5s;
  }
  .gp-root.light .gp-title-ghost { opacity: .06; color: var(--ink); }

  .gp-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(54px, 7.5vw, 100px);
    line-height: .88; letter-spacing: .01em;
    position: relative; z-index: 1; transition: color .5s;
  }
  .gp-root.dark  .gp-title { color: var(--cream); }
  .gp-root.light .gp-title { color: var(--ink); }
  .gp-title em { font-style: normal; color: var(--amber); }

  .gp-subtitle {
    display: block; margin-top: 10px;
    font-family: 'DM Serif Display', serif; font-style: italic;
    font-size: clamp(14px, 1.6vw, 20px);
    transition: color .5s;
    position: relative; z-index: 1;
  }
  .gp-root.dark  .gp-subtitle { color: rgba(253,250,245,.3); }
  .gp-root.light .gp-subtitle { color: rgba(23,16,9,.4); }

  /* header right */
  .gp-hr { display: flex; flex-direction: column; align-items: flex-end; gap: 14px; }
  .gp-count {
    font-size: 11px; letter-spacing: .2em; transition: color .5s;
  }
  .gp-root.dark  .gp-count { color: rgba(253,250,245,.28); }
  .gp-root.light .gp-count { color: rgba(23,16,9,.35); }

  .gp-controls { display: flex; align-items: center; gap: 10px; }

  /* theme toggle */
  .gp-pill {
    width: 48px; height: 24px; border-radius: 12px; position: relative;
    border: 1px solid rgba(212,121,10,.4); background: rgba(212,121,10,.1);
    cursor: pointer; transition: background .3s;
  }
  .gp-pill:hover { background: rgba(212,121,10,.2); }
  .gp-pill-k {
    position: absolute; top: 2px; width: 18px; height: 18px; border-radius: 50%;
    background: var(--amber); display: flex; align-items: center;
    justify-content: center; font-size: 10px;
    transition: left .3s cubic-bezier(.23,1,.32,1);
  }
  .dark  .gp-pill-k { left: 2px; }
  .light .gp-pill-k { left: 26px; }

  .gp-back {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 11px; letter-spacing: .08em; text-transform: uppercase;
    color: var(--ink); background: var(--amber);
    padding: 10px 20px; border: 1px solid var(--amber); border-radius: 2px;
    transition: all .2s; cursor: pointer; font-family: 'Syne Mono', monospace;
  }
  .gp-back:hover { background: transparent; color: var(--amber); }
  .gp-back svg { transition: transform .2s; }
  .gp-back:hover svg { transform: translateX(-3px); }

  /* ── BENTO GRID ── */
  .gp-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 270px;
    gap: 14px;
  }

  /* 9-card repeating editorial bento pattern:
     [LARGE 2×2] [TALL 1×2]
     [sm] [sm]   [         ]
     [TALL 1×2] [WIDE 2×1]
     [         ] [sm] [sm]  */
  .gp-card:nth-child(9n+1) { grid-column: span 2; grid-row: span 2; }
  .gp-card:nth-child(9n+2) { grid-row: span 2; }
  .gp-card:nth-child(9n+5) { grid-column: span 2; }
  .gp-card:nth-child(9n+7) { grid-row: span 2; }

  /* ── CARD ── */
  .gp-card {
    position: relative;
    perspective: 1000px;
    border-radius: 4px;
    /* staggered entrance */
    opacity: 0;
    animation: cardIn .75s cubic-bezier(.23,1,.32,1) forwards;
  }
  @keyframes cardIn {
    from { opacity:0; transform: translateY(40px) scale(.95); filter: blur(6px); }
    to   { opacity:1; transform: translateY(0)    scale(1);   filter: blur(0); }
  }

  /* big decorative number floats behind card (outside card-body) */
  .card-deco-n {
    position: absolute;
    bottom: -20px; right: -6px; z-index: 0;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 110px; line-height: 1; letter-spacing: -.02em;
    color: var(--amber); opacity: .07;
    pointer-events: none; user-select: none;
    transition: opacity .4s, transform .4s;
  }
  .gp-card:hover .card-deco-n { opacity: .15; transform: translateY(-6px); }

  /* thin amber rule above card — appears on hover */
  .card-top-line {
    position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 2;
    background: linear-gradient(90deg, var(--amber), transparent);
    transform: scaleX(0); transform-origin: left;
    transition: transform .5s cubic-bezier(.23,1,.32,1);
  }
  .gp-card:hover .card-top-line { transform: scaleX(1); }

  /* ── CARD BODY (3D pivot) ── */
  .card-body {
    position: relative; width: 100%; height: 100%; border-radius: 4px;
    overflow: hidden; transform-style: preserve-3d;
    will-change: transform, box-shadow; cursor: pointer;
    box-shadow:
      0 6px 28px rgba(0,0,0,.55),
      0 0 0 1px rgba(212,121,10,.07);
    transition: box-shadow .05s;
  }
  .card-body:hover {
    box-shadow:
      var(--sx, 0px) var(--sy, 12px) 70px rgba(0,0,0,.8),
      0 0 0 1px rgba(212,121,10,.4),
      0 0 50px rgba(212,121,10,.07);
  }

  /* ── PHOTO LAYER (deepest — biggest parallax shift) ── */
  .card-photo {
    position: absolute; inset: -8%;
    width: 116%; height: 116%;
    will-change: transform;
  }
  .card-photo img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    filter: grayscale(18%) brightness(.78) sepia(7%);
    transition: filter .55s;
  }
  .card-body:hover .card-photo img {
    filter: grayscale(0%) brightness(.93) sepia(0%);
  }

  /* ── CURTAIN REVEAL (dark panel wipes UP on hover) ── */
  .card-curtain {
    position: absolute; inset: 0; z-index: 4;
    transform-origin: top center;
    transform: scaleY(1);
    /* two-color split for drama: amber line at bottom of curtain */
    background: linear-gradient(
      to bottom,
      var(--ink) 92%,
      var(--amber) 92%,
      var(--amber) 94%,
      var(--ink) 94%
    );
    transition: transform .75s cubic-bezier(.77, 0, .175, 1);
  }
  .gp-root.light .card-curtain {
    background: linear-gradient(
      to bottom,
      #E8DFCF 92%,
      var(--amber) 92%,
      var(--amber) 94%,
      #E8DFCF 94%
    );
  }
  .card-body:hover .card-curtain { transform: scaleY(0); }

  /* ── GLARE SWEEP (animates once on hover, doesn't reverse) ── */
  .card-glare {
    position: absolute; inset: 0; z-index: 7; overflow: hidden; pointer-events: none;
  }
  .card-glare::after {
    content: '';
    position: absolute;
    top: -60%; left: -100%;
    width: 55%; height: 220%;
    background: linear-gradient(
      105deg,
      transparent 0%,
      rgba(253,250,245,.22) 40%,
      rgba(253,250,245,.08) 55%,
      transparent 100%
    );
    transform: skewX(-15deg);
  }
  /* one-shot animation plays on hover, doesn't animate back on leave */
  .card-body:hover .card-glare::after {
    animation: glareSweep .7s cubic-bezier(.23,1,.32,1) forwards;
  }
  @keyframes glareSweep {
    from { left: -100%; }
    to   { left:  220%; }
  }

  /* ── GRADIENT OVERLAY (mid depth) ── */
  .card-overlay {
    position: absolute; inset: 0; z-index: 5;
    background: linear-gradient(
      170deg,
      rgba(23,16,9,0)   20%,
      rgba(23,16,9,.88) 100%
    );
    opacity: 0; transition: opacity .4s;
    will-change: transform;
  }
  .card-body:hover .card-overlay { opacity: 1; }

  /* ── FOREGROUND (text, floats closest) ── */
  .card-fore {
    position: absolute; inset: 0; z-index: 6;
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 18px 20px; pointer-events: none;
    will-change: transform;
  }

  .card-tag {
    display: inline-flex; align-items: center; align-self: flex-start;
    font-size: 8px; letter-spacing: .22em; text-transform: uppercase;
    color: var(--ink); background: var(--amber);
    padding: 3px 9px; border-radius: 1px; margin-bottom: 8px;
    opacity: 0; transform: translateY(10px);
    transition: opacity .3s .05s, transform .3s .05s;
  }
  .card-body:hover .card-tag { opacity: 1; transform: translateY(0); }

  .card-num {
    font-size: 11px; letter-spacing: .25em;
    color: rgba(253,250,245,.65);
    opacity: 0; transform: translateY(10px);
    transition: opacity .3s .1s, transform .3s .1s;
    text-shadow: 0 1px 10px rgba(0,0,0,.9);
  }
  .card-body:hover .card-num { opacity: 1; transform: translateY(0); }

  /* ── AMBER LEFT EDGE ── */
  .card-edge {
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: var(--amber); z-index: 8;
    transform: scaleY(0); transform-origin: bottom;
    transition: transform .45s cubic-bezier(.23,1,.32,1);
  }
  .card-body:hover .card-edge { transform: scaleY(1); }

  /* ── EXPAND ICON ── */
  .card-exp {
    position: absolute; top: 14px; right: 14px; z-index: 8;
    width: 32px; height: 32px; border-radius: 50%;
    border: 1px solid rgba(253,250,245,.22);
    background: rgba(23,16,9,.48);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transform: scale(.55);
    transition: opacity .3s, transform .3s;
  }
  .card-body:hover .card-exp { opacity: 1; transform: scale(1); }
  .card-exp svg { width: 13px; height: 13px; stroke: var(--cream); fill: none; }

  /* ── LOADER / EMPTY ── */
  .gp-loader {
    width: 40px; height: 40px;
    border: 3px solid rgba(212,121,10,.22);
    border-top-color: var(--amber); border-radius: 50%;
    animation: spin 1s linear infinite; margin: 130px auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .gp-empty {
    text-align: center; padding: 130px 0;
    font-size: 13px; letter-spacing: .2em;
    color: rgba(253,250,245,.3);
  }

  /* ── LIGHTBOX ── */
  .gp-lb {
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(10,6,2,.97);
    display: flex; align-items: center; justify-content: center;
    animation: lbIn .22s ease;
  }
  @keyframes lbIn { from{opacity:0} to{opacity:1} }
  .gp-lb-img {
    max-width: 88vw; max-height: 83vh; object-fit: contain; border-radius: 3px;
    box-shadow: 0 0 0 1px rgba(212,121,10,.18), 0 50px 110px rgba(0,0,0,.95);
    animation: lbZoom .32s cubic-bezier(.23,1,.32,1);
  }
  @keyframes lbZoom {
    from { transform: scale(.9) translateY(12px); opacity: 0; }
    to   { transform: scale(1)  translateY(0);    opacity: 1; }
  }
  .gp-lb-x {
    position: fixed; top: 24px; right: 24px;
    width: 44px; height: 44px; border-radius: 2px;
    border: 1px solid rgba(253,250,245,.14);
    background: rgba(253,250,245,.04);
    color: rgba(253,250,245,.45); font-size: 18px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all .2s;
  }
  .gp-lb-x:hover { background: var(--amber); border-color: var(--amber); color: var(--ink); }
  .gp-lb-nav {
    position: fixed; top: 50%; transform: translateY(-50%);
    width: 44px; height: 80px; border-radius: 2px;
    border: 1px solid rgba(253,250,245,.1);
    background: rgba(253,250,245,.04);
    color: rgba(253,250,245,.45); font-size: 22px;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    transition: all .2s;
  }
  .gp-lb-nav:hover { background: rgba(212,121,10,.18); border-color: var(--amber); color: var(--amber); }
  .gp-lb-nav.p { left: 20px; } .gp-lb-nav.n { right: 20px; }
  .gp-lb-ctr {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    font-family: 'Syne Mono', monospace; font-size: 10px;
    letter-spacing: .22em; color: rgba(253,250,245,.28);
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 960px) {
    .gp-grid { grid-template-columns: repeat(2, 1fr); }
    .gp-card:nth-child(9n+1) { grid-column: span 2; grid-row: span 2; }
    .gp-card:nth-child(9n+2) { grid-row: span 1; grid-column: span 1; }
    .gp-card:nth-child(9n+5) { grid-column: span 2; grid-row: span 1; }
    .gp-card:nth-child(9n+7) { grid-row: span 1; }
    .gp-rail { display: none; }
    .gp-content { padding: 0 28px; }
  }
  @media (max-width: 560px) {
    .gp-grid { grid-template-columns: 1fr; }
    .gp-card:nth-child(n) { grid-column: span 1 !important; grid-row: span 1 !important; }
    .gp-header { grid-template-columns: 1fr; }
    .gp-content { padding: 0 20px; }
    *, *::before, *::after { cursor: auto !important; }
    .gp-cur, .gp-cur-dot { display: none !important; }
    .gp-grain { display: none; }
  }
`;

/* ─── CROSSHAIR CURSOR ───────────────────────────────────────────────────── */
const Cursor = () => {
  const curRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ x: -200, y: -200 });
  const lerp = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const onMove = (e) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top = e.clientY + 'px';
      }
    };
    const onEnter = () => document.body.classList.add('cur-card');
    const onLeave = () => document.body.classList.remove('cur-card');

    window.addEventListener('mousemove', onMove);
    document.querySelectorAll('.card-body').forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    let raf;
    const tick = () => {
      lerp.current.x += (pos.current.x - lerp.current.x) * 0.14;
      lerp.current.y += (pos.current.y - lerp.current.y) * 0.14;
      if (curRef.current) {
        curRef.current.style.left = lerp.current.x + 'px';
        curRef.current.style.top = lerp.current.y + 'px';
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onMove); };
  }, []);

  return (
    <>
      <div ref={dotRef} className="gp-cur-dot" />
      <div ref={curRef} className="gp-cur">
        <svg viewBox="0 0 28 28" fill="none">
          {/* crosshair arms */}
          <line x1="14" y1="0" x2="14" y2="9" stroke="rgba(212,121,10,0.8)" strokeWidth="1.2" />
          <line x1="14" y1="19" x2="14" y2="28" stroke="rgba(212,121,10,0.8)" strokeWidth="1.2" />
          <line x1="0" y1="14" x2="9" y2="14" stroke="rgba(212,121,10,0.8)" strokeWidth="1.2" />
          <line x1="19" y1="14" x2="28" y2="14" stroke="rgba(212,121,10,0.8)" strokeWidth="1.2" />
          {/* corner ticks */}
          <path d="M5 9 L5 5 L9 5" stroke="rgba(212,121,10,0.4)" strokeWidth="1" fill="none" />
          <path d="M23 9 L23 5 L19 5" stroke="rgba(212,121,10,0.4)" strokeWidth="1" fill="none" />
          <path d="M5 19 L5 23 L9 23" stroke="rgba(212,121,10,0.4)" strokeWidth="1" fill="none" />
          <path d="M23 19 L23 23 L19 23" stroke="rgba(212,121,10,0.4)" strokeWidth="1" fill="none" />
        </svg>
      </div>
    </>
  );
};

/* ─── FILM RAIL ──────────────────────────────────────────────────────────── */
const FilmRail = ({ side }) => {
  const holes = Array.from({ length: 28 });
  return (
    <div className={`gp-rail ${side}`}>
      {holes.map((_, i) => <div key={i} className="gp-sprocket" />)}
    </div>
  );
};

/* ─── 3D CARD ────────────────────────────────────────────────────────────── */
const TAGS = ['MEMORY', 'MOMENT', 'CAPTURE', 'STORY', 'FRAME', 'SCENE', 'STILL'];

const Card3D = ({ src, index, onClick }) => {
  const sceneRef = useRef(null);
  const bodyRef = useRef(null);
  const photoRef = useRef(null);
  const overlayRef = useRef(null);
  const foreRef = useRef(null);
  const rafRef = useRef(null);

  const state = useRef({ rx: 0, ry: 0, px: 0, py: 0, sc: 1 });
  const target = useRef({ rx: 0, ry: 0, px: 0, py: 0, sc: 1 });

  useEffect(() => {
    const scene = sceneRef.current;
    const body = bodyRef.current;
    const photo = photoRef.current;
    const overlay = overlayRef.current;
    const fore = foreRef.current;

    const onMove = (e) => {
      const r = scene.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      const dx = nx - 0.5;
      const dy = ny - 0.5;

      target.current.rx = -dy * 20;
      target.current.ry = dx * 20;
      target.current.px = -dx * 28;
      target.current.py = -dy * 28;
      target.current.sc = 1.04;

      // shift shadow opposite to tilt (light source effect)
      body.style.setProperty('--sx', `${-dx * 36}px`);
      body.style.setProperty('--sy', `${-dy * 24 + 16}px`);
    };

    const onLeave = () => {
      target.current = { rx: 0, ry: 0, px: 0, py: 0, sc: 1 };
      body.style.setProperty('--sx', '0px');
      body.style.setProperty('--sy', '12px');
    };

    scene.addEventListener('mousemove', onMove);
    scene.addEventListener('mouseleave', onLeave);

    const tick = () => {
      const s = state.current;
      const t = target.current;
      const k = 0.09;

      s.rx += (t.rx - s.rx) * k;
      s.ry += (t.ry - s.ry) * k;
      s.px += (t.px - s.px) * k;
      s.py += (t.py - s.py) * k;
      s.sc += (t.sc - s.sc) * k;

      // card pivots in 3D
      body.style.transform =
        `rotateX(${s.rx}deg) rotateY(${s.ry}deg) scale(${s.sc})`;

      // photo — deepest, moves most (strong parallax)
      if (photo)
        photo.style.transform = `translateX(${s.px}px) translateY(${s.py}px)`;

      // overlay — mid depth, counter-shifts slightly
      if (overlay)
        overlay.style.transform =
          `translateX(${s.px * -0.18}px) translateY(${s.py * -0.18}px)`;

      // text — closest, floats forward and tracks mouse gently
      if (fore)
        fore.style.transform =
          `translateX(${s.px * 0.14}px) translateY(${s.py * 0.14}px) translateZ(22px)`;

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      scene.removeEventListener('mousemove', onMove);
      scene.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // stagger per card: rows + position within row
  const row = Math.floor(index / 3);
  const col = index % 3;
  const delay = `${row * 0.12 + col * 0.06}s`;
  const tag = TAGS[index % TAGS.length];

  return (
    <div
      ref={sceneRef}
      className="gp-card"
      style={{ animationDelay: delay }}
      onClick={onClick}
    >
      {/* decorative number floats behind the card */}
      <div className="card-deco-n">{String(index + 1).padStart(2, '0')}</div>
      {/* top amber rule */}
      <div className="card-top-line" />

      <div ref={bodyRef} className="card-body">
        {/* ── Layer 0: Photo ── */}
        <div ref={photoRef} className="card-photo">
          <img src={src} alt={`Memory ${index + 1}`} loading="lazy" />
        </div>

        {/* ── Layer 1: Curtain wipe ── */}
        <div className="card-curtain" />

        {/* ── Layer 2: Glare sweep ── */}
        <div className="card-glare" />

        {/* ── Layer 3: Gradient overlay ── */}
        <div ref={overlayRef} className="card-overlay" />

        {/* ── Layer 4: Foreground text ── */}
        <div ref={foreRef} className="card-fore">
          <span className="card-tag">{tag}</span>
          <span className="card-num">№ {String(index + 1).padStart(3, '0')}</span>
        </div>

        {/* ── Amber left edge ── */}
        <div className="card-edge" />

        {/* ── Expand icon ── */}
        <div className="card-exp">
          <svg strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5,2 2,2 2,5" />
            <polyline points="9,2 12,2 12,5" />
            <polyline points="5,12 2,12 2,9" />
            <polyline points="9,12 12,12 12,9" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/* ─── MAIN ───────────────────────────────────────────────────────────────── */
const GalleryPage = () => {
  const [lbIdx, setLbIdx] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      try {
        const res = await apiFetch('/api/gallery');
        if (res.images?.length > 0)
          setImages(res.images.map(img => proxyImageUrl(img.url)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const prev = () => setLbIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setLbIdx(i => (i + 1) % images.length);

  useEffect(() => {
    const h = (e) => {
      if (lbIdx === null) return;
      if (e.key === 'Escape') setLbIdx(null);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [lbIdx, images.length]);

  return (
    <>
      <style>{styles}</style>

      {/* Grain + cursor + film rails */}
      <div className="gp-grain" />
      {lbIdx === null && <Cursor />}
      <FilmRail side="l" />
      <FilmRail side="r" />

      <div className={`gp-root ${theme}`}>
        <div className="gp-content">

          {/* ── HEADER ── */}
          <div className="gp-header">
            <div>
              <div className="gp-eyebrow">Festiverse '26 — Visual Archive</div>
              <div className="gp-title-wrap">
                <div className="gp-title-ghost">GALLERY</div>
                <h1 className="gp-title">
                  FULL <em>GALLERY</em>
                </h1>
                <span className="gp-subtitle">Every moment, preserved in frame</span>
              </div>
            </div>

            <div className="gp-hr">
              <div className="gp-count">
                {String(images.length).padStart(3, '0')} PHOTOGRAPHS
              </div>
              <div className="gp-controls">
                <span style={{
                  fontFamily: 'Syne Mono, monospace', fontSize: 10,
                  letterSpacing: '.14em', textTransform: 'uppercase',
                  color: theme === 'dark' ? 'rgba(253,250,245,.3)' : 'rgba(23,16,9,.35)',
                  transition: 'color .4s',
                }}>
                  {theme === 'dark' ? '☾' : '☀'}
                </span>
                <button
                  className="gp-pill"
                  onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                >
                  <div className="gp-pill-k">{theme === 'dark' ? '☾' : '☀'}</div>
                </button>
              </div>
              <button className="gp-back" onClick={() => navigate('/')}>
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M13 7H1M6 12L1 7l5-5" />
                </svg>
                Back to Home
              </button>
            </div>
          </div>

          {/* ── GRID ── */}
          {loading ? (
            <div className="gp-loader" />
          ) : images.length > 0 ? (
            <div className="gp-grid">
              {images.map((src, i) => (
                <Card3D
                  key={i}
                  src={src}
                  index={i}
                  onClick={() => setLbIdx(i)}
                />
              ))}
            </div>
          ) : (
            <div className="gp-empty">NO PHOTOGRAPHS FOUND</div>
          )}
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {lbIdx !== null && (
        <div className="gp-lb" onClick={() => setLbIdx(null)}>
          <img
            className="gp-lb-img"
            src={images[lbIdx]}
            alt={`Gallery ${lbIdx + 1}`}
            onClick={e => e.stopPropagation()}
          />
          <button className="gp-lb-x" onClick={() => setLbIdx(null)}>✕</button>
          <button className="gp-lb-nav p" onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
          <button className="gp-lb-nav n" onClick={e => { e.stopPropagation(); next(); }}>›</button>
          <div className="gp-lb-ctr">
            {String(lbIdx + 1).padStart(3, '0')} / {String(images.length).padStart(3, '0')}
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryPage;