import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

const TABS = ['Registrations', 'Messages', 'Users', 'Events', 'Team', 'Gallery'];

const AdminPanel = ({ onClose }) => {
    const [adminToken, setAdminToken] = useState(localStorage.getItem('festiverse_admin_token') || '');
    const [isAuthed, setIsAuthed] = useState(!!localStorage.getItem('festiverse_admin_token'));
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [activeTab, setActiveTab] = useState('Registrations');

    // Data states
    const [registrations, setRegistrations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [team, setTeam] = useState([]);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form states
    const [newEvent, setNewEvent] = useState({ name: '', location: '', date: '', description: '' });
    const [newTeam, setNewTeam] = useState({ name: '', role: '', bio: '', social_link: '' });
    const [teamImage, setTeamImage] = useState(null);
    const [galleryImage, setGalleryImage] = useState(null);
    const [galleryMeta, setGalleryMeta] = useState({ title: '', category: '' });

    // Admin login
    const handleAdminLogin = async () => {
        setLoginError('');
        try {
            const data = await apiFetch('/api/admin/login', {
                method: 'POST',
                body: JSON.stringify({ password }),
            });
            localStorage.setItem('festiverse_admin_token', data.token);
            setAdminToken(data.token);
            setIsAuthed(true);
        } catch (err) {
            setLoginError(err.message);
        }
    };

    const adminFetch = async (endpoint, options = {}) => {
        const headers = { ...(options.headers || {}) };
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        headers['Authorization'] = `Bearer ${adminToken}`;
        const res = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${endpoint}`,
            { ...options, headers }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Error');
        return data;
    };

    // Fetch data based on active tab
    useEffect(() => {
        if (!isAuthed) return;
        fetchTabData();
    }, [activeTab, isAuthed]);

    const fetchTabData = async () => {
        setLoading(true);
        try {
            switch (activeTab) {
                case 'Registrations': {
                    const d = await adminFetch('/api/admin/registrations');
                    setRegistrations(d.registrations || []);
                    break;
                }
                case 'Messages': {
                    const d = await adminFetch('/api/admin/messages');
                    setMessages(d.messages || []);
                    break;
                }
                case 'Users': {
                    const d = await adminFetch('/api/admin/users');
                    setUsers(d.users || []);
                    break;
                }
                case 'Events': {
                    const d = await apiFetch('/api/events');
                    setEvents(d.events || []);
                    break;
                }
                case 'Team': {
                    const d = await apiFetch('/api/team');
                    setTeam(d.team || []);
                    break;
                }
                case 'Gallery': {
                    const d = await apiFetch('/api/gallery');
                    setGallery(d.images || []);
                    break;
                }
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete handlers
    const deleteMessage = async (id) => {
        if (!confirm('Delete this message?')) return;
        await adminFetch(`/api/admin/messages/${id}`, { method: 'DELETE' });
        fetchTabData();
    };
    const deleteEvent = async (id) => {
        if (!confirm('Delete this event?')) return;
        await adminFetch(`/api/admin/events/${id}`, { method: 'DELETE' });
        fetchTabData();
    };
    const deleteTeamMember = async (id) => {
        if (!confirm('Remove this team member?')) return;
        await adminFetch(`/api/admin/team/${id}`, { method: 'DELETE' });
        fetchTabData();
    };
    const deleteGalleryImage = async (id) => {
        if (!confirm('Delete this image?')) return;
        await adminFetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
        fetchTabData();
    };

    // Add handlers
    const addEvent = async (e) => {
        e.preventDefault();
        await adminFetch('/api/admin/events', { method: 'POST', body: JSON.stringify(newEvent) });
        setNewEvent({ name: '', location: '', date: '', description: '' });
        fetchTabData();
    };

    const addTeamMember = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', newTeam.name);
        formData.append('role', newTeam.role);
        formData.append('bio', newTeam.bio);
        formData.append('social_link', newTeam.social_link);
        if (teamImage) formData.append('image', teamImage);
        await adminFetch('/api/admin/team', { method: 'POST', body: formData });
        setNewTeam({ name: '', role: '', bio: '', social_link: '' });
        setTeamImage(null);
        fetchTabData();
    };

    const addGalleryImage = async (e) => {
        e.preventDefault();
        if (!galleryImage) return alert('Please select an image.');
        const formData = new FormData();
        formData.append('image', galleryImage);
        formData.append('title', galleryMeta.title);
        formData.append('category', galleryMeta.category);
        await adminFetch('/api/admin/gallery', { method: 'POST', body: formData });
        setGalleryMeta({ title: '', category: '' });
        setGalleryImage(null);
        fetchTabData();
    };

    const handleLogout = () => {
        localStorage.removeItem('festiverse_admin_token');
        setAdminToken('');
        setIsAuthed(false);
    };

    // ─── Styles ───
    const s = {
        overlay: { position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(8px)', overflowY: 'auto' },
        container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
        title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff' },
        closeBtn: { background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#a1a1aa', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem' },
        tabs: { display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
        tab: (active) => ({ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, background: active ? 'linear-gradient(135deg, #7c3aed, #0891b2)' : 'rgba(255,255,255,0.06)', color: active ? '#fff' : '#a1a1aa', transition: 'all 0.2s' }),
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' },
        th: { textAlign: 'left', padding: '0.75rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#a1a1aa', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' },
        td: { padding: '0.75rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#d4d4d8', fontSize: '0.8rem' },
        delBtn: { background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)', color: '#f87171', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', cursor: 'pointer', fontSize: '0.7rem' },
        formCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.5rem' },
        formTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#e4e4e7', marginBottom: '1rem' },
        formRow: { display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' },
        input: { flex: 1, minWidth: '140px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.8rem', outline: 'none' },
        submitBtn: { padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #7c3aed, #0891b2)', border: 'none', borderRadius: '0.375rem', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' },
        empty: { color: '#71717a', textAlign: 'center', padding: '2rem', fontSize: '0.85rem' },
        loginBox: { maxWidth: '360px', margin: '15vh auto', padding: '2rem', background: '#18181b', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '1rem' },
    };

    // ─── Login Screen ───
    if (!isAuthed) {
        return (
            <div style={s.overlay}>
                <div style={s.loginBox}>
                    <h2 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Admin Login</h2>
                    {loginError && <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{loginError}</p>}
                    <input
                        type="password"
                        placeholder="Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                        style={{ ...s.input, width: '100%', marginBottom: '1rem' }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={handleAdminLogin} style={s.submitBtn}>Login</button>
                        <button onClick={onClose} style={s.closeBtn}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Tab Content Renderers ───
    const renderRegistrations = () => (
        <table style={s.table}>
            <thead>
                <tr>
                    <th style={s.th}>User</th>
                    <th style={s.th}>Event</th>
                    <th style={s.th}>Date</th>
                </tr>
            </thead>
            <tbody>
                {registrations.length === 0 ? (
                    <tr><td colSpan={3} style={s.empty}>No registrations yet</td></tr>
                ) : registrations.map((r) => (
                    <tr key={r.id}>
                        <td style={s.td}>{r.users?.name || '—'}<br /><span style={{ color: '#71717a', fontSize: '0.7rem' }}>{r.users?.phone}</span></td>
                        <td style={s.td}>{r.events?.name || '—'}</td>
                        <td style={s.td}>{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderMessages = () => (
        <table style={s.table}>
            <thead>
                <tr>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>Message</th>
                    <th style={s.th}>Date</th>
                    <th style={s.th}></th>
                </tr>
            </thead>
            <tbody>
                {messages.length === 0 ? (
                    <tr><td colSpan={5} style={s.empty}>No messages yet</td></tr>
                ) : messages.map((m) => (
                    <tr key={m.id}>
                        <td style={s.td}>{m.name}</td>
                        <td style={s.td}>{m.email}</td>
                        <td style={{ ...s.td, maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</td>
                        <td style={s.td}>{new Date(m.created_at).toLocaleDateString()}</td>
                        <td style={s.td}><button style={s.delBtn} onClick={() => deleteMessage(m.id)}>Delete</button></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderUsers = () => (
        <table style={s.table}>
            <thead>
                <tr>
                    <th style={s.th}>Name</th>
                    <th style={s.th}>Phone</th>
                    <th style={s.th}>Email</th>
                    <th style={s.th}>College</th>
                    <th style={s.th}>Joined</th>
                </tr>
            </thead>
            <tbody>
                {users.length === 0 ? (
                    <tr><td colSpan={5} style={s.empty}>No users yet</td></tr>
                ) : users.map((u) => (
                    <tr key={u.id}>
                        <td style={s.td}>{u.name}</td>
                        <td style={s.td}>{u.phone}</td>
                        <td style={s.td}>{u.email || '—'}</td>
                        <td style={s.td}>{u.college || '—'}</td>
                        <td style={s.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    const renderEvents = () => (
        <>
            <div style={s.formCard}>
                <div style={s.formTitle}>Add New Event</div>
                <form onSubmit={addEvent}>
                    <div style={s.formRow}>
                        <input style={s.input} placeholder="Event Name *" required value={newEvent.name} onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })} />
                        <input style={s.input} placeholder="Location" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                        <input style={s.input} type="date" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                    </div>
                    <div style={s.formRow}>
                        <input style={s.input} placeholder="Description" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                        <button type="submit" style={s.submitBtn}>Add Event</button>
                    </div>
                </form>
            </div>
            <table style={s.table}>
                <thead>
                    <tr>
                        <th style={s.th}>Name</th>
                        <th style={s.th}>Location</th>
                        <th style={s.th}>Date</th>
                        <th style={s.th}></th>
                    </tr>
                </thead>
                <tbody>
                    {events.length === 0 ? (
                        <tr><td colSpan={4} style={s.empty}>No events yet</td></tr>
                    ) : events.map((ev) => (
                        <tr key={ev.id}>
                            <td style={s.td}>{ev.name}</td>
                            <td style={s.td}>{ev.location || '—'}</td>
                            <td style={s.td}>{ev.date ? new Date(ev.date).toLocaleDateString() : '—'}</td>
                            <td style={s.td}><button style={s.delBtn} onClick={() => deleteEvent(ev.id)}>Delete</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );

    const renderTeam = () => (
        <>
            <div style={s.formCard}>
                <div style={s.formTitle}>Add Team Member</div>
                <form onSubmit={addTeamMember}>
                    <div style={s.formRow}>
                        <input style={s.input} placeholder="Name *" required value={newTeam.name} onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })} />
                        <input style={s.input} placeholder="Role *" required value={newTeam.role} onChange={(e) => setNewTeam({ ...newTeam, role: e.target.value })} />
                    </div>
                    <div style={s.formRow}>
                        <input style={s.input} placeholder="Bio" value={newTeam.bio} onChange={(e) => setNewTeam({ ...newTeam, bio: e.target.value })} />
                        <input style={s.input} placeholder="Social Link" value={newTeam.social_link} onChange={(e) => setNewTeam({ ...newTeam, social_link: e.target.value })} />
                    </div>
                    <div style={s.formRow}>
                        <input type="file" accept="image/*" onChange={(e) => setTeamImage(e.target.files[0])} style={{ color: '#a1a1aa', fontSize: '0.8rem' }} />
                        <button type="submit" style={s.submitBtn}>Add Member</button>
                    </div>
                </form>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {team.length === 0 ? (
                    <p style={s.empty}>No team members yet</p>
                ) : team.map((m) => (
                    <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1rem', textAlign: 'center' }}>
                        {m.image_url && <img src={m.image_url} alt={m.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 0.75rem', display: 'block', border: '2px solid rgba(124,58,237,0.3)' }} />}
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{m.name}</div>
                        <div style={{ color: '#a78bfa', fontSize: '0.75rem', marginTop: '0.25rem' }}>{m.role}</div>
                        {m.bio && <div style={{ color: '#71717a', fontSize: '0.7rem', marginTop: '0.5rem' }}>{m.bio}</div>}
                        <button style={{ ...s.delBtn, marginTop: '0.75rem' }} onClick={() => deleteTeamMember(m.id)}>Remove</button>
                    </div>
                ))}
            </div>
        </>
    );

    const renderGallery = () => (
        <>
            <div style={s.formCard}>
                <div style={s.formTitle}>Upload Image</div>
                <form onSubmit={addGalleryImage}>
                    <div style={s.formRow}>
                        <input type="file" accept="image/*" onChange={(e) => setGalleryImage(e.target.files[0])} style={{ color: '#a1a1aa', fontSize: '0.8rem' }} />
                        <input style={s.input} placeholder="Title" value={galleryMeta.title} onChange={(e) => setGalleryMeta({ ...galleryMeta, title: e.target.value })} />
                        <input style={s.input} placeholder="Category" value={galleryMeta.category} onChange={(e) => setGalleryMeta({ ...galleryMeta, category: e.target.value })} />
                        <button type="submit" style={s.submitBtn}>Upload</button>
                    </div>
                </form>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                {gallery.length === 0 ? (
                    <p style={s.empty}>No images yet</p>
                ) : gallery.map((img) => (
                    <div key={img.id} style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <img src={img.url} alt={img.title} style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }} />
                        <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.6)' }}>
                            <div style={{ color: '#d4d4d8', fontSize: '0.75rem', fontWeight: 600 }}>{img.title || 'Untitled'}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                                <span style={{ color: '#71717a', fontSize: '0.65rem' }}>{img.category}</span>
                                <button style={s.delBtn} onClick={() => deleteGalleryImage(img.id)}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const tabContent = {
        Registrations: renderRegistrations,
        Messages: renderMessages,
        Users: renderUsers,
        Events: renderEvents,
        Team: renderTeam,
        Gallery: renderGallery,
    };

    return (
        <div style={s.overlay}>
            <div style={s.container}>
                {/* Header */}
                <div style={s.header}>
                    <h1 style={s.title}>⚡ Admin Panel</h1>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{ ...s.closeBtn, borderColor: 'rgba(248,113,113,0.3)', color: '#fca5a5' }} onClick={handleLogout}>Logout</button>
                        <button style={s.closeBtn} onClick={onClose}>✕ Close</button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={s.tabs}>
                    {TABS.map((tab) => (
                        <button key={tab} style={s.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <p style={{ color: '#a1a1aa', textAlign: 'center', padding: '3rem' }}>Loading...</p>
                ) : (
                    tabContent[activeTab]()
                )}
            </div>
        </div>
    );
};

export default AdminPanel;
