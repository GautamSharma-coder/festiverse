import React, { useState, useEffect } from 'react';
//import { apiFetch } from '../lib/api';
//import { proxyImageUrl } from '../lib/proxyImage';

// Tab Components
import OverviewTab from './admin/OverviewTab';
import RegistrationsTab from './admin/RegistrationsTab';
import UsersTab from './admin/UsersTab';
import MessagesTab from './admin/MessagesTab';
import EventsTab from './admin/EventsTab';
import TeamTab from './admin/TeamTab';
import FacultyTab from './admin/FacultyTab';
import GalleryTab from './admin/GalleryTab';
import NoticesTab from './admin/NoticesTab';
import CheckinTab from './admin/CheckinTab';
import ResultsTab from './admin/ResultsTab';
import SponsorsTab from './admin/SponsorsTab';
import HiringTab from './admin/HiringTab';

/* ── CSS ─────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
  :root {
    --bg:#0e0e10; --surface:#16161a; --surface2:#1e1e24; --border:#252529;
    --accent:#f97316; --accent2:#fb923c; --green:#22c55e; --red:#ef4444; --blue:#3b82f6;
    --text:#f4f4f5; --muted:#71717a; --muted2:#3f3f46;
    --radius:12px; --font-h:'Syne',sans-serif; --font-b:'Outfit',sans-serif;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

  /* Layout */
  .ap{display:flex;min-height:100vh;background:var(--bg);font-family:var(--font-b);color:var(--text)}

  /* Sidebar */
  .ap-side{width:230px;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:50;transition:transform .25s}
  .ap-side-head{padding:18px 20px;border-bottom:1px solid var(--border)}
  .ap-side-logo{font-family:var(--font-h);font-size:.95rem;font-weight:800;color:var(--text);letter-spacing:-.02em}
  .ap-side-logo span{color:var(--accent)}
  .ap-side-sub{font-size:.65rem;color:var(--muted);margin-top:2px;text-transform:uppercase;letter-spacing:.1em;font-weight:600}
  .ap-side-nav{flex:1;padding:8px 10px;overflow-y:auto}
  .ap-nav-label{font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:var(--muted2);padding:8px 10px 4px;margin-top:4px}
  .ap-nav-btn{display:flex;align-items:center;gap:10px;width:100%;padding:7px 12px;border:none;background:none;color:var(--muted);font-family:var(--font-b);font-size:.8rem;font-weight:500;border-radius:9px;cursor:pointer;transition:all .15s;text-align:left}
  .ap-nav-btn:hover{background:var(--surface2);color:var(--text)}
  .ap-nav-btn.active{background:rgba(249,115,22,.1);color:var(--accent);font-weight:600}
  .ap-nav-icon{font-size:1rem;width:22px;text-align:center;flex-shrink:0}
  .ap-side-foot{padding:10px 14px;border-top:1px solid var(--border)}
  .ap-logout-btn{width:100%;padding:9px 12px;border:1px solid rgba(239,68,68,.2);background:none;color:#fca5a5;border-radius:9px;font-family:var(--font-b);font-size:.8rem;font-weight:500;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:8px;justify-content:center}
  .ap-logout-btn:hover{background:rgba(239,68,68,.08);color:var(--red)}

  /* Main */
  .ap-main{flex:1;margin-left:230px;min-height:100vh;display:flex;flex-direction:column}

  /* Topbar */
  .ap-topbar{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;border-bottom:1px solid var(--border);background:rgba(14,14,16,.85);backdrop-filter:blur(16px);position:sticky;top:0;z-index:40}
  .ap-topbar-title{font-family:var(--font-h);font-size:1.1rem;font-weight:700}
  .ap-topbar-right{display:flex;align-items:center;gap:10px}
  .ap-btn-ghost{background:none;border:1px solid var(--border);border-radius:8px;padding:6px 14px;color:var(--muted);font-size:.78rem;font-family:var(--font-b);cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:5px}
  .ap-btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
  .ap-hamburger{display:none;background:none;border:none;color:var(--text);font-size:1.3rem;cursor:pointer;padding:4px}

  /* Content area */
  .ap-content{flex:1;padding:28px;max-width:1100px;width:100%}
  .ap-fade{animation:apFadeUp .3s ease both}
  @keyframes apFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

  /* Stats */
  .ap-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:28px}
  .ap-stat{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 18px;position:relative;overflow:hidden}
  .ap-stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px}
  .ap-stat.s-orange::before{background:var(--accent)} .ap-stat.s-green::before{background:var(--green)} .ap-stat.s-blue::before{background:var(--blue)} .ap-stat.s-red::before{background:var(--red)}
  .ap-stat-val{font-family:var(--font-h);font-size:1.6rem;font-weight:800}
  .ap-stat.s-orange .ap-stat-val{color:var(--accent)} .ap-stat.s-green .ap-stat-val{color:var(--green)} .ap-stat.s-blue .ap-stat-val{color:var(--blue)} .ap-stat.s-red .ap-stat-val{color:var(--red)}
  .ap-stat-lbl{font-size:.7rem;color:var(--muted);margin-top:2px;text-transform:uppercase;letter-spacing:.08em;font-weight:600}

  /* Section header */
  .ap-sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px}
  .ap-sec-title{font-family:var(--font-h);font-size:1.15rem;font-weight:700}
  .ap-search{background:var(--surface);border:1px solid var(--border);border-radius:9px;padding:8px 14px;color:var(--text);font-size:.82rem;font-family:var(--font-b);outline:none;width:240px;transition:border-color .15s}
  .ap-search:focus{border-color:var(--accent)}
  .ap-search::placeholder{color:var(--muted2)}

  /* Card */
  .ap-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:16px}
  .ap-card-title{font-size:.85rem;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:6px}
  .ap-card-title span{color:var(--accent)}

  /* Form */
  .ap-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
  .ap-field{display:flex;flex-direction:column;gap:4px}
  .ap-field label{font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
  .ap-field input,.ap-field select,.ap-field textarea{width:100%;padding:9px 12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.82rem;font-family:var(--font-b);outline:none;transition:border-color .15s}
  .ap-field input:focus,.ap-field select:focus,.ap-field textarea:focus{border-color:var(--accent)}
  .ap-field input::placeholder,.ap-field textarea::placeholder{color:var(--muted2)}
  .ap-field select{cursor:pointer;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%2371717a' viewBox='0 0 16 16'%3E%3Cpath d='M3 6l5 5 5-5'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 10px center}
  .ap-field select option{background:var(--surface);color:var(--text)}
  .ap-field-file{position:relative}
  .ap-field-file input[type=file]{opacity:0;position:absolute;inset:0;cursor:pointer;z-index:2}
  .ap-file-label{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;border:1.5px dashed var(--border);border-radius:8px;color:var(--muted);font-size:.78rem;transition:all .15s;cursor:pointer;text-align:center}
  .ap-file-label:hover{border-color:var(--accent);color:var(--accent)}

  .ap-btn-submit{padding:10px 24px;background:var(--accent);border:none;border-radius:9px;color:#fff;font-weight:600;font-size:.85rem;font-family:var(--font-b);cursor:pointer;transition:all .15s;box-shadow:0 2px 10px rgba(249,115,22,.25);display:inline-flex;align-items:center;gap:6px}
  .ap-btn-submit:hover{background:var(--accent2);transform:translateY(-1px);box-shadow:0 4px 16px rgba(249,115,22,.35)}
  .ap-btn-submit:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none}

  /* Table */
  .ap-table{width:100%;border-collapse:collapse}
  .ap-table th{text-align:left;padding:10px 12px;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);border-bottom:1px solid var(--border)}
  .ap-table td{padding:10px 12px;font-size:.82rem;color:var(--text);border-bottom:1px solid rgba(255,255,255,.03)}
  .ap-table tr:hover td{background:rgba(255,255,255,.015)}
  .ap-table .sub{font-size:.7rem;color:var(--muted);margin-top:1px}

  /* Action buttons */
  .ap-actions{display:flex;gap:4px;justify-content:flex-end}
  .ap-edit{background:none;border:1px solid rgba(59,130,246,.2);color:#93c5fd;padding:4px 10px;border-radius:6px;font-size:.7rem;font-family:var(--font-b);cursor:pointer;transition:all .15s}
  .ap-edit:hover{background:rgba(59,130,246,.1);color:var(--blue);border-color:rgba(59,130,246,.4)}
  .ap-del{background:none;border:1px solid rgba(239,68,68,.2);color:#fca5a5;padding:4px 10px;border-radius:6px;font-size:.7rem;font-family:var(--font-b);cursor:pointer;transition:all .15s}
  .ap-del:hover{background:rgba(239,68,68,.1);color:var(--red);border-color:rgba(239,68,68,.4)}

  /* Team grid */
  .ap-team-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:12px}
  .ap-team-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px;text-align:center;transition:all .15s;position:relative}
  .ap-team-card:hover{border-color:var(--muted2)}
  .ap-team-avatar{width:64px;height:64px;border-radius:50%;object-fit:cover;margin:0 auto 10px;display:block;border:2px solid var(--border)}
  .ap-team-name{font-weight:700;font-size:.88rem}
  .ap-team-role{font-size:.72rem;color:var(--accent);margin-top:2px}
  .ap-team-society{font-size:.7rem;color:var(--muted);margin-top:4px}
  .ap-badge{display:inline-block;font-size:.58rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;padding:2px 6px;border-radius:4px;margin-top:6px}
  .ap-badge-senior{background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.2)}
  .ap-badge-coord{background:rgba(168,85,247,.1);color:#c084fc;border:1px solid rgba(168,85,247,.2)}
  .ap-badge-sub{background:rgba(6,182,212,.1);color:#22d3ee;border:1px solid rgba(6,182,212,.2)}

  /* Gallery grid */
  .ap-gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}
  .ap-gal-item{border-radius:10px;overflow:hidden;border:1px solid var(--border);transition:all .15s;position:relative}
  .ap-gal-item:hover{border-color:var(--muted2)}
  .ap-gal-img{width:100%;height:130px;object-fit:cover;display:block}
  .ap-gal-info{padding:8px 10px;background:var(--surface)}
  .ap-gal-title{font-size:.75rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .ap-gal-cat{font-size:.65rem;color:var(--muted)}

  /* Empty */
  .ap-empty{text-align:center;padding:40px 20px;color:var(--muted)}
  .ap-empty-icon{font-size:2rem;opacity:.25;margin-bottom:8px}
  .ap-empty h4{font-family:var(--font-h);font-size:.95rem;font-weight:700;color:var(--text);margin-bottom:4px}

  /* Msg */
  .ap-msg{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:9px;margin-bottom:16px;font-size:.82rem;animation:apFadeUp .2s ease}
  .ap-msg.ok{background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.25);color:#86efac}
  .ap-msg.err{background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);color:#fca5a5}

  /* Spinner */
  .ap-spin{width:13px;height:13px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:apSpin .6s linear infinite;display:inline-block}
  .ap-spin-lg{width:28px;height:28px;border:3px solid rgba(249,115,22,.15);border-top-color:var(--accent);border-radius:50%;animation:apSpin .7s linear infinite;display:inline-block}
  @keyframes apSpin{to{transform:rotate(360deg)}}

  /* Loading state */
  .ap-loading-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:16px;animation:apFadeUp .3s ease}
  .ap-loading-wrap p{font-size:.85rem;color:var(--muted);font-weight:400}

  /* Skeleton */
  .ap-skel{background:var(--surface);border-radius:8px;position:relative;overflow:hidden}
  .ap-skel::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);animation:apShimmer 1.5s infinite}
  @keyframes apShimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
  .ap-skel-row{display:flex;gap:12px;margin-bottom:12px}
  .ap-skel-bar{height:14px;border-radius:6px}
  .ap-skel-stat{height:76px;border-radius:var(--radius)}
  .ap-skel-card{height:48px;border-radius:10px;margin-bottom:8px}

  /* Progress bar (top of content) */
  .ap-progress{position:absolute;top:0;left:0;right:0;height:2px;overflow:hidden;z-index:999}
  .ap-progress-bar{height:100%;background:linear-gradient(90deg,var(--accent),var(--accent2));width:30%;animation:apProgress 1.2s ease infinite;border-radius:2px}
  @keyframes apProgress{0%{width:0;margin-left:0}50%{width:40%;margin-left:30%}100%{width:0;margin-left:100%}}

  /* Overlay */
  .ap-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:45;display:none}
  .ap-overlay.show{display:block}

  /* Login */
  .ap-login-wrap{display:flex;align-items:center;justify-content:center;min-height:100vh;background:var(--bg);padding:20px}
  .ap-login-card{width:100%;max-width:380px;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:32px;text-align:center}
  .ap-login-card h2{font-family:var(--font-h);font-size:1.4rem;font-weight:800;margin-bottom:4px}
  .ap-login-card h2 span{color:var(--accent)}
  .ap-login-card p{font-size:.82rem;color:var(--muted);margin-bottom:24px}
  .ap-login-input{width:100%;padding:11px 14px;background:var(--bg);border:1px solid var(--border);border-radius:9px;color:var(--text);font-size:.88rem;font-family:var(--font-b);outline:none;margin-bottom:14px;transition:border-color .15s;text-align:center;letter-spacing:.15em}
  .ap-login-input:focus{border-color:var(--accent)}
  .ap-login-input::placeholder{letter-spacing:normal;color:var(--muted2)}
  .ap-login-err{font-size:.78rem;color:var(--red);margin-bottom:12px}
  .ap-login-btns{display:flex;gap:8px}
  .ap-login-btns button{flex:1}

  /* Edit Mode Form Wrap */
  .ap-edit-wrap {border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; background: rgba(255,255,255,0.015); margin-bottom: 20px;}
  .ap-edit-wrap-title {font-family: var(--font-h); font-size: .95rem; font-weight: 700; margin-bottom: 12px; color: var(--accent);}

  /* Responsive */
  @media(max-width:768px){
    .ap-side{transform:translateX(-100%)}
    .ap-side.open{transform:translateX(0)}
    .ap-main{margin-left:0}
    .ap-hamburger{display:block}
    .ap-overlay.show{display:block}
    .ap-content{padding:20px 14px}
    .ap-stats{grid-template-columns:1fr 1fr}
    .ap-form-grid{grid-template-columns:1fr}
    .ap-search{width:100%}
    .ap-sec-head{flex-direction:column;align-items:stretch}
    .ap-team-grid{grid-template-columns:repeat(auto-fill,minmax(150px,1fr))}
  }
  
  .live-indicator {
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
    100% { transform: scale(1); opacity: 1; }
  }
