import React, { useState } from 'react';
import { ScrollReveal } from './ScrollReveal';
import RegistrationForm from './RegistrationForm';

const RegistrationPage = ({ onRegister, showToast, onClose }) => {
    // State to manage button hover for cleaner inline styling
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#030305', // Deeper, richer black
            backgroundImage: `
                radial-gradient(circle at 15% 50%, rgba(249, 115, 22, 0.08), transparent 25%),
                radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.08), transparent 25%),
                linear-gradient(to right, rgba(255, 255, 255, 0.01) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
            `,
            backgroundSize: '100% 100%, 100% 100%, 40px 40px, 40px 40px', // Creates a subtle grid
            color: '#fafafa',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>

            {/* Ambient Top Glow */}
            <div style={{
                position: 'absolute',
                top: '-150px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '600px',
                height: '300px',
                background: 'radial-gradient(ellipse, rgba(249,115,22,0.15) 0%, rgba(0,0,0,0) 70%)',
                filter: 'blur(40px)',
                zIndex: 0,
                pointerEvents: 'none'
            }} />

            {/* Top Bar */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem 3rem',
                background: 'rgba(3, 3, 5, 0.65)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    {/* Optional Accent Dot */}
                    <span style={{
                        display: 'inline-block',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#f97316',
                        boxShadow: '0 0 10px #f97316'
                    }}></span>
                    FESTI<span style={{ color: '#f97316' }}>VERSE</span>
                </div>

                <button
                    onClick={onClose}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 24px',
                        border: isHovered ? '1px solid rgba(249,115,22,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '100px',
                        background: isHovered ? 'rgba(249,115,22,0.05)' : 'rgba(255,255,255,0.02)',
                        color: isHovered ? '#ffffff' : '#a1a1aa',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        boxShadow: isHovered ? '0 0 20px rgba(249,115,22,0.1)' : 'none'
                    }}
                >
                    <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isHovered ? 'translateX(-3px)' : 'translateX(0)', transition: 'transform 0.3s ease' }}
                    >
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Home
                </button>
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 2rem',
                position: 'relative',
                zIndex: 10
            }}>
                <ScrollReveal>
                    <div style={{
                        width: '100%',
                        maxWidth: '60rem',
                        margin: '0 auto',
                        background: 'rgba(20, 20, 25, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.03)',
                        borderRadius: '24px',
                        padding: '2px', // Acts as a gradient border wrapper
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}>
                        <div style={{
                            background: '#0a0a0f',
                            borderRadius: '22px',
                            padding: '1px', // Inner wrapper to contain the form gracefully
                        }}>
                            <RegistrationForm onRegister={onRegister} showToast={showToast} />
                        </div>
                    </div>
                </ScrollReveal>
            </div>

            {/* Footer */}
            <div style={{
                textAlign: 'center',
                padding: '2.5rem',
                color: '#52525b',
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                position: 'relative',
                zIndex: 10
            }}>
                <div style={{
                    width: '40px',
                    height: '1px',
                    background: 'rgba(255,255,255,0.1)',
                    margin: '0 auto 1.5rem auto'
                }}></div>
                © {new Date().getFullYear()} UDAAN × FESTIVERSE <span style={{ margin: '0 8px', color: '#f97316' }}>·</span> GEC Samastipur
            </div>
        </div>
    );
};

export default RegistrationPage;