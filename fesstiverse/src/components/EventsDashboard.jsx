import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

const EventsDashboard = ({ user }) => {
    const [events, setEvents] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [statusMsg, setStatusMsg] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await apiFetch('/api/events');
            setEvents(data.events || []);
        } catch (err) {
            console.error('Failed to fetch events:', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleEvent = (id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleConfirm = async () => {
        if (selected.size === 0) return alert('Please select at least one event.');
        setSubmitting(true);
        setStatusMsg('');
        try {
            const data = await apiFetch('/api/events/register', {
                method: 'POST',
                body: JSON.stringify({ eventIds: Array.from(selected) }),
            });
            setStatusMsg('✅ ' + data.message);
            setSelected(new Set());
        } catch (err) {
            setStatusMsg('❌ ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const userName = user?.name || 'Participant';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#fff' }}>Select Events</h2>
                <span style={{ fontSize: '0.875rem', color: '#22d3ee' }}>Welcome, {userName}</span>
            </div>

            {statusMsg && (
                <div style={{ padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.3)', color: statusMsg.startsWith('✅') ? '#4ade80' : '#f87171', fontSize: '0.875rem' }}>
                    {statusMsg}
                </div>
            )}

            {loading ? (
                <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '2rem' }}>Loading events...</p>
            ) : events.length === 0 ? (
                <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '2rem' }}>No events available yet.</p>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '1rem',
                }}>
                    {events.map((ev) => (
                        <label
                            key={ev.id}
                            style={{
                                cursor: 'pointer',
                                background: selected.has(ev.id) ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(12px)',
                                border: `1px solid ${selected.has(ev.id) ? 'rgba(168, 85, 247, 0.5)' : 'rgba(168, 85, 247, 0.2)'}`,
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '1rem',
                                transition: 'border-color 0.3s, background 0.3s',
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selected.has(ev.id)}
                                onChange={() => toggleEvent(ev.id)}
                                style={{ marginTop: '0.25rem', accentColor: '#06b6d4', width: '1rem', height: '1rem' }}
                            />
                            <div>
                                <h3 style={{ fontWeight: 700, color: '#fff' }}>{ev.name}</h3>
                                <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.25rem' }}>
                                    {ev.location} • {formatDate(ev.date)}
                                </p>
                            </div>
                        </label>
                    ))}
                </div>
            )}

            <button
                onClick={handleConfirm}
                disabled={submitting || selected.size === 0}
                style={{
                    marginTop: '2rem',
                    padding: '0.5rem 1.5rem',
                    backgroundColor: submitting ? '#065f73' : '#0891b2',
                    color: '#000',
                    fontWeight: 700,
                    borderRadius: '0.5rem',
                    cursor: (submitting || selected.size === 0) ? 'not-allowed' : 'pointer',
                    border: 'none',
                    opacity: selected.size === 0 ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                }}
            >
                {submitting ? 'Confirming...' : `Confirm Selection (${selected.size})`}
            </button>
        </div>
    );
};

export default EventsDashboard;
