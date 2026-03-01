import React from 'react';

const societies = [
    {
        name: 'Fine Arts',
        icon: 'solar:palette-linear',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        bgFrom: 'rgba(127, 29, 29, 0.2)',
        iconColor: '#ef4444',
        accentColor: 'rgba(239, 68, 68, 0.5)',
        events: ['Painting & Sketching', 'Photography', 'Handicraft', 'Story Writing'],
        align: 'left',
    },
    {
        name: 'Drama',
        icon: 'solar:masks-linear',
        borderColor: 'rgba(245, 158, 11, 0.3)',
        bgFrom: 'rgba(146, 64, 14, 0.2)',
        iconColor: '#f59e0b',
        accentColor: 'rgba(245, 158, 11, 0.5)',
        events: ['Solo Acting', 'Group Drama', 'Stand-up Comedy'],
        align: 'right',
    },
    {
        name: 'Music & Dance',
        icon: 'solar:music-note-linear',
        borderColor: 'rgba(168, 85, 247, 0.3)',
        bgFrom: 'rgba(88, 28, 135, 0.2)',
        iconColor: '#a855f7',
        accentColor: 'rgba(168, 85, 247, 0.5)',
        events: ['Singing (Solo/Group)', 'Dancing (Classical/Western)', 'Poetry & Shayari'],
        align: 'left',
    },
];

const Societies = () => {
    return (
        <section id="society" className="py-32 relative" style={{ backgroundColor: '#0a0a0a' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto',marginTop: '2rem',padding: '0 1.5rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 500, letterSpacing: '-0.025em', marginBottom: '4rem', marginTop: '0rem', textAlign: 'center', color: '#e4e4e7',padding: '2em' }}>
                    Our Societies
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6rem' }}>
                    {societies.map((s, idx) => (
                        <div
                            key={idx}
                            className="group"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '2.5rem',
                            }}
                        >
                            {/* Row with circle + sub-events */}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: s.align === 'right' ? 'row-reverse' : 'row',
                                    alignItems: 'center',
                                    gap: '2.5rem',
                                    width: '100%',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                }}
                            >
                                {/* Circle */}
                                <div
                                    className="society-circle"
                                    style={{
                                        width: '10rem',
                                        height: '10rem',
                                        borderRadius: '50%',
                                        border: `1px solid ${s.borderColor}`,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: `linear-gradient(to bottom right, ${s.bgFrom}, black)`,
                                        flexShrink: 0,
                                        position: 'relative',
                                    }}
                                >
                                    <iconify-icon icon={s.icon} width="48" style={{ color: s.iconColor }}></iconify-icon>
                                </div>

                                {/* Sub-events */}
                                <div
                                    className="group-hover:opacity-100"
                                    style={{
                                        flex: 1,
                                        minWidth: '280px',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                        gap: '0.75rem',
                                        opacity: 0.5,
                                        transition: 'opacity 0.5s',
                                    }}
                                >
                                    {s.events.map((event, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '1rem',
                                                borderLeft: `2px solid ${s.accentColor}`,
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '0.25rem',
                                            }}
                                        >
                                            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#e4e4e7' }}>{event}</h4>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Society name below the circle row */}
                            <span style={{
                                fontSize: '0.75rem',
                                letterSpacing: '0.15em',
                                textTransform: 'uppercase',
                                color: '#a1a1aa',
                                marginTop: '-1.5rem',
                                marginBottom: '2rem',
                            }}>
                                {s.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Societies;
