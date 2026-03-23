import React from 'react';

const FestHero = ({ onLoginClick, isLoggedIn, user, onLogout, onDashboardClick }) => {
    return (
        <header id="fest-home" className="fest-hero-header" style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundImage: "url('/src/assets/Video_Generation_From_Animation_Request-ezgif.com-split.webp')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#0a0a0a', // Dark fallback
            overflow: 'hidden',
            padding: '2rem',
            boxShadow: 'inset 0 0 250px rgba(0,0,0,0.9)', // Vignette to darken edges
        }}>
            {/* Background Blur Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                zIndex: 1,
                pointerEvents: 'none'
            }}></div>

            {/* Embedded CSS for assets, animations, and hover states */}
            <style>
                {`
                    @font-face {
                        font-family: 'HigherJump';
                        src: url('/src/assets/Higher Jump.ttf') format('truetype');
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

                    @keyframes sparkFloatUp {
                        0% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0px); }
                        60% { opacity: 0.8; filter: blur(1px); }
                        100% { transform: translateY(-400px) scale(0.2); opacity: 0; filter: blur(3px); }
                    }
                    .fire-text {
                        text-shadow: 0 0 5px #ffeb3b, 0 0 15px #ff9800, 0 0 30px #ff5722, 0 0 60px #e64a19, 0 0 90px #d84315;
                    }
                    
                    /* Enhanced Buttons */
                    .btn-primary {
                        background: linear-gradient(135deg, #d84315 0%, #ff8f00 100%);
                        box-shadow: 0 0 20px rgba(255, 87, 34, 0.4);
                        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        position: relative;
                        overflow: hidden;
                    }
                    .btn-primary::after {
                        content: '';
                        position: absolute;
                        top: -50%; right: -50%; bottom: -50%; left: -50%;
                        background: linear-gradient(to bottom, rgba(229, 172, 142, 0), rgba(255,255,255,0.2) 50%, rgba(229, 172, 142, 0));
                        transform: rotateZ(60deg) translate(-5em, 7.5em);
                        opacity: 0;
                        transition: all 0.5s ease-out;
                    }
                    .btn-primary:hover {
                        box-shadow: 0 0 35px rgba(255, 143, 0, 0.7);
                        transform: translateY(-3px) scale(1.02);
                    }
                    .btn-primary:hover::after {
                        opacity: 1;
                        transform: rotateZ(60deg) translate(1em, -9em);
                    }

                    .btn-secondary {
                        background: rgba(255, 255, 255, 0.03);
                        backdrop-filter: blur(10px);
                        transition: all 0.3s ease;
                        position: relative;
                    }
                    .btn-secondary:hover {
                        background: rgba(255, 255, 255, 0.08);
                        transform: translateY(-2px);
                        border-color: #ff9800 !important;
                        box-shadow: 0 0 20px rgba(255, 152, 0, 0.4);
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
                            padding: 0 1rem;
                            gap: 1rem !important;
                            margin-top: 2rem !important;
                        }
                        .action-buttons > * {
                            width: 100%;
                            text-align: center;
                        }
                    }
                    @media (max-width: 400px) {
                        .fire-text {
                            text-shadow: 0 0 3px #ffeb3b, 0 0 8px #ff9800, 0 0 15px #ff5722, 0 0 30px #e64a19, 0 0 50px #d84315;
                        }
                    }
                `}
            </style>

            {/* Cleaned up Orbs/Grid to show lava background */}
            {/* ASSET 3: Fire Particles */}
            {[...Array(40)].map((_, i) => {
                const colors = ['#ffcc00', '#ff6600', '#ff3300', '#ffffff'];
                const color = colors[i % colors.length];
                const size = Math.random() * 4 + 2; // 2px to 6px
                return (
                    <div key={i} style={{
                        position: 'absolute',
                        bottom: `${Math.random() * 20 - 10}%`, // Start slightly below view
                        left: `${Math.random() * 100}%`,
                        width: `${size}px`,
                        height: `${size}px`,
                        backgroundColor: color,
                        borderRadius: '50%',
                        boxShadow: `0 0 ${size * 2}px ${color}, 0 0 ${size * 4}px ${color}`,
                        zIndex: 2,
                        animation: `sparkFloatUp ${Math.random() * 3 + 2}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 5}s`
                    }}></div>
                );
            })}

            {/* Main Title */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%' }}>
                <h1 className="fire-text" style={{
                    fontFamily: "'HigherJump', sans-serif",
                    fontSize: 'clamp(2.2rem, 11vw, 6rem)',
                    color: '#1a0500', // Hard fallback
                    WebkitTextFillColor: '#1a0500', // Dark charred core
                    WebkitTextStroke: '2px #ff5722', // Bright glowing orange rim
                    lineHeight: 1.1,
                    margin: 0,
                    position: 'relative',
                    zIndex: 2,
                }}>
                    FESTIVERSE<span style={{ fontSize: '0.7em', verticalAlign: 'top', color: '#ffb300', textShadow: '0 0 20px rgba(255, 179, 0, 0.8)' }}>
                        '26</span>
                </h1>

                {/* Subtitle */}
                {/* <p style={{
                    color: '#ffcc80',
                    marginTop: '1.5rem',
                    fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    opacity: 0.9,
                    animation: 'float 6s ease-in-out infinite',
                    textShadow: '0 0 10px rgba(255, 204, 128, 0.4)'
                }}>
                    The Future of Celebration
                </p> */}
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
