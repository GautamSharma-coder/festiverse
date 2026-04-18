import React, { useState } from 'react';
import { apiFetch } from '../lib/api';

// Eye / Eye-off SVG icons
const EyeIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
const EyeOffIcon = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const InputField = ({ type = 'text', placeholder, value, onChange, onKeyDown, style = {}, ...rest }) => {
    const [focused, setFocused] = useState(false);
    const [visible, setVisible] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (visible ? 'text' : 'password') : type;

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${focused ? 'rgba(99,202,183,0.7)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px',
                    padding: isPassword ? '0.85rem 2.75rem 0.85rem 1rem' : '0.85rem 1rem',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '0.9rem',
                    fontFamily: "'DM Sans', sans-serif",
                    letterSpacing: '0.01em',
                    transition: 'border-color 0.25s, box-shadow 0.25s',
                    boxSizing: 'border-box',
                    boxShadow: focused ? '0 0 0 3px rgba(99,202,183,0.12)' : 'none',
                    ...style,
                }}
                {...rest}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setVisible(v => !v)}
                    tabIndex={-1}
                    style={{
                        position: 'absolute',
                        right: '0.85rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: visible ? '#63cab7' : 'rgba(255,255,255,0.3)',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#63cab7'}
                    onMouseLeave={e => e.currentTarget.style.color = visible ? '#63cab7' : 'rgba(255,255,255,0.3)'}
                    title={visible ? 'Hide password' : 'Show password'}
                >
                    {visible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            )}
        </div>
    );
};

const Btn = ({ onClick, disabled, loading, children, variant = 'primary' }) => {
    const [hovered, setHovered] = useState(false);
    const isPrimary = variant === 'primary';
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: '100%',
                background: isPrimary
                    ? (hovered && !disabled ? 'linear-gradient(135deg, #63cab7, #4db6a2)' : 'linear-gradient(135deg, #4db6a2, #3aa08e)')
                    : 'transparent',
                color: isPrimary ? '#0a1a16' : '#a0b8b2',
                fontWeight: isPrimary ? 700 : 500,
                fontSize: isPrimary ? '0.9rem' : '0.82rem',
                letterSpacing: isPrimary ? '0.05em' : '0.02em',
                padding: isPrimary ? '0.85rem' : '0.4rem',
                borderRadius: isPrimary ? '10px' : '0',
                cursor: disabled ? 'not-allowed' : 'pointer',
                border: 'none',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.6 : 1,
                fontFamily: "'DM Sans', sans-serif",
                textTransform: isPrimary ? 'uppercase' : 'none',
            }}
        >
            {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{
                        width: '14px', height: '14px',
                        border: '2px solid rgba(10,26,22,0.3)',
                        borderTopColor: '#0a1a16',
                        borderRadius: '50%',
                        display: 'inline-block',
                        animation: 'spin 0.7s linear infinite',
                    }} />
                    {children}
                </span>
            ) : children}
        </button>
    );
};

