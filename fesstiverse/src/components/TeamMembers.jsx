import React, { useState, useEffect } from 'react';
import { proxyImageUrl } from '../lib/proxyImage';

const roles = ['Senior Coordinator', 'Coordinator', 'Sub Coordinator'];

const roleColors = {
    'Senior Coordinator': { bg: '#7f1d1d', border: 'rgba(239,68,68,0.3)', text: '#fecaca', accent: '#f87171', tabBg: 'rgba(239,68,68,0.12)', tabBorder: 'rgba(239,68,68,0.25)' },
    'Coordinator': { bg: '#4c1d95', border: 'rgba(168,85,247,0.3)', text: '#e9d5ff', accent: '#c084fc', tabBg: 'rgba(168,85,247,0.12)', tabBorder: 'rgba(168,85,247,0.25)' },
    'Sub Coordinator': { bg: '#164e63', border: 'rgba(6,182,212,0.3)', text: '#a5f3fc', accent: '#22d3ee', tabBg: 'rgba(6,182,212,0.12)', tabBorder: 'rgba(6,182,212,0.25)' },
};

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TeamMembers = () => {
    const [activeRole, setActiveRole] = useState('Senior Coordinator');
    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch(`${API}/api/team`)
            .then((r) => r.json())
            .then((d) => {
                if (d.success) setAllMembers(d.members || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    // Filter by category and search
    let members = allMembers.filter((m) => (m.category || 'Coordinator') === activeRole);

    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        members = members.filter(m =>
            (m.name || '').toLowerCase().includes(q) ||
            (m.role || '').toLowerCase().includes(q) ||
            (m.society || '').toLowerCase().includes(q)
        );
    }
    const colors = roleColors[activeRole];

    return (
        <section id="members" style={{ padding: '6rem 0', background: 'rgba(24, 24, 27, 0.3)' }}>
            <style>{`
                .flip-card:hover .flip-inner { transform: rotateY(180deg); }
                .members-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
                    gap: 1.5rem;
                }
                @media (max-width: 640px) {
                    .members-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1rem;
                    }
                }
            `}</style>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 600, color: '#e4e4e7', marginBottom: '0.5rem' }}>The Team</h2>
                    <p style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '1rem' }}>The people who make it all happen</p>
                    <input
                        type="text"
                        placeholder="🔍 Search by name, role, or society..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '10px',
                            padding: '10px 16px',
                            color: '#e4e4e7',
                            fontSize: '0.85rem',
                            width: '100%',
                            maxWidth: '360px',
                            outline: 'none',
                            fontFamily: 'inherit',
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'rgba(249,115,22,0.4)'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                </div>

                {/* Role Tabs */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
                    {roles.map((role) => {
                        const rc = roleColors[role];
                        const count = allMembers.filter((m) => m.category === role).length;
                        return (
                            <button
                                key={role}
                                onClick={() => setActiveRole(role)}
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    background: activeRole === role ? rc.tabBg : 'transparent',
                                    color: activeRole === role ? rc.accent : '#71717a',
                                    border: activeRole === role ? `1px solid ${rc.tabBorder}` : '1px solid rgba(255,255,255,0.06)',
                                }}
                            >
                                {role} {count > 0 && <span style={{ opacity: 0.6 }}>({count})</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', color: '#71717a', padding: '3rem 0' }}>
                        Loading team members...
                    </div>
                )}

                {/* Empty state */}
                {!loading && members.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#71717a', padding: '3rem 0' }}>
                        <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.3 }}>👥</p>
                        <p>No {activeRole.toLowerCase()}s added yet.</p>
                        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Add them from the Admin Panel.</p>
                    </div>
                )}

                {/* Member Grid */}
                <div className="members-grid">
                    {members.map((m) => (
                        <div key={m.id} className="flip-card" style={{ height: '16rem', perspective: '1000px', cursor: 'pointer' }}>
                            <div className="flip-inner" style={{
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
                                }}>
                                    <div style={{
                                        width: '5rem',
                                        height: '5rem',
                                        background: '#3f3f46',
                                        borderRadius: '50%',
                                        marginBottom: '0.75rem',
                                        overflow: 'hidden',
                                        border: `2px solid ${colors.border}`,
                                    }}>
                                        <img
                                            src={proxyImageUrl(m.image_url) || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`}
                                            onError={e => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`; }}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            alt={m.name}
                                        />
                                    </div>
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e4e4e7' }}>{m.name}</h3>
                                    <p style={{ fontSize: '0.7rem', color: '#71717a', marginTop: '0.25rem' }}>Hover to see details</p>
                                </div>

                                {/* ── Back ── */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: colors.bg,
                                    borderRadius: '1rem',
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '1.25rem',
                                    border: `1px solid ${colors.border}`,
                                }}>
                                    <h3 style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', marginBottom: '0.75rem' }}>{m.name}</h3>

                                    <span style={{
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.12em',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '9999px',
                                        background: 'rgba(255,255,255,0.1)',
                                        color: colors.accent,
                                        marginBottom: '0.5rem',
                                    }}>
                                        {m.category || activeRole}
                                    </span>

                                    {m.society && (
                                        <p style={{ fontSize: '0.8rem', color: colors.text, textAlign: 'center', marginTop: '0.5rem' }}>
                                            {m.society}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TeamMembers;
