import React, { useState } from 'react';
import { apiFetch } from '../lib/api';

const LoginModal = ({ isOpen, onClose, onLogin, showToast }) => {
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1 = enter phone, 2 = enter OTP
    const [maskedEmail, setMaskedEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSendOTP = async () => {
        if (!phone) return setError('Please enter your phone number.');
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ phone }),
            });
            setMaskedEmail(data.emailMasked || '');
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) return setError('Please enter the OTP.');
        setLoading(true);
        setError('');
        try {
            const data = await apiFetch('/api/auth/verify-login', {
                method: 'POST',
                body: JSON.stringify({ phone, otp }),
            });
            localStorage.setItem('festiverse_token', data.token);
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
        setOtp('');
        setStep(1);
        setMaskedEmail('');
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

                {step === 2 && maskedEmail && (
                    <p style={{ color: '#a1a1aa', fontSize: '0.8125rem', marginBottom: '1rem' }}>
                        OTP sent to <span style={{ color: '#22d3ee', fontWeight: 600 }}>{maskedEmail}</span>
                    </p>
                )}

                {error && (
                    <div style={{ color: '#f87171', fontSize: '0.8125rem', marginBottom: '0.75rem', padding: '0.5rem', background: 'rgba(248,113,113,0.1)', borderRadius: '0.25rem' }}>
                        {error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Step 1: Phone number */}
                    <input
                        type="text"
                        placeholder="Registered Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (step === 1 ? handleSendOTP() : handleVerifyOTP())}
                        disabled={step === 2}
                        style={{
                            width: '100%',
                            background: step === 2 ? '#1a1a1e' : '#000',
                            border: '1px solid #3f3f46',
                            borderRadius: '0.25rem',
                            padding: '0.75rem',
                            color: step === 2 ? '#71717a' : '#fff',
                            outline: 'none',
                            transition: 'border-color 0.2s',
                        }}
                        onFocus={(e) => step === 1 && (e.target.style.borderColor = '#22d3ee')}
                        onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                    />

                    {/* Step 2: OTP input */}
                    {step === 2 && (
                        <input
                            type="text"
                            placeholder="Enter 4-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerifyOTP()}
                            autoFocus
                            style={{
                                width: '100%',
                                background: '#000',
                                border: '1px solid #3f3f46',
                                borderRadius: '0.25rem',
                                padding: '0.75rem',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '1.25rem',
                                letterSpacing: '0.3em',
                                textAlign: 'center',
                                transition: 'border-color 0.2s',
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#22d3ee'}
                            onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
                        />
                    )}

                    <button
                        onClick={step === 1 ? handleSendOTP : handleVerifyOTP}
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
                        {loading
                            ? (step === 1 ? 'Sending OTP...' : 'Verifying...')
                            : (step === 1 ? 'Send OTP' : 'Verify & Login')
                        }
                    </button>

                    {step === 2 && (
                        <button
                            onClick={() => { setStep(1); setOtp(''); setError(''); }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#a1a1aa',
                                fontSize: '0.8125rem',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: '0',
                            }}
                        >
                            ← Change phone number
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginModal;

