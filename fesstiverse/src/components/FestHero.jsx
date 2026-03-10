import React from 'react';

const FestHero = ({ onLoginClick, isLoggedIn, user, onLogout, onDashboardClick }) => {
    return (
        <header id="fest-home" style={{
            minHeight: '100vh', // Changed to 100vh for a true hero section feel
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundColor: '#030014', // Deep, rich dark background
            overflow: 'hidden',
            padding: '2rem',
        }}>
            {/* Embedded CSS for animations and hover states */}
            <style>
                {`
                    @keyframes shimmer {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                    }
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                        100% { transform: translateY(0px); }
                    }
                    .text-gradient {
                        background-size: 200% auto;
                        animation: shimmer 4s linear infinite;
                    }
                    .btn-primary {
                        background: linear-gradient(135deg, #9333ea 0%, #06b6d4 100%);
                        box-shadow: 0 0 20px rgba(124,58,237,0.3);
                        transition: all 0.3s ease;
                    }
                    .btn-primary:hover {
                        box-shadow: 0 0 30px rgba(6, 182, 212, 0.6);
                        transform: translateY(-2px);
                    }
                    .btn-secondary {
                        background: rgba(255, 255, 255, 0.05);
                        backdrop-filter: blur(10px);
                        transition: all 0.3s ease;
                    }
                    .btn-secondary:hover {
                        background: rgba(255, 255, 255, 0.1);
                        transform: translateY(-2px);
                        border-color: #c084fc !important;
                    }
                    .btn-logout:hover {
                        background: rgba(248, 113, 113, 0.1) !important;
                        color: #fecaca !important;
                    }
                `}
            </style>

            {/* Glowing Background Orbs */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60vw',
                height: '60vw',
                background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 60%)',
                filter: 'blur(60px)',
                zIndex: 1,
            }}></div>

            {/* Main Title */}
            <h1 className="text-gradient" style={{
                fontSize: 'clamp(3.5rem, 10vw, 9rem)',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                backgroundImage: 'linear-gradient(to right, #c084fc, #22d3ee, #818cf8, #c084fc)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                position: 'relative',
                zIndex: 10,
                lineHeight: 1,
                textAlign: 'center',
                margin: 0,
            }}>
                FESTIVERSE<span style={{ fontSize: '0.6em', verticalAlign: 'top', color: '#06b6d4' }}>'26</span>
            </h1>

            {/* Subtitle */}
            <p style={{
                color: '#a5f3fc',
                marginTop: '1.5rem',
                fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                position: 'relative',
                zIndex: 10,
                opacity: 0.9,
                animation: 'float 6s ease-in-out infinite',
            }}>
                The Future of Celebration
            </p>

            {/* Action Buttons */}
            <div style={{
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
                            padding: '0.875rem 2.5rem',
                            borderRadius: '9999px',
                            color: '#fff',
                            fontWeight: 700,
                            textDecoration: 'none',
                        }}>
                            Register Now
                        </a>
                        <button onClick={onLoginClick} className="btn-secondary" style={{
                            padding: '0.875rem 2.5rem',
                            borderRadius: '9999px',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            color: '#e9d5ff',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 500,
                        }}>
                            Login
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={onDashboardClick}
                            style={{
                                padding: '0.75rem 2rem',
                                borderRadius: '9999px',
                                background: 'linear-gradient(to right, #9333ea, #06b6d4)',
                                color: '#fff',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 0 20px rgba(124,58,237,0.5)',
                            }}
                        >
                            My Dashboard
                        </button>

                        <button onClick={onLogout} className="btn-logout" style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '9999px',
                            border: '1px solid rgba(248,113,113,0.3)',
                            color: '#fca5a5',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            transition: 'all 0.2s',
                            marginRight: '0.5rem'
                        }}>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default FestHero;