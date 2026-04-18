//import React, { useState, useEffect } from 'react';
import rubikPuddlesFont from '../assets/RubikPuddles-Regular.ttf';
import mandalaPattern from '../assets/mandala-pattern.png';
import festHeroImage from '../assets/festHeroImage.png';
import GlassSurface from './GlassSurface';

const FestHero = ({ onLoginClick, onRegisterClick, isLoggedIn, user, onLogout, onDashboardClick }) => {
    return (
        <header id="fest-home" className="fest-hero-header" style={{
            backgroundImage: `url(${festHeroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
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
                backdropFilter: 'blur(2px)',
                WebkitBackdropFilter: 'blur(2x)',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                zIndex: 3,
                pointerEvents: 'none'
            }}></div>

            {/* Embedded CSS for assets, animations, and hover states */}
            <style>
                {`
                    @font-face {
                        font-family: 'HigherJump';
                        src: url(${rubikPuddlesFont}) format('truetype');
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

                    .fire-text {
                        text-shadow: 0 0 10px rgba(255, 215, 0, 0.3), 
                                     0 0 20px rgba(212, 175, 55, 0.5), 
                                     0 0 40px rgba(184, 134, 11, 0.6), 
                                     0 0 80px rgba(218, 165, 32, 0.7), 
                                     0 10px 30px rgba(0,0,0,0.9);
                    }

                    /* Interactive Letters */
                    .hero-letter {
                        display: inline-block;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                        position: relative;
                    }
                    .hero-letter:hover {
                        transform: translateY(-12px) scale(1.25) !important;
                        WebkitTextFillColor: #ff5722;
                        text-shadow: 0 0 20px #ffeb3b, 0 0 40px #ff9800, 0 0 60px #ff5722, 0 0 100px #e64a19, 0 5px 30px rgba(255,87,34,0.8);
                        filter: brightness(1.5);
                    }

                    /* Moving Border Button */
                    .moving-border-btn {
                        position: relative;
                        display: inline-flex;
                        border-radius: 9999px;
                        transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    }
                    .moving-border-btn:hover {
                        transform: scale(1.05);
                    }
                    .moving-border-glow {
                        position: absolute;
                        inset: -2px;
                        border-radius: 9999px;
                        padding: 3px;
                        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
                        -webkit-mask-composite: xor;
                        mask-composite: exclude;
                        pointer-events: none;
                        z-index: 10;
                        overflow: hidden;
                    }
                    .moving-border-glow::before {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 150%;
                        aspect-ratio: 1;
                        background: conic-gradient(from 0deg, transparent 0 280deg, #ff9800 320deg, #ff5722 360deg);
                        transform: translate(-50%, -50%);
                        animation: spin-conic 2s linear infinite;
                    }
                    @keyframes spin-conic {
                        100% { transform: translate(-50%, -50%) rotate(360deg); }
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
                            flex-direction: row;
                            flex-wrap: wrap;
                            justify-content: center;
                            width: auto;
                            padding: 0 1.5rem;
                            gap: 0.75rem !important;
                            margin-top: 1.5rem !important;
                        }
                        .btn-primary, .btn-secondary, .btn-logout {
                            padding: 0.6rem 1.2rem !important;
                            font-size: 0.75rem !important;
                            width: auto;
                            text-align: center;
                            box-sizing: border-box;
                        }
                        .moving-border-btn {
                            transform: scale(0.85);
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
                backgroundImage: `url(${mandalaPattern})`,
                backgroundSize: '400px 400px',
                backgroundRepeat: 'repeat',
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
                            className={`hero-letter`}
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
                        className={`hero-letter`}
                        style={{
                            fontSize: '0.7em',
                            verticalAlign: 'top',
                            color: '#ffb300',
                            WebkitTextFillColor: '#ffb300',
                            WebkitTextStroke: 'none',
                            textShadow: '0 0 20px rgba(255, 179, 0, 0.8)',
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
                        <button onClick={onRegisterClick} className="moving-border-btn" style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer' }}>
                            <div className="moving-border-glow"></div>
                            <GlassSurface
                                width={200}
                                height={50}
                                borderRadius={9999}
                                displace={15}
                                distortionScale={-150}
                                redOffset={5}
                                greenOffset={15}
                                blueOffset={25}
                                mixBlendMode="screen"
                                brightness={60}
                                opacity={0.8}
                            >
                                <span style={{
                                    color: '#fff',
                                    fontWeight: 700,
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    fontSize: '0.9rem',
                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                }}>
                                    Register Now
                                </span>
                            </GlassSurface>
                        </button>
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
            {/* Event Dates */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                textAlign: 'center',
                marginTop: '3rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                top: '10px'
            }}>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '10px 28px',
                    background: 'rgba(255, 152, 0, 0.06)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 179, 0, 0.15)',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 152, 0, 0.04)',
                }}>
                    <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#ffb300',
                        boxShadow: '0 0 8px #ffb300',
                        animation: 'twinkle 2s ease-in-out infinite',
                        flexShrink: 0,
                    }} />
                    <span style={{
                        fontFamily: "'Outfit', 'Inter', sans-serif",
                        fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)',
                        fontWeight: 600,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#ffcc80',
                        textShadow: '0 0 12px rgba(255, 179, 0, 0.4)',
                    }}>
                        15 <span style={{ color: '#ff9800', opacity: 0.6 }}>·</span> 16 <span style={{ color: '#ff9800', opacity: 0.6 }}>·</span> 17 May 2026
                    </span>
                    <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: '#ffb300',
                        boxShadow: '0 0 8px #ffb300',
                        animation: 'twinkle 2s ease-in-out infinite 1s',
                        flexShrink: 0,
                    }} />
                </div>
                <span style={{
                    fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                    color: 'white',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                }}>
                    GEC Samastipur
                </span>
            </div>

        </header>
    );
};

export default FestHero;
