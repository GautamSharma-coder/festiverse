import React, { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { biharEngineeringColleges } from '../lib/colleges';

/* ── LAZY RAZORPAY LOADER ──────────────────────────────────── */
const loadRazorpay = () => {
    return new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve(window.Razorpay);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            if (window.Razorpay) resolve(window.Razorpay);
            else reject(new Error('Razorpay SDK failed to load.'));
        };
        script.onerror = () => reject(new Error('Failed to load payment gateway. Check your network.'));
        document.body.appendChild(script);
    });
};

/* ── INPUT SANITIZER (XSS Prevention) ───────────────────────── */
const sanitizeInput = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '');
};

/* ── ICONS ─────────────────────────────────────────────────── */
const StepIcon = ({ icon, active, done }) => (
    <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: done ? '#ffb300' : active ? 'rgba(255, 179, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${done || active ? '#ffb300' : 'rgba(255, 255, 255, 0.1)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: done ? '#000' : active ? '#ffb300' : '#444',
        transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
        boxShadow: active ? '0 0 20px rgba(255, 179, 0, 0.2)' : 'none'
    }}>
        <iconify-icon icon={done ? 'solar:check-read-bold' : icon} width="22" />
    </div>
);

/* ── UI COMPONENTS ─────────────────────────────────────────── */
const Field = ({ label, icon, children, hint, error }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: '#888'
        }}>
            <iconify-icon icon={icon} style={{ color: '#ffb300' }} />
            {label}
        </label>
        {children}
        {hint && <span style={{ fontSize: '0.7rem', color: '#555', fontWeight: 500 }}>{hint}</span>}
        {error && <span style={{ fontSize: '0.7rem', color: '#ff4b4b', fontWeight: 600 }}>{error}</span>}
    </div>
);

const Input = ({ ...props }) => (
    <input
        {...props}
        style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            color: '#fff',
            fontSize: '1rem',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'all 0.3s ease'
        }}
        onFocus={(e) => {
            e.target.style.background = 'rgba(255, 179, 0, 0.05)';
            e.target.style.borderColor = '#ffb300';
            e.target.style.boxShadow = '0 0 0 4px rgba(255, 179, 0, 0.1)';
        }}
        onBlur={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.03)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.target.style.boxShadow = 'none';
        }}
    />
);

