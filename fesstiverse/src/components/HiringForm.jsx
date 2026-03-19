import React, { useState, useRef, useEffect } from 'react';

const C = {
    black: '#0a0a0a',
    ink: '#1a1a1a',
    stone: '#6b6b6b',
    muted: '#9b9b9b',
    border: '#e4e4e4',
    surface: '#f7f7f7',
    white: '#ffffff',
    accent: '#2563eb',
    accentL: '#eff4ff',
    error: '#dc2626',
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function useToast() {
    const [toasts, setToasts] = useState([]);
    const show = (msg, type = 'success') => {
        const id = Date.now();
        setToasts(p => [...p, { id, msg, type }]);
        setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200);
    };
    return { toasts, show };
}

const Toasts = ({ toasts }) => (
    <div style={{ position: 'fixed', top: 16, right: 16, left: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
        {toasts.map(t => (
            <div key={t.id} style={{
                padding: '10px 14px',
                background: C.white,
                border: `1px solid ${t.type === 'success' ? C.border : '#fecaca'}`,
                borderLeft: `3px solid ${t.type === 'success' ? C.accent : C.error}`,
                borderRadius: 6, fontSize: 13, color: C.ink,
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                animation: 'toastIn 0.22s ease forwards',
                maxWidth: 360, marginLeft: 'auto', pointerEvents: 'auto',
            }}>
                <span style={{ color: t.type === 'success' ? C.accent : C.error, marginRight: 7, fontSize: 11 }}>
                    {t.type === 'success' ? '✓' : '×'}
                </span>
                {t.msg}
            </div>
        ))}
    </div>
);

// ── Field ─────────────────────────────────────────────────────────────────────
const Field = ({ label, required = true, value, onChange, placeholder, type = 'text' }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 11, fontWeight: 500, color: C.stone, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                {label}{required && <span style={{ color: C.error, marginLeft: 2 }}>*</span>}
            </label>
            <input
                type={type} value={value} onChange={onChange} placeholder={placeholder}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{
                    padding: '11px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1.5px solid ${focused ? C.accent : C.border}`,
                    fontSize: 15, color: C.ink,
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    width: '100%', boxSizing: 'border-box',
                    fontFamily: "'DM Sans', sans-serif",
                    WebkitAppearance: 'none',
                    borderRadius: 0,
                }}
            />
        </div>
    );
};

// ── BranchSelect ──────────────────────────────────────────────────────────────
const BRANCHES = [
    { id: 'cse-cyber', label: 'CSE', sub: 'Cybersecurity' },
    { id: 'cse-aiml', label: 'CSE', sub: 'AI / ML' },
    { id: 'ee', label: 'EE', sub: 'Electrical Engineering' },
    { id: 'ece', label: 'ECE', sub: 'Electronics & Comm.' },
    { id: 'civil', label: 'Civil', sub: 'Civil Engineering' },
    { id: 'mech', label: 'Mechanical', sub: 'Mechanical Engineering' },
];

