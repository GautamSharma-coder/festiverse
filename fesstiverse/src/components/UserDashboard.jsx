import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

const UserDashboard = ({ user, onProfileUpdate, onClose, onLogout }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', college: user?.college || '' });
    const [myEvents, setMyEvents] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchProfile();
        fetchMyEvents();
        fetchAllEvents();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await apiFetch('/api/auth/profile');
            if (data.user) {
                setProfile({ name: data.user.name || '', email: data.user.email || '', phone: data.user.phone || '', college: data.user.college || '' });
            }
        } catch { }
    };

    const fetchMyEvents = async () => {
        try {
            const data = await apiFetch('/api/events/my-events');
            setMyEvents(data.registrations || []);
        } catch { }
    };

    const fetchAllEvents = async () => {
        try {
            const data = await apiFetch('/api/events');
            setAllEvents(data.events || []);
        } catch { }
    };

    const saveProfile = async () => {
        setSaving(true);
        setMsg({ text: '', type: '' });
        try {
            const data = await apiFetch('/api/auth/profile', {
                method: 'PUT',
                body: JSON.stringify({ name: profile.name, email: profile.email, college: profile.college }),
            });
            setMsg({ text: '✅ Profile updated successfully!', type: 'success' });
            if (onProfileUpdate && data.user) {
                onProfileUpdate(data.user);
            }
        } catch (err) {
            setMsg({ text: '❌ ' + err.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const toggleEvent = (id) => {
        setSelectedEvents((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);
    };

    const registerEvents = async () => {
        if (selectedEvents.length === 0) return setMsg({ text: 'Please select at least one event.', type: 'error' });
        setLoading(true);
        try {
            await apiFetch('/api/events/register', { method: 'POST', body: JSON.stringify({ eventIds: selectedEvents }) });
            setMsg({ text: '✅ Registered for events!', type: 'success' });
            setSelectedEvents([]);
            fetchMyEvents();
        } catch (err) {
            setMsg({ text: '❌ ' + err.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const registeredIds = myEvents.map((r) => r.event_id);

    // ─── Styles ───
    const s = {
        overlay: { minHeight: '100vh', background: 'linear-gradient(180deg, #0a0a0a 0%, #18181b 100%)' },
        wrapper: { maxWidth: '56rem', margin: '0 auto', padding: '2rem 1.5rem', minHeight: '100vh' },
        topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
        backBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' },
        logoutBtn: { background: 'none', border: '1px solid rgba(248,113,113,0.3)', color: '#fca5a5', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.75rem' },
        header: { textAlign: 'center', marginBottom: '2rem' },
        title: { fontSize: '1.75rem', fontWeight: 700, backgroundImage: 'linear-gradient(to right, #c084fc, #22d3ee)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' },
        subtitle: { color: '#71717a', fontSize: '0.9rem', marginTop: '0.25rem' },
        tabs: { display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' },
        tab: (active) => ({ padding: '0.6rem 1.5rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, background: active ? 'linear-gradient(135deg, #7c3aed, #0891b2)' : 'rgba(255,255,255,0.05)', color: active ? '#fff' : '#a1a1aa', transition: 'all 0.25s', border: active ? 'none' : '1px solid rgba(255,255,255,0.08)' }),
        card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1rem' },
        label: { display: 'block', color: '#a1a1aa', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.375rem' },
        input: { width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', color: '#fff', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
        inputDisabled: { width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '0.5rem', padding: '0.625rem 0.875rem', color: '#52525b', fontSize: '0.875rem', cursor: 'not-allowed', boxSizing: 'border-box' },
        row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
        btn: { padding: '0.625rem 2rem', background: 'linear-gradient(135deg, #7c3aed, #0891b2)', border: 'none', borderRadius: '9999px', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', transition: 'opacity 0.2s' },
        msg: (type) => ({ padding: '0.75rem 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '1rem', background: type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, color: type === 'success' ? '#6ee7b7' : '#fca5a5' }),
        eventCard: (selected, registered) => ({ padding: '1rem', borderRadius: '0.75rem', border: `1px solid ${registered ? 'rgba(16,185,129,0.4)' : selected ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`, background: registered ? 'rgba(16,185,129,0.05)' : selected ? 'rgba(124,58,237,0.1)' : 'rgba(255,255,255,0.02)', cursor: registered ? 'default' : 'pointer', transition: 'all 0.2s' }),
        badge: (color) => ({ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', background: `rgba(${color},0.15)`, color: `rgba(${color},1)`, fontWeight: 600 }),
    };

    return (
        <div style={s.overlay}>
            <div style={s.wrapper}>
                {/* Top Bar */}
                <div style={s.topBar}>
                    <button style={s.backBtn} onClick={onClose}>
                        ← Back to Festiverse
                    </button>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ color: '#71717a', fontSize: '0.8rem' }}>Hi, {user?.name}!</span>
                        <button style={s.logoutBtn} onClick={onLogout}>Logout</button>
                    </div>
                </div>

                {/* Header */}
                <div style={s.header}>
                    <h2 style={s.title}>My Dashboard</h2>
                    <p style={s.subtitle}>Manage your profile and events</p>
                </div>

                {/* Tabs */}
                <div style={s.tabs}>
                    {['profile', 'my-events', 'register'].map((tab) => (
                        <button key={tab} style={s.tab(activeTab === tab)} onClick={() => { setActiveTab(tab); setMsg({ text: '', type: '' }); }}>
                            {tab === 'profile' ? '👤 Profile' : tab === 'my-events' ? '🎫 My Events' : '🎯 Register Events'}
                        </button>
                    ))}
                </div>

                {/* Message */}
                {msg.text && <div style={s.msg(msg.type)}>{msg.text}</div>}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div style={s.card}>
                        <div style={s.row}>
                            <div>
                                <label style={s.label}>Full Name</label>
                                <input style={s.input} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                            </div>
                            <div>
                                <label style={s.label}>Phone Number</label>
                                <input style={s.inputDisabled} value={profile.phone} disabled title="Phone cannot be changed" />
                            </div>
                        </div>
                        <div style={s.row}>
                            <div>
                                <label style={s.label}>Email</label>
                                <input style={s.input} type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                            </div>
                            <div>
                                <label style={s.label}>College</label>
                                <input style={s.input} value={profile.college} onChange={(e) => setProfile({ ...profile, college: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button style={{ ...s.btn, opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={saveProfile}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {/* My Events Tab */}
                {activeTab === 'my-events' && (
                    <div>
                        {myEvents.length === 0 ? (
                            <div style={{ ...s.card, textAlign: 'center' }}>
                                <p style={{ color: '#71717a', fontSize: '0.9rem' }}>You haven't registered for any events yet.</p>
                                <button style={{ ...s.btn, marginTop: '1rem' }} onClick={() => setActiveTab('register')}>Browse Events</button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                                {myEvents.map((reg) => (
                                    <div key={reg.id} style={s.eventCard(false, true)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{reg.events?.name || 'Event'}</h4>
                                            <span style={s.badge('16,185,129')}>Registered</span>
                                        </div>
                                        {reg.events?.location && <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>📍 {reg.events.location}</p>}
                                        {reg.events?.date && <p style={{ color: '#a1a1aa', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>📅 {new Date(reg.events.date).toLocaleDateString()}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Register Events Tab */}
                {activeTab === 'register' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            {allEvents.map((ev) => {
                                const isRegistered = registeredIds.includes(ev.id);
                                const isSelected = selectedEvents.includes(ev.id);
                                return (
                                    <div key={ev.id} style={s.eventCard(isSelected, isRegistered)} onClick={() => !isRegistered && toggleEvent(ev.id)}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{ev.name}</h4>
                                            {isRegistered && <span style={s.badge('16,185,129')}>Registered</span>}
                                            {isSelected && !isRegistered && <span style={s.badge('139,92,246')}>Selected</span>}
                                        </div>
                                        {ev.location && <p style={{ color: '#a1a1aa', fontSize: '0.8rem', margin: '0.5rem 0 0' }}>📍 {ev.location}</p>}
                                        {ev.date && <p style={{ color: '#a1a1aa', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>📅 {new Date(ev.date).toLocaleDateString()}</p>}
                                        {ev.description && <p style={{ color: '#52525b', fontSize: '0.75rem', margin: '0.5rem 0 0' }}>{ev.description}</p>}
                                    </div>
                                );
                            })}
                        </div>
                        {selectedEvents.length > 0 && (
                            <div style={{ textAlign: 'center' }}>
                                <button style={{ ...s.btn, opacity: loading ? 0.6 : 1 }} disabled={loading} onClick={registerEvents}>
                                    {loading ? 'Registering...' : `Register for ${selectedEvents.length} Event(s)`}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