` ;

const NAV_ITEMS = [
    { id: 'overview', icon: '◈', label: 'Overview' },
    { id: 'registrations', icon: '⊞', label: 'Registrations', group: 'Data' },
    { id: 'users', icon: '⊙', label: 'Users' },
    { id: 'messages', icon: '◉', label: 'Messages' },
    { id: 'hiring', icon: '📋', label: 'Hiring Apps' },
    { id: 'checkin', icon: '✓', label: 'Check-In', group: 'Operations' },
    { id: 'events', icon: '◎', label: 'Events', group: 'Content' },
    { id: 'team', icon: '◇', label: 'Team Members' },
    { id: 'faculty', icon: '🎓', label: 'Faculty' },
    { id: 'gallery', icon: '⊡', label: 'Gallery' },
    { id: 'notices', icon: '◆', label: 'Notices' },
    { id: 'results', icon: '🏆', label: 'Results' },
    { id: 'sponsors', icon: '★', label: 'Sponsors' },
];

// SECURITY: Admin auth now uses httpOnly cookies — no client-side token access needed

const AdminPanel = ({ onClose }) => {
    const [isAuthed, setIsAuthed] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [registrations, setRegistrations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [team, setTeam] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [notices, setNotices] = useState([]);
    const [hiringApps, setHiringApps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });
    const [search, setSearch] = useState('');
    const [analytics, setAnalytics] = useState({ uniqueVisitors: 0, liveUsers: 0 });
    const [newNotice, setNewNotice] = useState({ title: '', description: '', color: '#3b82f6', link_url: '', link_text: '' });

    const [newEvent, setNewEvent] = useState({ name: '', location: '', date: '', description: '', rules: '', schedule: '', prizes: '' });
    const [newTeam, setNewTeam] = useState({ name: '', role: '', bio: '', social_link: '', society: '', category: 'Coordinator' });
    const [teamImage, setTeamImage] = useState(null);
    const [newFaculty, setNewFaculty] = useState({ name: '', role: '', department: '' });
    const [facultyImage, setFacultyImage] = useState(null);
    const [galleryImage, setGalleryImage] = useState(null);
    const [eventImage, setEventImage] = useState(null);
    const [galleryMeta, setGalleryMeta] = useState({ title: '', category: '' });

    // Editing states
    const [editingEvent, setEditingEvent] = useState(null);
    const [editingTeam, setEditingTeam] = useState(null);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [editingGallery, setEditingGallery] = useState(null);
    const [editingNotice, setEditingNotice] = useState(null);
    const [editingUser, setEditingUser] = useState(null);

    // Check-in, Results, Sponsors
    const [checkinId, setCheckinId] = useState('');
    const [checkinResult, setCheckinResult] = useState(null);
    const [checkinLoading, setCheckinLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [newResult, setNewResult] = useState({ event_id: '', position: 1, participant_name: '', participant_college: '', participant_email: '', user_id: '', score: '' });
    const [sponsors, setSponsors] = useState([]);
    const [newSponsor, setNewSponsor] = useState({ name: '', tier: 'bronze', website: '', sort_order: 0 });
    const [sponsorLogo, setSponsorLogo] = useState(null);

    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // SECURITY: Check auth status on mount via httpOnly cookie (not localStorage)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${API}/api/admin/analytics`, {
                    credentials: 'include',
                    headers: { 'X-Requested-With': 'XMLHttpRequest' },
                });
                setIsAuthed(res.ok);
            } catch {
                setIsAuthed(false);
            } finally {
                setAuthChecked(true);
            }
        };
        checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const autoLogout = () => {
        // SECURITY: Clear httpOnly cookie via server logout endpoint
        fetch(`${API}/api/admin/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'X-Requested-With': 'XMLHttpRequest' },
        }).catch(() => {});
        setIsAuthed(false);
    };

    const adminFetch = async (endpoint, options = {}) => {
        const headers = { ...(options.headers || {}), 'X-Requested-With': 'XMLHttpRequest' };
        if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
        // SECURITY: Use httpOnly cookies instead of Authorization header
        const res = await fetch(`${API}${endpoint}`, { ...options, headers, credentials: 'include' });
        if (res.status === 401) { autoLogout(); throw new Error('Session expired. Please log in again.'); }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        return data;
    };

    const handleAdminLogin = async () => {
        setLoginError('');
        try {
            const res = await fetch(`${API}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                body: JSON.stringify({ password }),
                credentials: 'include', // SECURITY: Receive httpOnly cookie
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Invalid password');
            // SECURITY: Token is now set as httpOnly cookie by the server, no localStorage needed
            setIsAuthed(true);
        } catch (err) {
            setLoginError(err.message);
        }
    };

    const handleLogout = () => autoLogout();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (isAuthed) fetchAll(); }, [isAuthed]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (isAuthed) fetchTabData(); }, [activeTab, isAuthed]);

    const fetchAll = async () => {
        try {
            const [r, m, u, e, t, f, g, n, a] = await Promise.all([
                adminFetch('/api/admin/registrations').catch(() => ({})),
                adminFetch('/api/admin/messages').catch(() => ({})),
                adminFetch('/api/admin/users').catch(() => ({})),
                fetch(`${API}/api/events`).then(r => r.json()).catch(() => ({})),
                fetch(`${API}/api/team`).then(r => r.json()).catch(() => ({})),
                fetch(`${API}/api/faculty`).then(r => r.json()).catch(() => ({})),
                fetch(`${API}/api/gallery`).then(r => r.json()).catch(() => ({})),
                adminFetch('/api/admin/notices').catch(() => ({})),
                adminFetch('/api/admin/analytics').catch(() => ({ uniqueVisitors: 0, liveUsers: 0 })),
            ]);
            setRegistrations(r.registrations || []);
            setMessages(m.messages || []);
            setUsers(u.users || []);
            setEvents(e.events || []);
            setTeam(t.members || []);
            setFaculty(f.faculty || []);
            setGallery(g.images || []);
            setNotices(n.notices || []);
            setAnalytics(a);
        } catch (err) {
            console.error(err);

        }
    };

    const fetchTabData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'registrations': { const d = await adminFetch('/api/admin/registrations'); setRegistrations(d.registrations || []); break; }
                case 'messages': { const d = await adminFetch('/api/admin/messages'); setMessages(d.messages || []); break; }
                case 'users': { const d = await adminFetch('/api/admin/users'); setUsers(d.users || []); break; }
                case 'events': { const d = await fetch(`${API}/api/events`).then(r => r.json()); setEvents(d.events || []); break; }
                case 'team': { const d = await fetch(`${API}/api/team`).then(r => r.json()); setTeam(d.members || []); break; }
                case 'faculty': { const d = await fetch(`${API}/api/faculty`).then(r => r.json()); setFaculty(d.faculty || []); break; }
                case 'gallery': { const d = await fetch(`${API}/api/gallery`).then(r => r.json()); setGallery(d.images || []); break; }
                case 'notices': { const d = await adminFetch('/api/admin/notices'); setNotices(d.notices || []); break; }
                case 'results': { const d = await fetch(`${API}/api/results`).then(r => r.json()); setResults(d.results || []); break; }
                case 'sponsors': { const d = await adminFetch('/api/admin/sponsors'); setSponsors(d.sponsors || []); break; }
                case 'hiring': { const d = await adminFetch('/api/admin/hiring'); setHiringApps(d.applications || []); break; }
                case 'overview': { const d = await adminFetch('/api/admin/analytics'); setAnalytics(d); break; }
            }
        } catch (err) {
            console.error(err);

        }
        finally { setLoading(false); }
    };

    const flash = (text, type = 'ok') => { setMsg({ text, type }); setTimeout(() => setMsg({ text: '', type: '' }), 4000); };

    const deleteUser = async (id) => { if (!confirm('Delete this user?')) return; await adminFetch(`/api/admin/users/${id}`, { method: 'DELETE' }); flash('User deleted'); fetchTabData(); };
    const deleteMessage = async (id) => { if (!confirm('Delete this message?')) return; await adminFetch(`/api/admin/messages/${id}`, { method: 'DELETE' }); flash('Message deleted'); fetchTabData(); };
    const deleteEvent = async (id) => { if (!confirm('Delete this event?')) return; await adminFetch(`/api/admin/events/${id}`, { method: 'DELETE' }); flash('Event deleted'); fetchTabData(); };
    const deleteTeamMember = async (id) => { if (!confirm('Remove this team member?')) return; await adminFetch(`/api/admin/team/${id}`, { method: 'DELETE' }); flash('Team member removed'); fetchTabData(); };
    const deleteFacultyMember = async (id) => { if (!confirm('Remove this faculty member?')) return; await adminFetch(`/api/admin/faculty/${id}`, { method: 'DELETE' }); flash('Faculty member removed'); fetchTabData(); };
    const deleteGalleryImage = async (id) => { if (!confirm('Delete this image?')) return; await adminFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' }); flash('Image deleted'); fetchTabData(); };
    const deleteNotice = async (id) => { if (!confirm('Delete this notice?')) return; await adminFetch(`/api/admin/notices/${id}`, { method: 'DELETE' }); flash('Notice deleted'); fetchTabData(); };
    const deleteHiringApp = async (id) => { if (!confirm('Delete this application?')) return; await adminFetch(`/api/admin/hiring/${id}`, { method: 'DELETE' }); flash('Application deleted'); fetchTabData(); };

    const addNotice = async (e) => {
        e.preventDefault();
        try {
            await adminFetch('/api/admin/notices', { method: 'POST', body: JSON.stringify(newNotice) });
            setNewNotice({ title: '', description: '', color: '#3b82f6', link_url: '', link_text: '' });
            flash('Notice added');
            fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };

    const addEvent = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newEvent.name);
            formData.append('location', newEvent.location);
            formData.append('date', newEvent.date);
            formData.append('description', newEvent.description);
            formData.append('rules', newEvent.rules);
            formData.append('schedule', JSON.stringify([newEvent.schedule]));
            formData.append('prizes', newEvent.prizes);
            if (eventImage) formData.append('image', eventImage);

            await adminFetch('/api/admin/events', { method: 'POST', body: formData });
            setNewEvent({ name: '', location: '', date: '', description: '', rules: '', schedule: '', prizes: '' });
            setEventImage(null);
            flash('Event added successfully');
            fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };

    const addTeamMember = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newTeam.name);
            formData.append('role', newTeam.role);
            formData.append('bio', newTeam.bio);
            formData.append('social_link', newTeam.social_link);
            formData.append('society', newTeam.society);
            formData.append('category', newTeam.category);
            if (teamImage) formData.append('image', teamImage);
            await adminFetch('/api/admin/team', { method: 'POST', body: formData });
            setNewTeam({ name: '', role: '', bio: '', social_link: '', society: '', category: 'Coordinator' });
            setTeamImage(null);
            flash('Team member added');
            fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };

    const addGalleryImage = async (e) => {
        e.preventDefault();
        if (!galleryImage) return flash('Please select an image.', 'err');
        try {
            const formData = new FormData();
            formData.append('image', galleryImage);
            formData.append('title', galleryMeta.title);
            formData.append('category', galleryMeta.category);
            await adminFetch('/api/admin/gallery', { method: 'POST', body: formData });
            setGalleryMeta({ title: '', category: '' }); setGalleryImage(null);
            flash('Image uploaded');
            fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };

    // --- Edit Handlers ---
    const updateUser = async (e) => {
        e.preventDefault();
        try {
            await adminFetch(`/api/admin/users/${editingUser.id}`, { method: 'PUT', body: JSON.stringify(editingUser) });
            setEditingUser(null);
            flash('User updated successfully');
            fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };

    const updateEvent = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', editingEvent.name);
            formData.append('location', editingEvent.location);
            if (editingEvent.date) formData.append('date', editingEvent.date);
            formData.append('description', editingEvent.description);
            formData.append('rules', editingEvent.rules || '');

            // Handle schedule array/string conversion safely
            const schedStr = typeof editingEvent.schedule === 'string'
                ? JSON.stringify([editingEvent.schedule])
                : JSON.stringify(editingEvent.schedule || []);
            formData.append('schedule', schedStr);

            formData.append('prizes', editingEvent.prizes || '');
            if (eventImage) formData.append('image', eventImage);

            await adminFetch(`/api/admin/events/${editingEvent.id}`, { method: 'PUT', body: formData });
            setEditingEvent(null);
            setEventImage(null);
            flash('Event updated successfully');
            fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };

    const updateTeamMember = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', editingTeam.name);
            formData.append('role', editingTeam.role);
            formData.append('bio', editingTeam.bio);
            formData.append('social_link', editingTeam.social_link);
            formData.append('society', editingTeam.society);
            formData.append('category', editingTeam.category);
            if (teamImage) formData.append('image', teamImage);

            await adminFetch(`/api/admin/team/${editingTeam.id}`, { method: 'PUT', body: formData });
            setEditingTeam(null);
            setTeamImage(null);
            flash('Team member updated');
            fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };

    const addFacultyMember = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newFaculty.name);
            formData.append('role', newFaculty.role);
            formData.append('department', newFaculty.department);
            if (facultyImage) formData.append('image', facultyImage);
            await adminFetch('/api/admin/faculty', { method: 'POST', body: formData });
            setNewFaculty({ name: '', role: '', department: '' });
            setFacultyImage(null);
            flash('Faculty member added');
            fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };

    const updateFacultyMember = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', editingFaculty.name);
            formData.append('role', editingFaculty.role);
            formData.append('department', editingFaculty.department);
            if (facultyImage) formData.append('image', facultyImage);

            await adminFetch(`/api/admin/faculty/${editingFaculty.id}`, { method: 'PUT', body: formData });
            setEditingFaculty(null);
            setFacultyImage(null);
            flash('Faculty member updated');
            fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };

    const updateGalleryImage = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', editingGallery.title);
            formData.append('category', editingGallery.category);
            if (galleryImage) formData.append('image', galleryImage);

            await adminFetch(`/api/admin/gallery/${editingGallery.id}`, { method: 'PUT', body: formData });
            setEditingGallery(null);
            setGalleryImage(null);
            flash('Image updated');
            fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };

    const updateNotice = async (e) => {
        e.preventDefault();
        try {
            await adminFetch(`/api/admin/notices/${editingNotice.id}`, { method: 'PUT', body: JSON.stringify(editingNotice) });
            setEditingNotice(null);
            flash('Notice updated');
            fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };

    // ── Check-in handler ──
    const handleCheckin = async (scannedId) => {
        const idToUse = (typeof scannedId === 'string' ? scannedId : checkinId).trim();
        if (!idToUse) return flash('Enter a registration ID', 'err');
        if (typeof scannedId === 'string') setCheckinId(scannedId);
        setCheckinLoading(true); setCheckinResult(null);
        try {
            const d = await adminFetch('/api/admin/checkin', { method: 'POST', body: JSON.stringify({ registrationId: idToUse }) });
            setCheckinResult(d);
            flash(d.message || 'Checked in!');
            setCheckinId('');
            return d;
        } catch (err) {
            flash(err.message, 'err');
            const errResult = { success: false, message: err.message };
            setCheckinResult(errResult);
            return errResult;
        }
        finally { setCheckinLoading(false); }
    };

    // ── Results CRUD ──
    const addResult = async (e) => {
        e.preventDefault();
        try {
            await adminFetch('/api/admin/results', { method: 'POST', body: JSON.stringify(newResult) });
            setNewResult({ event_id: '', position: 1, participant_name: '', participant_college: '', participant_email: '', user_id: '', score: '' });
            flash('Result added'); fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };
    const deleteResult = async (id) => { if (!confirm('Delete this result?')) return; await adminFetch(`/api/admin/results/${id}`, { method: 'DELETE' }); flash('Result deleted'); fetchTabData(); };

    // ── Toggle publish results for an event ──
    const toggleEventPublish = async (eventId) => {
        try {
            const d = await adminFetch(`/api/admin/events/${eventId}/toggle-publish`, { method: 'POST' });
            flash(d.message || 'Publish status updated');
            const evData = await fetch(`${API}/api/events`).then(r => r.json());
            setEvents(evData.events || []);
        } catch (err) { flash(err.message, 'err'); }
    };

    const bulkTogglePublish = async (publish) => {
        if (!confirm(`${publish ? 'Publish' : 'Unpublish'} ALL event results and certificates?`)) return;
        try {
            const d = await adminFetch('/api/admin/events/bulk-toggle-publish', { method: 'POST', body: JSON.stringify({ publish }) });
            flash(d.message);
            const evData = await fetch(`${API}/api/events`).then(r => r.json());
            setEvents(evData.events || []);
        } catch (err) { flash(err.message, 'err'); }
    };

    // ── Sponsors CRUD ──
    const addSponsor = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', newSponsor.name);
            formData.append('tier', newSponsor.tier);
            formData.append('website', newSponsor.website);
            formData.append('sort_order', newSponsor.sort_order);
            if (sponsorLogo) formData.append('logo', sponsorLogo);
            await adminFetch('/api/admin/sponsors', { method: 'POST', body: formData });
            setNewSponsor({ name: '', tier: 'bronze', website: '', sort_order: 0 }); setSponsorLogo(null);
            flash('Sponsor added'); fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };
    const deleteSponsor = async (id) => { if (!confirm('Delete this sponsor?')) return; await adminFetch(`/api/admin/sponsors/${id}`, { method: 'DELETE' }); flash('Sponsor deleted'); fetchTabData(); };


    const switchTab = (id) => { setActiveTab(id); setSidebarOpen(false); setSearch(''); setMsg({ text: '', type: '' }); };


    /* ── Loading state while checking auth cookie ── */
    if (!authChecked) {
        return (
            <>
                <style>{CSS}</style>
                <div className="ap-login-wrap">
                    <div className="ap-login-card ap-fade">
                        <h2>Admin <span>Panel</span></h2>
                        <p>Verifying session...</p>
                    </div>
                </div>
            </>
        );
    }

    /* ── Login screen ── */
    if (!isAuthed) {
        return (
            <>
                <style>{CSS}</style>
                <div className="ap-login-wrap">
                    <div className="ap-login-card ap-fade">
                        <h2>Admin <span>Panel</span></h2>
                        <p>Enter admin password to continue</p>
                        {loginError && <div className="ap-login-err">⚠ {loginError}</div>}
                        <input
                            className="ap-login-input" type="password"
                            placeholder="••••••••" value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                            autoFocus
                        />
                        <div className="ap-login-btns">
                            <button className="ap-btn-submit" onClick={handleAdminLogin}>Sign In</button>
                            <button className="ap-btn-ghost" onClick={onClose}>← Back</button>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    /* ── Dashboard ── */
    const tabTitles = { overview: 'Overview', registrations: 'Registrations', messages: 'Messages', users: 'Users', events: 'Events', team: 'Team Members', faculty: 'Faculty', gallery: 'Gallery', notices: 'Notices', checkin: 'Check-In', results: 'Results', sponsors: 'Sponsors', hiring: 'Hiring Applications' };

    /* ── Render active tab ── */
    const renderTab = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab registrations={registrations} users={users} events={events} messages={messages} analytics={analytics} />;
            case 'registrations':
                return <RegistrationsTab registrations={registrations} search={search} setSearch={setSearch} loading={loading} />;
            case 'users':
                return <UsersTab users={users} search={search} setSearch={setSearch} editingUser={editingUser} setEditingUser={setEditingUser} updateUser={updateUser} deleteUser={deleteUser} />;
            case 'messages':
                return <MessagesTab messages={messages} deleteMessage={deleteMessage} />;
            case 'events':
                return <EventsTab events={events} newEvent={newEvent} setNewEvent={setNewEvent} eventImage={eventImage} setEventImage={setEventImage} editingEvent={editingEvent} setEditingEvent={setEditingEvent} addEvent={addEvent} updateEvent={updateEvent} deleteEvent={deleteEvent} />;
            case 'team':
                return <TeamTab team={team} newTeam={newTeam} setNewTeam={setNewTeam} teamImage={teamImage} setTeamImage={setTeamImage} editingTeam={editingTeam} setEditingTeam={setEditingTeam} addTeamMember={addTeamMember} updateTeamMember={updateTeamMember} deleteTeamMember={deleteTeamMember} />;
            case 'faculty':
                return <FacultyTab faculty={faculty} newFaculty={newFaculty} setNewFaculty={setNewFaculty} facultyImage={facultyImage} setFacultyImage={setFacultyImage} editingFaculty={editingFaculty} setEditingFaculty={setEditingFaculty} addFacultyMember={addFacultyMember} updateFacultyMember={updateFacultyMember} deleteFacultyMember={deleteFacultyMember} />;
            case 'gallery':
                return <GalleryTab gallery={gallery} galleryMeta={galleryMeta} setGalleryMeta={setGalleryMeta} galleryImage={galleryImage} setGalleryImage={setGalleryImage} editingGallery={editingGallery} setEditingGallery={setEditingGallery} addGalleryImage={addGalleryImage} updateGalleryImage={updateGalleryImage} deleteGalleryImage={deleteGalleryImage} />;
            case 'notices':
                return <NoticesTab notices={notices} newNotice={newNotice} setNewNotice={setNewNotice} editingNotice={editingNotice} setEditingNotice={setEditingNotice} addNotice={addNotice} updateNotice={updateNotice} deleteNotice={deleteNotice} />;
            case 'checkin':
                return <CheckinTab checkinId={checkinId} setCheckinId={setCheckinId} checkinLoading={checkinLoading} checkinResult={checkinResult} handleCheckin={handleCheckin} />;
            case 'results':
                return <ResultsTab results={results} events={events} users={users} registrations={registrations} newResult={newResult} setNewResult={setNewResult} addResult={addResult} deleteResult={deleteResult} toggleEventPublish={toggleEventPublish} bulkTogglePublish={bulkTogglePublish} />;
            case 'sponsors':
                return <SponsorsTab sponsors={sponsors} newSponsor={newSponsor} setNewSponsor={setNewSponsor} sponsorLogo={sponsorLogo} setSponsorLogo={setSponsorLogo} addSponsor={addSponsor} deleteSponsor={deleteSponsor} />;
            case 'hiring':
                return <HiringTab hiringApps={hiringApps} search={search} setSearch={setSearch} loading={loading} deleteHiringApp={deleteHiringApp} />;
            default:
                return null;
        }
    };

    return (
        <>
            <style>{CSS}</style>
            <div className="ap">

                {/* Overlay for mobile */}
                <div className={`ap-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)} />

                {/* Sidebar */}
                <aside className={`ap-side ${sidebarOpen ? 'open' : ''}`}>
                    <div className="ap-side-head">
                        <div className="ap-side-logo">Festiver<span>se</span></div>
                        <div className="ap-side-sub">Admin Console</div>
                    </div>
                    <nav className="ap-side-nav">
                        {NAV_ITEMS.map((item, i) => (
                            <React.Fragment key={item.id}>
                                {item.group && <div className="ap-nav-label">{item.group}</div>}
                                {i === 0 && <div className="ap-nav-label">Dashboard</div>}
                                <button className={`ap-nav-btn ${activeTab === item.id ? 'active' : ''}`} onClick={() => switchTab(item.id)}>
                                    <span className="ap-nav-icon">{item.icon}</span> {item.label}
                                </button>
                            </React.Fragment>
                        ))}
                    </nav>
                    <div className="ap-side-foot">
                        <button className="ap-logout-btn" onClick={handleLogout}>
                            ⏻ Sign Out
                        </button>
                    </div>
                </aside>

                {/* Main content */}
                <div className="ap-main">
                    <header className="ap-topbar" style={{ position: 'relative' }}>
                        {loading && <div className="ap-progress"><div className="ap-progress-bar" /></div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button className="ap-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
                            <span className="ap-topbar-title">{tabTitles[activeTab]}</span>
                            {loading && <span className="ap-spin" style={{ marginLeft: 8 }} />}
                        </div>
                        <div className="ap-topbar-right">
                            <button className="ap-btn-ghost" onClick={onClose}>← Back to Site</button>
                        </div>
                    </header>

                    <div className="ap-content">
                        {/* Flash message */}
                        {msg.text && <div className={`ap-msg ${msg.type}`}>{msg.type === 'ok' ? '✓' : '!'} {msg.text}</div>}

                        {/* ─── Loading skeleton ─── */}
                        {loading && activeTab !== 'overview' && activeTab !== 'hiring' && (
                            <div className="ap-fade">
                                <div className="ap-skel-row" style={{ marginBottom: 20 }}>
                                    <div className="ap-skel ap-skel-bar" style={{ width: '30%' }} />
                                    <div style={{ flex: 1 }} />
                                    <div className="ap-skel ap-skel-bar" style={{ width: '200px' }} />
                                </div>
                                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                                            <div className="ap-skel ap-skel-bar" style={{ width: '22%', opacity: 1 - i * 0.1 }} />
                                            <div className="ap-skel ap-skel-bar" style={{ width: '18%', opacity: 1 - i * 0.1 }} />
                                            <div className="ap-skel ap-skel-bar" style={{ width: '28%', opacity: 1 - i * 0.1 }} />
                                            <div className="ap-skel ap-skel-bar" style={{ width: '15%', opacity: 1 - i * 0.1 }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ─── Active Tab Content ─── */}
                        {renderTab()}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminPanel;
