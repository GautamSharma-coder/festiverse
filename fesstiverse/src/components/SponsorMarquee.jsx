import React from 'react';

const sponsors = ['Sponsored by TechGiant', 'Café Chai', 'Coding Ninjas', 'Unacademy', 'RedBull'];

const SponsorMarquee = () => {
    return (
        <>
            <style>{`
                @keyframes marqueeScroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
            <div style={{
                background: 'rgba(88, 28, 135, 0.08)',
                borderTop: '1px solid rgba(168, 85, 247, 0.15)',
                borderBottom: '1px solid rgba(168, 85, 247, 0.15)',
                padding: '1rem 0',
                overflow: 'hidden',
            }}>
                <div style={{
                    display: 'flex',
                    whiteSpace: 'nowrap',
                    gap: '4rem',
                    color: '#71717a',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '0.875rem',
                    animation: 'marqueeScroll 20s linear infinite',
                    width: 'max-content',
                }}>
                    {[...sponsors, ...sponsors, ...sponsors].map((s, i) => (
                        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: 'rgba(168, 85, 247, 0.5)' }}>✦</span> {s}
                        </span>
                    ))}
                </div>
            </div>
        </>
    );
};

export default SponsorMarquee;

