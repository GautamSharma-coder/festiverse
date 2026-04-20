import React, { useState } from 'react';
import { ScrollReveal } from './ScrollReveal';
import RegistrationForm from './RegistrationForm';

const RegistrationPage = ({ onRegister, showToast, onClose }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#050505',
            backgroundImage: `
                radial-gradient(circle at 10% 20%, rgba(255, 179, 0, 0.05), transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(249, 115, 22, 0.05), transparent 40%),
                linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 100%, 50px 50px, 50px 50px',
            color: '#fff',
            fontFamily: "'Space Grotesk', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflowX: 'hidden'
        }}>
            {/* Top Bar Navigation */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                padding: '1.5rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(5, 5, 5, 0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 179, 0, 0.1)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                }} onClick={onClose}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: '#ffb300',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(255, 179, 0, 0.3)'
                    }}>
                        <iconify-icon icon="solar:ticket-bold" width="20" style={{ color: '#000' }} />
                    </div>
                    <span style={{
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        letterSpacing: '2px',
                        textTransform: 'uppercase'
                    }}>
                        FESTI<span style={{ color: '#ffb300' }}>VERSE</span>'26
                    </span>
                </div>

                <button
                    onClick={onClose}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        padding: '10px 24px',
                        borderRadius: '9999px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: isHovered ? 'rgba(255, 179, 0, 0.1)' : 'transparent',
                        color: isHovered ? '#ffb300' : '#888',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <iconify-icon icon="solar:close-circle-bold" width="18" />
                    CLOSE
                </button>
            </header>

            {/* Main Content Area */}
            <main style={{
                flex: 1,
                paddingTop: '100px',
                paddingBottom: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto',
                px: '2rem'
            }}>
                
                {/* Title & Badge */}
                <ScrollReveal>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'rgba(255, 179, 0, 0.1)',
                            border: '1px solid rgba(255, 179, 0, 0.2)',
                            padding: '6px 16px',
                            borderRadius: '9999px',
                            marginBottom: '1.5rem'
                        }}>
                            <span style={{
                                width: '6px',
                                height: '6px',
                                background: '#ffb300',
                                borderRadius: '50%',
                                boxShadow: '0 0 10px #ffb300'
                            }} />
                            <span style={{
                                fontSize: '0.75rem',
                                color: '#ffb300',
                                fontWeight: 800,
                                letterSpacing: '2.5px',
                                textTransform: 'uppercase'
                            }}>
                                Registration Portal
                            </span>
                        </div>
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                            fontWeight: 900,
                            lineHeight: 1,
                            marginBottom: '1rem',
                            textTransform: 'uppercase'
                        }}>
                            SECURE YOUR <span style={{ color: '#ffb300' }}>SPOT</span>
                        </h1>
                        <p style={{
                            color: '#888',
                            fontSize: '1.1rem',
                            maxWidth: '600px',
                            margin: '0 auto',
                            fontWeight: 500
                        }}>
                            Join the ultimate convergence of tech and culture. 
                            Complete your registration in three simple steps.
                        </p>
                    </div>
                </ScrollReveal>

                {/* Form Container */}
                <div style={{ 
                    width: '100%', 
                    maxWidth: '800px', 
                    position: 'relative' 
                }}>
                    {/* Decorative Elements */}
                    <div style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '-20px',
                        width: '100px',
                        height: '100px',
                        borderTop: '2px solid #ffb300',
                        borderLeft: '2px solid #ffb300',
                        opacity: 0.3,
                        pointerEvents: 'none'
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: '-20px',
                        right: '-20px',
                        width: '100px',
                        height: '100px',
                        borderBottom: '2px solid #ffb300',
                        borderRight: '2px solid #ffb300',
                        opacity: 0.3,
                        pointerEvents: 'none'
                    }} />

                    <div style={{
                        background: 'rgba(15, 15, 15, 0.4)',
                        backdropFilter: 'blur(30px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 40px 100px rgba(0, 0, 0, 0.4)'
                    }}>
                        <RegistrationForm onRegister={onRegister} showToast={showToast} onClose={onClose} />
                    </div>
                </div>

                {/* Secure Trust Badges */}
                <div style={{
                    marginTop: '3rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    opacity: 0.5
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <iconify-icon icon="solar:shield-check-bold" width="20" style={{ color: '#ffb300' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>SECURE SSL</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <iconify-icon icon="logos:razorpay" width="80" />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <iconify-icon icon="solar:lock-bold" width="20" style={{ color: '#ffb300' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px' }}>AES-256</span>
                    </div>
                </div>
            </main>

            {/* Subtle Industrial Grain / Noise */}
            <div style={{
                position: 'fixed',
                inset: 0,
                backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")',
                opacity: 0.03,
                pointerEvents: 'none',
                zIndex: 1000
            }} />
        </div>
    );
};

export default RegistrationPage;