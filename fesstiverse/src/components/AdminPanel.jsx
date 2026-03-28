import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { proxyImageUrl } from '../lib/proxyImage';

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
`;

const CATEGORIES = ['Senior Coordinator', 'Coordinator', 'Sub Coordinator'];
const SOCIETIES = ['Fine and Art Society', 'Music and Dance Society', 'Acting and Drama Society', 'Literature and Debate Society', 'Social Awareness Society'];

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

const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch { return false; }
};

const AdminPanel = ({ onClose }) => {
    const savedToken = localStorage.getItem('festiverse_admin_token') || '';
    const [adminToken, setAdminToken] = useState(savedToken);
    const [isAuthed, setIsAuthed] = useState(isTokenValid(savedToken));
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
    const [newNotice, setNewNotice] = useState({ title: '', description: '', color: '#3b82f6' });

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
    const [newResult, setNewResult] = useState({ event_id: '', position: 1, participant_name: '', participant_college: '', score: '' });
    const [sponsors, setSponsors] = useState([]);
    const [newSponsor, setNewSponsor] = useState({ name: '', tier: 'bronze', website: '', sort_order: 0 });
    const [sponsorLogo, setSponsorLogo] = useState(null);

    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    const autoLogout = () => {
        localStorage.removeItem('festiverse_admin_token');
        setAdminToken(''); setIsAuthed(false);
    };

    const adminFetch = async (endpoint, options = {}) => {
        if (!isTokenValid(adminToken)) { autoLogout(); throw new Error('Session expired. Please log in again.'); }
        const headers = { ...(options.headers || {}) };
        if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
        headers['Authorization'] = `Bearer ${adminToken}`;
        const res = await fetch(`${API}${endpoint}`, { ...options, headers });
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Invalid password');
            localStorage.setItem('festiverse_admin_token', data.token);
            setAdminToken(data.token);
            setIsAuthed(true);
        } catch (err) {
            setLoginError(err.message);
        }
    };

    const handleLogout = () => autoLogout();

    useEffect(() => { if (isAuthed) fetchAll(); }, [isAuthed]);
    useEffect(() => { if (isAuthed) fetchTabData(); }, [activeTab, isAuthed]);

    const fetchAll = async () => {
        try {
            const [r, m, u, e, t, f, g, n] = await Promise.all([
                adminFetch('/api/admin/registrations').catch(() => ({})),
                adminFetch('/api/admin/messages').catch(() => ({})),
                adminFetch('/api/admin/users').catch(() => ({})),
                fetch(`${API}/api/events`).then(r => r.json()).catch(() => ({})),
                fetch(`${API}/api/team`).then(r => r.json()).catch(() => ({})),
                fetch(`${API}/api/faculty`).then(r => r.json()).catch(() => ({})),
                fetch(`${API}/api/gallery`).then(r => r.json()).catch(() => ({})),
                adminFetch('/api/admin/notices').catch(() => ({})),
            ]);
            setRegistrations(r.registrations || []);
            setMessages(m.messages || []);
            setUsers(u.users || []);
            setEvents(e.events || []);
            setTeam(t.members || []);
            setFaculty(f.faculty || []);
            setGallery(g.images || []);
            setNotices(n.notices || []);
        } catch { }
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
            }
        } catch { }
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
            setNewNotice({ title: '', description: '', color: '#3b82f6' });
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
    const handleCheckin = async () => {
        if (!checkinId.trim()) return flash('Enter a registration ID', 'err');
        setCheckinLoading(true); setCheckinResult(null);
        try {
            const d = await adminFetch('/api/admin/checkin', { method: 'POST', body: JSON.stringify({ registrationId: checkinId.trim() }) });
            setCheckinResult(d);
            flash(d.message || 'Checked in!');
            setCheckinId('');
        } catch (err) { flash(err.message, 'err'); setCheckinResult({ success: false, message: err.message }); }
        finally { setCheckinLoading(false); }
    };

    // ── Results CRUD ──
    const addResult = async (e) => {
        e.preventDefault();
        try {
            await adminFetch('/api/admin/results', { method: 'POST', body: JSON.stringify(newResult) });
            setNewResult({ event_id: '', position: 1, participant_name: '', participant_college: '', score: '' });
            flash('Result added'); fetchTabData();
        } catch (err) { flash(err.message, 'err'); }
    };
    const deleteResult = async (id) => { if (!confirm('Delete this result?')) return; await adminFetch(`/api/admin/results/${id}`, { method: 'DELETE' }); flash('Result deleted'); fetchTabData(); };

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
    const badgeClass = (cat) => cat === 'Senior Coordinator' ? 'ap-badge-senior' : cat === 'Sub Coordinator' ? 'ap-badge-sub' : 'ap-badge-coord';

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
                        {/* ─── OVERVIEW ─── */}
                        {activeTab === 'overview' && (
                            <div className="ap-fade">
                                <div className="ap-stats">
                                    <div className="ap-stat s-orange"><div className="ap-stat-val">{registrations.length}</div><div className="ap-stat-lbl">Registrations</div></div>
                                    <div className="ap-stat s-blue"><div className="ap-stat-val">{users.length}</div><div className="ap-stat-lbl">Users</div></div>
                                    <div className="ap-stat s-green"><div className="ap-stat-val">{events.length}</div><div className="ap-stat-lbl">Events</div></div>
                                    <div className="ap-stat s-red"><div className="ap-stat-val">{messages.length}</div><div className="ap-stat-lbl">Messages</div></div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div className="ap-card">
                                        <div className="ap-card-title"><span>◎</span> Recent Registrations</div>
                                        {registrations.slice(0, 5).map(r => (
                                            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '.82rem' }}>
                                                <span>{r.users?.name || '—'}</span>
                                                <span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>{r.events?.name || '—'}</span>
                                            </div>
                                        ))}
                                        {registrations.length === 0 && <div className="ap-empty"><p>No registrations yet</p></div>}
                                    </div>
                                    <div className="ap-card">
                                        <div className="ap-card-title"><span>◉</span> Recent Messages</div>
                                        {messages.slice(0, 5).map(m => (
                                            <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                                                <div style={{ fontSize: '.82rem', fontWeight: 600 }}>{m.name}</div>
                                                <div style={{ fontSize: '.75rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.message}</div>
                                            </div>
                                        ))}
                                        {messages.length === 0 && <div className="ap-empty"><p>No messages yet</p></div>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── REGISTRATIONS ─── */}
                        {activeTab === 'registrations' && (() => {
                            // Group registrations by user
                            const grouped = {};
                            registrations.forEach(r => {
                                const uid = r.users?.id || r.user_id || 'unknown';
                                if (!grouped[uid]) {
                                    grouped[uid] = {
                                        user: r.users || {},
                                        events: [],
                                    };
                                }
                                grouped[uid].events.push({
                                    id: r.id,
                                    custom_id: r.custom_id,
                                    name: r.events?.name || '—',
                                    date: r.created_at,
                                    team_members: r.team_members,
                                    team_size: r.events?.team_size,
                                });
                            });
                            const userList = Object.values(grouped).filter(g => {
                                if (!search) return true;
                                const s = search.toLowerCase();
                                return (g.user.name || '').toLowerCase().includes(s) ||
                                    (g.user.phone || '').includes(s) ||
                                    g.events.some(e => e.name.toLowerCase().includes(s));
                            });
                            const uniqueUsers = Object.keys(grouped).length;

                            return (
                                <div className="ap-fade">
                                    <div className="ap-sec-head">
                                        <div>
                                            <div className="ap-sec-title">{registrations.length} Registrations</div>
                                            <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 2 }}>{uniqueUsers} unique participants</div>
                                        </div>
                                        <input className="ap-search" placeholder="Search by name, phone, or event..." value={search} onChange={e => setSearch(e.target.value)} />
                                    </div>
                                    {loading ? (
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
                                    ) : userList.length === 0 ? (
                                        <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">⊞</div><h4>No registrations</h4></div></div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {userList.map((g, idx) => (
                                                <div key={idx} className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                                                    {/* User header */}
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,.015)' }}>
                                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0, border: '1px solid var(--border)' }}>
                                                            {(g.user.name || '?')[0].toUpperCase()}
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ fontWeight: 700, fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                {g.user.name || '—'}
                                                                {g.user.has_paid ? <span style={{ color: '#86efac', background: 'rgba(34,197,94,.1)', padding: '2px 6px', borderRadius: 4, fontSize: '.65rem', fontWeight: 600 }}>Paid</span> : <span style={{ color: '#fca5a5', background: 'rgba(239,68,68,.1)', padding: '2px 6px', borderRadius: 4, fontSize: '.65rem', fontWeight: 600 }}>Unpaid</span>}
                                                            </div>
                                                            <div style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                                                <span>📞 {g.user.phone || '—'}</span>
                                                                {g.user.email && <span>✉ {g.user.email}</span>}
                                                                {g.user.college && <span>🎓 {g.user.college}</span>}
                                                            </div>
                                                        </div>
                                                        <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--accent)', background: 'rgba(249,115,22,.1)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(249,115,22,.2)', flexShrink: 0 }}>
                                                            {g.events.length} event{g.events.length > 1 ? 's' : ''}
                                                        </div>
                                                    </div>
                                                    {/* Events */}
                                                    <div style={{ padding: '12px 18px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                        {g.events.map((ev, ei) => (
                                                            <div key={ei} style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                                padding: '5px 12px', borderRadius: 8,
                                                                background: 'var(--surface2)', border: '1px solid var(--border)',
                                                                fontSize: '.78rem', fontWeight: 500, color: 'var(--text)',
                                                            }}>
                                                                <span>{ev.name}</span>
                                                                {ev.custom_id && <span style={{ fontSize: '.65rem', padding: '1px 5px', background: 'var(--border)', borderRadius: 4, marginLeft: 6, color: 'var(--text)', fontWeight: '500', letterSpacing: '0.05em' }}>{ev.custom_id}</span>}
                                                                {ev.team_size > 1 && <span style={{ fontSize: '.6rem', color: 'var(--accent)', fontWeight: 700 }}>TEAM</span>}
                                                                {ev.team_members && ev.team_members.length > 0 && (
                                                                    <span style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
                                                                        ({ev.team_members.map(m => m.name).join(', ')})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        {/* ─── USERS ─── */}
                        {activeTab === 'users' && (
                            <div className="ap-fade">
                                {editingUser && (
                                    <div className="ap-edit-wrap">
                                        <div className="ap-edit-wrap-title">✎ Edit User</div>
                                        <form onSubmit={updateUser}>
                                            <div className="ap-form-grid">
                                                <div className="ap-field"><label>Name *</label><input required placeholder="User name" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} /></div>
                                                <div className="ap-field"><label>Phone</label><input placeholder="Phone number" value={editingUser.phone} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} /></div>
                                                <div className="ap-field"><label>Email</label><input type="email" placeholder="Email address" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} /></div>
                                                <div className="ap-field"><label>College</label><input placeholder="College name" value={editingUser.college} onChange={e => setEditingUser({ ...editingUser, college: e.target.value })} /></div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                                <button type="submit" className="ap-btn-submit">Save Changes</button>
                                                <button type="button" className="ap-btn-ghost" onClick={() => setEditingUser(null)}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="ap-sec-head">
                                    <div className="ap-sec-title">{users.length} Users</div>
                                    <input className="ap-search" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <table className="ap-table">
                                        <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>College</th><th>Payment</th><th>Joined</th><th></th></tr></thead>
                                        <tbody>
                                            {users.filter(u => !search || (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.phone || '').includes(search)).map(u => (
                                                <tr key={u.id}>
                                                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                                                    <td>{u.phone}</td>
                                                    <td style={{ color: 'var(--muted)' }}>{u.email || '—'}</td>
                                                    <td style={{ color: 'var(--muted)' }}>{u.college || '—'}</td>
                                                    <td>{u.has_paid ? <span style={{ color: '#86efac', background: 'rgba(34,197,94,.1)', padding: '2px 6px', borderRadius: 4, fontSize: '.7rem' }}>Paid</span> : <span style={{ color: '#fca5a5', background: 'rgba(239,68,68,.1)', padding: '2px 6px', borderRadius: 4, fontSize: '.7rem' }}>Unpaid</span>}</td>
                                                    <td style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="ap-actions">
                                                            <button className="ap-edit" onClick={() => { setEditingUser({ ...u, name: u.name || '', phone: u.phone || '', email: u.email || '', college: u.college || '' }); window.scrollTo(0, 0); }}>Edit</button>
                                                            <button className="ap-del" onClick={() => deleteUser(u.id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {users.length === 0 && <tr><td colSpan={6}><div className="ap-empty"><div className="ap-empty-icon">⊙</div><h4>No users yet</h4></div></td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ─── MESSAGES ─── */}
                        {activeTab === 'messages' && (
                            <div className="ap-fade">
                                <div className="ap-sec-head">
                                    <div className="ap-sec-title">{messages.length} Messages</div>
                                </div>
                                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <table className="ap-table">
                                        <thead><tr><th>From</th><th>Email</th><th>Message</th><th>Date</th><th></th></tr></thead>
                                        <tbody>
                                            {messages.map(m => (
                                                <tr key={m.id}>
                                                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                                                    <td style={{ color: 'var(--muted)' }}>{m.email || '—'}</td>
                                                    <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</td>
                                                    <td style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{new Date(m.created_at).toLocaleDateString()}</td>
                                                    <td><button className="ap-del" onClick={() => deleteMessage(m.id)}>Delete</button></td>
                                                </tr>
                                            ))}
                                            {messages.length === 0 && <tr><td colSpan={5}><div className="ap-empty"><div className="ap-empty-icon">◉</div><h4>No messages</h4></div></td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ─── EVENTS ─── */}
                        {activeTab === 'events' && (
                            <div className="ap-fade">
                                {editingEvent ? (
                                    <div className="ap-edit-wrap">
                                        <div className="ap-edit-wrap-title">✎ Edit Event</div>
                                        <form onSubmit={updateEvent}>
                                            <div className="ap-form-grid">
                                                <div className="ap-field"><label>Event Name *</label><input required placeholder="e.g. Solo Dance" value={editingEvent.name} onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })} /></div>
                                                <div className="ap-field"><label>Location</label><input placeholder="e.g. Main Stage" value={editingEvent.location} onChange={e => setEditingEvent({ ...editingEvent, location: e.target.value })} /></div>
                                                <div className="ap-field"><label>Date</label><input type="date" value={editingEvent.date ? new Date(editingEvent.date).toISOString().split('T')[0] : ''} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} /></div>
                                                <div className="ap-field"><label>Short Description</label><input placeholder="Brief description" value={editingEvent.description} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })} /></div>

                                                <div className="ap-field" style={{ gridColumn: '1 / -1' }}><label>Rules</label><textarea placeholder="Event rules" value={editingEvent.rules || ''} onChange={e => setEditingEvent({ ...editingEvent, rules: e.target.value })} rows="3" /></div>
                                                <div className="ap-field"><label>Schedule</label><input placeholder="e.g. 10:00 AM - 12:00 PM" value={(Array.isArray(editingEvent.schedule) ? editingEvent.schedule[0] : editingEvent.schedule) || ''} onChange={e => setEditingEvent({ ...editingEvent, schedule: e.target.value })} /></div>
                                                <div className="ap-field"><label>Prizes</label><input placeholder="e.g. 1st: $500" value={editingEvent.prizes || ''} onChange={e => setEditingEvent({ ...editingEvent, prizes: e.target.value })} /></div>

                                                <div className="ap-field ap-field-file" style={{ gridColumn: '1 / -1' }}>
                                                    <label>Event Image (Banner/Poster)</label>
                                                    <input type="file" accept="image/*" onChange={e => setEventImage(e.target.files[0])} />
                                                    <div className="ap-file-label">{eventImage ? `📷 ${eventImage.name}` : '📷 Change cover image (optional)'}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                                                <button type="submit" className="ap-btn-submit">Save Changes</button>
                                                <button type="button" className="ap-btn-ghost" onClick={() => { setEditingEvent(null); setEventImage(null); }}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="ap-card">
                                        <div className="ap-card-title"><span>+</span> Add New Event</div>
                                        <form onSubmit={addEvent}>
                                            <div className="ap-form-grid">
                                                <div className="ap-field"><label>Event Name *</label><input required placeholder="e.g. Solo Dance" value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} /></div>
                                                <div className="ap-field"><label>Location</label><input placeholder="e.g. Main Stage" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} /></div>
                                                <div className="ap-field"><label>Date</label><input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} /></div>
                                                <div className="ap-field"><label>Short Description</label><input placeholder="Brief description" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} /></div>

                                                <div className="ap-field" style={{ gridColumn: '1 / -1' }}><label>Rules</label><textarea placeholder="Event rules" value={newEvent.rules} onChange={e => setNewEvent({ ...newEvent, rules: e.target.value })} rows="3" /></div>
                                                <div className="ap-field"><label>Schedule</label><input placeholder="e.g. 10:00 AM - 12:00 PM" value={newEvent.schedule} onChange={e => setNewEvent({ ...newEvent, schedule: e.target.value })} /></div>
                                                <div className="ap-field"><label>Prizes</label><input placeholder="e.g. 1st: $500" value={newEvent.prizes} onChange={e => setNewEvent({ ...newEvent, prizes: e.target.value })} /></div>

                                                <div className="ap-field ap-field-file" style={{ gridColumn: '1 / -1' }}>
                                                    <label>Event Image (Banner/Poster)</label>
                                                    <input type="file" accept="image/*" onChange={e => setEventImage(e.target.files[0])} />
                                                    <div className="ap-file-label">{eventImage ? `📷 ${eventImage.name}` : '📷 Choose cover image (optional)'}</div>
                                                </div>
                                            </div>
                                            <button type="submit" className="ap-btn-submit">+ Add Event</button>
                                        </form>
                                    </div>
                                )}

                                <div className="ap-sec-head"><div className="ap-sec-title">{events.length} Events</div></div>
                                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <table className="ap-table">
                                        <thead><tr><th>Name</th><th>Location</th><th>Date</th><th>Team Size</th><th></th></tr></thead>
                                        <tbody>
                                            {events.map(ev => (
                                                <tr key={ev.id}>
                                                    <td style={{ fontWeight: 600 }}>{ev.name}</td>
                                                    <td style={{ color: 'var(--muted)' }}>{ev.location || '—'}</td>
                                                    <td style={{ color: 'var(--muted)' }}>{ev.date ? new Date(ev.date).toLocaleDateString() : '—'}</td>
                                                    <td>{ev.team_size > 1 ? <span style={{ color: 'var(--accent)' }}>Team ×{ev.team_size}</span> : <span style={{ color: 'var(--muted)' }}>Solo</span>}</td>
                                                    <td>
                                                        <div className="ap-actions">
                                                            <button className="ap-edit" onClick={() => { setEditingEvent({ ...ev, name: ev.name || '', location: ev.location || '', date: ev.date || '', description: ev.description || '', rules: ev.rules || '', schedule: ev.schedule || '', prizes: ev.prizes || '' }); window.scrollTo(0, 0); }}>Edit</button>
                                                            <button className="ap-del" onClick={() => deleteEvent(ev.id)}>Delete</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {events.length === 0 && <tr><td colSpan={5}><div className="ap-empty"><div className="ap-empty-icon">◎</div><h4>No events</h4></div></td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ─── TEAM ─── */}
                        {activeTab === 'team' && (
                            <div className="ap-fade">
                                {editingTeam ? (
                                    <div className="ap-edit-wrap">
                                        <div className="ap-edit-wrap-title">✎ Edit Team Member</div>
                                        <form onSubmit={updateTeamMember}>
                                            <div className="ap-form-grid">
                                                <div className="ap-field"><label>Name *</label><input required placeholder="Full name" value={editingTeam.name} onChange={e => setEditingTeam({ ...editingTeam, name: e.target.value })} /></div>
                                                <div className="ap-field"><label>Role / Title *</label><input required placeholder="e.g. Event Lead" value={editingTeam.role} onChange={e => setEditingTeam({ ...editingTeam, role: e.target.value })} /></div>
                                                <div className="ap-field">
                                                    <label>Category *</label>
                                                    <select value={editingTeam.category} onChange={e => setEditingTeam({ ...editingTeam, category: e.target.value })}>
                                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div className="ap-field">
                                                    <label>Society</label>
                                                    <select value={editingTeam.society} onChange={e => setEditingTeam({ ...editingTeam, society: e.target.value })}>
                                                        <option value="">Select society</option>
                                                        {SOCIETIES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div className="ap-field"><label>Bio</label><input placeholder="Short bio (optional)" value={editingTeam.bio} onChange={e => setEditingTeam({ ...editingTeam, bio: e.target.value })} /></div>
                                                <div className="ap-field"><label>Social Link</label><input placeholder="Instagram / LinkedIn URL" value={editingTeam.social_link} onChange={e => setEditingTeam({ ...editingTeam, social_link: e.target.value })} /></div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                                                <div className="ap-field ap-field-file" style={{ flex: 1 }}>
                                                    <input type="file" accept="image/*" onChange={e => setTeamImage(e.target.files[0])} />
                                                    <div className="ap-file-label">
                                                        {teamImage ? `📷 ${teamImage.name}` : '📷 Choose photo to replace (optional)'}
                                                    </div>
                                                </div>
                                                <button type="submit" className="ap-btn-submit">Save</button>
                                                <button type="button" className="ap-btn-ghost" onClick={() => { setEditingTeam(null); setTeamImage(null); }}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="ap-card">
                                        <div className="ap-card-title"><span>+</span> Add Team Member</div>
                                        <form onSubmit={addTeamMember}>
                                            <div className="ap-form-grid">
                                                <div className="ap-field"><label>Name *</label><input required placeholder="Full name" value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} /></div>
                                                <div className="ap-field"><label>Role / Title *</label><input required placeholder="e.g. Event Lead" value={newTeam.role} onChange={e => setNewTeam({ ...newTeam, role: e.target.value })} /></div>
                                                <div className="ap-field">
                                                    <label>Category *</label>
                                                    <select value={newTeam.category} onChange={e => setNewTeam({ ...newTeam, category: e.target.value })}>
                                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                </div>
                                                <div className="ap-field">
                                                    <label>Society</label>
                                                    <select value={newTeam.society} onChange={e => setNewTeam({ ...newTeam, society: e.target.value })}>
                                                        <option value="">Select society</option>
                                                        {SOCIETIES.map(s => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                </div>
                                                <div className="ap-field"><label>Bio</label><input placeholder="Short bio (optional)" value={newTeam.bio} onChange={e => setNewTeam({ ...newTeam, bio: e.target.value })} /></div>
                                                <div className="ap-field"><label>Social Link</label><input placeholder="Instagram / LinkedIn URL" value={newTeam.social_link} onChange={e => setNewTeam({ ...newTeam, social_link: e.target.value })} /></div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                                                <div className="ap-field ap-field-file" style={{ flex: 1 }}>
                                                    <input type="file" accept="image/*" onChange={e => setTeamImage(e.target.files[0])} />
                                                    <div className="ap-file-label">
                                                        {teamImage ? `📷 ${teamImage.name}` : '📷 Choose photo (optional)'}
                                                    </div>
                                                </div>
                                                <button type="submit" className="ap-btn-submit">+ Add Member</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="ap-sec-head"><div className="ap-sec-title">{team.length} Team Members</div></div>
                                {team.length === 0 ? (
                                    <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">◇</div><h4>No team members</h4><p style={{ fontSize: '.82rem' }}>Add members using the form above.</p></div></div>
                                ) : (
                                    <div className="ap-team-grid">
                                        {team.map(m => (
                                            <div key={m.id} className="ap-team-card">
                                                <img className="ap-team-avatar" src={proxyImageUrl(m.image_url) || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`} onError={e => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`; }} alt={m.name} />
                                                <div className="ap-team-name">{m.name}</div>
                                                <div className="ap-team-role">{m.role}</div>
                                                {m.society && <div className="ap-team-society">{m.society}</div>}
                                                <div className={`ap-badge ${badgeClass(m.category)}`}>{m.category || 'Coordinator'}</div>
                                                <div className="ap-actions" style={{ marginTop: 10, justifyContent: 'center' }}>
                                                    <button className="ap-edit" onClick={() => { setEditingTeam({ ...m, name: m.name || '', role: m.role || '', category: m.category || 'Coordinator', society: m.society || '', bio: m.bio || '', social_link: m.social_link || '' }); window.scrollTo(0, 0); }}>Edit</button>
                                                    <button className="ap-del" onClick={() => deleteTeamMember(m.id)}>Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── FACULTY ─── */}
                        {activeTab === 'faculty' && (
                            <div className="ap-fade">
                                {editingFaculty ? (
                                    <div className="ap-edit-wrap">
                                        <div className="ap-edit-wrap-title">✎ Edit Faculty Member</div>
                                        <form onSubmit={updateFacultyMember}>
                                            <div className="ap-form-grid">
                                                <div className="ap-field"><label>Name *</label><input required placeholder="Full name" value={editingFaculty.name} onChange={e => setEditingFaculty({ ...editingFaculty, name: e.target.value })} /></div>
                                                <div className="ap-field"><label>Role / Title *</label><input required placeholder="e.g. Chief Coordinator" value={editingFaculty.role} onChange={e => setEditingFaculty({ ...editingFaculty, role: e.target.value })} /></div>
                                                <div className="ap-field"><label>Department</label><input placeholder="e.g. Department of Arts" value={editingFaculty.department} onChange={e => setEditingFaculty({ ...editingFaculty, department: e.target.value })} /></div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                                                <div className="ap-field ap-field-file" style={{ flex: 1 }}>
                                                    <input type="file" accept="image/*" onChange={e => setFacultyImage(e.target.files[0])} />
                                                    <div className="ap-file-label">
                                                        {facultyImage ? `📷 ${facultyImage.name}` : '📷 Choose photo to replace (optional)'}
                                                    </div>
                                                </div>
                                                <button type="submit" className="ap-btn-submit">Save</button>
                                                <button type="button" className="ap-btn-ghost" onClick={() => { setEditingFaculty(null); setFacultyImage(null); }}>Cancel</button>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="ap-card">
                                        <div className="ap-card-title"><span>+</span> Add Faculty Member</div>
                                        <form onSubmit={addFacultyMember}>
                                            <div className="ap-form-grid">
                                                <div className="ap-field"><label>Name *</label><input required placeholder="Full name" value={newFaculty.name} onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })} /></div>
                                                <div className="ap-field"><label>Role / Title *</label><input required placeholder="e.g. Chief Coordinator" value={newFaculty.role} onChange={e => setNewFaculty({ ...newFaculty, role: e.target.value })} /></div>
                                                <div className="ap-field"><label>Department</label><input placeholder="e.g. Department of Arts" value={newFaculty.department} onChange={e => setNewFaculty({ ...newFaculty, department: e.target.value })} /></div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                                                <div className="ap-field ap-field-file" style={{ flex: 1 }}>
                                                    <input type="file" accept="image/*" onChange={e => setFacultyImage(e.target.files[0])} />
                                                    <div className="ap-file-label">
                                                        {facultyImage ? `📷 ${facultyImage.name}` : '📷 Choose photo (optional)'}
                                                    </div>
                                                </div>
                                                <button type="submit" className="ap-btn-submit">+ Add Member</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="ap-sec-head"><div className="ap-sec-title">{faculty.length} Faculty Members</div></div>
                                {faculty.length === 0 ? (
                                    <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">🎓</div><h4>No faculty members</h4><p style={{ fontSize: '.82rem' }}>Add members using the form above.</p></div></div>
                                ) : (
                                    <div className="ap-team-grid">
                                        {faculty.map(m => (
                                            <div key={m.id} className="ap-team-card">
                                                <img className="ap-team-avatar" src={proxyImageUrl(m.image_url) || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`} onError={e => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`; }} alt={m.name} />
                                                <div className="ap-team-name">{m.name}</div>
                                                <div className="ap-team-role">{m.role}</div>
                                                {m.department && <div className="ap-team-society">{m.department}</div>}
                                                <div className="ap-actions" style={{ marginTop: 10, justifyContent: 'center' }}>
                                                    <button className="ap-edit" onClick={() => { setEditingFaculty({ ...m, name: m.name || '', role: m.role || '', department: m.department || '' }); window.scrollTo(0, 0); }}>Edit</button>
                                                    <button className="ap-del" onClick={() => deleteFacultyMember(m.id)}>Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─── GALLERY ─── */}
                        {activeTab === 'gallery' && (
                            <div className="ap-fade">
                                {editingGallery ? (
                                    <div className="ap-edit-wrap">
                                        <div className="ap-edit-wrap-title">✎ Edit Image</div>
                                        <form onSubmit={updateGalleryImage}>
                                            <div className="ap-form-grid">
                                                <div className="ap-field ap-field-file">
                                                    <input type="file" accept="image/*" onChange={e => setGalleryImage(e.target.files[0])} />
                                                    <div className="ap-file-label">
                                                        {galleryImage ? `🖼 ${galleryImage.name}` : '🖼 Choose new image to replace (optional)'}
                                                    </div>
                                                </div>
                                                <div className="ap-field"><label>Title</label><input placeholder="Image title" value={editingGallery.title} onChange={e => setEditingGallery({ ...editingGallery, title: e.target.value })} /></div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                                                <div className="ap-field" style={{ flex: 1 }}><label>Category</label><input placeholder="e.g. cultural, tech" value={editingGallery.category} onChange={e => setEditingGallery({ ...editingGallery, category: e.target.value })} /></div>
                                                <div style={{ display: 'flex', gap: 8, marginBottom: 0 }}>
                                                    <button type="submit" className="ap-btn-submit">Save</button>
                                                    <button type="button" className="ap-btn-ghost" onClick={() => { setEditingGallery(null); setGalleryImage(null); }}>Cancel</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="ap-card">
                                        <div className="ap-card-title"><span>+</span> Upload Image</div>
                                        <form onSubmit={addGalleryImage}>
                                            <div className="ap-form-grid">
                                                <div className="ap-field ap-field-file">
                                                    <input type="file" accept="image/*" onChange={e => setGalleryImage(e.target.files[0])} />
                                                    <div className="ap-file-label">
                                                        {galleryImage ? `🖼 ${galleryImage.name}` : '🖼 Drop or select image *'}
                                                    </div>
                                                </div>
                                                <div className="ap-field"><label>Title</label><input placeholder="Image title" value={galleryMeta.title} onChange={e => setGalleryMeta({ ...galleryMeta, title: e.target.value })} /></div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                                                <div className="ap-field" style={{ flex: 1 }}><label>Category</label><input placeholder="e.g. cultural, tech" value={galleryMeta.category} onChange={e => setGalleryMeta({ ...galleryMeta, category: e.target.value })} /></div>
                                                <button type="submit" className="ap-btn-submit" style={{ marginBottom: 0 }}>Upload</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="ap-sec-head"><div className="ap-sec-title">{gallery.length} Images</div></div>
                                {gallery.length === 0 ? (
                                    <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">⊡</div><h4>No images</h4></div></div>
                                ) : (
                                    <div className="ap-gal-grid">
                                        {gallery.map(img => (
                                            <div key={img.id} className="ap-gal-item">
                                                <img className="ap-gal-img" src={proxyImageUrl(img.url)} alt={img.title} />
                                                <div className="ap-gal-info">
                                                    <div className="ap-gal-title">{img.title || 'Untitled'}</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                                        <span className="ap-gal-cat">{img.category || '—'}</span>
                                                        <div className="ap-actions">
                                                            <button className="ap-edit" onClick={() => { setEditingGallery({ ...img, title: img.title || '', category: img.category || '' }); window.scrollTo(0, 0); }}>Edit</button>
                                                            <button className="ap-del" onClick={() => deleteGalleryImage(img.id)}>✕</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ─── NOTICES ─── */}
                    {activeTab === 'notices' && (
                        <div className="ap-fade">
                            {editingNotice ? (
                                <div className="ap-edit-wrap" style={{ marginBottom: 20 }}>
                                    <div className="ap-edit-wrap-title">✎ Edit Notice</div>
                                    <form onSubmit={updateNotice}>
                                        <div className="ap-form-grid">
                                            <div className="ap-field"><label>Title *</label><input placeholder="Notice title" value={editingNotice.title} onChange={e => setEditingNotice({ ...editingNotice, title: e.target.value })} required /></div>
                                            <div className="ap-field"><label>Description</label><input placeholder="Short description" value={editingNotice.description} onChange={e => setEditingNotice({ ...editingNotice, description: e.target.value })} /></div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
                                            <div className="ap-field" style={{ marginBottom: 0 }}>
                                                <label>Color</label>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    {['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ec4899'].map(c => (
                                                        <button type="button" key={c} onClick={() => setEditingNotice({ ...editingNotice, color: c })} style={{
                                                            width: 28, height: 28, borderRadius: '50%', background: c, border: editingNotice.color === c ? '3px solid #fff' : '2px solid transparent',
                                                            cursor: 'pointer', transition: 'all .15s', transform: editingNotice.color === c ? 'scale(1.15)' : 'scale(1)',
                                                        }} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', marginTop: 16 }}>
                                                <button className="ap-btn-submit" type="submit">Save</button>
                                                <button className="ap-btn-ghost" type="button" onClick={() => setEditingNotice(null)}>Cancel</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <div className="ap-card" style={{ marginBottom: 20 }}>
                                    <div className="ap-card-title"><span>◆</span> Add Notice</div>
                                    <form onSubmit={addNotice}>
                                        <div className="ap-form-grid">
                                            <div className="ap-field"><label>Title *</label><input placeholder="Notice title" value={newNotice.title} onChange={e => setNewNotice({ ...newNotice, title: e.target.value })} required /></div>
                                            <div className="ap-field"><label>Description</label><input placeholder="Short description" value={newNotice.description} onChange={e => setNewNotice({ ...newNotice, description: e.target.value })} /></div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
                                            <div className="ap-field" style={{ marginBottom: 0 }}>
                                                <label>Color</label>
                                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                                    {['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ec4899'].map(c => (
                                                        <button type="button" key={c} onClick={() => setNewNotice({ ...newNotice, color: c })} style={{
                                                            width: 28, height: 28, borderRadius: '50%', background: c, border: newNotice.color === c ? '3px solid #fff' : '2px solid transparent',
                                                            cursor: 'pointer', transition: 'all .15s', transform: newNotice.color === c ? 'scale(1.15)' : 'scale(1)',
                                                        }} />
                                                    ))}
                                                </div>
                                            </div>
                                            <button className="ap-btn-submit" type="submit" style={{ marginLeft: 'auto', marginTop: 16 }}>+ Add Notice</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="ap-sec-head"><div className="ap-sec-title">{notices.length} Notices</div></div>
                            {notices.length === 0 ? (
                                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">◆</div><h4>No notices yet</h4><p>Add one above to display on the Notice Board</p></div></div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {notices.map(n => (
                                        <div key={n.id} className="ap-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ width: 4, height: 40, borderRadius: 4, background: n.color || '#3b82f6', flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{n.title}</div>
                                                {n.description && <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 2 }}>{n.description}</div>}
                                            </div>
                                            <div style={{ fontSize: '.65rem', color: 'var(--muted)', flexShrink: 0, marginRight: 10 }}>{new Date(n.created_at).toLocaleDateString()}</div>
                                            <div className="ap-actions">
                                                <button className="ap-edit" onClick={() => { setEditingNotice({ ...n, title: n.title || '', description: n.description || '', color: n.color || '#3b82f6' }); window.scrollTo(0, 0); }}>Edit</button>
                                                <button className="ap-del" onClick={() => deleteNotice(n.id)}>✕</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── CHECK-IN ─── */}
                    {activeTab === 'checkin' && (
                        <div className="ap-fade">
                            <div className="ap-card">
                                <div className="ap-card-title"><span>✓</span> QR Check-In</div>
                                <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: 16 }}>Enter or scan a registration ID to check in a participant.</p>
                                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                                    <input className="ap-search" style={{ flex: 1, width: 'auto' }} placeholder="Registration ID..." value={checkinId} onChange={e => setCheckinId(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCheckin()} />
                                    <button className="ap-btn-submit" disabled={checkinLoading} onClick={handleCheckin}>
                                        {checkinLoading ? <><span className="ap-spin" /> Checking...</> : '✓ Check In'}
                                    </button>
                                </div>
                                {checkinResult && (
                                    <div className={`ap-msg ${checkinResult.success ? 'ok' : 'err'}`} style={{ marginTop: 8 }}>
                                        {checkinResult.message}
                                        {checkinResult.registration && (
                                            <div style={{ marginTop: 8, fontSize: '.78rem' }}>
                                                <div>Name: <strong>{checkinResult.registration.users?.name}</strong></div>
                                                <div>Event: <strong>{checkinResult.registration.events?.name}</strong></div>
                                                <div style={{ marginTop: 4 }}>Payment: <strong>{checkinResult.registration.users?.has_paid ? <span style={{ color: '#86efac' }}>Paid ✅</span> : <span style={{ color: '#fca5a5' }}>Unpaid ❌</span>}</strong></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ─── RESULTS ─── */}
                    {activeTab === 'results' && (
                        <div className="ap-fade">
                            <div className="ap-card">
                                <div className="ap-card-title"><span>+</span> Add Result</div>
                                <form onSubmit={addResult}>
                                    <div className="ap-form-grid">
                                        <div className="ap-field">
                                            <label>Event *</label>
                                            <select required value={newResult.event_id} onChange={e => setNewResult({ ...newResult, event_id: e.target.value })}>
                                                <option value="">Select event...</option>
                                                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="ap-field"><label>Position *</label><input type="number" min="1" required value={newResult.position} onChange={e => setNewResult({ ...newResult, position: parseInt(e.target.value) })} /></div>
                                        <div className="ap-field"><label>Participant Name *</label><input required placeholder="Name" value={newResult.participant_name} onChange={e => setNewResult({ ...newResult, participant_name: e.target.value })} /></div>
                                        <div className="ap-field"><label>College</label><input placeholder="College" value={newResult.participant_college} onChange={e => setNewResult({ ...newResult, participant_college: e.target.value })} /></div>
                                        <div className="ap-field"><label>Score</label><input placeholder="e.g. 95" value={newResult.score} onChange={e => setNewResult({ ...newResult, score: e.target.value })} /></div>
                                    </div>
                                    <button type="submit" className="ap-btn-submit">Add Result</button>
                                </form>
                            </div>
                            <div className="ap-sec-head"><div className="ap-sec-title">{results.length} Results</div></div>
                            {results.length === 0 ? (
                                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">🏆</div><h4>No results yet</h4></div></div>
                            ) : (
                                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <table className="ap-table">
                                        <thead><tr><th>Event</th><th>Pos</th><th>Name</th><th>College</th><th>Score</th><th></th></tr></thead>
                                        <tbody>
                                            {results.map(r => (
                                                <tr key={r.id}>
                                                    <td>{r.events?.name || '—'}</td>
                                                    <td><strong>{r.position}</strong></td>
                                                    <td style={{ fontWeight: 600 }}>{r.participant_name}</td>
                                                    <td style={{ color: 'var(--muted)' }}>{r.participant_college || '—'}</td>
                                                    <td>{r.score || '—'}</td>
                                                    <td><button className="ap-del" onClick={() => deleteResult(r.id)}>✕</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── SPONSORS ─── */}
                    {activeTab === 'sponsors' && (
                        <div className="ap-fade">
                            <div className="ap-card">
                                <div className="ap-card-title"><span>+</span> Add Sponsor</div>
                                <form onSubmit={addSponsor}>
                                    <div className="ap-form-grid">
                                        <div className="ap-field"><label>Name *</label><input required placeholder="Sponsor name" value={newSponsor.name} onChange={e => setNewSponsor({ ...newSponsor, name: e.target.value })} /></div>
                                        <div className="ap-field">
                                            <label>Tier</label>
                                            <select value={newSponsor.tier} onChange={e => setNewSponsor({ ...newSponsor, tier: e.target.value })}>
                                                <option value="gold">Gold</option>
                                                <option value="silver">Silver</option>
                                                <option value="bronze">Bronze</option>
                                            </select>
                                        </div>
                                        <div className="ap-field"><label>Website</label><input placeholder="https://..." value={newSponsor.website} onChange={e => setNewSponsor({ ...newSponsor, website: e.target.value })} /></div>
                                        <div className="ap-field"><label>Sort Order</label><input type="number" value={newSponsor.sort_order} onChange={e => setNewSponsor({ ...newSponsor, sort_order: parseInt(e.target.value) || 0 })} /></div>
                                        <div className="ap-field ap-field-file">
                                            <label>Logo</label>
                                            <input type="file" accept="image/*" onChange={e => setSponsorLogo(e.target.files[0])} />
                                            <div className="ap-file-label">{sponsorLogo ? `✓ ${sponsorLogo.name}` : '📎 Choose logo image'}</div>
                                        </div>
                                    </div>
                                    <button type="submit" className="ap-btn-submit">Add Sponsor</button>
                                </form>
                            </div>
                            <div className="ap-sec-head"><div className="ap-sec-title">{sponsors.length} Sponsors</div></div>
                            {sponsors.length === 0 ? (
                                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">★</div><h4>No sponsors yet</h4></div></div>
                            ) : (
                                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                                    <table className="ap-table">
                                        <thead><tr><th>Logo</th><th>Name</th><th>Tier</th><th>Website</th><th>Order</th><th></th></tr></thead>
                                        <tbody>
                                            {sponsors.map(s => (
                                                <tr key={s.id}>
                                                    <td>{s.logo_url ? <img src={s.logo_url} alt="" style={{ height: 28, objectFit: 'contain' }} /> : '—'}</td>
                                                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                                                    <td><span style={{ textTransform: 'capitalize', color: s.tier === 'gold' ? '#fbbf24' : s.tier === 'silver' ? '#9ca3af' : '#d97706' }}>{s.tier}</span></td>
                                                    <td style={{ color: 'var(--muted)' }}>{s.website ? <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Visit</a> : '—'}</td>
                                                    <td>{s.sort_order}</td>
                                                    <td><button className="ap-del" onClick={() => deleteSponsor(s.id)}>✕</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ─── HIRING APPLICATIONS ─── */}
                    {activeTab === 'hiring' && (() => {
                        const filtered = hiringApps.filter(a => {
                            if (!search) return true;
                            const s = search.toLowerCase();
                            return (a.name || '').toLowerCase().includes(s) ||
                                (a.email || '').toLowerCase().includes(s) ||
                                (a.role || '').toLowerCase().includes(s) ||
                                (a.branch || '').toLowerCase().includes(s) ||
                                (a.roll_no || '').toLowerCase().includes(s);
                        });
                        return (
                            <div className="ap-fade">
                                <div className="ap-sec-head">
                                    <div>
                                        <div className="ap-sec-title">{hiringApps.length} Applications</div>
                                        <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 2 }}>
                                            {hiringApps.filter(a => a.role === 'coordinator').length} coordinators · {hiringApps.filter(a => a.role === 'volunteer').length} volunteers
                                        </div>
                                    </div>
                                    <input className="ap-search" placeholder="Search by name, email, role, branch..." value={search} onChange={e => setSearch(e.target.value)} />
                                </div>
                                {loading ? (
                                    <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                                                <div className="ap-skel ap-skel-bar" style={{ width: '20%', opacity: 1 - i * 0.1 }} />
                                                <div className="ap-skel ap-skel-bar" style={{ width: '25%', opacity: 1 - i * 0.1 }} />
                                                <div className="ap-skel ap-skel-bar" style={{ width: '15%', opacity: 1 - i * 0.1 }} />
                                                <div className="ap-skel ap-skel-bar" style={{ width: '15%', opacity: 1 - i * 0.1 }} />
                                            </div>
                                        ))}
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">📋</div><h4>No hiring applications yet</h4></div></div>
                                ) : (
                                    <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                                        <div style={{ overflowX: 'auto' }}>
                                            <table className="ap-table">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Role</th>
                                                        <th>Email</th>
                                                        <th>Phone</th>
                                                        <th>Branch</th>
                                                        <th>Batch</th>
                                                        <th>Reg / Roll</th>
                                                        <th>Resume</th>
                                                        <th>Date</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filtered.map(a => (
                                                        <tr key={a.id}>
                                                            <td style={{ fontWeight: 600 }}>{a.name}</td>
                                                            <td>
                                                                <span style={{
                                                                    textTransform: 'capitalize',
                                                                    color: a.role === 'coordinator' ? '#c084fc' : '#22d3ee',
                                                                    background: a.role === 'coordinator' ? 'rgba(168,85,247,.1)' : 'rgba(6,182,212,.1)',
                                                                    padding: '2px 8px', borderRadius: 4, fontSize: '.72rem', fontWeight: 600,
                                                                    border: a.role === 'coordinator' ? '1px solid rgba(168,85,247,.2)' : '1px solid rgba(6,182,212,.2)',
                                                                }}>{a.role}</span>
                                                            </td>
                                                            <td style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{a.email}</td>
                                                            <td style={{ color: 'var(--muted)' }}>{a.phone}</td>
                                                            <td>{a.branch}</td>
                                                            <td>{a.batch}</td>
                                                            <td style={{ fontSize: '.78rem' }}>{a.reg_no} / {a.roll_no}</td>
                                                            <td>
                                                                {a.resume_url ? (
                                                                    <a href={a.resume_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '.78rem', fontWeight: 600 }}>View</a>
                                                                ) : '—'}
                                                            </td>
                                                            <td style={{ color: 'var(--muted)', fontSize: '.72rem', whiteSpace: 'nowrap' }}>
                                                                {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                                                            </td>
                                                            <td>
                                                                <div className="ap-actions">
                                                                    <button className="ap-del" onClick={() => deleteHiringApp(a.id)}>✕</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>
            </div>
        </>
    );
};

export default AdminPanel;
