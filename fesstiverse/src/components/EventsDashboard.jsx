import React from 'react';

const events = [
    { name: 'Solo Dance', location: 'Main Stage', date: '21 Oct' },
    { name: 'Battle of Bands', location: 'OAT', date: '22 Oct' },
    { name: 'Face Painting', location: 'Art Gallery', date: '21 Oct' },
    { name: 'Debate', location: 'Seminar Hall', date: '20 Oct' },
    { name: 'Solo Singing', location: 'Auditorium', date: '22 Oct' },
    { name: 'Wall Painting', location: 'Campus Walls', date: '20 Oct' },
];

const EventsDashboard = () => {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#fff' }}>Select Events</h2>
                <span style={{ fontSize: '0.875rem', color: '#22d3ee' }}>Welcome, Participant</span>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '1rem',
            }}>
                {events.map((ev, i) => (
                    <label
                        key={i}
                        style={{
                            cursor: 'pointer',
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(168, 85, 247, 0.2)',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '1rem',
                            transition: 'border-color 0.3s',
                        }}
                    >
                        <input type="checkbox" style={{ marginTop: '0.25rem', accentColor: '#06b6d4', width: '1rem', height: '1rem' }} />
                        <div>
                            <h3 style={{ fontWeight: 700, color: '#fff' }}>{ev.name}</h3>
                            <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.25rem' }}>{ev.location} • {ev.date}</p>
                        </div>
                    </label>
                ))}
            </div>

            <button style={{
                marginTop: '2rem',
                padding: '0.5rem 1.5rem',
                backgroundColor: '#0891b2',
                color: '#000',
                fontWeight: 700,
                borderRadius: '0.5rem',
                cursor: 'pointer',
                border: 'none',
            }}>
                Confirm Selection
            </button>
        </div>
    );
};

export default EventsDashboard;
