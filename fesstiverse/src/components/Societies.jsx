import React, { useState, useEffect, useRef } from 'react';

const floatStyles = `
  @keyframes float-0 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-8px) rotate(0.4deg); }
    66%       { transform: translateY(-4px) rotate(-0.3deg); }
  }
  @keyframes float-1 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    40%       { transform: translateY(-10px) rotate(-0.5deg); }
    70%       { transform: translateY(-5px) rotate(0.3deg); }
  }
  @keyframes float-2 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    25%       { transform: translateY(-6px) rotate(0.3deg); }
    60%       { transform: translateY(-11px) rotate(-0.4deg); }
  }
  @keyframes float-3 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-9px) rotate(0.5deg); }
    80%       { transform: translateY(-3px) rotate(-0.2deg); }
  }
  @keyframes float-4 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    30%       { transform: translateY(-12px) rotate(-0.4deg); }
    65%       { transform: translateY(-5px) rotate(0.3deg); }
  }
  @keyframes shimmer {
    0%   { opacity: 0.15; transform: translateX(-100%); }
    50%  { opacity: 0.4; }
    100% { opacity: 0.15; transform: translateX(100%); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 6px currentColor; opacity: 0.6; }
    50%       { box-shadow: 0 0 14px currentColor; opacity: 1; }
  }
`;

const societies = [
    {
        name: 'Fine and Art Society',
        icon: 'solar:palette-linear',
        borderColor: 'rgba(239, 68, 68, 0.4)',
        bgFrom: 'rgba(127, 29, 29, 0.25)',
        iconColor: '#ef4444',
        accentColor: '#ef4444',
        tagline: 'Express. Create. Inspire.',
        events: [
            { name: 'Painting & Sketching', desc: 'Canvas, charcoal & beyond', icon: 'solar:brush-linear' },
            { name: 'Photography', desc: 'Capture the unseen moment', icon: 'solar:camera-linear' },
            { name: 'Handicraft', desc: 'Art with your hands', icon: 'solar:scissors-linear' },
            { name: 'Story Writing', desc: 'Words that paint worlds', icon: 'solar:pen-linear' },
        ],
        align: 'left',
    },
    {
        name: 'Music and Dance Society',
        icon: 'solar:music-note-linear',
        borderColor: 'rgba(168, 85, 247, 0.4)',
        bgFrom: 'rgba(88, 28, 135, 0.25)',
        iconColor: '#a855f7',
        accentColor: '#a855f7',
        tagline: 'Rhythm. Soul. Motion.',
        events: [
            { name: 'Solo Singing', desc: 'Your voice, your stage', icon: 'solar:microphone-3-linear' },
            { name: 'Group Singing', desc: 'Harmonies in unison', icon: 'solar:music-notes-linear' },
            { name: 'Classical Dance', desc: 'Grace rooted in tradition', icon: 'solar:star-shine-linear' },
            { name: 'Western Dance', desc: 'Move to modern beats', icon: 'solar:flame-linear' },
            { name: 'Poetry & Shayari', desc: 'Words with a rhythm', icon: 'solar:document-text-linear' },
        ],
        align: 'right',
    },
    {
        name: 'Acting and Drama Society',
        icon: 'solar:masks-linear',
        borderColor: 'rgba(245, 158, 11, 0.4)',
        bgFrom: 'rgba(146, 64, 14, 0.25)',
        iconColor: '#f59e0b',
        accentColor: '#f59e0b',
        tagline: 'Stage. Voice. Story.',
        events: [
            { name: 'Solo Acting', desc: 'Own the stage alone', icon: 'solar:user-speak-linear' },
            { name: 'Group Drama', desc: 'Stories told together', icon: 'solar:users-group-rounded-linear' },
            { name: 'Stand-up Comedy', desc: 'Make the crowd roar', icon: 'solar:microphone-linear' },
            { name: 'Mime & Skit', desc: 'Expression beyond words', icon: 'solar:smile-circle-linear' },
        ],
        align: 'left',
    },
    {
        name: 'Literature and Debate Society',
        icon: 'solar:book-open-linear',
        borderColor: 'rgba(20, 184, 166, 0.4)',
        bgFrom: 'rgba(17, 78, 72, 0.25)',
        iconColor: '#14b8a6',
        accentColor: '#14b8a6',
        tagline: 'Read. Write. Debate.',
        events: [
            { name: 'Debate', desc: 'Argue your conviction', icon: 'solar:chat-square-linear' },
            { name: 'Quiz', desc: 'Knowledge under pressure', icon: 'solar:question-circle-linear' },
            { name: 'Extempore', desc: 'Speak without warning', icon: 'solar:bolt-linear' },
            { name: 'Creative Writing', desc: 'Fiction from imagination', icon: 'solar:pen-new-square-linear' },
        ],
        align: 'right',
    },
    {
        name: 'Social Awareness Society',
        icon: 'solar:heart-angle-linear',
        borderColor: 'rgba(34, 197, 94, 0.4)',
        bgFrom: 'rgba(20, 83, 45, 0.25)',
        iconColor: '#22c55e',
        accentColor: '#22c55e',
        tagline: 'Aware. Act. Change.',
        events: [
            { name: 'Nukkad Natak', desc: 'Street plays with a message', icon: 'solar:streets-map-point-linear' },
            { name: 'Poster Making', desc: 'Art as activism', icon: 'solar:gallery-wide-linear' },
            { name: 'Rally & Campaign', desc: 'Raise your voice loudly', icon: 'solar:flag-linear' },
            { name: 'Documentary', desc: 'Stories that matter', icon: 'solar:video-frame-play-vertical-linear' },
        ],
        align: 'left',
    },
];

const EventCard = ({ event, accentColor, index }) => {
    const [hovered, setHovered] = useState(false);
    const [visible, setVisible] = useState(false);
    const ref = useRef(null);

    const floatIndex = index % 5;
    const floatDuration = 3.8 + (index % 5) * 0.6; // 3.8s – 6.2s
    const floatDelay = (index % 5) * 0.5;          // 0s – 2.0s
    const entranceDelay = index * 0.07;

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.15 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                position: 'relative',
                padding: '1.25rem',
                borderRadius: '14px',
                background: hovered
                    ? `linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))`
                    : 'rgba(255,255,255,0.035)',
                border: `1px solid ${hovered ? accentColor + '66' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'default',
                overflow: 'hidden',
                // Entrance animation
                opacity: visible ? 1 : 0,
                animation: visible
                    ? `fadeSlideUp 0.5s ease ${entranceDelay}s both, float-${floatIndex} ${floatDuration}s ease-in-out ${floatDelay}s infinite`
                    : 'none',
                // Hover lift on top of float (via filter glow trick)
                filter: hovered ? `drop-shadow(0 12px 28px ${accentColor}33)` : 'none',
                transition: 'border-color 0.3s ease, background 0.3s ease, filter 0.3s ease',
                willChange: 'transform',
            }}
        >
            {/* Shimmer sweep on hover */}
            {hovered && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(105deg, transparent 40%, ${accentColor}18 50%, transparent 60%)`,
                    animation: 'shimmer 1.2s ease infinite',
                    pointerEvents: 'none',
                }} />
            )}

            {/* Pulsing glow dot */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: accentColor,
                color: accentColor,
                animation: 'pulse-glow 2.4s ease-in-out infinite',
                animationDelay: `${floatDelay}s`,
            }} />

            {/* Icon */}
            <iconify-icon
                icon={event.icon}
                width="22"
                style={{
                    color: accentColor,
                    display: 'block',
                    marginBottom: '0.75rem',
                    opacity: hovered ? 1 : 0.75,
                    transition: 'opacity 0.3s, transform 0.3s',
                    transform: hovered ? 'scale(1.15)' : 'scale(1)',
                }}
            />

            <h4 style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: hovered ? '#fff' : '#e4e4e7',
                margin: '0 0 0.3rem',
                transition: 'color 0.3s',
                letterSpacing: '-0.01em',
            }}>
                {event.name}
            </h4>
            <p style={{
                fontSize: '0.6875rem',
                color: hovered ? '#a1a1aa' : '#71717a',
                margin: 0,
                lineHeight: 1.5,
                transition: 'color 0.3s',
            }}>
                {event.desc}
            </p>

            {/* Bottom accent bar */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '2px',
                width: hovered ? '100%' : '30%',
                background: `linear-gradient(to right, ${accentColor}, transparent)`,
                transition: 'width 0.45s ease',
                opacity: hovered ? 1 : 0.3,
            }} />
        </div>
    );
};

const Societies = () => {
    return (
        <section
            id="society"
            style={{
                backgroundColor: '#0a0a0a',
                padding: '6rem 0',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <style>{floatStyles}</style>
            {/* Subtle noise/grid bg */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)`,
                backgroundSize: '32px 32px',
                pointerEvents: 'none',
            }} />

            <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}>

                {/* Heading */}
                <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                    <span style={{
                        fontSize: '0.6875rem',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#52525b',
                        display: 'block',
                        marginBottom: '0.75rem',
                    }}>
                        UDAAN Arts Club
                    </span>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                        fontWeight: 500,
                        letterSpacing: '-0.03em',
                        color: '#e4e4e7',
                        margin: 0,
                    }}>
                        Our Societies
                    </h2>
                </div>

                {/* Society sections */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
                    {societies.map((s, idx) => (
                        <div key={idx}>
                            {/* Divider */}
                            {idx !== 0 && (
                                <div style={{
                                    height: '1px',
                                    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)',
                                    marginBottom: '5rem',
                                }} />
                            )}

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2.5fr)',
                                gap: '3rem',
                                alignItems: 'start',
                                direction: s.align === 'right' ? 'rtl' : 'ltr',
                            }}>
                                {/* LEFT: Identity block */}
                                <div style={{ direction: 'ltr', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Circle */}
                                    <div style={{
                                        width: '7rem',
                                        height: '7rem',
                                        borderRadius: '50%',
                                        border: `1px solid ${s.borderColor}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: `radial-gradient(circle at 30% 30%, ${s.bgFrom}, #0a0a0a)`,
                                        flexShrink: 0,
                                        boxShadow: `0 0 40px ${s.accentColor}18`,
                                    }}>
                                        <iconify-icon icon={s.icon} width="36" style={{ color: s.iconColor }} />
                                    </div>

                                    <div>
                                        <h3 style={{
                                            fontSize: '1.375rem',
                                            fontWeight: 600,
                                            color: '#e4e4e7',
                                            margin: '0 0 0.25rem',
                                            letterSpacing: '-0.02em',
                                        }}>
                                            {s.name}
                                        </h3>
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: s.accentColor,
                                            margin: 0,
                                            opacity: 0.8,
                                            letterSpacing: '0.05em',
                                        }}>
                                            {s.tagline}
                                        </p>
                                    </div>

                                    <div style={{
                                        fontSize: '0.6875rem',
                                        color: '#52525b',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase',
                                    }}>
                                        {s.events.length} events
                                    </div>
                                </div>

                                {/* RIGHT: Event cards grid */}
                                <div style={{
                                    direction: 'ltr',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                    gap: '0.75rem',
                                }}>
                                    {s.events.map((event, i) => (
                                        <EventCard key={i} index={i} event={event} accentColor={s.accentColor} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Societies;