import React, { useState, useRef } from 'react';
import { apiFetch } from '../lib/api';
import { biharEngineeringColleges } from '../lib/colleges';

/* ── tiny SVG icons ─────────────────────────────────────────── */
const Icon = ({ d, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} />
    </svg>
);
const EyeIcon = () => <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />;
const EyeOffIcon = () => (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);
const CheckIcon = () => <Icon d="M20 6L9 17l-5-5" />;
const UserIcon = () => <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
const MailIcon = () => <Icon d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" />;
const PhoneIcon = () => <Icon d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />;
const LockIcon = () => <Icon d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4" />;
const BuildingIcon = () => <Icon d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10" />;

/* ── Field wrapper ───────────────────────────────────────────── */
const Field = ({ label, icon, children, hint }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '0.72rem', fontFamily: "'Outfit', sans-serif",
            fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.38)',
        }}>
            <span style={{ color: '#f97316', opacity: 0.8 }}>{icon}</span>
            {label}
        </label>
        {children}
        {hint && <p style={{ margin: 0, fontSize: '0.72rem', color: 'rgba(255,255,255,0.22)', fontFamily: "'Outfit', sans-serif" }}>{hint}</p>}
    </div>
);

/* ── Text / tel / email input ────────────────────────────────── */
const Input = ({ type = 'text', value, onChange, onKeyDown, placeholder, required, minLength, inputMode, maxLength, rightEl, autoComplete }) => {
    const [focused, setFocused] = useState(false);
    const isPass = type === 'password';
    const [visible, setVisible] = useState(false);
    const resolvedType = isPass ? (visible ? 'text' : 'password') : type;

    return (
        <div style={{ position: 'relative' }}>
            <input
                type={resolvedType}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
                inputMode={inputMode}
                maxLength={maxLength}
                autoComplete={autoComplete}
                style={{
                    width: '100%', boxSizing: 'border-box',
                    background: focused ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${focused ? 'rgba(249,115,22,0.55)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '10px',
                    padding: isPass ? '0.8rem 2.8rem 0.8rem 1rem' : (rightEl ? '0.8rem 6rem 0.8rem 1rem' : '0.8rem 1rem'),
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontFamily: "'Outfit', sans-serif",
                    outline: 'none',
                    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                    boxShadow: focused ? '0 0 0 3px rgba(249,115,22,0.1)' : 'none',
                }}
            />
            {isPass && (
                <button type="button" tabIndex={-1} onClick={() => setVisible(v => !v)}
                    style={{
                        position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                        color: visible ? '#f97316' : 'rgba(255,255,255,0.28)',
                        display: 'flex', alignItems: 'center', transition: 'color 0.2s',
                    }}>
                    {visible ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            )}
            {rightEl && (
                <div style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)' }}>
                    {rightEl}
                </div>
            )}
        </div>
    );
};

/* ── Progress step bar ───────────────────────────────────────── */
const steps = ['Identity', 'Contact', 'Security'];
const StepBar = ({ current }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '2rem' }}>
        {steps.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
                <React.Fragment key={s}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: done ? '#f97316' : active ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
                            border: `2px solid ${done ? '#f97316' : active ? '#f97316' : 'rgba(255,255,255,0.1)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            color: done ? '#fff' : active ? '#f97316' : 'rgba(255,255,255,0.25)',
                            fontSize: '0.75rem', fontWeight: 700, fontFamily: "'Outfit', sans-serif",
                        }}>
                            {done ? <CheckIcon /> : i + 1}
                        </div>
                        <span style={{
                            fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase',
                            fontFamily: "'Outfit', sans-serif", fontWeight: 600,
                            color: active ? '#f97316' : done ? 'rgba(249,115,22,0.6)' : 'rgba(255,255,255,0.2)',
                            transition: 'color 0.3s',
                        }}>{s}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{
                            flex: 1, height: '2px', marginBottom: '16px',
                            background: done ? '#f97316' : 'rgba(255,255,255,0.08)',
                            transition: 'background 0.3s',
                        }} />
                    )}
                </React.Fragment>
            );
        })}
    </div>
);

/* ── Main Component ──────────────────────────────────────────── */
const RegistrationForm = ({ onRegister, showToast }) => {
    const [step, setStep] = useState(0);
    const [otpSent, setOtpSent] = useState(false);
    const [otpBtnText, setOtpBtnText] = useState('Send OTP');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [college, setCollege] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');
    const [statusType, setStatusType] = useState('');
    const otpRefs = useRef([]);

    const handlePhoneChange = (e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
        setPhone(digits);
    };

    const handleOtpChange = (val, i) => {
        const digit = val.replace(/\D/g, '').slice(-1);
        const next = [...otp]; next[i] = digit; setOtp(next);
        if (digit && i < 3) otpRefs.current[i + 1]?.focus();
    };
    const handleOtpKey = (e, i) => {
        if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
    };

    const sendOTP = async () => {
        if (!email) return showToast?.('Please enter your email address first.', 'warning');
        setOtpBtnText('...');
        try {
            await apiFetch('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ email }) });
            setStatusType('success'); setStatusMsg('OTP sent! Check your inbox.');
            setOtpSent(true); setOtpBtnText('Resend');
        } catch (err) {
            showToast?.(err.message, 'error'); setOtpBtnText('Send OTP');
        }
    };

    const nextStep = () => {
        if (step === 0 && (!name || !college)) { setStatusType('error'); setStatusMsg('Please fill in your name and college.'); return; }
        if (step === 1 && (!email || !otpSent)) { setStatusType('error'); setStatusMsg('Please verify your email with OTP.'); return; }
        setStatusMsg(''); setStep(s => s + 1);
    };
    const prevStep = () => { setStatusMsg(''); setStep(s => s - 1); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpStr = otp.join('');
        if (otpStr.length < 4) return setStatusMsg('Please enter the 4-digit OTP.');
        if (!phone || phone.length < 10) { setStatusType('error'); setStatusMsg('Enter a valid 10-digit phone number.'); return; }
        setLoading(true); setStatusType(''); setStatusMsg('Initiating secure payment...');

        try {
            const orderData = await apiFetch('/api/payment/create-order', { method: 'POST' });
            if (!orderData?.orderId) throw new Error('Unable to create payment session.');

            const options = {
                key: orderData.keyId, amount: orderData.amount, currency: orderData.currency,
                name: "Festiverse'26", description: 'Event Pass Fee', order_id: orderData.orderId,
                handler: async (response) => {
                    try {
                        setStatusMsg('Finishing registration...');
                        const data = await apiFetch('/api/auth/register', {
                            method: 'POST',
                            body: JSON.stringify({
                                name, college, email, phone, otp: otpStr, password,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });
                        setStatusType('success'); setStatusMsg(data.message);
                        if (data.user) { localStorage.setItem('festiverse_user', JSON.stringify(data.user)); onRegister?.(data.user); }
                    } catch (err) { setStatusType('error'); setStatusMsg(err.message); setLoading(false); }
                },
                prefill: { name, email, contact: phone },
                theme: { color: '#f97316' },
                modal: { ondismiss: () => { setStatusType('error'); setStatusMsg('Payment cancelled.'); setLoading(false); } },
            };
            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (r) => { setStatusType('error'); setStatusMsg('Payment failed: ' + r.error.description); setLoading(false); });
            rzp.open();
        } catch (err) { setStatusType('error'); setStatusMsg(err.message); setLoading(false); }
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Clash+Display:wght@600;700&display=swap');
                @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
                @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin { to { transform:rotate(360deg); } }
                @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.5;} }
                .rf-select option { background:#111; color:#fff; }
                .rf-otp:focus { border-color: rgba(249,115,22,0.7) !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.12) !important; }
                .rf-next:hover:not(:disabled) { background: rgba(249,115,22,0.18) !important; }
                .rf-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
                .rf-submit:active:not(:disabled) { transform: translateY(0); }
            `}</style>

            <div style={{
                background: 'linear-gradient(145deg, #0f0a00 0%, #130d02 60%, #0a0a0a 100%)',
                border: '1px solid rgba(249,115,22,0.18)',
                borderRadius: '20px',
                padding: '2.25rem 2rem',
                boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.06) inset',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: "'Outfit', sans-serif",
            }}>
                {/* Glow blobs */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '260px', height: '260px', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(234,88,12,0.07) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

                {/* Header */}
                <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ width: '3px', height: '28px', background: 'linear-gradient(180deg,#f97316,#ea580c)', borderRadius: '2px' }} />
                        <h2 style={{
                            margin: 0,
                            fontSize: '1.75rem',
                            fontFamily: "'Bebas Neue', sans-serif",
                            letterSpacing: '0.05em',
                            color: '#fff',
                            lineHeight: 1,
                        }}>
                            GET YOUR PASS
                        </h2>
                    </div>
                    <p style={{ margin: '0 0 0 11px', color: 'rgba(255,255,255,0.32)', fontSize: '0.82rem', fontWeight: 400 }}>
                        Festiverse'26 — complete the form below
                    </p>
                </div>

                <StepBar current={step} />

                {/* Status message */}
                {statusMsg && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '0.65rem 0.9rem', borderRadius: '10px',
                        marginBottom: '1.25rem',
                        background: statusType === 'success' ? 'rgba(34,197,94,0.08)' : statusType === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(249,115,22,0.08)',
                        border: `1px solid ${statusType === 'success' ? 'rgba(34,197,94,0.25)' : statusType === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(249,115,22,0.25)'}`,
                        color: statusType === 'success' ? '#4ade80' : statusType === 'error' ? '#f87171' : '#fb923c',
                        fontSize: '0.82rem', animation: 'fadeUp 0.2s ease',
                    }}>
                        <span>{statusType === 'success' ? '✓' : statusType === 'error' ? '⚠' : '○'}</span>
                        {statusMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* STEP 0 — Identity */}
                    {step === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeUp 0.25s ease' }}>
                            <Field label="Full Name" icon={<UserIcon />}>
                                <Input type="text" placeholder="Your full name" value={name}
                                    onChange={e => setName(e.target.value)} required autoComplete="name" />
                            </Field>
                            <Field label="College" icon={<BuildingIcon />}>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        className="rf-select"
                                        required
                                        value={college}
                                        onChange={e => setCollege(e.target.value)}
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '10px',
                                            padding: '0.8rem 1rem',
                                            color: college ? '#fff' : 'rgba(255,255,255,0.3)',
                                            fontSize: '0.9rem',
                                            fontFamily: "'Outfit', sans-serif",
                                            outline: 'none',
                                            cursor: 'pointer',
                                            appearance: 'none',
                                        }}
                                        onFocus={e => { e.target.style.borderColor = 'rgba(249,115,22,0.55)'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)'; e.target.style.background = 'rgba(255,255,255,0.06)'; }}
                                        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.03)'; }}
                                    >
                                        <option value="" disabled hidden>Select your college</option>
                                        {biharEngineeringColleges.map((c, i) => (
                                            <option key={i} value={c}>{c}</option>
                                        ))}
                                    </select>
                                    <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', pointerEvents: 'none', fontSize: '10px' }}>▼</span>
                                </div>
                            </Field>
                        </div>
                    )}

                    {/* STEP 1 — Contact */}
                    {step === 1 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeUp 0.25s ease' }}>
                            <Field label="Email Address" icon={<MailIcon />}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                                    <div style={{ flex: 1 }}>
                                        <Input type="email" placeholder="you@example.com" value={email}
                                            onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={sendOTP}
                                        style={{
                                            padding: '0 1rem',
                                            background: otpSent ? 'rgba(34,197,94,0.12)' : 'rgba(249,115,22,0.15)',
                                            border: `1px solid ${otpSent ? 'rgba(34,197,94,0.35)' : 'rgba(249,115,22,0.4)'}`,
                                            borderRadius: '10px',
                                            color: otpSent ? '#4ade80' : '#fb923c',
                                            fontSize: '0.75rem', fontWeight: 700,
                                            fontFamily: "'Outfit', sans-serif",
                                            letterSpacing: '0.06em', textTransform: 'uppercase',
                                            cursor: 'pointer', whiteSpace: 'nowrap',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        {otpBtnText === '...' ? (
                                            <span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                        ) : otpBtnText}
                                    </button>
                                </div>
                            </Field>

                            {otpSent && (
                                <Field label="Verification Code" icon={<MailIcon />} hint="4-digit code sent to your email">
                                    <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-start' }}>
                                        {otp.map((d, i) => (
                                            <input
                                                key={i}
                                                ref={el => otpRefs.current[i] = el}
                                                className="rf-otp"
                                                type="text" inputMode="numeric" maxLength={1}
                                                value={d}
                                                onChange={e => handleOtpChange(e.target.value, i)}
                                                onKeyDown={e => handleOtpKey(e, i)}
                                                style={{
                                                    width: '52px', height: '56px',
                                                    background: d ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.03)',
                                                    border: `1px solid ${d ? 'rgba(249,115,22,0.45)' : 'rgba(255,255,255,0.1)'}`,
                                                    borderRadius: '10px',
                                                    color: '#fff', fontSize: '1.3rem',
                                                    fontFamily: "'Bebas Neue', sans-serif",
                                                    textAlign: 'center', outline: 'none',
                                                    caretColor: '#f97316',
                                                    transition: 'border-color 0.2s, background 0.2s',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </Field>
                            )}
                        </div>
                    )}

                    {/* STEP 2 — Security */}
                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeUp 0.25s ease' }}>
                            <Field label="Phone Number" icon={<PhoneIcon />} hint={`${phone.length}/10 digits`}>
                                <Input type="tel" placeholder="10-digit mobile number"
                                    value={phone} onChange={handlePhoneChange}
                                    inputMode="numeric" maxLength={10} required />
                            </Field>
                            <Field label="Create Password" icon={<LockIcon />} hint="Minimum 6 characters">
                                <Input type="password" placeholder="Choose a strong password"
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    required minLength={6} autoComplete="new-password" />
                            </Field>

                            {/* Summary card */}
                            <div style={{
                                background: 'rgba(249,115,22,0.05)',
                                border: '1px solid rgba(249,115,22,0.15)',
                                borderRadius: '12px', padding: '1rem',
                                display: 'flex', flexDirection: 'column', gap: '6px',
                            }}>
                                <p style={{ margin: 0, fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(249,115,22,0.6)', fontWeight: 600 }}>Registration Summary</p>
                                {[['Name', name], ['College', college], ['Email', email]].map(([k, v]) => (
                                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{k}</span>
                                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{v || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.75rem' }}>
                        {step > 0 && (
                            <button type="button" onClick={prevStep}
                                className="rf-next"
                                style={{
                                    flex: 1, padding: '0.85rem',
                                    background: 'rgba(255,255,255,0.04)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '10px', color: 'rgba(255,255,255,0.5)',
                                    fontSize: '0.85rem', fontWeight: 600,
                                    fontFamily: "'Outfit', sans-serif",
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}>
                                ← Back
                            </button>
                        )}
                        {step < 2 ? (
                            <button type="button" onClick={nextStep}
                                style={{
                                    flex: 2, padding: '0.85rem',
                                    background: 'linear-gradient(135deg, rgba(249,115,22,0.9), rgba(234,88,12,0.9))',
                                    border: 'none', borderRadius: '10px',
                                    color: '#fff', fontSize: '0.85rem', fontWeight: 700,
                                    fontFamily: "'Outfit', sans-serif",
                                    letterSpacing: '0.04em',
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                                onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                            >
                                Continue →
                            </button>
                        ) : (
                            <button type="submit" disabled={loading}
                                className="rf-submit"
                                style={{
                                    flex: 2, padding: '0.9rem',
                                    background: loading ? 'rgba(249,115,22,0.4)' : 'linear-gradient(135deg, #f97316, #ea580c)',
                                    border: 'none', borderRadius: '10px',
                                    color: '#fff', fontSize: '0.85rem', fontWeight: 700,
                                    fontFamily: "'Outfit', sans-serif",
                                    letterSpacing: '0.04em', textTransform: 'uppercase',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                }}>
                                {loading ? (
                                    <>
                                        <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                                        Processing…
                                    </>
                                ) : '🎟 Complete & Pay'}
                            </button>
                        )}
                    </div>
                </form>

                {/* Footer */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        🔒 Secured by Razorpay
                    </span>
                    <span style={{ color: 'rgba(255,255,255,0.08)' }}>·</span>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                        Festiverse
                    </span>
                </div>
            </div>
        </>
    );
};

export default RegistrationForm;