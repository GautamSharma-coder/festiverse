import React, { useState } from 'react';
import { apiFetch } from '../lib/api';

const LoginModal = ({ isOpen, onClose, onLogin, showToast }) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleLogin = async () => {
        if (!phone || !password) return setError('Please enter both phone and password.');
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ phone, password }),
            });
            localStorage.setItem('festiverse_user', JSON.stringify(data.user));
            onLogin(data.user);
            handleClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setPhone('');
        setPassword('');
        setError('');
        onClose();
    };

    return (
        <>
            <style>{`
                @keyframes badgeDrop {
                    0% { transform: translateY(-60px); opacity: 0; }
                    60% { transform: translateY(10px); opacity: 1; }
                    80% { transform: translateY(-4px); }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes lanyardSwing {
                    0%   { transform: rotate(-4deg); }
                    50%  { transform: rotate(4deg); }
                    100% { transform: rotate(-4deg); }
                }
                .badge-card {
                    animation: badgeDrop 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                .lanyard-strap {
                    animation: lanyardSwing 3s ease-in-out infinite;
                    transform-origin: top center;
                }
                .login-input {
                    width: 100%;
                    background: #2a2a2e;
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 0.6rem;
                    padding: 0.8rem 1rem;
                    color: #fff;
                    font-size: 0.875rem;
                    outline: none;
                    box-sizing: border-box;
                    transition: border-color 0.2s, background 0.2s;
                }
                .login-input::placeholder { color: #52525b; }
                .login-input:focus {
                    border-color: rgba(168, 85, 247, 0.6);
                    background: #1f1f23;
                }
                .login-btn {
                    width: 100%;
                    padding: 0.85rem;
                    border-radius: 0.6rem;
                    border: none;
                    font-weight: 700;
                    font-size: 0.95rem;
                    cursor: pointer;
                    letter-spacing: 0.03em;
                    background: linear-gradient(135deg, #7c3aed, #a855f7);
                    color: #fff;
                    transition: opacity 0.2s, transform 0.1s;
                    box-shadow: 0 4px 20px rgba(124, 58, 237, 0.4);
                }
                .login-btn:hover:not(:disabled) {
                    opacity: 0.9;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 24px rgba(124, 58, 237, 0.55);
                }
                .login-btn:active:not(:disabled) { transform: translateY(0); }
                .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .close-btn {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 50%;
                    width: 2rem;
                    height: 2rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    color: #71717a;
                    transition: background 0.2s, color 0.2s;
                    flex-shrink: 0;
                }
                .close-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
            `}</style>

            {/* Backdrop */}
            <div
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 60,
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(6px)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    paddingTop: '3rem',
                }}
            >
                {/* Wrapper — stop click propagation */}
                <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                    {/* Lanyard strap */}
                    <div className="lanyard-strap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Strap body */}
                        <div style={{
                            width: '2.8rem',
                            height: '5rem',
                            background: 'linear-gradient(180deg, #6d28d9 0%, #7c3aed 40%, #5b21b6 100%)',
                            borderRadius: '0.2rem 0.2rem 0 0',
                            position: 'relative',
                            boxShadow: '2px 0 8px rgba(0,0,0,0.4), -2px 0 8px rgba(0,0,0,0.4)',
                        }}>
                            {/* Strap sheen */}
                            <div style={{
                                position: 'absolute',
                                left: '30%',
                                top: 0,
                                width: '25%',
                                height: '100%',
                                background: 'rgba(255,255,255,0.12)',
                                borderRadius: '0 0.1rem 0.1rem 0',
                            }} />
                        </div>
                        {/* Clip notch */}
                        <div style={{
                            width: '1.6rem',
                            height: '0.7rem',
                            background: '#3f3f46',
                            borderRadius: '0 0 0.3rem 0.3rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderTop: 'none',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                        }} />
                    </div>

                    {/* Badge Card */}
                    <div
                        className="badge-card"
                        style={{
                            background: '#1c1c1f',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: '1.25rem',
                            width: '100%',
                            maxWidth: '22rem',
                            margin: '0 1rem',
                            padding: '2rem 1.75rem 1.75rem',
                            boxShadow: '0 32px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,85,247,0.08)',
                            position: 'relative',
                        }}
                    >
                        {/* Top bar accent */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '40%',
                            height: '2px',
                            background: 'linear-gradient(90deg, transparent, #7c3aed, transparent)',
                            borderRadius: '0 0 2px 2px',
                        }} />

                        {/* Header row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.2 }}>
                                    Welcome back
                                </h3>
                                <p style={{ color: '#71717a', fontSize: '0.8rem', margin: '0.35rem 0 0', lineHeight: 1.4 }}>
                                    Sign in to your Festiverse'26 account
                                </p>
                            </div>
                            <button className="close-btn" onClick={handleClose}>
                                <iconify-icon icon="solar:close-linear" width="16"></iconify-icon>
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                color: '#f87171',
                                fontSize: '0.8rem',
                                marginBottom: '1rem',
                                padding: '0.6rem 0.75rem',
                                background: 'rgba(248,113,113,0.08)',
                                border: '1px solid rgba(248,113,113,0.2)',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                            }}>
                                <iconify-icon icon="solar:danger-triangle-linear" width="14"></iconify-icon>
                                {error}
                            </div>
                        )}

                        {/* Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <input
                                className="login-input"
                                type="text"
                                placeholder="Phone Number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                            <input
                                className="login-input"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />

                            <button
                                className="login-btn"
                                onClick={handleLogin}
                                disabled={loading}
                                style={{ marginTop: '0.25rem' }}
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </div>

                        {/* Footer */}
                        <p style={{
                            textAlign: 'center',
                            color: '#3f3f46',
                            fontSize: '0.7rem',
                            marginTop: '1.25rem',
                            marginBottom: 0,
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                        }}>
                            GEC Samastipur · Festiverse'26
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoginModal;