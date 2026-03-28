import React, { useState, useEffect } from 'react';

const FestHero = ({ onLoginClick, isLoggedIn, user, onLogout, onDashboardClick }) => {
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        // After entrance animation finishes, switch to idle wave
        const timer = setTimeout(() => setEntered(true), 1200);
        return () => clearTimeout(timer);
    }, []);

    return (
        <header id="fest-home" className="fest-hero-header animated-bg" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            padding: '2rem',
            boxShadow: 'inset 0 0 300px rgba(0,0,0,0.95)',
        }}>
            {/* Background Blur Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                zIndex: 3,
                pointerEvents: 'none'
            }}></div>

            {/* Embedded CSS for assets, animations, and hover states */}
            <style>
                {`
                    @font-face {
                        font-family: 'HigherJump';
                        src: url('/src/assets/RubikPuddles-Regular.ttf') format('truetype');
                        font-weight: normal;
                        font-style: normal;
                    }
                    @keyframes shimmer {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-15px); }
                        100% { transform: translateY(0px); }
                    }
                    @keyframes drift {
                        0% { transform: translate(0px, 0px) scale(1); opacity: 0.6; }
                        33% { transform: translate(30px, -50px) scale(1.1); opacity: 0.8; }
                        66% { transform: translate(-20px, 20px) scale(0.9); opacity: 0.5; }
                        100% { transform: translate(0px, 0px) scale(1); opacity: 0.6; }
                    }
                    @keyframes twinkle {
                        0%, 100% { opacity: 0.2; transform: scale(0.8); }
                        50% { opacity: 0.8; transform: scale(1.2); }
                    }
                    @keyframes dynamicGradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    .animated-bg {
                        background: radial-gradient(circle at 50% 120%, rgba(212, 175, 55, 0.15) 0%, rgba(10,10,10,1) 60%),
                                    linear-gradient(-45deg, #0f0a05, #1a1510, #221c13, #080604);
                        background-size: 400% 400%;
                        animation: dynamicGradient 20s ease infinite;
                    }

                    /* Asset 1: Cyber Grid Pattern */
                    .cyber-grid {
                        position: absolute;
                        inset: 0;
                        background-image: 
                            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                        background-size: 50px 50px;
                        mask-image: radial-gradient(ellipse at center, black 10%, transparent 70%);
                        -webkit-mask-image: radial-gradient(ellipse at center, black 10%, transparent 70%);
                        z-index: 1;
                        pointer-events: none;
                    }

                    @keyframes panMandala {
                        0% { background-position: 0px 0px; }
                        100% { background-position: -400px -400px; }
                    }
                    .fire-text {
                        text-shadow: 0 0 10px rgba(255, 215, 0, 0.3), 
                                     0 0 20px rgba(212, 175, 55, 0.5), 
                                     0 0 40px rgba(184, 134, 11, 0.6), 
                                     0 0 80px rgba(218, 165, 32, 0.7), 
                                     0 10px 30px rgba(0,0,0,0.9);
                    }

                    /* Interactive Letter Animations */
                    @keyframes letterEntrance {
                        0% { opacity: 0; transform: translateY(80px) scale(0.3) rotate(-15deg); filter: blur(12px); }
                        60% { opacity: 1; transform: translateY(-15px) scale(1.1) rotate(5deg); filter: blur(0px); }
                        100% { opacity: 1; transform: translateY(0) scale(1) rotate(0deg); filter: blur(0px); }
                    }
                    @keyframes idleWave {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-6px); }
                    }
                    .hero-letter {
                        display: inline-block;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        animation: letterEntrance 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
                        position: relative;
                    }
                    .hero-letter:hover {
                        transform: translateY(-12px) scale(1.25) !important;
                        WebkitTextFillColor: #ff5722;
                        text-shadow: 0 0 20px #ffeb3b, 0 0 40px #ff9800, 0 0 60px #ff5722, 0 0 100px #e64a19, 0 5px 30px rgba(255,87,34,0.8);
                        filter: brightness(1.5);
                    }
                    .hero-letter.idle-wave {
                        animation: idleWave 3s ease-in-out infinite;
                        opacity: 1;
                    }
                    
                    /* Enhanced Buttons */
                    .btn-primary {
                        background: linear-gradient(135deg, rgba(216, 67, 21, 0.8) 0%, rgba(255, 143, 0, 0.8) 100%);
                        backdrop-filter: blur(12px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        box-shadow: 0 8px 32px rgba(255, 87, 34, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1);
                        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        position: relative;
                        overflow: hidden;
                    }
                    .btn-primary::after {
                        content: '';
                        position: absolute;
                        top: -50%; right: -50%; bottom: -50%; left: -50%;
                        background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255,255,255,0.4) 50%, rgba(255, 255, 255, 0));
                        transform: rotateZ(60deg) translate(-5em, 7.5em);
                        opacity: 0;
                        transition: all 0.5s ease-out;
                    }
                    .btn-primary:hover {
                        box-shadow: 0 12px 40px rgba(255, 143, 0, 0.6), inset 0 0 30px rgba(255, 255, 255, 0.2);
                        transform: translateY(-4px) scale(1.03);
                        border: 1px solid rgba(255, 255, 255, 0.4);
                    }
                    .btn-primary:hover::after {
                        opacity: 1;
                        transform: rotateZ(60deg) translate(1em, -9em);
                    }

                    .btn-secondary {
                        background: rgba(20, 10, 5, 0.4);
                        backdrop-filter: blur(16px);
                        border: 1px solid rgba(255, 152, 0, 0.2);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                        transition: all 0.3s ease;
                        position: relative;
                    }
                    .btn-secondary:hover {
                        background: rgba(30, 15, 5, 0.6);
                        transform: translateY(-3px);
                        border-color: rgba(255, 152, 0, 0.6) !important;
                        box-shadow: 0 10px 30px rgba(255, 152, 0, 0.3), inset 0 0 15px rgba(255, 152, 0, 0.1);
                    }
                    .btn-logout:hover {
                        background: rgba(255, 87, 34, 0.15) !important;
                        color: #ffcc80 !important;
                        box-shadow: 0 0 15px rgba(255, 87, 34, 0.3);
                    }

                    /* Mobile Responsiveness */
                    @media (max-width: 768px) {
                        .fest-hero-header {
                            padding: 1rem !important;
                        }
                        .action-buttons {
                            flex-direction: column;
                            width: 100%;
                            padding: 0 1.5rem;
                            gap: 1rem !important;
                            margin-top: 2rem !important;
                        }
                        .btn-primary, .btn-secondary, .btn-logout {
                            padding: 0.8rem 1.5rem !important;
                            font-size: 0.8rem !important;
                            width: 100%;
                            text-align: center;
                            box-sizing: border-box;
                        }
                    }
                    @media (max-width: 400px) {
                        .fire-text {
                            text-shadow: 0 0 3px #ffeb3b, 0 0 8px #ff9800, 0 0 15px #ff5722, 0 0 30px #e64a19, 0 0 50px #d84315;
                        }
                    }
                `}
            </style>

            {/* Cinematic Background Elements: Seamless Golden Mandala Pattern */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: "url('/src/assets/mandala-pattern.png')",
                backgroundSize: '400px 400px',
                backgroundRepeat: 'repeat',
                animation: 'panMandala 40s linear infinite',
                opacity: 0.15,
                zIndex: 2,
                pointerEvents: 'none'
            }}></div>

            {/* Main Title — Interactive Letters */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%' }}>
                <h1 className="fire-text" style={{
                    fontFamily: "'HigherJump', sans-serif",
                    fontSize: 'clamp(2.5rem, 13vw, 7rem)',
                    color: '#2a0a00',
                    WebkitTextFillColor: '#2a0a00',
                    WebkitTextStroke: '2px #ff7043',
                    lineHeight: 1.1,
                    margin: 0,
                    position: 'relative',
                    zIndex: 2,
                    perspective: '500px',
                }}>
                    {'FESTIVERSE'.split('').map((letter, i) => (
                        <span
                            key={i}
                            className={`hero-letter ${entered ? 'idle-wave' : ''}`}
                            style={{
                                animationDelay: entered ? `${i * 0.15}s` : `${i * 0.08}s`,
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-12px) scale(1.25)';
                                e.target.style.WebkitTextFillColor = '#ff5722';
                                e.target.style.filter = 'brightness(1.5) drop-shadow(0 0 15px #ff5722)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = '';
                                e.target.style.WebkitTextFillColor = '#1a0500';
                                e.target.style.filter = '';
                            }}
                        >
                            {letter}
                        </span>
                    ))}
                    <span
                        className={`hero-letter ${entered ? 'idle-wave' : ''}`}
                        style={{
                            fontSize: '0.7em',
                            verticalAlign: 'top',
                            color: '#ffb300',
                            WebkitTextFillColor: '#ffb300',
                            WebkitTextStroke: 'none',
                            textShadow: '0 0 20px rgba(255, 179, 0, 0.8)',
                            animationDelay: entered ? `${10 * 0.15}s` : `${10 * 0.08}s`,
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-12px) scale(1.3)';
                            e.target.style.filter = 'brightness(1.6) drop-shadow(0 0 20px #ffb300)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = '';
                            e.target.style.filter = '';
                        }}
                    >
                        '26
                    </span>
                </h1>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons" style={{
                marginTop: '4rem',
                display: 'flex',
                gap: '1.5rem',
                position: 'relative',
                zIndex: 10,
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center',
            }}>
                {!isLoggedIn ? (
                    <>
                        <a href="#register" className="btn-primary" style={{
                            padding: '1rem 3rem',
                            borderRadius: '9999px',
                            color: '#fff',
                            fontWeight: 700,
                            textDecoration: 'none',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            fontSize: '0.9rem'
                        }}>
                            Register Now
                        </a>
                        <button onClick={onLoginClick} className="btn-secondary" style={{
                            padding: '0.9rem 2.5rem',
                            borderRadius: '9999px',
                            border: '1px solid rgba(255, 152, 0, 0.3)',
                            color: '#ffcc80',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                        }}>
                            Login
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={onDashboardClick} className="btn-primary" style={{
                            padding: '1rem 3rem',
                            borderRadius: '9999px',
                            color: '#fff',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                            fontSize: '0.9rem'
                        }}>
                            My Dashboard
                        </button>

                        <button onClick={onLogout} className="btn-logout" style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '9999px',
                            border: '1px solid rgba(248,113,113,0.3)',
                            color: '#fca5a5',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'all 0.3s ease',
                            fontWeight: 600,
                            letterSpacing: '1px',
                            textTransform: 'uppercase',
                        }}>
                            Logout
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default FestHero;