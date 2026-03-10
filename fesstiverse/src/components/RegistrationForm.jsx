import React, { useState } from 'react';
import { apiFetch } from '../lib/api';
import { biharEngineeringColleges } from '../lib/colleges';

const RegistrationForm = ({ onRegister, showToast }) => {
    const [otpSent, setOtpSent] = useState(false);
    const [otpBtnText, setOtpBtnText] = useState('Send OTP');
    const [otp, setOtp] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [college, setCollege] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    const sendOTP = async () => {
        if (!email) return showToast?.('Please enter your email address first.', 'warning');
        setOtpBtnText('Sending...');
        try {
            await apiFetch('/api/auth/send-otp', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
            setStatusMsg('✉️ OTP sent to your email! Check your inbox.');
            setOtpSent(true);
            setOtpBtnText('Resend');
        } catch (err) {
            showToast?.(err.message, 'error');
            setOtpBtnText('Send OTP');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otp) return showToast?.('Please enter the OTP.', 'warning');
        setLoading(true);
        setStatusMsg('Initiating secure payment...');
        try {
            // STEP 1: Create Razorpay Order
            const orderData = await apiFetch('/api/payment/create-order', {
                method: 'POST',
            });

            if (!orderData || !orderData.orderId) {
                throw new Error("Unable to create payment session.");
            }

            // STEP 2: Open Razorpay Checkout
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Festiverse'26",
                description: "Event Pass Fee",
                order_id: orderData.orderId,
                handler: async function (response) {
                    try {
                        setStatusMsg('Finishing registration...');
                        // STEP 3: Register and verify signature
                        const data = await apiFetch('/api/auth/register', {
                            method: 'POST',
                            body: JSON.stringify({
                                name, college, email, phone, otp, password,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature
                            }),
                        });

                        setStatusMsg('✅ ' + data.message);
                        if (data.user) {
                            localStorage.setItem('festiverse_user', JSON.stringify(data.user));
                            if (onRegister) onRegister(data.user);
                        }
                    } catch (err) {
                        setStatusMsg('❌ ' + err.message);
                        setLoading(false);
                    }
                },
                prefill: {
                    name: name,
                    email: email,
                    contact: phone
                },
                theme: {
                    color: "#9333ea"
                },
                modal: {
                    ondismiss: function () {
                        setStatusMsg('❌ Payment cancelled.');
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                setStatusMsg('❌ Payment failed processing: ' + response.error.description);
                setLoading(false);
            });
            rzp.open();

        } catch (err) {
            setStatusMsg('❌ ' + err.message);
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        color: '#fff',
        outline: 'none',
        fontSize: '0.875rem',
    };

    const labelStyle = {
        fontSize: '0.75rem',
        color: '#c4b5fd',
        display: 'block',
        marginBottom: '0.25rem',
    };

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 0 30px rgba(124, 58, 237, 0.1)',
        }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>
                Get Your Pass
            </h2>

            {statusMsg && (
                <div style={{ padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', color: statusMsg.startsWith('✅') ? '#4ade80' : '#f87171', fontSize: '0.875rem' }}>
                    {statusMsg}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Full Name</label>
                        <input type="text" required style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label style={labelStyle}>College Name</label>
                        <select required style={inputStyle} value={college} onChange={(e) => setCollege(e.target.value)}>
                            <option value="" disabled hidden>Select your college</option>
                            {biharEngineeringColleges.map((c, i) => (
                                <option key={i} value={c} style={{ background: '#000', color: '#fff' }}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Email Address</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="email" required style={{ ...inputStyle, flex: 1 }} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
                        <button
                            type="button"
                            onClick={sendOTP}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(88, 28, 135, 0.5)',
                                border: '1px solid rgba(168, 85, 247, 0.5)',
                                borderRadius: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#67e8f9',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {otpBtnText}
                        </button>
                    </div>
                </div>

                {otpSent && (
                    <div>
                        <label style={labelStyle}>Enter OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            style={inputStyle}
                            placeholder="4-digit code from your email"
                        />
                    </div>
                )}

                <div>
                    <label style={labelStyle}>Create Password</label>
                    <input type="password" required style={inputStyle} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" minLength={6} />
                </div>

                <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input type="tel" required style={inputStyle} value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        background: 'linear-gradient(to right, #9333ea, #06b6d4)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        border: 'none',
                        opacity: loading ? 0.6 : 1,
                        transition: 'opacity 0.2s',
                    }}
                >
                    {loading ? 'Registering...' : 'Complete Registration'}
                </button>
            </form>
        </div>
    );
};

export default RegistrationForm;