/* ── MAIN FORM COMPONENT ────────────────────────────────────── */
const RegistrationForm = ({ onRegister, showToast }) => {
    const [step, setStep] = useState(0); // 0: Category, 1: Details, 2: Verification
    const [category, setCategory] = useState(null); // 'INTERNAL' or 'EXTERNAL'
    const [stepMounted, setStepMounted] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        college: '',
        password: '',
        tShirtSize: ''
    });

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpSent, setOtpSent] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false); // Double-submit prevention
    const [status, setStatus] = useState({ msg: '', type: '' });

    const formRef = useRef(null);
    const otpRefs = useRef([]);

    // Category Prices
    const PRICES = {
        INTERNAL: import.meta.env.VITE_INTERNAL_PRICE || 349,
        EXTERNAL: import.meta.env.VITE_EXTERNAL_PRICE || 699
    };

    const HOST_COLLEGE = import.meta.env.VITE_HOST_COLLEGE_NAME || "Government Engineering College (GEC), Samastipur";

    const updateForm = (field, val) => {
        // Sanitize text inputs (not password)
        const sanitized = field === 'password' ? val : sanitizeInput(val);
        setFormData(prev => ({ ...prev, [field]: sanitized }));
    };

    const selectCategory = (type) => {
        setCategory(type);
        if (type === 'INTERNAL') {
            updateForm('college', HOST_COLLEGE);
        } else {
            updateForm('college', '');
        }
        setStep(1);
    };

    const sendOTP = async () => {
        if (!formData.email) return showToast?.('Email is required for verification.', 'warning');
        setLoading(true);
        setStatus({ msg: 'Sending code...', type: '' });
        try {
            await apiFetch('/api/auth/send-otp', {
                method: 'POST',
                body: JSON.stringify({ email: formData.email })
            });
            setOtpSent(true);
            setStatus({ msg: 'OTP sent! Please check your inbox.', type: 'success' });
        } catch (err) {
            setStatus({ msg: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        const otpStr = otp.join('');
        if (otpStr.length < 6) return setStatus({ msg: 'Enter the 6-digit code.', type: 'error' });

        setLoading(true);
        setStatus({ msg: 'Verifying code...', type: '' });
        try {
            await apiFetch('/api/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ email: formData.email, otp: otpStr })
            });
            setIsVerified(true);
            setStatus({ msg: 'Email verified successfully!', type: 'success' });
        } catch (err) {
            setStatus({ msg: err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (step === 1) {
            const { name, email, phone, college, password, tShirtSize } = formData;
            if (!name || !email || !phone || !college || !password || !tShirtSize) {
                return setStatus({ msg: 'Please complete all fields.', type: 'error' });
            }
            // Validate name doesn't contain injection attempts
            if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) {
                return setStatus({ msg: 'Name contains invalid characters.', type: 'error' });
            }
            if (name.trim().length < 2) return setStatus({ msg: 'Name must be at least 2 characters.', type: 'error' });
            if (name.length > 100) return setStatus({ msg: 'Name is too long (max 100 chars).', type: 'error' });
            if (!/^[6-9]\d{9}$/.test(phone)) return setStatus({ msg: 'Valid 10-digit Indian phone number required.', type: 'error' });
            if (password.length < 10) return setStatus({ msg: 'Password must be at least 10 chars.', type: 'error' });
            if (password.length > 128) return setStatus({ msg: 'Password is too long.', type: 'error' });

            // Strict email format check matching backend
            if (!email.toLowerCase().endsWith('@gmail.com') || email.includes('+')) {
                return setStatus({ msg: 'Only standard Gmail addresses (@gmail.com) without aliases are accepted.', type: 'error' });
            }

            // SECURITY: Ensure Internal category has the correct college
            if (category === 'INTERNAL' && college !== HOST_COLLEGE) {
                return setStatus({ msg: `Internal registrations are only for ${HOST_COLLEGE} students.`, type: 'error' });
            }

            setStep(2);
            setStatus({ msg: '', type: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitted || loading) return; // Prevent double submission
        const otpStr = otp.join('');
        if (otpStr.length < 6) return setStatus({ msg: 'Enter the 6-digit code.', type: 'error' });

        setLoading(true);
        setSubmitted(true);
        setStatus({ msg: 'Initializing secure transaction...', type: '' });

        try {
            // Include category and userData in order creation for webhook support
            const orderData = await apiFetch('/api/payment/create-order', {
                method: 'POST',
                body: JSON.stringify({
                    category,
                    userData: formData // Pass full form data to be saved as "pending"
                })
            });

            if (!orderData?.orderId) throw new Error('Order creation failed.');

            setStatus({ msg: 'Loading payment gateway...', type: '' });

            const RazorpaySDK = await loadRazorpay();

            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Festiverse'26",
                description: `${category === 'INTERNAL' ? 'GEC Internal' : 'Inter-College'} Pass`,
                order_id: orderData.orderId,
                handler: async (paymentRes) => {
                    try {
                        setStatus({ msg: 'Finalizing registration...', type: '' });
                        const regRes = await apiFetch('/api/auth/register', {
                            method: 'POST',
                            body: JSON.stringify({
                                ...formData,
                                otp: otpStr,
                                razorpay_payment_id: paymentRes.razorpay_payment_id,
                                razorpay_order_id: paymentRes.razorpay_order_id,
                                razorpay_signature: paymentRes.razorpay_signature,
                            }),
                        });

                        if (regRes.user) {
                            localStorage.setItem('festiverse_user', JSON.stringify(regRes.user));
                            setStatus({ msg: 'Welcome to Festiverse!', type: 'success' });
                            setTimeout(() => onRegister?.(regRes.user), 1500);
                        }
                    } catch (err) {
                        setStatus({ msg: err.message, type: 'error' });
                        setLoading(false);
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: { color: '#ffb300' },
                modal: { ondismiss: () => { setLoading(false); setSubmitted(false); setStatus({ msg: 'Payment cancelled.', type: 'error' }); } }
            };

            const rzp = new RazorpaySDK(options);
            rzp.open();
        } catch (err) {
            setStatus({ msg: err.message, type: 'error' });
            setLoading(false);
            setSubmitted(false);
        }
    };

    // CSS-based entrance animation (replaces gsap.fromTo)
    useEffect(() => {
        setStepMounted(false);
        const raf = requestAnimationFrame(() => setStepMounted(true));
        return () => cancelAnimationFrame(raf);
    }, [step]);

    return (
        <div style={{ padding: '2.5rem' }}>
            {/* Step Progress Indicators */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '3rem',
                position: 'relative'
            }}>
                <div style={{ position: 'absolute', top: '20px', left: '10%', right: '10%', height: '1px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />

                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <StepIcon icon="solar:user-bold" active={step === 0} done={step > 0} />
                    <span style={{ display: 'block', marginTop: '8px', fontSize: '0.6rem', fontWeight: 800, color: step >= 0 ? '#ffb300' : '#444' }}>CATEGORY</span>
                </div>
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <StepIcon icon="solar:document-bold" active={step === 1} done={step > 1} />
                    <span style={{ display: 'block', marginTop: '8px', fontSize: '0.6rem', fontWeight: 800, color: step >= 1 ? '#ffb300' : '#444' }}>DETAILS</span>
                </div>
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    <StepIcon icon="solar:shield-check-bold" active={step === 2} done={step > 2} />
                    <span style={{ display: 'block', marginTop: '8px', fontSize: '0.6rem', fontWeight: 800, color: step >= 2 ? '#ffb300' : '#444' }}>VERIFY</span>
                </div>
            </div>

            {/* ERROR/SUCCESS MESSAGES */}
            {status.msg && (
                <div style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    background: status.type === 'success' ? 'rgba(0, 255, 127, 0.1)' : status.type === 'error' ? 'rgba(255, 75, 75, 0.1)' : 'rgba(255, 179, 0, 0.1)',
                    border: `1px solid ${status.type === 'success' ? '#00ffa4' : status.type === 'error' ? '#ff4b4b' : '#ffb300'}`,
                    color: status.type === 'success' ? '#00ffa4' : status.type === 'error' ? '#ff4b4b' : '#ffb300',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <iconify-icon icon={status.type === 'error' ? 'solar:danger-bold' : 'solar:info-circle-bold'} width="20" />
                    {status.msg}
                </div>
            )}

            <div ref={formRef} style={{
                opacity: stepMounted ? 1 : 0,
                transform: stepMounted ? 'scale(1)' : 'scale(0.98)',
                transition: 'opacity 0.5s cubic-bezier(0.33, 1, 0.68, 1), transform 0.5s cubic-bezier(0.33, 1, 0.68, 1)',
            }}>
                {/* STEP 0: Category Selection */}
                {step === 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '1rem' }}>WHO ARE YOU?</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <button
                                onClick={() => selectCategory('INTERNAL')}
                                style={{
                                    padding: '2rem 1.5rem',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 179, 0, 0.2)',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 179, 0, 0.05)'; e.currentTarget.style.borderColor = '#ffb300'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'rgba(255, 179, 0, 0.2)'; }}
                            >
                                <iconify-icon icon="solar:home-bold" width="32" style={{ color: '#ffb300' }} />
                                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>GEC STUDENT</span>
                                <span style={{ fontSize: '0.75rem', color: '#ffb300', fontWeight: 700 }}>₹{PRICES.INTERNAL} Only</span>
                            </button>

                            <button
                                onClick={() => selectCategory('EXTERNAL')}
                                style={{
                                    padding: '2rem 1.5rem',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                            >
                                <iconify-icon icon="solar:globus-bold" width="32" style={{ color: '#fff' }} />
                                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>INTER-COLLEGE</span>
                                <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 700 }}>₹{PRICES.EXTERNAL} Pass</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 1: Details */}
                {step === 1 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Field label="Full Name" icon="solar:user-bold">
                                <Input placeholder="Enter your name" value={formData.name} maxLength={100} onChange={e => updateForm('name', e.target.value)} />
                            </Field>
                            <Field label="Phone No." icon="solar:phone-bold">
                                <Input placeholder="10 Digits" type="tel" maxLength={10} value={formData.phone} onChange={e => updateForm('phone', e.target.value.replace(/\D/g, ''))} />
                            </Field>
                        </div>

                        <Field label="College" icon="solar:buildings-bold">
                            {category === 'INTERNAL' ? (
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    background: 'rgba(255, 179, 0, 0.05)',
                                    border: '1px solid #ffb300',
                                    borderRadius: '12px',
                                    color: '#ffb300',
                                    fontSize: '0.9rem',
                                    fontWeight: 700,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <iconify-icon icon="solar:verified-check-bold" />
                                    GEC SAMASTIPUR (Internal Pass)
                                </div>
                            ) : (
                                <select
                                    value={formData.college}
                                    onChange={e => updateForm('college', e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '12px',
                                        padding: '1rem 1.25rem',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        appearance: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="" disabled style={{ background: '#111' }}>Select College</option>
                                    {biharEngineeringColleges
                                        .filter(c => c !== HOST_COLLEGE)
                                        .map((c, i) => (
                                            <option key={i} value={c} style={{ background: '#111' }}>{c}</option>
                                        ))}
                                </select>
                            )}
                        </Field>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <Field label="Email ID" icon="solar:letter-bold">
                                <Input placeholder="university@email.com" type="email" maxLength={254} value={formData.email} onChange={e => updateForm('email', e.target.value)} />
                            </Field>

                            <Field label="T-Shirt Size" icon="solar:shirt-bold">
                                <select
                                    value={formData.tShirtSize}
                                    onChange={e => updateForm('tShirtSize', e.target.value)}
                                    style={{
                                        width: '100%',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '12px',
                                        padding: '1rem 1.25rem',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        outline: 'none',
                                        appearance: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="" disabled style={{ background: '#111' }}>Select Size</option>
                                    <option value="S" style={{ background: '#111' }}>Small (S)</option>
                                    <option value="M" style={{ background: '#111' }}>Medium (M)</option>
                                    <option value="L" style={{ background: '#111' }}>Large (L)</option>
                                    <option value="XL" style={{ background: '#111' }}>X-Large (XL)</option>
                                    <option value="XXL" style={{ background: '#111' }}>XX-Large (XXL)</option>
                                    <option value="XXXL" style={{ background: '#111' }}>XXX-Large (XXXL)</option>
                                </select>
                            </Field>
                        </div>

                        <Field label="Password" icon="solar:lock-bold">
                            <Input placeholder="Min 10 characters" type="password" maxLength={128} value={formData.password} onChange={e => updateForm('password', e.target.value)} />
                        </Field>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={() => setStep(0)} style={{ flex: 1, padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#888', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>BACK</button>
                            <button onClick={handleNext} style={{ flex: 2, padding: '1rem', border: 'none', background: 'linear-gradient(90deg, #ffb300, #ff8f00)', color: '#000', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 5px 15px rgba(255, 179, 0, 0.3)' }}>NEXT STEP</button>
                        </div>
                    </div>
                )}

                {/* STEP 2: Verification */}
                {step === 2 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <div style={{ textAlign: 'center' }}>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>VERIFY YOUR EMAIL</h4>
                            <p style={{ fontSize: '0.875rem', color: '#888' }}>We've sent a 6-digit code to <br /><b style={{ color: '#ffb300' }}>{formData.email}</b></p>
                        </div>

                        {!otpSent ? (
                            <button
                                onClick={sendOTP}
                                disabled={loading}
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '16px',
                                    border: '1px solid #ffb300',
                                    background: 'rgba(255, 179, 0, 0.05)',
                                    color: '#ffb300',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px'
                                }}
                            >
                                {loading && <iconify-icon icon="line-md:loading-twotone-loop" />}
                                SEND VERIFICATION CODE
                            </button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={el => otpRefs.current[i] = el}
                                            type="text"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                const newOtp = [...otp];
                                                newOtp[i] = val;
                                                setOtp(newOtp);
                                                if (val && i < 5) otpRefs.current[i + 1].focus();
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1].focus();
                                            }}
                                            style={{
                                                width: '50px',
                                                height: '60px',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: digit ? '2px solid #ffb300' : '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                color: '#fff',
                                                fontSize: '1.5rem',
                                                fontWeight: 900,
                                                textAlign: 'center',
                                                outline: 'none',
                                                transition: 'all 0.2s'
                                            }}
                                        />
                                    ))}
                                </div>

                                {isVerified && (
                                    <div style={{
                                        padding: '0.75rem',
                                        borderRadius: '12px',
                                        background: 'rgba(0, 255, 127, 0.1)',
                                        border: '1px solid #00ffa4',
                                        color: '#00ffa4',
                                        fontSize: '0.8rem',
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px'
                                    }}>
                                        <iconify-icon icon="solar:verified-check-bold" />
                                        EMAIL VERIFIED
                                    </div>
                                )}

                                <div style={{ background: 'rgba(255, 179, 0, 0.05)', border: '1px solid rgba(255, 179, 0, 0.1)', borderRadius: '16px', padding: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 700 }}>PAYMENT TOTAL</span>
                                        <span style={{ fontSize: '1rem', fontWeight: 900, color: '#ffb300' }}>₹{PRICES[category]}</span>
                                    </div>
                                    <p style={{ fontSize: '0.65rem', color: '#555', margin: 0 }}>* Includes All Events, Food, Merch, and Campus Access.</p>
                                </div>

                                <button
                                    onClick={isVerified ? handleSubmit : verifyOTP}
                                    disabled={loading}
                                    style={{
                                        padding: '1.25rem',
                                        borderRadius: '16px',
                                        background: isVerified ? 'linear-gradient(90deg, #ffb300, #ff8f00)' : 'rgba(255, 179, 0, 0.1)',
                                        border: isVerified ? 'none' : '1px solid #ffb300',
                                        color: isVerified ? '#000' : '#ffb300',
                                        fontSize: '1rem',
                                        fontWeight: 900,
                                        cursor: 'pointer',
                                        boxShadow: isVerified ? '0 10px 30px rgba(255, 179, 0, 0.2)' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '12px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {loading ? <iconify-icon icon="line-md:loading-twotone-loop" /> : isVerified ? <iconify-icon icon="solar:shield-keyhole-bold" /> : <iconify-icon icon="solar:check-read-bold" />}
                                    {isVerified ? 'COMPLETE PAYMENT & REGISTER' : 'VERIFY CODE'}
                                </button>

                                <button onClick={() => setOtpSent(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 700 }}>Didn't get the code? Resend Email</button>
                            </div>
                        )}
                        <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#555', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 700 }}>‹ Back to Details</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegistrationForm;
