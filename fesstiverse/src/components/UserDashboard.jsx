import React, { useState, useEffect } from 'react';
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
  }

  /* ── Topbar ── */
  .d-topbar {
    position: sticky; top: 0; z-index: 50;
    height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 20px;
    background: rgba(14,14,16,0.85);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }
  .d-logo {
    font-family: var(--font-h);
    font-size: 1rem; font-weight: 800;
    letter-spacing: -0.02em; color: var(--text);
  }
  .d-logo span { color: var(--accent); }
  .d-topbar-right { display: flex; align-items: center; gap: 10px; }
  .d-user-chip {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 99px;
    padding: 5px 12px 5px 5px;
    font-size: 0.8rem; color: var(--muted);
  }
  .d-avatar {
    width: 26px; height: 26px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent), #f59e0b);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }
  .d-btn-icon {
    background: none; border: none; cursor: pointer;
    color: var(--muted); font-size: 0.78rem;
    padding: 6px 10px; border-radius: 8px;
    transition: color .15s, background .15s;
    font-family: var(--font-b);
  }
  .d-btn-icon:hover { background: var(--surface); color: var(--red); }
  .d-back-btn {
    background: none; border: none; cursor: pointer;
    color: var(--muted); font-size: 0.78rem;
    padding: 6px 10px; border-radius: 8px;
    display: flex; align-items: center; gap: 5px;
    transition: color .15s, background .15s;
    font-family: var(--font-b);
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
    padding: 28px 20px 100px; /* bottom pad for mobile nav */
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
  }

  /* ── Section label ── */
  .d-section-label {
    font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.12em; color: var(--muted); margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .d-section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

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
  }

  /* ── Event card ── */
  .d-ev {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 16px;
    cursor: pointer; transition: all .2s; position: relative; overflow: hidden;
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

  .d-ev-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 10px; }
  .d-ev-name { font-family: var(--font-h); font-size: 0.95rem; font-weight: 700; line-height: 1.3; }
  .d-ev-badges { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; flex-shrink: 0; }
  .d-badge {
    font-size: 0.62rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.07em; padding: 2px 7px; border-radius: 4px; white-space: nowrap;
  }
  .d-badge-green { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
  .d-badge-amber { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
  .d-badge-orange { background: rgba(249,115,22,0.12); color: var(--accent); border: 1px solid rgba(249,115,22,0.25); }

  .d-ev-meta { font-size: 0.78rem; color: var(--muted); margin: 3px 0; display: flex; align-items: center; gap: 5px; }
  .d-ev-desc { font-size: 0.78rem; color: var(--muted2); line-height: 1.55; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--border); }

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
  }
  .d-team-title {
    font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--accent); margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  .d-team-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
  .d-team-row input {
    width: 100%; padding: 8px 10px;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 7px; color: var(--text);
    font-size: 0.8rem; font-family: var(--font-b); outline: none;
    transition: border-color .15s;
  }
  .d-team-row input:focus { border-color: var(--accent); }
  .d-team-row input::placeholder { color: var(--muted2); }

  /* ── Sticky register bar ── */
  .d-reg-bar {
    position: sticky; bottom: 88px; /* above mobile nav */
    background: rgba(22,22,26,0.92);
    border: 1px solid var(--border);
    border-radius: 14px; padding: 14px 18px;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 16px 40px rgba(0,0,0,0.5);
    animation: slideUp .25s ease;
    z-index: 30;
  }
  .d-reg-bar-text { font-size: 0.85rem; }
  .d-reg-bar-text strong { font-family: var(--font-h); font-weight: 700; font-size: 1rem; display: block; }
  .d-reg-bar-text span { color: var(--muted); font-size: 0.78rem; }

  /* ── My events list ── */
  .d-my-ev {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 16px; border-radius: 11px;
    background: var(--surface); border: 1px solid var(--border);
    margin-bottom: 8px; transition: border-color .15s;
  }
  .d-my-ev:hover { border-color: var(--muted2); }
  .d-my-ev-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--green); flex-shrink: 0;
    box-shadow: 0 0 8px rgba(34,197,94,0.5);
  }
  .d-my-ev-info { flex: 1; min-width: 0; }
  .d-my-ev-name { font-weight: 600; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .d-my-ev-meta { font-size: 0.75rem; color: var(--muted); margin-top: 2px; }
  .d-my-ev-badge { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 8px; border-radius: 5px; background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); flex-shrink: 0; }

  /* ── Stats strip ── */
  .d-stats {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 10px; margin-bottom: 24px;
  }
  .d-stat {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 11px; padding: 14px 16px; text-align: center;
  }
  .d-stat-val { font-family: var(--font-h); font-size: 1.4rem; font-weight: 800; color: var(--accent); }
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
    .d-stats { grid-template-columns: 1fr 1fr; }
    .d-stats .d-stat:last-child { grid-column: 1 / -1; }
    .d-reg-bar { bottom: 88px; flex-direction: column; gap: 10px; }
    .d-reg-bar .d-btn-primary { width: 100%; justify-content: center; }
    .d-team-row { grid-template-columns: 1fr; }
    .d-card { padding: 18px 16px; }
    .d-header h1 { font-size: 1.4rem; }
  }
  @media (min-width: 641px) {
    .d-bottom-nav { display: none; }
    .d-reg-bar { bottom: 24px; }
  }
  @media (min-width: 768px) {
    .d-body { padding: 36px 28px 80px; }
    .d-events-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
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
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({
        name: user?.name || '', email: user?.email || '',
        phone: user?.phone || '', college: user?.college || '',
    });
    const [myEvents, setMyEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [teamMembers, setTeamMembers] = useState({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => { fetchProfile(); fetchMyEvents(); fetchAllEvents(); }, []);

    const fetchProfile = async () => { try { const d = await apiFetch('/api/auth/profile'); if (d.user) setProfile({ name: d.user.name || '', email: d.user.email || '', phone: d.user.phone || '', college: d.user.college || '' }); } catch { } };
    const fetchMyEvents = async () => { try { const d = await apiFetch('/api/events/my-events'); setMyEvents(d.registrations || []); } catch { } };
    const fetchAllEvents = async () => { try { const d = await apiFetch('/api/events'); setAllEvents(d.events || []); } catch { } };

    const saveProfile = async () => {
        setSaving(true); setMsg({ text: '', type: '' });
        try {
            const data = await apiFetch('/api/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({ name: profile.name, email: profile.email, college: profile.college }),
            });
            setMsg({ text: 'Profile saved successfully.', type: 'ok' });
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
                const slots = Array.from({ length: ev.team_size - 1 }, () => ({ name: '', phone: '' }));
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

    const registerEvents = async () => {
        if (!selectedEvents.length) return setMsg({ text: 'Select at least one event to continue.', type: 'err' });
        for (const eid of selectedEvents) {
            const ev = allEvents.find(e => e.id === eid);
            if (ev?.team_size > 1) {
                const members = teamMembers[eid] || [];
                if (members.some(m => !m.name.trim()))
                    return setMsg({ text: `Fill in all team member names for "${ev.name}".`, type: 'err' });
            }
        }
        setLoading(true);
        try {
            const payload = selectedEvents.map(eid => ({ eventId: eid, teamMembers: teamMembers[eid] || [] }));
            await apiFetch('/api/events/register', { method: 'POST', body: JSON.stringify({ registrations: payload }) });
            setMsg({ text: 'Registered! See you at the festival.', type: 'ok' });
            setSelectedEvents([]); setTeamMembers({}); fetchMyEvents();
        } catch (e) { setMsg({ text: e.message, type: 'err' }); }
        finally { setLoading(false); }
    };

    const registeredIds = myEvents.map(r => r.event_id);
    const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button className="d-back-btn" onClick={onClose}>
                            <span>←</span> <span style={{ display: 'none' }}>Back</span>
                        </button>
                        <div className="d-logo">Festiver<span>se</span> <span style={{ fontWeight: 400, fontSize: '0.75rem', color: 'var(--muted)' }}>'26</span></div>
                    </div>
                    <div className="d-topbar-right">
                        <div className="d-user-chip">
                            <div className="d-avatar">{initials}</div>
                            <span style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</span>
                        </div>
                        <button className="d-btn-icon" onClick={onLogout}>Logout</button>
                    </div>
                </header>

                {/* ── Main body ── */}
                <main className="d-body">

                    {/* Page header */}
                    <div className="d-header d-fade">
                        <h1>My <em>Dashboard</em></h1>
                        <p>Manage your profile and event registrations</p>
                    </div>

                    {/* Desktop tab bar */}
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

                    {/* Message */}
                    {msg.text && (
                        <div className={`d-msg ${msg.type}`}>
                            <span className="d-msg-icon">{msg.type === 'ok' ? '✓' : '!'}</span>
                            {msg.text}
                        </div>
                    )}

                    {/* ── PROFILE ── */}
                    {activeTab === 'profile' && (
                        <div className="d-fade">
                            {/* Stats */}
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
                                    <div className="d-stat-val" style={{ fontSize: '1rem', paddingTop: 4 }}>
                                        {profile.college ? profile.college.split(' ')[0] : '—'}
                                    </div>
                                    <div className="d-stat-lbl">College</div>
                                </div>
                            </div>

                            <div className="d-card">
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
                                                <div className="d-my-ev-name">{reg.events?.name || 'Event'}</div>
                                                <div className="d-my-ev-meta">
                                                    {[reg.events?.location, reg.events?.date && new Date(reg.events.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })].filter(Boolean).join('  ·  ')}
                                                </div>
                                            </div>
                                            <span className="d-my-ev-badge">Confirmed</span>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {/* ── REGISTER ── */}
                    {activeTab === 'register' && (
                        <div className="d-fade">
                            <div className="d-section-label" style={{ marginBottom: 14 }}>
                                {allEvents.length} Events Available
                            </div>
                            <div className="d-events-grid">
                                {allEvents.map((ev, i) => {
                                    const isReg = registeredIds.includes(ev.id);
                                    const isSel = selectedEvents.includes(ev.id);
                                    return (
                                        <div
                                            key={ev.id}
                                            className={`d-ev d-fade ${isReg ? 'd-ev-reg' : ''} ${isSel && !isReg ? 'd-ev-sel' : ''}`}
                                            style={{ animationDelay: `${i * 0.04}s` }}
                                        >
                                            {/* Card header — click to toggle */}
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
                                                {ev.description && <div className="d-ev-desc">{ev.description}</div>}

                                                {!isReg && (
                                                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.78rem', color: isSel ? 'var(--accent)' : 'var(--muted)' }}>
                                                        <div className={`d-checkbox ${isSel ? 'checked' : ''}`}>{isSel && <Check />}</div>
                                                        {isSel ? 'Selected' : 'Click to select'}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Team member form */}
                                            {isSel && !isReg && ev.team_size > 1 && teamMembers[ev.id] && (
                                                <div className="d-team-form" onClick={e => e.stopPropagation()}>
                                                    <div className="d-team-title">
                                                        <span>◈</span> Team Members — you + {ev.team_size - 1} others
                                                    </div>
                                                    {teamMembers[ev.id].map((m, idx) => (
                                                        <div key={idx} className="d-team-row">
                                                            <input
                                                                placeholder={`Member ${idx + 2} name *`}
                                                                value={m.name}
                                                                onChange={e => updateMember(ev.id, idx, 'name', e.target.value)}
                                                            />
                                                            <input
                                                                placeholder={`Member ${idx + 2} phone`}
                                                                value={m.phone}
                                                                onChange={e => updateMember(ev.id, idx, 'phone', e.target.value)}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Sticky register bar */}
                            {selectedEvents.length > 0 && (
                                <div className="d-reg-bar">
                                    <div className="d-reg-bar-text">
                                        <strong>{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''} selected</strong>
                                        <span>Review your selections before confirming</span>
                                    </div>
                                    <button className="d-btn-primary" disabled={loading} onClick={registerEvents}>
                                        {loading ? <><Spin /> Processing…</> : 'Confirm →'}
                                    </button>
                                </div>
                            )}
                        </div>
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