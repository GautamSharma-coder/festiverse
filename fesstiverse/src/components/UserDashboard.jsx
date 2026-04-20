import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

/* ── CSS ─────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --bg:       #0e0e10;
    --surface:  #16161a;
    --border:   #252529;
    --accent:   #f97316;
    --accent2:  #fb923c;
    --green:    #22c55e;
    --red:      #ef4444;
    --text:     #f4f4f5;
    --muted:    #71717a;
    --muted2:   #3f3f46;
    --radius:   14px;
    --font-h:   'Syne', sans-serif;
    --font-b:   'Outfit', sans-serif;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Layout ── */
  .d-root {
    min-height: 100vh;
    background: var(--bg);
    font-family: var(--font-b);
    color: var(--text);
    display: flex;
    flex-direction: column;
    /* FIX: prevent horizontal overflow on root */
    overflow-x: hidden;
    max-width: 100vw;
  }

  /* ── Topbar ── */
  .d-topbar {
    position: sticky; top: 0; z-index: 50;
    height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    /* FIX: tighter padding on mobile, use gap instead of relying on space */
    padding: 0 14px;
    background: rgba(14,14,16,0.85);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    /* FIX: prevent topbar itself from overflowing */
    width: 100%;
    min-width: 0;
  }
  .d-topbar-left {
    display: flex; align-items: center; gap: 8px;
    /* FIX: allow shrink so right side isn't pushed off */
    min-width: 0;
    flex-shrink: 1;
    overflow: hidden;
  }
  .d-logo {
    font-family: var(--font-h);
    font-size: 1rem; font-weight: 800;
    letter-spacing: -0.02em; color: var(--text);
    /* FIX: don't let logo wrap or overflow */
    white-space: nowrap;
    flex-shrink: 0;
  }
  .d-logo span { color: var(--accent); }
  .d-topbar-right {
    display: flex; align-items: center; gap: 8px;
    /* FIX: prevent shrinking so logout stays visible */
    flex-shrink: 0;
    min-width: 0;
  }
  .d-user-chip {
    display: flex; align-items: center; gap: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 99px;
    padding: 5px 10px 5px 5px;
    font-size: 0.8rem; color: var(--muted);
    /* FIX: hard cap width + ellipsis */
    max-width: 130px;
    min-width: 0;
    overflow: hidden;
  }
  .d-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), #f59e0b);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }
  /* FIX: name inside chip must truncate */
  .d-user-chip-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .d-btn-icon {
    background: none; border: none; cursor: pointer;
    color: var(--muted); font-size: 0.78rem;
    padding: 6px 10px; border-radius: 8px;
    transition: color .15s, background .15s;
    font-family: var(--font-b);
    white-space: nowrap;
    flex-shrink: 0;
  }
  .d-btn-icon:hover { background: var(--surface); color: var(--red); }
  .d-back-btn {
    background: none; border: none; cursor: pointer;
    color: var(--muted); font-size: 0.78rem;
    padding: 6px 8px; border-radius: 8px;
    display: flex; align-items: center; gap: 4px;
    transition: color .15s, background .15s;
    font-family: var(--font-b);
    flex-shrink: 0;
    white-space: nowrap;
  }
  .d-back-btn:hover { background: var(--surface); color: var(--text); }

  /* ── Body ── */
  .d-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
    padding: 28px 20px 100px;
    /* FIX: prevent inner content from escaping */
    min-width: 0;
    overflow-x: hidden;
  }

  /* ── Page header ── */
  .d-header { margin-bottom: 28px; }
  .d-header h1 {
    font-family: var(--font-h);
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 800; letter-spacing: -0.03em;
    line-height: 1.1;
  }
  .d-header h1 em { font-style: normal; color: var(--accent); }
  .d-header p { font-size: 0.85rem; color: var(--muted); margin-top: 5px; font-weight: 300; }

  /* ── Desktop Tabs ── */
  .d-tabs-desktop {
    display: flex; gap: 4px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px; padding: 4px;
    margin-bottom: 28px;
  }
  .d-tab {
    flex: 1; padding: 9px 16px;
    background: none; border: none; cursor: pointer;
    font-family: var(--font-b); font-size: 0.85rem; font-weight: 500;
    color: var(--muted); border-radius: 9px;
    transition: all .2s; display: flex; align-items: center; justify-content: center; gap: 7px;
  }
  .d-tab:hover { color: var(--text); background: var(--muted2); }
  .d-tab.active {
    background: var(--accent); color: #fff;
    font-weight: 600;
    box-shadow: 0 2px 12px rgba(249,115,22,0.35);
  }
  .d-tab-icon { font-size: 1rem; }

  /* ── Mobile Bottom Nav ── */
  .d-bottom-nav {
    display: none;
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    background: rgba(22,22,26,0.95);
    border-top: 1px solid var(--border);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 8px 16px 20px;
  }
  .d-bottom-nav-inner { display: flex; justify-content: space-around; }
  .d-nav-item {
    background: none; border: none; cursor: pointer;
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 6px 14px; border-radius: 12px;
    transition: all .2s; font-family: var(--font-b);
  }
  .d-nav-item.active { background: rgba(249,115,22,0.12); }
  .d-nav-icon { font-size: 1.2rem; }
  .d-nav-label { font-size: 0.65rem; font-weight: 500; color: var(--muted); letter-spacing: 0.03em; }
  .d-nav-item.active .d-nav-label { color: var(--accent); }
  .d-nav-item.active .d-nav-icon { filter: saturate(1.5); }

  /* ── Message ── */
  .d-msg {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 12px 16px; border-radius: 10px; margin-bottom: 20px;
    font-size: 0.85rem; font-weight: 400; animation: fadeUp .25s ease;
    /* FIX: wrap long error messages */
    word-break: break-word;
  }
  .d-msg.ok  { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25); color: #86efac; }
  .d-msg.err { background: rgba(239,68,68,0.08);  border: 1px solid rgba(239,68,68,0.25);  color: #fca5a5; }
  .d-msg-icon { font-size: 1rem; flex-shrink: 0; margin-top: 1px; }

  /* ── Card ── */
  .d-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    /* FIX: card must not overflow its container */
    min-width: 0;
    overflow: hidden;
  }

  /* ── Section label ── */
  .d-section-label {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.12em; color: var(--muted); margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
    overflow: hidden;
  }
  .d-section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); min-width: 0; }

  /* ── Form ── */
  .d-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }
  .d-field label {
    display: block; font-size: 0.72rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: var(--muted); margin-bottom: 6px;
  }
  .d-field input {
    width: 100%; padding: 10px 13px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 9px; color: var(--text); font-size: 0.88rem;
    font-family: var(--font-b); transition: border-color .15s, box-shadow .15s;
    outline: none;
    /* FIX: inputs must not exceed their grid cell */
    min-width: 0;
    max-width: 100%;
  }
  .d-field input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(249,115,22,0.1);
  }
  .d-field input:disabled {
    color: var(--muted2); cursor: not-allowed; background: var(--surface);
  }
  .d-field input::placeholder { color: var(--muted2); }

  /* ── Divider ── */
  .d-divider { height: 1px; background: var(--border); margin: 20px 0; }

  /* ── Primary button ── */
  .d-btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 22px;
    background: var(--accent); color: #fff;
    border: none; border-radius: 10px; cursor: pointer;
    font-family: var(--font-b); font-size: 0.875rem; font-weight: 600;
    transition: background .15s, transform .15s, box-shadow .15s;
    box-shadow: 0 2px 10px rgba(249,115,22,0.25);
    max-width: 100%;
    white-space: nowrap;
  }
  .d-btn-primary:hover:not(:disabled) {
    background: var(--accent2);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(249,115,22,0.35);
  }
  .d-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
  .d-btn-primary.full { width: 100%; justify-content: center; padding: 12px; font-size: 0.9rem; }

  /* ── Ghost button ── */
  .d-btn-ghost {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px;
    background: none; border: 1px solid var(--border);
    border-radius: 10px; color: var(--muted); cursor: pointer;
    font-family: var(--font-b); font-size: 0.85rem; font-weight: 500;
    transition: all .15s;
  }
  .d-btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

  /* ── Spinner ── */
  .d-spin {
    width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin .65s linear infinite;
    display: inline-block; flex-shrink: 0;
  }

  /* ── Empty state ── */
  .d-empty { text-align: center; padding: 56px 24px; }
  .d-empty-icon { font-size: 2.5rem; opacity: 0.25; margin-bottom: 14px; }
  .d-empty h3 { font-family: var(--font-h); font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; }
  .d-empty p { font-size: 0.85rem; color: var(--muted); margin-bottom: 20px; }

  /* ── Events grid ── */
  .d-events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
    min-width: 0;
    width: 100%;
  }

  /* ── Event card ── */
  .d-ev {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 16px;
    cursor: pointer; transition: all .2s; position: relative; overflow: hidden;
    /* FIX: event cards must stay inside grid cell */
    min-width: 0;
    word-break: break-word;
  }
  .d-ev::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 2px; background: transparent; transition: background .2s;
  }
  .d-ev:hover:not(.d-ev-reg) { border-color: rgba(249,115,22,0.4); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  .d-ev:hover:not(.d-ev-reg)::before { background: linear-gradient(to right, var(--accent), transparent); }
  .d-ev.d-ev-sel { border-color: var(--accent); background: rgba(249,115,22,0.06); }
  .d-ev.d-ev-sel::before { background: linear-gradient(to right, var(--accent), var(--accent2)); }
  .d-ev.d-ev-reg { border-color: rgba(34,197,94,0.3); background: rgba(34,197,94,0.04); cursor: default; transform: none; }
  .d-ev.d-ev-reg::before { background: linear-gradient(to right, var(--green), transparent); }

  .d-ev-head {
    display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 10px;
    min-width: 0;
    overflow: hidden;
  }
  .d-ev-name {
    font-family: var(--font-h); font-size: 0.95rem; font-weight: 700; line-height: 1.3;
    /* FIX: name must wrap, not push badges off screen */
    min-width: 0;
    word-break: break-word;
    flex: 1;
  }
  .d-ev-badges {
    display: flex; flex-direction: column; gap: 4px; align-items: flex-end;
    flex-shrink: 0;
    max-width: 50%;
  }
  .d-badge {
    font-size: 0.62rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.07em; padding: 2px 7px; border-radius: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .d-badge-green { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
  .d-badge-amber { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
  .d-badge-orange { background: rgba(249,115,22,0.12); color: var(--accent); border: 1px solid rgba(249,115,22,0.25); }

  .d-ev-meta {
    font-size: 0.78rem; color: var(--muted); margin: 3px 0; display: flex; align-items: center; gap: 5px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .d-ev-desc {
    font-size: 0.78rem; color: var(--muted2); line-height: 1.55; margin-top: 10px; padding-top: 10px;
    border-top: 1px solid var(--border);
    word-break: break-word;
    overflow-wrap: break-word;
  }

  /* Checkbox */
  .d-checkbox {
    width: 19px; height: 19px; border-radius: 5px; flex-shrink: 0;
    border: 1.5px solid var(--muted2);
    background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    transition: all .15s; margin-top: 2px;
  }
  .d-checkbox.checked { background: var(--accent); border-color: var(--accent); }

  /* ── Team form ── */
  .d-team-form {
    margin-top: 14px; padding: 14px; border-radius: 10px;
    background: var(--bg); border: 1px solid rgba(249,115,22,0.2);
    overflow: hidden;
    min-width: 0;
  }
  .d-team-title {
    font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--accent); margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
    word-break: break-word;
  }
  .d-team-row {
    display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 8px; margin-bottom: 8px;
    min-width: 0;
  }
  .d-team-row input {
    width: 100%; padding: 8px 10px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 7px; color: var(--text);
    font-size: 0.8rem; font-family: var(--font-b); outline: none;
    transition: border-color .15s;
    min-width: 0;
    max-width: 100%;
  }
  .d-team-row input:focus { border-color: var(--accent); }
  .d-team-row input::placeholder { color: var(--muted2); }

  /* ── Fixed register bar ── */
  .d-reg-bar {
    position: fixed; bottom: 88px; left: 50%; transform: translateX(-50%);
    width: calc(100% - 28px); max-width: 800px;
    background: rgba(22,22,26,0.92);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 14px 18px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.5);
    animation: slideUp .25s ease;
    z-index: 30;
    box-sizing: border-box;
  }
  .d-reg-bar-text {
    font-size: 0.85rem;
    min-width: 0;
    flex: 1;
    overflow: hidden;
  }
  .d-reg-bar-text strong {
    font-family: var(--font-h); font-weight: 700; font-size: 1rem; display: block;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .d-reg-bar-text span {
    color: var(--muted); font-size: 0.78rem;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;
  }

  /* ── My events list ── */
  .d-my-ev {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 11px;
    background: var(--surface); border: 1px solid var(--border);
    margin-bottom: 8px; transition: border-color .15s;
    min-width: 0;
    overflow: hidden;
  }
  .d-my-ev:hover { border-color: var(--muted2); }
  .d-my-ev-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--green); flex-shrink: 0;
    box-shadow: 0 0 8px rgba(34,197,94,0.5);
  }
  .d-my-ev-info { flex: 1; min-width: 0; overflow: hidden; }
  .d-my-ev-name { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .d-my-ev-meta {
    font-size: 0.75rem; color: var(--muted); margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .d-my-ev-badge {
    font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
    padding: 3px 8px; border-radius: 5px;
    background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.2);
    flex-shrink: 0;
    white-space: nowrap;
  }

  /* ── Stats strip ── */
  .d-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 10px; margin-bottom: 24px;
  }
  .d-stat {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 11px; padding: 14px 16px; text-align: center;
    min-width: 0;
    overflow: hidden;
  }
  .d-stat-val {
    font-family: var(--font-h); font-size: 1.4rem; font-weight: 800; color: var(--accent);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .d-stat-lbl { font-size: 0.7rem; color: var(--muted); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.08em; }

  /* ── Animations ── */
  @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin    { to { transform:rotate(360deg); } }
  .d-fade { animation: fadeUp .35s ease both; }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .d-body { padding: 20px 14px 100px; }
    .d-form-grid { grid-template-columns: 1fr; gap: 12px; }
    .d-events-grid { grid-template-columns: 1fr; }
    .d-tabs-desktop { display: none; }
    .d-bottom-nav { display: block; }

    /* FIX: stats — 2-col on mobile, third spans full width */
    .d-stats { grid-template-columns: 1fr 1fr; }
    .d-stats .d-stat:last-child { grid-column: 1 / -1; }

    /* FIX: register bar stacks vertically, constrained by body padding */
    .d-reg-bar {
      bottom: 88px;
      flex-direction: column;
      gap: 10px;
    }
    .d-reg-bar .d-btn-primary { width: 100%; justify-content: center; }

    /* FIX: team row goes single-column on mobile */
    .d-team-row { grid-template-columns: 1fr; }

    .d-card { padding: 18px 16px; }
    .d-header h1 { font-size: 1.4rem; }
    .d-user-chip { max-width: 100px; }
    .d-topbar { padding: 0 10px; }
  }

  /* FIX: hide chip name text on very narrow screens */
  @media (max-width: 380px) {
    .d-user-chip-name { display: none; }
    .d-user-chip { padding: 5px; }
  }

  @media (min-width: 641px) {
    .d-bottom-nav { display: none; }
    .d-reg-bar { bottom: 24px; }
  }
  @media (min-width: 768px) {
    .d-body { padding: 36px 28px 80px; }
    .d-events-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
    .d-topbar { padding: 0 20px; }
  }
`;

/* ── Spinner ─── */
const Spin = () => <span className="d-spin" />;

/* ── SVG check ─── */
const Check = () => (
  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
    <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Main Component ─────────────────────────────────────────────────── */
const UserDashboard = ({ user, onProfileUpdate, onClose, onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: user?.name || '', email: user?.email || '',
    phone: user?.phone || '', college: user?.college || '',
  });
  const [festiverseId, setFestiverseId] = useState(user?.festiverse_id || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [myEvents, setMyEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [teamMembers, setTeamMembers] = useState({});
  const [memberLookup, setMemberLookup] = useState({}); // { [eid_idx]: { status, data } }
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [eventSearch, setEventSearch] = useState('');
  const [qrModal, setQrModal] = useState(null); // registration id for QR
  const [qrImage, setQrImage] = useState('');
  const [qrLoading, setQrLoading] = useState(false);
  const [idCopied, setIdCopied] = useState(false);

  useEffect(() => { fetchProfile(); fetchMyEvents(); fetchAllEvents(); }, []);

  const fetchProfile = async () => { try { const d = await apiFetch('/api/auth/profile'); if (d.user) { setProfile({ name: d.user.name || '', email: d.user.email || '', phone: d.user.phone || '', college: d.user.college || '' }); if (d.user.avatar_url) setAvatarUrl(d.user.avatar_url); if (d.user.festiverse_id) setFestiverseId(d.user.festiverse_id); } } catch (e) { if (e.message.includes('token') || e.message.includes('Unauthorized') || e.message.includes('Admin access')) onLogout(); } };
  const fetchMyEvents = async () => { try { const d = await apiFetch('/api/events/my-events'); setMyEvents(d.registrations || []); } catch (e) { if (e.message.includes('token') || e.message.includes('Unauthorized') || e.message.includes('Admin access')) onLogout(); } };
  const fetchAllEvents = async () => { try { const d = await apiFetch('/api/events'); setAllEvents(d.events || []); } catch (e) { if (e.message.includes('token') || e.message.includes('Unauthorized') || e.message.includes('Admin access')) onLogout(); } };

  const saveProfile = async () => {
    setSaving(true); setMsg({ text: '', type: '' });
    try {
      let data;
      if (avatarFile) {
        // Use FormData for avatar upload
        const formData = new FormData();
        formData.append('name', profile.name);
        formData.append('email', profile.email);
        formData.append('college', profile.college);
        formData.append('avatar', avatarFile);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${API_URL}/api/auth/profile`, {
          method: 'PUT',
          body: formData,
          credentials: 'include', // Include httpOnly cookies
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload failed');
      } else {
        data = await apiFetch('/api/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({ name: profile.name, email: profile.email, college: profile.college }),
        });
      }
      setMsg({ text: 'Profile saved successfully.', type: 'ok' });
      if (data.user?.avatar_url) { setAvatarUrl(data.user.avatar_url); setAvatarFile(null); setAvatarPreview(''); }
      if (onProfileUpdate && data.user) onProfileUpdate(data.user);
    } catch (e) { setMsg({ text: e.message, type: 'err' }); }
    finally { setSaving(false); }
  };

  const toggleEvent = (id) => {
    setSelectedEvents(prev => {
      if (prev.includes(id)) {
        const copy = { ...teamMembers }; delete copy[id]; setTeamMembers(copy);
        return prev.filter(e => e !== id);
      }
      const ev = allEvents.find(e => e.id === id);
      if (ev?.team_size > 1) {
        const slots = Array.from({ length: ev.team_size - 1 }, () => ({ festiverse_id: '' }));
        setTeamMembers(p => ({ ...p, [id]: slots }));
      }
      return [...prev, id];
    });
  };

  const updateMember = (eid, idx, field, val) =>
    setTeamMembers(p => {
      const arr = [...(p[eid] || [])];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...p, [eid]: arr };
    });

  // Look up a team member by Festiverse ID
  const lookupMember = async (eid, idx, fid) => {
    const key = `${eid}_${idx}`;
    const trimmed = fid.toUpperCase().trim();
    if (!trimmed || !/^F26[A-Z]{2}\d{4}$/.test(trimmed)) {
      setMemberLookup(p => ({ ...p, [key]: null }));
      return;
    }
    setMemberLookup(p => ({ ...p, [key]: { status: 'loading' } }));
    try {
      const d = await apiFetch(`/api/events/lookup-member/${trimmed}`);
      setMemberLookup(p => ({ ...p, [key]: { status: 'found', data: d.member } }));
    } catch (e) {
      setMemberLookup(p => ({ ...p, [key]: { status: 'error', message: e.message } }));
    }
  };

  const registerEvents = async () => {
    if (!selectedEvents.length) return setMsg({ text: 'Select at least one event to continue.', type: 'err' });
    for (const eid of selectedEvents) {
      const ev = allEvents.find(e => e.id === eid);
      if (ev?.team_size > 1) {
        const members = teamMembers[eid] || [];
        for (let i = 0; i < members.length; i++) {
          const fid = members[i].festiverse_id?.trim();
          if (!fid) return setMsg({ text: `Enter Festiverse ID for all team members in "${ev.name}".`, type: 'err' });
          const key = `${eid}_${i}`;
          const lookup = memberLookup[key];
          if (!lookup || lookup.status !== 'found') return setMsg({ text: `Verify all Festiverse IDs for "${ev.name}" before registering.`, type: 'err' });
        }
      }
    }
    setLoading(true);
    try {
      const payload = selectedEvents.map(eid => ({ eventId: eid, teamMembers: teamMembers[eid] || [] }));
      await apiFetch('/api/events/register', { method: 'POST', body: JSON.stringify({ registrations: payload }) });
      setMsg({ text: 'Registered! See you at the festival.', type: 'ok' });
      setSelectedEvents([]); setTeamMembers({}); setMemberLookup({}); fetchMyEvents();
    } catch (e) { setMsg({ text: e.message, type: 'err' }); }
    finally { setLoading(false); }
  };

  const registeredIds = myEvents.map(r => r.event_id);
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const showQr = async (regId) => {
    setQrModal(regId); setQrLoading(true); setQrImage('');
    try {
      const d = await apiFetch(`/api/events/qr/${regId}`);
      setQrImage(d.qrCode || '');
    } catch (e) {
      setQrImage('');
      console.log(e);
    } finally { setQrLoading(false); }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '⊙' },
    { id: 'my-events', label: 'Tickets', icon: '◎' },
    { id: 'register', label: 'Explore', icon: '◈' },
  ];

  const switchTab = (id) => { setActiveTab(id); setMsg({ text: '', type: '' }); };

  return (
    <>
      <style>{CSS}</style>
      <div className="d-root">

        {/* ── Topbar ── */}
        <header className="d-topbar">
          <div className="d-topbar-left">
            <button className="d-back-btn" onClick={onClose}>
              <span>←</span>
            </button>
            <div className="d-logo">Festiver<span>se</span> <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--muted)' }}>'26</span></div>
          </div>
          <div className="d-topbar-right">
            <div className="d-user-chip">
              <div className="d-avatar" style={avatarUrl ? { backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}>
                {!avatarUrl && initials}
              </div>
              <span className="d-user-chip-name">{user?.name}</span>
            </div>
            <button className="d-btn-icon" onClick={onLogout}>Logout</button>
          </div>
        </header>

        {/* ── Main body ── */}
        <main className="d-body">

          <div className="d-header d-fade">
            <h1>My <em>Dashboard</em></h1>
            <p>Manage your profile and event registrations</p>
          </div>

          <div className="d-tabs-desktop d-fade" style={{ animationDelay: '.05s' }}>
            {tabs.map(t => (
              <button key={t.id} className={`d-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => switchTab(t.id)}>
                <span className="d-tab-icon">{t.icon}</span> {t.label}
                {t.id === 'my-events' && myEvents.length > 0 && (
                  <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '1px 6px', fontSize: '0.7rem', marginLeft: 2 }}>{myEvents.length}</span>
                )}
              </button>
            ))}
          </div>

          {msg.text && (
            <div className={`d-msg ${msg.type}`}>
              <span className="d-msg-icon">{msg.type === 'ok' ? '✓' : '!'}</span>
              {msg.text}
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div className="d-fade">
              {/* Festiverse ID Card */}
              {festiverseId && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(249,115,22,0.03))',
                  border: '1px solid rgba(249,115,22,0.25)',
                  borderRadius: 'var(--radius)', padding: '16px 20px',
                  marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, animation: 'fadeUp .3s ease both',
                }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent)', marginBottom: 4 }}>Your Festiverse ID</div>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>{festiverseId}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>Share this with your team leader for event registration</div>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(festiverseId); setIdCopied(true); setTimeout(() => setIdCopied(false), 2000); }}
                    style={{
                      background: idCopied ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.15)',
                      border: `1px solid ${idCopied ? 'rgba(34,197,94,0.35)' : 'rgba(249,115,22,0.35)'}`,
                      borderRadius: 10, padding: '8px 16px', cursor: 'pointer',
                      color: idCopied ? '#4ade80' : 'var(--accent)',
                      fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-b)',
                      transition: 'all .2s', whiteSpace: 'nowrap', flexShrink: 0,
                    }}
                  >
                    {idCopied ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>
              )}

              <div className="d-stats">
                <div className="d-stat">
                  <div className="d-stat-val">{myEvents.length}</div>
                  <div className="d-stat-lbl">Registered</div>
                </div>
                <div className="d-stat">
                  <div className="d-stat-val">{allEvents.length}</div>
                  <div className="d-stat-lbl">Total Events</div>
                </div>
                <div className="d-stat">
                  <div className="d-stat-val" style={{ fontSize: '0.95rem', paddingTop: 4, whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.2 }}>
                    {profile.college ? profile.college : '—'}
                  </div>
                  <div className="d-stat-lbl">College</div>
                </div>
              </div>

              <div className="d-card">
                {/* Avatar Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: avatarPreview || avatarUrl
                      ? `url(${avatarPreview || avatarUrl}) center/cover`
                      : 'linear-gradient(135deg, var(--accent), #f59e0b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', fontWeight: 700, color: '#fff',
                    border: '2px solid var(--border)', flexShrink: 0,
                  }}>
                    {!(avatarPreview || avatarUrl) && initials}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 4 }}>Profile Photo</div>
                    <label style={{
                      display: 'inline-block', fontSize: '0.75rem', color: 'var(--accent)',
                      cursor: 'pointer', padding: '4px 10px', borderRadius: 6,
                      border: '1px solid rgba(249,115,22,0.3)', background: 'rgba(249,115,22,0.06)',
                    }}>
                      {avatarFile ? '✓ Photo selected' : '📷 Upload'}
                      <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                    </label>
                    {avatarFile && <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: 8 }}>{avatarFile.name}</span>}
                  </div>
                </div>

                <div className="d-section-label">Personal Information</div>
                <div className="d-form-grid">
                  {[
                    { label: 'Full Name', key: 'name', type: 'text', disabled: false },
                    { label: 'Phone', key: 'phone', type: 'tel', disabled: true },
                    { label: 'Email', key: 'email', type: 'email', disabled: false },
                    { label: 'College', key: 'college', type: 'text', disabled: false },
                  ].map(f => (
                    <div key={f.key} className="d-field">
                      <label>{f.label}{f.disabled && <span style={{ color: 'var(--muted2)', fontSize: '0.6rem', marginLeft: 5 }}>locked</span>}</label>
                      <input
                        type={f.type}
                        value={profile[f.key]}
                        disabled={f.disabled}
                        onChange={e => !f.disabled && setProfile({ ...profile, [f.key]: e.target.value })}
                        placeholder={f.disabled ? '—' : `Enter ${f.label.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="d-divider" />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="d-btn-primary" disabled={saving} onClick={saveProfile}>
                    {saving ? <><Spin /> Saving…</> : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* Payment Information */}
              <div className="d-card" style={{ marginTop: '24px' }}>
                <div className="d-section-label">Payment Information</div>
                {user?.payment_status === 'paid' ? (
                  <div style={{ padding: '16px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px' }}>
                    <div style={{ color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>✓</span> Complete Festival Pass Active
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '8px' }}>Your transaction was successful. You have full access to registered events.</p>
                  </div>
                ) : (
                  <div style={{ padding: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '10px' }}>
                    <div style={{ color: '#fca5a5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>!</span> Payment Pending
                    </div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '8px', marginBottom: '16px' }}>
                      You need to complete your payment to get your festival pass and confirm event registrations. Please complete the payment process with the coordinators.
                    </p>
                    <button className="d-btn-ghost" style={{ padding: '8px 16px', fontSize: '0.8rem', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => setMsg({ text: 'Redirecting to payment gateway...', type: 'ok' })}>
                      Pay Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── MY EVENTS ── */}
          {activeTab === 'my-events' && (
            <div className="d-fade">
              {myEvents.length === 0 ? (
                <div className="d-card">
                  <div className="d-empty">
                    <div className="d-empty-icon">🎟</div>
                    <h3>No tickets yet</h3>
                    <p>Register for events to see them here.</p>
                    <button className="d-btn-primary" onClick={() => switchTab('register')}>
                      Explore Events →
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="d-section-label" style={{ marginBottom: 14 }}>Your Registrations</div>
                  {myEvents.map((reg, i) => (
                    <div key={reg.id} className="d-my-ev d-fade" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="d-my-ev-dot" />
                      <div className="d-my-ev-info">
                        <div className="d-my-ev-name">{reg.events?.name || 'Event'} {reg.custom_id && <span style={{ fontSize: '0.65rem', padding: '1px 5px', background: 'var(--border)', borderRadius: 4, marginLeft: 6, color: 'var(--muted)', fontWeight: 'normal', letterSpacing: '0.05em' }}>{reg.custom_id}</span>}</div>
                        <div className="d-my-ev-meta">
                          {[reg.events?.location, reg.events?.date && new Date(reg.events.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })].filter(Boolean).join('  ·  ')}
                        </div>
                      </div>
                      <button
                        className="d-btn-ghost"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', color: 'var(--accent)', borderColor: 'rgba(249,115,22,0.3)' }}
                        onClick={() => {
                          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                          window.open(`${API_URL}/api/certificates/download/${festiverseId}?event_id=${reg.event_id}`, '_blank');
                        }}
                      >
                        🎓 Cert
                      </button>
                      <button
                        className="d-btn-ghost"
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                        onClick={() => showQr(reg.id)}
                      >
                        📱 QR
                      </button>
                      <span className="d-my-ev-badge">{reg.checked_in ? 'Checked In' : 'Confirmed'}</span>
                    </div>
                  ))}
                </>
              )}

              {/* QR Modal */}
              {qrModal && (
                <div style={{
                  position: 'fixed', inset: 0, zIndex: 9999,
                  background: 'rgba(0,0,0,0.85)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'fadeUp .2s ease',
                }} onClick={() => { setQrModal(null); setQrImage(''); }}>
                  <div style={{
                    background: '#fff', borderRadius: 16, padding: 32,
                    textAlign: 'center', maxWidth: 340, width: '90%',
                  }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ color: '#111', fontFamily: 'var(--font-h)', marginBottom: 8, fontSize: '1.1rem' }}>Your Event QR Code</h3>
                    {myEvents.find(r => r.id === qrModal)?.custom_id && (
                      <div style={{ background: '#f4f4f5', color: '#52525b', padding: '4px 10px', borderRadius: 6, display: 'inline-block', marginBottom: 16, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                        ID: {myEvents.find(r => r.id === qrModal).custom_id}
                      </div>
                    )}
                    {qrLoading ? (
                      <p style={{ color: '#666', padding: 20 }}>Generating QR code...</p>
                    ) : qrImage ? (
                      <img src={qrImage} alt="QR Code" style={{ width: 200, height: 200, margin: '0 auto' }} />
                    ) : (
                      <p style={{ color: '#999', padding: 20 }}>Could not generate QR code.</p>
                    )}
                    <p style={{ fontSize: '0.75rem', color: '#999', marginTop: 12 }}>Show this at the event entrance for check-in</p>
                    <button onClick={() => { setQrModal(null); setQrImage(''); }}
                      style={{
                        marginTop: 16, padding: '8px 24px', borderRadius: 8,
                        border: '1px solid #ddd', background: '#fff', cursor: 'pointer',
                        fontFamily: 'var(--font-b)', fontSize: '0.85rem',
                      }}>Close</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── REGISTER ── */}
          {activeTab === 'register' && (
            <>
              <div className="d-fade">
                <div className="d-section-label" style={{ marginBottom: 14 }}>
                  {allEvents.length} Events Available
                </div>

                {/* Search */}
                <div style={{ marginBottom: 16 }}>
                  <input
                    type="text"
                    placeholder="🔍 Search events by name, location..."
                    value={eventSearch}
                    onChange={e => setEventSearch(e.target.value)}
                    style={{
                      width: '100%', padding: '10px 14px',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 10, color: 'var(--text)', fontSize: '0.85rem',
                      fontFamily: 'var(--font-b)', outline: 'none',
                      transition: 'border-color .15s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>

                <div className="d-events-grid">
                  {allEvents.filter(ev => {
                    if (!eventSearch.trim()) return true;
                    const q = eventSearch.toLowerCase();
                    return (ev.name || '').toLowerCase().includes(q) ||
                      (ev.location || '').toLowerCase().includes(q) ||
                      (ev.category || '').toLowerCase().includes(q) ||
                      (ev.description || '').toLowerCase().includes(q);
                  }).map((ev, i) => {
                    const isReg = registeredIds.includes(ev.id);
                    const isSel = selectedEvents.includes(ev.id);
                    return (
                      <div
                        key={ev.id}
                        className={`d-ev d-fade ${isReg ? 'd-ev-reg' : ''} ${isSel && !isReg ? 'd-ev-sel' : ''}`}
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        <div onClick={() => !isReg && toggleEvent(ev.id)} style={{ cursor: isReg ? 'default' : 'pointer' }}>
                          <div className="d-ev-head">
                            <div className="d-ev-name">{ev.name}</div>
                            <div className="d-ev-badges">
                              {isReg && <span className="d-badge d-badge-green">Confirmed</span>}
                              {isSel && !isReg && <span className="d-badge d-badge-orange">Selected</span>}
                              {ev.team_size > 1 && <span className="d-badge d-badge-amber">Team ×{ev.team_size}</span>}
                            </div>
                          </div>

                          {ev.location && <div className="d-ev-meta"><span>📍</span>{ev.location}</div>}
                          {ev.date && <div className="d-ev-meta"><span>🗓</span>{new Date(ev.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>}

                          {/* New View Details button */}
                          <div style={{ marginTop: 12 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); navigate(`/events/${ev.id}`); }}
                              style={{
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                                padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem',
                                color: 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font-b)',
                                transition: 'all .2s'
                              }}
                              onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; }}
                            >
                              View Details ↗
                            </button>
                          </div>

                          {/* Short Description */}
                          {ev.description && <div className="d-ev-desc" style={{ marginTop: 14, borderTop: 'none', paddingTop: 0 }}>{ev.description}</div>}

                          {!isReg && (
                            <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div style={{ fontSize: '0.78rem', color: isSel ? 'var(--accent)' : 'var(--muted)' }}>
                                {isSel ? 'Event Selected' : 'Registration Open'}
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleEvent(ev.id); }}
                                style={{
                                  background: isSel ? 'var(--accent)' : 'var(--surface)',
                                  color: isSel ? '#fff' : 'var(--text)',
                                  border: `1px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`,
                                  padding: '6px 16px', borderRadius: '8px', fontSize: '0.75rem',
                                  fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-b)',
                                  transition: 'all .2s'
                                }}
                                onMouseOver={(e) => { if (!isSel) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; } }}
                                onMouseOut={(e) => { if (!isSel) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; } }}
                              >
                                {isSel ? '✓ Selected' : '+ Select'}
                              </button>
                            </div>
                          )}
                        </div>

                        {isSel && !isReg && ev.team_size > 1 && teamMembers[ev.id] && (
                          <div className="d-team-form" onClick={e => e.stopPropagation()}>
                            <div className="d-team-title">
                              <span>◈</span> Team Members — you + {ev.team_size - 1} others
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginBottom: 12 }}>
                              Enter each member's Festiverse ID (e.g. F26GS4821)
                            </div>
                            {teamMembers[ev.id].map((m, idx) => {
                              const key = `${ev.id}_${idx}`;
                              const lookup = memberLookup[key];
                              return (
                                <div key={idx} style={{ marginBottom: 10 }}>
                                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input
                                      placeholder={`Member ${idx + 2} Festiverse ID *`}
                                      value={m.festiverse_id || ''}
                                      onChange={e => {
                                        const val = e.target.value.toUpperCase();
                                        updateMember(ev.id, idx, 'festiverse_id', val);
                                        // Clear lookup if input changed
                                        setMemberLookup(p => ({ ...p, [key]: null }));
                                      }}
                                      onBlur={() => lookupMember(ev.id, idx, m.festiverse_id || '')}
                                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); lookupMember(ev.id, idx, m.festiverse_id || ''); } }}
                                      style={{
                                        flex: 1, padding: '8px 10px',
                                        background: 'var(--surface)', border: `1px solid ${lookup?.status === 'found' ? 'rgba(34,197,94,0.5)' : lookup?.status === 'error' ? 'rgba(239,68,68,0.5)' : 'var(--border)'}`,
                                        borderRadius: 7, color: 'var(--text)',
                                        fontSize: '0.85rem', fontFamily: 'var(--font-b)', fontWeight: 600,
                                        letterSpacing: '0.06em', outline: 'none',
                                        transition: 'border-color .15s',
                                        minWidth: 0, maxWidth: '100%',
                                      }}
                                    />
                                    {lookup?.status === 'loading' && <span className="d-spin" />}
                                  </div>
                                  {lookup?.status === 'found' && (
                                    <div style={{
                                      display: 'flex', alignItems: 'center', gap: 6,
                                      marginTop: 5, padding: '5px 8px', borderRadius: 6,
                                      background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
                                      fontSize: '0.75rem', color: '#4ade80',
                                    }}>
                                      <span>✓</span> {lookup.data.name} {lookup.data.college ? `· ${lookup.data.college}` : ''}
                                    </div>
                                  )}
                                  {lookup?.status === 'error' && (
                                    <div style={{
                                      marginTop: 5, padding: '5px 8px', borderRadius: 6,
                                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                      fontSize: '0.72rem', color: '#fca5a5',
                                    }}>
                                      ⚠ {lookup.message}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedEvents.length > 0 && (
                <div className="d-reg-bar">
                  <div className="d-reg-bar-text">
                    <strong>{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected</strong>
                    <span>Review your selections before registering</span>
                  </div>
                  <button className="d-btn-primary" disabled={loading} onClick={registerEvents}>
                    {loading ? <><Spin /> Processing…</> : 'Register Now →'}
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* ── Mobile bottom nav ── */}
        <nav className="d-bottom-nav">
          <div className="d-bottom-nav-inner">
            {tabs.map(t => (
              <button key={t.id} className={`d-nav-item ${activeTab === t.id ? 'active' : ''}`} onClick={() => switchTab(t.id)}>
                <span className="d-nav-icon">{t.icon}</span>
                <span className="d-nav-label">{t.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default UserDashboard;
