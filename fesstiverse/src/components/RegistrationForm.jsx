import React, { useState } from 'react';

const RegistrationForm = () => {
    const [otpSent, setOtpSent] = useState(false);
    const [otpBtnText, setOtpBtnText] = useState('Send OTP');
    const [otp, setOtp] = useState('');

    const sendOTP = () => {
        setOtpBtnText('Sending...');
        setTimeout(() => {
            alert('Your OTP is: 1234');
            setOtpSent(true);
            setOtpBtnText('Resend');
        }, 1000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (otp === '1234') {
            alert('Registration Successful! Please Login to select events.');
            e.target.reset();
            setOtpSent(false);
            setOtpBtnText('Send OTP');
            setOtp('');
            window.scrollTo(0, 0);
        } else {
            alert('Invalid OTP. Try 1234');
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
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div>
                        <label style={labelStyle}>Full Name</label>
                        <input type="text" required style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>College Name</label>
                        <input type="text" required style={inputStyle} />
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Email Address</label>
                    <input type="email" required style={inputStyle} />
                </div>

                <div>
                    <label style={labelStyle}>Phone Number</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="tel" required style={{ ...inputStyle, flex: 1 }} />
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
                        />
                    </div>
                )}

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        background: 'linear-gradient(to right, #9333ea, #06b6d4)',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        border: 'none',
                        opacity: 1,
                        transition: 'opacity 0.2s',
                    }}
                >
                    Complete Registration
                </button>
            </form>
        </div>
    );
};

export default RegistrationForm;
