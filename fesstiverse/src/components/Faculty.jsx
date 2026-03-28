import React, { useState, useEffect } from 'react';
import proxyImageUrl from '../utils/proxyImageUrl';

const Faculty = () => {
    const [facultyMembers, setFacultyMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fallback colors for cards without specific BG styling
    const fallbackStyles = [
        { bg: '#4c1d00', border: 'rgba(249,115,22,0.3)', accent: '#f97316' },
        { bg: '#4c1d95', border: 'rgba(168,85,247,0.3)', accent: '#c084fc' },
        { bg: '#7f1d1d', border: 'rgba(239,68,68,0.3)', accent: '#f87171' },
        { bg: '#134e4a', border: 'rgba(20,184,166,0.3)', accent: '#2dd4bf' },
        { bg: '#14532d', border: 'rgba(34,197,94,0.3)', accent: '#4ade80' },
        { bg: '#1e3a5f', border: 'rgba(59,130,246,0.3)', accent: '#60a5fa' },
    ];

    useEffect(() => {
        const fetchFaculty = async () => {
            try {
                const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const response = await fetch(`${API}/api/faculty`);
                const data = await response.json();
                if (data.success && data.faculty) {
                    setFacultyMembers(data.faculty);
                }
            } catch (err) {
                console.error("Failed to fetch faculty:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFaculty();
    }, []);

    return (
        <section id="faculty" style={{ padding: '6rem 0', background: 'rgba(24, 24, 27, 0.3)' }}>
            <style>{`
                .faculty-flip-card:hover .faculty-flip-inner { transform: rotateY(180deg); }
            `}</style>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <span style={{
                        fontSize: '0.6875rem',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: '#52525b',
                        display: 'block',
                        marginBottom: '0.5rem',
                    }}>
                        UDAAN Arts Club
                    </span>
                    <h2 style={{ fontSize: '2rem', fontWeight: 600, color: '#e4e4e7', marginBottom: '0.5rem' }}>Our Faculty</h2>
                    <p style={{ color: '#71717a', fontSize: '0.9rem' }}>The mentors who shape the vision and make UDAAN soar</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#71717a', padding: '2rem' }}>Loading faculty...</div>
                ) : facultyMembers.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#71717a', padding: '2rem' }}>No faculty members to display.</div>
                ) : (
                    /* Faculty Grid — Flip Cards */
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                        gap: '1.5rem',
                    }}>
                        {facultyMembers.map((m, index) => {
                            const style = fallbackStyles[index % fallbackStyles.length];
                            const avatarUrl = proxyImageUrl(m.image_url) || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`;
                            const isFallback = !m.image_url;

                            return (
                                <div key={m.id} className="faculty-flip-card" style={{ height: '16rem', perspective: '1000px', cursor: 'pointer' }}>
                                    <div className="faculty-flip-inner" style={{
                                        position: 'relative',
                                        width: '100%',
                                        height: '100%',
                                        transition: 'transform 0.6s',
                                        transformStyle: 'preserve-3d',
                                    }}>
                                        {/* ── Front ── */}
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: '#27272a',
                                            borderRadius: '1rem',
                                            backfaceVisibility: 'hidden',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: '5rem',
                                                height: '5rem',
                                                background: '#3f3f46',
                                                borderRadius: '50%',
                                                marginBottom: '0.75rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: `2px solid ${style.border}`,
                                                overflow: 'hidden'
                                            }}>
                                                <img
                                                    src={avatarUrl}
                                                    alt={m.name}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: isFallback ? 'contain' : 'cover',
                                                        padding: isFallback ? '10px' : '0'
                                                    }}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`; e.target.style.padding = '10px'; e.target.style.objectFit = 'contain'; }}
                                                />
                                            </div>
                                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e4e4e7' }}>{m.name}</h3>
                                            <p style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '0.25rem' }}>Hover to see details</p>
                                        </div>

                                        {/* ── Back ── */}
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: style.bg,
                                            borderRadius: '1rem',
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '1.25rem',
                                            border: `1px solid ${style.border}`,
                                        }}>
                                            <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem', textAlign: 'center' }}>{m.name}</h3>

                                            <span style={{
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.12em',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '9999px',
                                                background: 'rgba(255,255,255,0.1)',
                                                color: style.accent,
                                                marginBottom: '0.5rem',
                                                textAlign: 'center',
                                            }}>
                                                {m.role}
                                            </span>

                                            <p style={{
                                                fontSize: '0.75rem',
                                                color: 'rgba(255,255,255,0.75)',
                                                textAlign: 'center',
                                                marginTop: '0.5rem',
                                                lineHeight: 1.5,
                                            }}>
                                                {m.department}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default Faculty;
