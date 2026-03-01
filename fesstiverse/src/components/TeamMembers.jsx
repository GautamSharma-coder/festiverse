import React, { useState } from 'react';

const getMembers = (batchYear) => Array.from({ length: 10 }, (_, i) => ({
    id: `${batchYear}-${i + 1}`,
    name: `Member ${i + 1}`,
    batch: `Batch ${batchYear}`,
    realName: 'John Doe',
    role: 'Creative Lead',
    phone: '+91 98765 43210',
}));

const members2k24 = getMembers('2k24');
const members2k23 = getMembers('2k23');

const TeamMembers = () => {
    const [activeBatch, setActiveBatch] = useState('2k24');
    const members = activeBatch === '2k24' ? members2k24 : members2k23;

    return (
        <section id="members" style={{ padding: '8rem 0', background: 'rgba(24, 24, 27, 0.3)' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.875rem', fontWeight: 500, color: '#e4e4e7' }}>The Team</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setActiveBatch('2k24')}
                            style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                background: activeBatch === '2k24' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                fontSize: '0.75rem',
                                color: activeBatch === '2k24' ? '#fff' : '#71717a',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}>2k24</button>
                        <button
                            onClick={() => setActiveBatch('2k23')}
                            style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '9999px',
                                background: activeBatch === '2k23' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                fontSize: '0.75rem',
                                color: activeBatch === '2k23' ? '#fff' : '#71717a',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}>2k23</button>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '1.5rem',
                }}>
                    {members.map((m) => (
                        <div key={m.id} className="group" style={{ height: '16rem', perspective: '1000px', cursor: 'pointer' }}>
                            <div className="group-hover:rotate-y-180" style={{
                                position: 'relative',
                                width: '100%',
                                height: '100%',
                                transition: 'transform 0.7s',
                                transformStyle: 'preserve-3d',
                            }}>
                                {/* Front */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: '#27272a',
                                    borderRadius: '0.75rem',
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
                                    }}>
                                        <img
                                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            alt="avatar"
                                        />
                                    </div>
                                    <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#e4e4e7' }}>{m.name}</h3>
                                    <p style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.25rem' }}>{m.batch}</p>
                                </div>

                                {/* Back */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: '#7f1d1d',
                                    borderRadius: '0.75rem',
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '1rem',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                }}>
                                    <h3 style={{ color: '#fff', fontWeight: 700 }}>{m.realName}</h3>
                                    <p style={{ fontSize: '0.625rem', color: '#fecaca', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>{m.role}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#fecaca' }}>{m.phone}</p>
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