const BranchSelect = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const selected = BRANCHES.find(b => b.id === value);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }} ref={ref}>
            <label style={{ fontSize: 11, fontWeight: 500, color: C.stone, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                Branch<span style={{ color: C.error, marginLeft: 2 }}>*</span>
            </label>

            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1.5px solid ${open ? C.accent : value ? C.border : C.border}`,
                    fontSize: 15, color: selected ? C.ink : '#c8c8c8',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'border-color 0.15s',
                    outline: 'none',
                }}
            >
                <span>
                    {selected
                        ? <><strong style={{ fontWeight: 500 }}>{selected.label}</strong> <span style={{ color: C.stone, fontSize: 13.5 }}>({selected.sub})</span></>
                        : 'Select branch'}
                </span>
                {/* Chevron */}
                <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: 'absolute', zIndex: 100,
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    boxShadow: '0 8px 28px rgba(0,0,0,0.09)',
                    overflow: 'hidden',
                    marginTop: 2,
                    width: '100%',
                    animation: 'fadeUp 0.16s ease both',
                }}>
                    {BRANCHES.map((b, i) => {
                        const active = value === b.id;
                        return (
                            <button
                                key={b.id}
                                type="button"
                                onClick={() => { onChange(b.id); setOpen(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    width: '100%', padding: '11px 14px',
                                    background: active ? C.accentL : 'transparent',
                                    border: 'none',
                                    borderBottom: i < BRANCHES.length - 1 ? `1px solid ${C.border}` : 'none',
                                    cursor: 'pointer', textAlign: 'left',
                                    fontFamily: "'DM Sans', sans-serif",
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.surface; }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <div>
                                    <span style={{ fontSize: 14, fontWeight: 500, color: active ? C.accent : C.ink }}>
                                        {b.label}
                                    </span>
                                    <span style={{ fontSize: 12.5, color: C.stone, marginLeft: 7 }}>{b.sub}</span>
                                </div>
                                {active && (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ── BatchSelect ───────────────────────────────────────────────────────────────
const BATCHES = [
    { id: '2024', label: '2024' },
    { id: '2025', label: '2025' }
];

const BatchSelect = ({ value, onChange }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        if (!open) return;
        const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const selected = BATCHES.find(b => b.id === value);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }} ref={ref}>
            <label style={{ fontSize: 11, fontWeight: 500, color: C.stone, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                Batch year<span style={{ color: C.error, marginLeft: 2 }}>*</span>
            </label>

            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '11px 0',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `1.5px solid ${open ? C.accent : value ? C.border : C.border}`,
                    fontSize: 15, color: selected ? C.ink : '#c8c8c8',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                    fontFamily: "'DM Sans', sans-serif",
                    transition: 'border-color 0.15s',
                    outline: 'none',
                }}
            >
                <span>
                    {selected ? <strong style={{ fontWeight: 500 }}>{selected.label}</strong> : 'Select batch'}
                </span>
                <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <div style={{
                    position: 'absolute', zIndex: 100,
                    background: C.white,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    boxShadow: '0 8px 28px rgba(0,0,0,0.09)',
                    overflow: 'hidden',
                    marginTop: 2,
                    width: '100%',
                    animation: 'fadeUp 0.16s ease both',
                }}>
                    {BATCHES.map((b, i) => {
                        const active = value === b.id;
                        return (
                            <button
                                key={b.id}
                                type="button"
                                onClick={() => { onChange(b.id); setOpen(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    width: '100%', padding: '11px 14px',
                                    background: active ? C.accentL : 'transparent',
                                    border: 'none',
                                    borderBottom: i < BATCHES.length - 1 ? `1px solid ${C.border}` : 'none',
                                    cursor: 'pointer', textAlign: 'left',
                                    fontFamily: "'DM Sans', sans-serif",
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => { if (!active) e.currentTarget.style.background = C.surface; }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                            >
                                <span style={{ fontSize: 14, fontWeight: 500, color: active ? C.accent : C.ink }}>
                                    {b.label}
                                </span>
                                {active && (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// ── useBreakpoint ─────────────────────────────────────────────────────────────
function useBreakpoint() {
    const [mobile, setMobile] = useState(() =>
        typeof window !== 'undefined' ? window.innerWidth <= 680 : false
    );
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 680px)');
        const update = () => setMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);
    return { mobile };
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HiringForm({ onBack }) {
    const { toasts, show } = useToast();
    const [step, setStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', phone: '', reg: '', roll: '', branch: '', batch: '', role: '', file: null, fname: ''
    });
    const fileRef = useRef();
    const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const { mobile } = useBreakpoint();

    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap';
        document.head.appendChild(link);
        const style = document.createElement('style');
        style.innerHTML = `
      *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
      html { -webkit-text-size-adjust:100%; }
      @keyframes toastIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
      @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      .step-anim { animation: fadeUp 0.28s ease both; }
      input::placeholder { color:#c8c8c8 !important; }
    `;
        document.head.appendChild(style);
        return () => { document.head.removeChild(link); document.head.removeChild(style); };
    }, []);

    const acceptFile = f => {
        if (!f) return;
        if (f.size > 10 * 1024 * 1024) { show('File exceeds 10 MB', 'error'); return; }
        const ok = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!ok.includes(f.type) && !f.name.match(/\.(pdf|doc|docx)$/i)) { show('PDF, DOC or DOCX only', 'error'); return; }
        set('file', f); set('fname', f.name);
    };

    const next = () => {
        if (step === 1 && !form.role) { show('Please select a role', 'error'); return; }
        if (step === 2) {
            for (const k of ['name', 'email', 'phone', 'reg', 'roll', 'branch', 'batch'])
                if (!(form[k] || '').trim()) { show(`Please fill in ${k === 'reg' ? 'registration number' : k}`, 'error'); return; }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { show('Enter a valid email address', 'error'); return; }
            if (!/^\d{10}$/.test(form.phone.replace(/\D/g, ''))) { show('Enter a valid 10-digit phone number', 'error'); return; }
        }
        setStep(s => s + 1);
    };

    const submit = async () => {
        if (!form.file) { show('Please upload your resume', 'error'); return; }
        setSubmitting(true);
        try {
            const body = new FormData();
            Object.entries(form).forEach(([k, v]) => {
                if (!v) return;
                if (k === 'branch') {
                    const b = BRANCHES.find(b => b.id === v);
                    body.append(k, b ? `${b.label} (${b.sub})` : v);
                } else {
                    body.append(k, v);
                }
            });
            const url = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:3000';
            const res = await fetch(`${url}/api/hiring/submit`, { method: 'POST', body });
            if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Submission failed'); }
            setSubmitted(true);
        } catch (e) { show(e.message || 'Something went wrong', 'error'); }
        finally { setSubmitting(false); }
    };

    const F = { fontFamily: "'DM Sans', sans-serif" };
    const steps = [{ n: 1, label: 'Role' }, { n: 2, label: 'Details' }, { n: 3, label: 'Resume' }];

    // ── Success ───────────────────────────────────────────────────────────────
    if (submitted) return (
        <div style={{ ...F, minHeight: '100vh', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
            <Toasts toasts={toasts} />
            <div style={{ maxWidth: 400, width: '100%', animation: 'fadeUp 0.4s ease forwards' }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17, color: C.white, marginBottom: 28,
                }}>✓</div>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
                    Application submitted
                </p>
                <h2 style={{ fontSize: mobile ? 26 : 32, fontWeight: 600, color: C.black, lineHeight: 1.2, marginBottom: 14 }}>
                    Welcome, {form.name.split(' ')[0]}.
                </h2>
                <p style={{ fontSize: 14.5, color: C.stone, lineHeight: 1.75, marginBottom: 36 }}>
                    You've applied as{' '}
                    <strong style={{ color: C.ink, textTransform: 'capitalize' }}>{form.role}</strong>{' '}
                    for Festiverse '26. We'll be in touch at{' '}
                    <span style={{ color: C.accent, wordBreak: 'break-all' }}>{form.email}</span>.
                </p>
                <button
                    onClick={() => { if (onBack) onBack(); else window.location.href = '/'; }}
                    style={{
                        ...F, background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 6,
                        padding: '12px 22px', fontSize: 14, fontWeight: 500, color: C.stone, cursor: 'pointer',
                        transition: 'all 0.15s', width: mobile ? '100%' : 'auto', minHeight: 44,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = C.ink; e.currentTarget.style.color = C.ink; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.stone; }}
                >← Return home</button>
            </div>
        </div>
    );

    return (
        <div style={{ ...F, minHeight: '100vh', background: C.white, display: 'flex', flexDirection: mobile ? 'column' : 'row' }}>
            <Toasts toasts={toasts} />

            {/* ── MOBILE: top bar ── */}
            {mobile ? (
                <div style={{
                    background: C.white,
                    borderBottom: `1px solid ${C.border}`,
                    padding: '18px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'sticky', top: 0, zIndex: 20,
                }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 600, color: C.black }}>
                        UDAAN-Recruitment
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {steps.map((s, i) => {
                            const done = step > s.n, active = step === s.n;
                            return (
                                <React.Fragment key={s.n}>
                                    <div style={{
                                        width: 28, height: 28, borderRadius: '50%',
                                        background: done ? C.black : active ? C.accent : 'transparent',
                                        border: `1.5px solid ${done ? C.black : active ? C.accent : C.border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 12, fontWeight: 600, color: done || active ? C.white : C.muted,
                                        transition: 'all 0.2s',
                                    }}>{done ? '✓' : s.n}</div>
                                    {i < steps.length - 1 && (
                                        <div style={{ width: 14, height: 1.5, background: step > s.n ? C.black : C.border, transition: 'background 0.3s' }} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            ) : (
                /* ── DESKTOP: left sidebar ── */
                <div style={{
                    width: 260, minHeight: '100vh', padding: '52px 36px',
                    borderRight: `1px solid ${C.border}`,
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
                }}>
                    <div>
                        <div style={{ marginBottom: 56 }}>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, fontWeight: 600, color: C.black }}>
                                UDAAN-Recruitment
                            </span>
                            <div style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Hiring '26</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {steps.map((s, i) => {
                                const done = step > s.n, active = step === s.n;
                                return (
                                    <div key={s.n} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24, flexShrink: 0 }}>
                                            <div style={{
                                                width: 24, height: 24, borderRadius: '50%',
                                                background: done ? C.black : active ? C.accent : 'transparent',
                                                border: `1.5px solid ${done ? C.black : active ? C.accent : C.border}`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 11, color: C.white, fontWeight: 700,
                                                transition: 'all 0.2s', marginTop: 1,
                                            }}>{done && '✓'}</div>
                                            {i < steps.length - 1 && (
                                                <div style={{ width: 1.5, height: 42, background: done ? C.black : C.border, transition: 'background 0.3s', marginTop: 6 }} />
                                            )}
                                        </div>
                                        <div style={{ paddingBottom: i < steps.length - 1 ? 42 : 0 }}>
                                            <div style={{
                                                fontSize: 17, fontWeight: active ? 500 : 400,
                                                color: active ? C.ink : done ? C.stone : C.muted,
                                                transition: 'color 0.2s', marginTop: 1,
                                            }}>{s.label}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7 }}>
                        Closes <span style={{ color: C.stone, fontWeight: 500 }}>March 31, 2026</span>
                    </p>
                </div>
            )}

            {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
            <div style={{
                flex: 1,
                display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
                padding: mobile ? '32px 20px 72px' : '72px 60px 80px',
            }}>
                <div style={{ width: '100%', maxWidth: mobile ? '100%' : 480 }} key={step} className="step-anim">

                    {/* Progress bar */}
                    <div style={{ height: 1.5, background: C.border, marginBottom: mobile ? 32 : 52, borderRadius: 2 }}>
                        <div style={{
                            height: '100%', background: C.accent,
                            width: `${(step / 3) * 100}%`,
                            transition: 'width 0.45s ease', borderRadius: 2,
                        }} />
                    </div>

                    {/* ── STEP 1 ── */}
                    {step === 1 && (
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                                Step 1 of 3
                            </p>
                            <h2 style={{ fontSize: mobile ? 23 : 28, fontWeight: 600, color: C.black, lineHeight: 1.2, marginBottom: 8 }}>
                                Choose your role
                            </h2>
                            <p style={{ fontSize: 14, color: C.stone, lineHeight: 1.7, marginBottom: 28 }}>
                                Pick the position that fits your availability and skills.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {[
                                    { id: 'coordinator', title: 'Coordinator', desc: '' },
                                    { id: 'volunteer', title: 'Volunteer', desc: '' },
                                ].map(role => {
                                    const active = form.role === role.id;
                                    return (
                                        <button key={role.id} onClick={() => set('role', role.id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                padding: mobile ? '15px 15px' : '18px 20px',
                                                background: active ? C.accentL : C.surface,
                                                border: `1.5px solid ${active ? C.accent : C.border}`,
                                                borderRadius: 8, cursor: 'pointer', textAlign: 'left',
                                                transition: 'all 0.15s', width: '100%', minHeight: 44,
                                            }}
                                            onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = C.stone; }}
                                            onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = C.border; }}
                                        >
                                            <div style={{ flex: 1, paddingRight: 12 }}>
                                                <div style={{ fontSize: 15, fontWeight: 500, color: active ? C.accent : C.ink, marginBottom: 3 }}>
                                                    {role.title}
                                                </div>
                                                <div style={{ fontSize: 13, color: C.stone, lineHeight: 1.55 }}>{role.desc}</div>
                                            </div>
                                            <div style={{
                                                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                                                border: `1.5px solid ${active ? C.accent : C.border}`,
                                                background: active ? C.accent : 'transparent',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 9, color: C.white, transition: 'all 0.15s',
                                            }}>{active && '✓'}</div>
                                        </button>
                                    );
                                })}
                            </div>

                            <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.7, marginTop: 16 }}>
                                Coordinators must be available from February onwards.
                            </p>
                        </div>
                    )}

                    {/* ── STEP 2 ── */}
                    {step === 2 && (
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                                Step 2 of 3
                            </p>
                            <h2 style={{ fontSize: mobile ? 23 : 28, fontWeight: 600, color: C.black, lineHeight: 1.2, marginBottom: 8 }}>
                                Your details
                            </h2>
                            <p style={{ fontSize: 14, color: C.stone, lineHeight: 1.7, marginBottom: 28 }}>
                                We'll use this to contact you after reviewing applications.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
                                <Field label="Full name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Anjali Sharma" />

                                <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: mobile ? 22 : 18 }}>
                                    <Field label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" />
                                    <Field label="Phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="9876543210" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: mobile ? 22 : 18 }}>
                                    <Field label="Registration no." value={form.reg} onChange={e => set('reg', e.target.value)} placeholder="12345678" />
                                    <Field label="Roll no." value={form.roll} onChange={e => set('roll', e.target.value.toUpperCase())} placeholder="S24CS01" />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: mobile ? 22 : 18 }}>
                                    <div style={{ position: 'relative' }}>
                                        <BranchSelect value={form.branch} onChange={v => set('branch', v)} />
                                    </div>
                                    <div style={{ position: 'relative' }}>
                                        <BatchSelect value={form.batch} onChange={v => set('batch', v)} />
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                                padding: '7px 12px', borderRadius: 5,
                                background: C.surface, border: `1px solid ${C.border}`,
                                fontSize: 12.5, color: C.stone,
                            }}>
                                Applying as{' '}
                                <strong style={{ color: C.ink, textTransform: 'capitalize' }}>{form.role}</strong>
                                <span style={{ color: C.border }}>·</span>
                                <button onClick={() => setStep(1)} style={{
                                    background: 'none', border: 'none', color: C.accent, fontSize: 12.5,
                                    cursor: 'pointer', fontFamily: 'inherit', padding: 0,
                                }}>Change</button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3 ── */}
                    {step === 3 && (
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>
                                Step 3 of 3
                            </p>
                            <h2 style={{ fontSize: mobile ? 23 : 28, fontWeight: 600, color: C.black, lineHeight: 1.2, marginBottom: 8 }}>
                                Almost done
                            </h2>
                            <p style={{ fontSize: 14, color: C.stone, lineHeight: 1.7, marginBottom: 28 }}>
                                Upload your resume and confirm before submitting.
                            </p>

                            {/* Upload */}
                            <div style={{ marginBottom: 28 }}>
                                <label style={{ fontSize: 11, fontWeight: 500, color: C.stone, letterSpacing: '0.07em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                                    Resume <span style={{ color: C.error }}>*</span>
                                </label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={e => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files[0]); }}
                                    style={{
                                        border: `1.5px dashed ${dragging ? C.accent : form.fname ? C.black : C.border}`,
                                        background: form.fname ? C.surface : 'transparent',
                                        borderRadius: 8,
                                        padding: mobile ? '22px 16px' : '28px 24px',
                                        textAlign: 'center', cursor: 'pointer',
                                        transition: 'all 0.15s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        minHeight: 80,
                                    }}
                                >
                                    {form.fname ? (
                                        <div>
                                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 12.5, color: C.ink, marginBottom: 4, wordBreak: 'break-all' }}>
                                                {form.fname}
                                            </div>
                                            <div style={{ fontSize: 12, color: C.muted }}>{mobile ? 'Tap' : 'Click'} to replace</div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div style={{ fontSize: 13.5, color: dragging ? C.accent : C.stone, marginBottom: 4, fontWeight: 500 }}>
                                                {dragging ? 'Drop here' : mobile ? 'Tap to upload' : 'Click to upload or drag & drop'}
                                            </div>
                                            <div style={{ fontSize: 12, color: C.muted }}>PDF, DOC, DOCX · max 10 MB</div>
                                        </div>
                                    )}
                                </div>
                                <input type="file" ref={fileRef} accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={e => acceptFile(e.target.files[0])} />
                            </div>

                            {/* Summary */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{ fontSize: 11, fontWeight: 500, color: C.stone, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                                        Summary
                                    </span>
                                    <button onClick={() => setStep(2)} style={{
                                        background: 'none', border: 'none', fontSize: 12.5,
                                        cursor: 'pointer', color: C.accent, padding: 0, fontFamily: 'inherit',
                                    }}>Edit</button>
                                </div>
                                <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
                                    {[
                                        ['Role', form.role],
                                        ['Name', form.name],
                                        ['Email', form.email],
                                        ['Phone', form.phone],
                                        ['Branch', BRANCHES.find(b => b.id === form.branch) ? `${BRANCHES.find(b => b.id === form.branch).label} (${BRANCHES.find(b => b.id === form.branch).sub})` : ''],
                                        ['Reg / Roll', `${form.reg} / ${form.roll}`],
                                    ].map(([label, value], i, arr) => (
                                        <div key={label} style={{
                                            display: 'flex', alignItems: 'baseline', gap: 12,
                                            padding: mobile ? '10px 13px' : '11px 16px',
                                            borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                                        }}>
                                            <span style={{
                                                fontSize: 10.5, fontWeight: 500, color: C.muted,
                                                letterSpacing: '0.06em', textTransform: 'uppercase',
                                                width: mobile ? 56 : 70, flexShrink: 0,
                                            }}>{label}</span>
                                            <span style={{
                                                fontSize: mobile ? 12.5 : 13.5,
                                                color: value ? C.ink : C.border,
                                                textTransform: label === 'Email' || label === 'Reg / Roll' ? 'none' : 'capitalize',
                                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                fontFamily: label === 'Email' ? "'DM Mono', monospace" : 'inherit',
                                                minWidth: 0,
                                            }}>{value || '—'}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Navigation ── */}
                    <div style={{
                        marginTop: 32,
                        display: 'flex', alignItems: 'center',
                        justifyContent: step > 1 ? 'space-between' : 'flex-end',
                        gap: 12,
                    }}>
                        {step > 1 && (
                            <button onClick={() => setStep(s => s - 1)} disabled={submitting}
                                style={{
                                    ...F, background: 'transparent', border: 'none',
                                    fontSize: 14, fontWeight: 400, color: C.stone,
                                    cursor: 'pointer', transition: 'color 0.15s', padding: '11px 0',
                                    minHeight: 44, minWidth: 60,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = C.ink; }}
                                onMouseLeave={e => { e.currentTarget.style.color = C.stone; }}
                            >← Back</button>
                        )}

                        {step < 3 ? (
                            <button onClick={next}
                                style={{
                                    ...F, background: C.black, border: 'none', borderRadius: 6,
                                    padding: '12px 28px', fontSize: 14, fontWeight: 500, color: C.white,
                                    cursor: 'pointer', transition: 'opacity 0.15s',
                                    minHeight: 44,
                                    ...(mobile && step === 1 ? { flex: 1 } : {}),
                                }}
                                onMouseEnter={e => { e.currentTarget.style.opacity = '0.78'; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                            >Continue →</button>
                        ) : (
                            <button onClick={submit} disabled={submitting}
                                style={{
                                    ...F,
                                    background: submitting ? C.surface : C.accent,
                                    border: `1.5px solid ${submitting ? C.border : 'transparent'}`,
                                    borderRadius: 6, padding: '12px 26px', fontSize: 14, fontWeight: 500,
                                    color: submitting ? C.muted : C.white,
                                    cursor: submitting ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.15s',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    minHeight: 44,
                                    ...(mobile ? { flex: 1, justifyContent: 'center' } : {}),
                                }}
                                onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.88'; }}
                                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                            >
                                {submitting ? (
                                    <>
                                        <svg style={{ animation: 'spin 0.9s linear infinite', width: 13, height: 13, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                        </svg>
                                        Submitting…
                                    </>
                                ) : 'Submit application →'}
                            </button>
                        )}
                    </div>

                    {/* Deadline — mobile footer */}
                    {mobile && (
                        <p style={{ fontSize: 11.5, color: C.muted, textAlign: 'center', marginTop: 28, lineHeight: 1.6 }}>
                            Applications close{' '}
                            <span style={{ color: C.stone, fontWeight: 500 }}>March 31, 2026</span>
                        </p>
                    )}

                </div>
            </div>
        </div>
    );
}