import React from 'react';

const FestHero = ({ onLoginClick, isLoggedIn, user, onLogout, onDashboardClick }) => {
    return (
        <header id="fest-home" style={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            paddingTop: '5rem',
        }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at top, rgba(88, 28, 135, 0.3), black, black)',
            }}></div>

            <h1 style={{
                fontSize: 'clamp(3.5rem, 10vw, 9rem)',
                fontWeight: 700,
                letterSpacing: '-0.05em',
                backgroundImage: 'linear-gradient(to right, #c084fc, #22d3ee, #c084fc)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                backgroundSize: '200% auto',
                position: 'relative',
                zIndex: 10,
                lineHeight: 1.1,
            }}>
                FESTIVERSE'26
            </h1>
            <p style={{
                color: '#a5f3fc',
                marginTop: '1rem',
                fontSize: '1.125rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                position: 'relative',
                zIndex: 10,
            }}>
                Unleash the Euphoria
            </p>

            <div style={{
                marginTop: '2.5rem',
                display: 'flex',
                gap: '1rem',
                position: 'relative',
                zIndex: 10,
                alignItems: 'center',
            }}>
                {!isLoggedIn ? (
                    <>
                        <a
                            href="#register"
                            style={{
                                padding: '0.75rem 2rem',
                                borderRadius: '9999px',
                                background: 'linear-gradient(to right, #9333ea, #06b6d4)',
                                color: '#fff',
                                fontWeight: 700,
                                textDecoration: 'none',
                                boxShadow: '0 0 20px rgba(124,58,237,0.5)',
                                transition: 'box-shadow 0.3s',
                            }}
                        >
                            Register Now
                        </a>
                        <button
                            onClick={onLoginClick}
                            style={{
                                padding: '0.75rem 2rem',
                                borderRadius: '9999px',
                                border: '1px solid rgba(168, 85, 247, 0.5)',
                                color: '#e9d5ff',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                            }}
                        >
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
                        <span style={{ color: '#a5f3fc', fontSize: '0.875rem' }}>
                            Hi, {user?.name || 'User'}!
                        </span>
                        <button
                            onClick={onLogout}
                            style={{
                                padding: '0.5rem 1.25rem',
                                borderRadius: '9999px',
                                border: '1px solid rgba(248,113,113,0.4)',
                                color: '#fca5a5',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                transition: 'all 0.2s',
                            }}
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </header>
    );
};

export default FestHero;