const LoginModal = ({ isOpen, onClose, onLogin }) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [view, setView] = useState('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');


    if (!isOpen) return null;

    // Phone: digits only, max 10
    const handlePhoneChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhone(digits);
    };

    const handleLogin = async () => {
        if (!phone || !password) return setError('Please enter both phone and password.');
        if (phone.length < 10) return setError('Phone number must be exactly 10 digits.');
        setLoading(true); setError(''); setSuccessMsg('');
        try {
            const data = await apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ phone, password }) });
            localStorage.setItem('festiverse_user', JSON.stringify(data.user));
            onLogin(data.user);
            handleClose();
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleSendOtp = async () => {
        if (!email) return setError('Please enter your registered email.');
        setLoading(true); setError(''); setSuccessMsg('');
        try {
            const data = await apiFetch('/api/auth/forgot-password-otp', { method: 'POST', body: JSON.stringify({ email }) });
            setSuccessMsg(data.message); setView('reset');
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) return setError('Please enter OTP and new password.');
        if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
        setLoading(true); setError(''); setSuccessMsg('');
        try {
            const data = await apiFetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email, otp, newPassword }) });
            setSuccessMsg(data.message); setView('login');
            setPhone(''); setPassword(''); setOtp(''); setNewPassword('');
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleClose = () => {
        setPhone(''); setPassword(''); setEmail(''); setOtp('');
        setNewPassword(''); setError(''); setSuccessMsg(''); setView('login');
        onClose();
    };

    const titles = { login: 'Welcome back', forgot: 'Reset access', reset: 'New password' };
    const subtitles = { login: 'Sign in to your account', forgot: "We'll send a one-time code", reset: `Code sent to ${email}` };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Syne:wght@700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes modalIn {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
                .otp-digit { transition: border-color 0.2s, box-shadow 0.2s; }
                .otp-digit:focus { outline: none; border-color: rgba(99,202,183,0.7) !important; box-shadow: 0 0 0 3px rgba(99,202,183,0.12); }
            `}</style>

            {/* Overlay */}
            <div style={{
                position: 'fixed', inset: 0, zIndex: 60,
                backgroundColor: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: 'overlayIn 0.2s ease',
            }} onClick={handleClose}>

                {/* Card */}
                <div
                    onClick={e => e.stopPropagation()}
                    style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '400px',
                        margin: '1rem',
                        background: 'linear-gradient(160deg, #0d1f1c 0%, #0a1510 100%)',
                        border: '1px solid rgba(99,202,183,0.18)',
                        borderRadius: '20px',
                        padding: '2.25rem 2rem',
                        boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,202,183,0.06) inset',
                        animation: 'modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1)',
                        fontFamily: "'DM Sans', sans-serif",
                        overflow: 'hidden',
                    }}
                >
                    {/* Glow blobs */}
                    <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(99,202,183,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-80px', left: '-40px', width: '220px', height: '220px', background: 'radial-gradient(circle, rgba(77,182,162,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                    {/* Close btn */}
                    <button
                        onClick={handleClose}
                        style={{
                            position: 'absolute', top: '1.1rem', right: '1.1rem',
                            width: '32px', height: '32px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px', cursor: 'pointer',
                            color: '#6b8f89', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s', fontSize: '16px', lineHeight: 1,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#6b8f89'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    >✕</button>

                    {/* Step dots */}
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '1.5rem' }}>
                        {['login', 'forgot', 'reset'].map(v => (
                            <div key={v} style={{
                                height: '3px',
                                width: view === v ? '20px' : '6px',
                                borderRadius: '999px',
                                background: view === v ? '#63cab7' : 'rgba(255,255,255,0.1)',
                                transition: 'all 0.3s ease',
                            }} />
                        ))}
                    </div>

                    {/* Header */}
                    <div style={{ marginBottom: '1.75rem' }}>
                        <h2 style={{ margin: '0 0 0.3rem', fontSize: '1.7rem', fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                            {titles[view]}
                        </h2>
                        <p style={{ margin: 0, color: '#5a8a82', fontSize: '0.85rem', fontWeight: 400 }}>
                            {subtitles[view]}
                        </p>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ff7b7b', fontSize: '0.8rem', marginBottom: '1rem', padding: '0.65rem 0.9rem', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)', borderRadius: '8px' }}>
                            <span style={{ fontSize: '14px' }}>⚠</span> {error}
                        </div>
                    )}
                    {successMsg && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#63cab7', fontSize: '0.8rem', marginBottom: '1rem', padding: '0.65rem 0.9rem', background: 'rgba(99,202,183,0.08)', border: '1px solid rgba(99,202,183,0.2)', borderRadius: '8px' }}>
                            <span style={{ fontSize: '14px' }}>✓</span> {successMsg}
                        </div>
                    )}

                    {/* Fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>

                        {view === 'login' && (<>
                            {/* Phone with digit counter */}
                            <div>
                                <InputField
                                    type="tel"
                                    placeholder="Phone number (10 digits)"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    inputMode="numeric"
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px', paddingRight: '2px' }}>
                                    <span style={{
                                        fontSize: '0.72rem',
                                        fontFamily: "'DM Sans', sans-serif",
                                        color: phone.length === 10 ? '#63cab7' : phone.length >= 7 ? '#f0a840' : 'rgba(255,255,255,0.22)',
                                        transition: 'color 0.2s',
                                    }}>

                                    </span>
                                </div>
                            </div>

                            {/* Password with show/hide (built into InputField) */}
                            <InputField
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => { setView('forgot'); setError(''); setSuccessMsg(''); }}
                                    style={{ background: 'none', border: 'none', color: '#63cab7', fontSize: '0.8rem', cursor: 'pointer', padding: 0, fontFamily: "'DM Sans', sans-serif" }}
                                    onMouseEnter={e => e.target.style.textDecoration = 'underline'}
                                    onMouseLeave={e => e.target.style.textDecoration = 'none'}
                                >
                                    Forgot password?
                                </button>
                            </div>

                            <div style={{ marginTop: '0.25rem' }}>
                                <Btn onClick={handleLogin} disabled={loading} loading={loading}>
                                    {loading ? 'Signing in…' : 'Sign In'}
                                </Btn>
                            </div>
                        </>)}

                        {view === 'forgot' && (<>
                            <InputField
                                type="email"
                                placeholder="Registered email address"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                            />
                            <Btn onClick={handleSendOtp} disabled={loading} loading={loading}>
                                {loading ? 'Sending code…' : 'Send Code'}
                            </Btn>
                            <Btn variant="secondary" onClick={() => { setView('login'); setError(''); setSuccessMsg(''); }}>
                                ← Back to sign in
                            </Btn>
                        </>)}

                        {view === 'reset' && (<>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                {[0, 1, 2, 3].map(i => (
                                    <input
                                        key={i}
                                        className="otp-digit"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={otp[i] || ''}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            const arr = otp.split('');
                                            arr[i] = val;
                                            const next = arr.join('').slice(0, 4);
                                            setOtp(next);
                                            if (val && i < 3) {
                                                const sibling = e.target.parentElement.children[i + 1];
                                                if (sibling) sibling.focus();
                                            }
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'Backspace' && !otp[i] && i > 0) {
                                                const sibling = e.target.parentElement.children[i - 1];
                                                if (sibling) sibling.focus();
                                            }
                                        }}
                                        style={{
                                            width: '56px', height: '60px',
                                            background: 'rgba(255,255,255,0.04)',
                                            border: `1px solid ${otp[i] ? 'rgba(99,202,183,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                            borderRadius: '10px',
                                            color: '#fff', fontSize: '1.4rem',
                                            fontFamily: "'Syne', sans-serif",
                                            fontWeight: 700,
                                            textAlign: 'center',
                                            caretColor: '#63cab7',
                                        }}
                                    />
                                ))}
                            </div>

                            <InputField
                                type="password"
                                placeholder="New password (min. 6 characters)"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
                            />
                            <Btn onClick={handleResetPassword} disabled={loading} loading={loading}>
                                {loading ? 'Updating…' : 'Update Password'}
                            </Btn>
                            <Btn variant="secondary" onClick={() => { setView('login'); setError(''); setSuccessMsg(''); setOtp(''); }}>
                                Cancel
                            </Btn>
                        </>)}

                    </div>

                    {/* Brand footer */}
                    <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#63cab7' }} />
                        <span style={{ color: '#2d5c54', fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>Festiverse</span>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#63cab7' }} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginModal;