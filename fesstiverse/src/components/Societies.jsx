import React, { useState, useEffect, useRef } from 'react';

const styles = `
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
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 6px currentColor; opacity: 0.6; }
    50%       { box-shadow: 0 0 14px currentColor; opacity: 1; }
  }
  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(-64px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(64px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(18px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .society-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 2.1fr);
    gap: 3rem;
    align-items: start;
  }
  .society-row.rtl { direction: rtl; }
  .society-row.ltr { direction: ltr; }

  .society-identity {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    direction: ltr;
  }

  .society-events {
    direction: ltr;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.75rem;
  }

  @media (max-width: 768px) {
    .society-row {
      grid-template-columns: 1fr;
      direction: ltr !important;
      gap: 2rem;
    }
    .society-identity { align-items: center !important; text-align: center !important; }
  }
`;

const societies = [
    {
        name: 'Fine and Art Society',
        logo: '/images/societies/fine_art_logo.png',
        bg: '/images/societies/fine_art_bg.png',
        borderColor: 'rgba(239, 68, 68, 0.4)',
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
        logo: '/images/societies/music_dance_logo.png',
        bg: '/images/societies/music_dance_bg.png',
        borderColor: 'rgba(168, 85, 247, 0.4)',
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
        logo: '/images/societies/acting_drama_logo.png',
        bg: '/images/societies/acting_drama_bg.png',
        borderColor: 'rgba(245, 158, 11, 0.4)',
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
        logo: '/images/societies/literature_debate_logo.png',
        bg: '/images/societies/literature_debate_bg.png',
        borderColor: 'rgba(20, 184, 166, 0.4)',
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
        logo: '/images/societies/social_awareness_logo.png',
        bg: '/images/societies/social_awareness_bg.png',
        borderColor: 'rgba(34, 197, 94, 0.4)',
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

/* ── useInView: fires once when element enters viewport ── */
function useInView(options = {}) {
    const { threshold = 0.05, rootMargin = '-20px 0px' } = options;
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
        }, { threshold, rootMargin });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold, rootMargin]);
    return [ref, visible];
}

/* ── EventCard ── */
const EventCard = ({ event, accentColor, index, bgImage, sectionVisible }) => {
    const [hovered, setHovered] = useState(false);
    const [bgLoaded, setBgLoaded] = useState(false);
    const ref = useRef(null);

    const floatIndex = index % 5;
    const floatDuration = 3.8 + floatIndex * 0.6;
    const floatDelay = floatIndex * 0.5;
    const entranceDelay = sectionVisible ? 0.2 + index * 0.1 : 0;

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setBgLoaded(true); obs.disconnect(); }
        }, { rootMargin: '200px' });
        obs.observe(el);
        return () => obs.disconnect();
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
                background: hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.035)',
                border: `1px solid ${hovered ? accentColor + '66' : 'rgba(255,255,255,0.08)'}`,
                cursor: 'default',
                overflow: 'hidden',
                opacity: sectionVisible ? 1 : 0,
                animation: sectionVisible
                    ? `cardIn 0.5s cubic-bezier(0.22,1,0.36,1) ${entranceDelay}s both,
             float-${floatIndex} ${floatDuration}s ease-in-out ${floatDelay + entranceDelay}s infinite`
                    : 'none',
                filter: hovered ? `drop-shadow(0 12px 28px ${accentColor}33)` : 'none',
                transition: 'border-color 0.3s, background 0.3s, filter 0.3s',
                willChange: 'transform',
            }}
        >
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: bgLoaded ? `url(${bgImage})` : 'none',
                backgroundSize: 'cover', backgroundPosition: 'center',
                opacity: hovered ? 0.35 : 0.12,
                transition: 'opacity 0.6s, transform 0.6s',
                transform: hovered ? 'scale(1.1)' : 'scale(1)',
                filter: 'grayscale(40%) contrast(110%)',
                pointerEvents: 'none', zIndex: -1,
            }} />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))',
                zIndex: 0, pointerEvents: 'none',
            }} />
            {hovered && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `linear-gradient(105deg, transparent 40%, ${accentColor}18 50%, transparent 60%)`,
                    animation: 'shimmer 1.2s ease infinite',
                    pointerEvents: 'none', zIndex: 1,
                }} />
            )}
            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{
                    position: 'absolute', top: '-0.25rem', right: '-0.25rem',
                    width: 7, height: 7, borderRadius: '50%',
                    background: accentColor, color: accentColor,
                    animation: `pulse-glow 2.4s ease-in-out ${floatDelay}s infinite`,
                }} />
                <iconify-icon icon={event.icon} width="22" style={{
                    color: accentColor, display: 'block', marginBottom: '0.75rem',
                    opacity: hovered ? 1 : 0.85,
                    transition: 'opacity 0.3s, transform 0.3s',
                    transform: hovered ? 'scale(1.15)' : 'scale(1)',
                }} />
                <h4 style={{
                    fontSize: '0.8125rem', fontWeight: 600,
                    color: hovered ? '#fff' : '#e4e4e7',
                    margin: '0 0 0.3rem', letterSpacing: '-0.01em',
                    transition: 'color 0.3s', textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}>{event.name}</h4>
                <p style={{
                    fontSize: '0.6875rem', color: hovered ? '#d1d1d6' : '#a1a1aa',
                    margin: 0, lineHeight: 1.5,
                    transition: 'color 0.3s', textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                }}>{event.desc}</p>
            </div>
            <div style={{
                position: 'absolute', bottom: 0, left: 0, height: 2,
                width: hovered ? '100%' : '30%',
                background: `linear-gradient(to right, ${accentColor}, transparent)`,
                transition: 'width 0.45s ease',
                opacity: hovered ? 1 : 0.3, zIndex: 2,
            }} />
        </div>
    );
};

/* ── SocietyRow ── */
const SocietyRow = ({ s, idx }) => {
    const isRight = s.align === 'right';
    const [wrapRef, visible] = useInView({ threshold: 0.02, rootMargin: '-20px 0px' });

    const identityAnim = isRight ? 'slideRight' : 'slideLeft';
    const eventsAnim = isRight ? 'slideLeft' : 'slideRight';

    return (
        <div ref={wrapRef}>
            {idx !== 0 && (
                <div style={{
                    height: 1,
                    background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)',
                    marginBottom: '5rem',
                }} />
            )}

            <div className={`society-row ${isRight ? 'rtl' : 'ltr'}`}>

                {/* Identity — slides from its side */}
                <div
                    className="society-identity"
                    style={{
                        opacity: visible ? 1 : 0,
                        animation: visible
                            ? `var(--mobile-anim, ${identityAnim}) 0.65s cubic-bezier(0.22,1,0.36,1) 0.05s both`
                            : 'none',
                    }}
                >
                    <div style={{
                        width: '7rem', height: '7rem', borderRadius: '50%',
                        border: `1px solid ${s.borderColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#fff', flexShrink: 0,
                        boxShadow: '0 0 30px rgba(255,255,255,0.1)',
                        overflow: 'hidden', padding: '0.5rem',
                    }}>
                        <img src={s.logo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>

                    <div>
                        <h3 style={{
                            fontSize: '1.375rem', fontWeight: 600, color: '#e4e4e7',
                            margin: '0 0 0.25rem', letterSpacing: '-0.02em',
                        }}>{s.name}</h3>
                        <p style={{
                            fontSize: '0.75rem', color: s.accentColor,
                            margin: 0, opacity: 0.8, letterSpacing: '0.05em',
                        }}>{s.tagline}</p>
                    </div>

                    <div style={{
                        fontSize: '0.6875rem', color: '#52525b',
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>
                        {s.events.length} events
                    </div>
                </div>

                {/* Events — slides from opposite side, cards stagger individually */}
                <div
                    className="society-events"
                    style={{
                        opacity: visible ? 1 : 0,
                        animation: visible
                            ? `var(--mobile-anim, ${eventsAnim}) 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s both`
                            : 'none',
                    }}
                >
                    {s.events.map((event, i) => (
                        <EventCard
                            key={i}
                            index={i}
                            event={event}
                            accentColor={s.accentColor}
                            bgImage={s.bg}
                            sectionVisible={visible}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

/* ── Main Section ── */
const Societies = () => {
    const [headerRef, headerVisible] = useInView({ threshold: 0.05, rootMargin: '-20px 0px' });

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
            <style>{styles}</style>

            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.015) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
                pointerEvents: 'none',
            }} />

            <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', position: 'relative' }}>

                <div
                    ref={headerRef}
                    style={{
                        textAlign: 'center',
                        marginBottom: '5rem',
                        opacity: headerVisible ? 1 : 0,
                        transform: headerVisible ? 'translateY(0)' : 'translateY(30px)',
                        transition: 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)'
                    }}
                >
                    <span style={{
                        fontSize: '0.6875rem', letterSpacing: '0.2em',
                        textTransform: 'uppercase', color: '#52525b',
                        display: 'block', marginBottom: '0.75rem',
                    }}>UDAAN Arts Club</span>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 500,
                        letterSpacing: '-0.03em', color: '#e4e4e7', margin: 0,
                    }}>Our Societies</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem' }}>
                    {societies.map((s, idx) => (
                        <SocietyRow key={idx} s={s} idx={idx} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Societies;
