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
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{
                background: '#18181b',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                padding: '2rem',
                borderRadius: '1rem',
                width: '100%',
                maxWidth: '28rem',
                margin: '1rem',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}>
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        color: '#71717a',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#71717a'}
                >
                    <iconify-icon icon="solar:close-circle-linear" width="24"></iconify-icon>
                </button>
                <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '0.5rem',
                }}>Login</h3>

                {error && (
                    <div style={{ color: '#f87171', fontSize: '0.8125rem', marginBottom: '0.75rem', padding: '0.5rem', background: 'rgba(248,113,113,0.1)', borderRadius: '0.25rem' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Registered Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        style={{
                            width: '100%',
                            background: '#000',
                            border: '1px solid #3f3f46',
                            borderRadius: '0.25rem',
                            padding: '0.75rem',
                            color: '#fff',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = '#22d3ee')}
                        onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        style={{
                            width: '100%',
                            background: '#000',
                            border: '1px solid #3f3f46',
                            borderRadius: '0.25rem',
                            padding: '0.75rem',
                            color: '#fff',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#22d3ee'}
                        onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                    />

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        style={{
                            width: '100%',
                            backgroundColor: loading ? '#065f73' : '#0891b2',
                            color: '#000',
                            fontWeight: 700,
                            padding: '0.75rem',
                            borderRadius: '0.25rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            border: 'none',
                            transition: 'background-color 0.2s',
                        }}
                        onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#06b6d4')}
                        onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#0891b2')}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;

