import React from 'react';

const RegistrationsTab = ({ registrations, search, setSearch, loading }) => {
    // Group registrations by user
    const grouped = {};
    registrations.forEach(r => {
        const uid = r.users?.id || r.user_id || 'unknown';
        if (!grouped[uid]) {
            grouped[uid] = {
                user: r.users || {},
                events: [],
            };
        }
        grouped[uid].events.push({
            id: r.id,
            custom_id: r.custom_id,
            name: r.events?.name || '—',
            date: r.created_at,
            team_members: r.team_members,
            team_size: r.events?.team_size,
            checked_in: r.checked_in,
        });
    });
    const userList = Object.values(grouped).filter(g => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (g.user.name || '').toLowerCase().includes(s) ||
            (g.user.phone || '').includes(s) ||
            (g.user.email || '').toLowerCase().includes(s) ||
            (g.user.festiverse_id || '').toLowerCase().includes(s) ||
            g.events.some(e => e.name.toLowerCase().includes(s) || (e.custom_id || '').toLowerCase().includes(s));
    });
    const uniqueUsers = Object.keys(grouped).length;
    const checkedInCount = registrations.filter(r => r.checked_in).length;

    const exportCSV = () => {
        const headers = ['User Name', 'Phone', 'Email', 'College', 'Festiverse ID', 'Event', 'Registration ID', 'Checked In', 'Date'];
        const rows = [];
        Object.values(grouped).forEach(g => {
            g.events.forEach(ev => {
                rows.push([
                    g.user.name || '',
                    g.user.phone || '',
                    g.user.email || '',
                    g.user.college || '',
                    g.user.festiverse_id || '',
                    ev.name,
                    ev.custom_id || '',
                    ev.checked_in ? 'Yes' : 'No',
                    ev.date ? new Date(ev.date).toLocaleDateString() : '',
                ]);
            });
        });
        const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `festiverse_registrations_${new Date().toISOString().slice(0,10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    return (
        <div className="ap-fade">
            <div className="ap-sec-head">
                <div>
                    <div className="ap-sec-title">{registrations.length} Registrations</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 2, display: 'flex', gap: 12 }}>
                        <span>{uniqueUsers} unique participants</span>
                        <span style={{ color: '#86efac' }}>✓ {checkedInCount} checked in</span>
                        <span style={{ color: 'var(--muted2)' }}>○ {registrations.length - checkedInCount} pending</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input className="ap-search" placeholder="Search name, phone, email, Festiverse ID..." value={search} onChange={e => setSearch(e.target.value)} />
                    <button className="ap-btn-ghost" onClick={exportCSV} style={{ fontSize: '.72rem', padding: '6px 12px' }}>
                        ⬇ CSV
                    </button>
                </div>
            </div>
            {loading ? (
                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                            <div className="ap-skel ap-skel-bar" style={{ width: '22%', opacity: 1 - i * 0.1 }} />
                            <div className="ap-skel ap-skel-bar" style={{ width: '18%', opacity: 1 - i * 0.1 }} />
                            <div className="ap-skel ap-skel-bar" style={{ width: '28%', opacity: 1 - i * 0.1 }} />
                            <div className="ap-skel ap-skel-bar" style={{ width: '15%', opacity: 1 - i * 0.1 }} />
                        </div>
                    ))}
                </div>
            ) : userList.length === 0 ? (
                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">⊞</div><h4>No registrations</h4></div></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {userList.map((g, idx) => (
                        <div key={idx} className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                            {/* User header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,.015)' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.85rem', fontWeight: 700, color: 'var(--accent)', flexShrink: 0, border: '1px solid var(--border)' }}>
                                    {(g.user.name || '?')[0].toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: '.88rem', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                        {g.user.name || '—'}
                                        {g.user.festiverse_id && <span style={{ fontSize: '.62rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '.04em', padding: '1px 5px', background: 'rgba(249,115,22,.1)', borderRadius: 4, border: '1px solid rgba(249,115,22,.2)' }}>{g.user.festiverse_id}</span>}
                                        {g.user.has_paid ? <span style={{ color: '#86efac', background: 'rgba(34,197,94,.1)', padding: '2px 6px', borderRadius: 4, fontSize: '.65rem', fontWeight: 600 }}>Paid</span> : <span style={{ color: '#fca5a5', background: 'rgba(239,68,68,.1)', padding: '2px 6px', borderRadius: 4, fontSize: '.65rem', fontWeight: 600 }}>Unpaid</span>}
                                    </div>
                                    <div style={{ fontSize: '.72rem', color: 'var(--muted)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        <span>📞 {g.user.phone || '—'}</span>
                                        {g.user.email && <span>✉ {g.user.email}</span>}
                                        {g.user.college && <span>🎓 {g.user.college}</span>}
                                    </div>
                                </div>
                                <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--accent)', background: 'rgba(249,115,22,.1)', padding: '4px 10px', borderRadius: 6, border: '1px solid rgba(249,115,22,.2)', flexShrink: 0 }}>
                                    {g.events.length} event{g.events.length > 1 ? 's' : ''}
                                </div>
                            </div>
                            {/* Events */}
                            <div style={{ padding: '12px 18px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                {g.events.map((ev, ei) => (
                                    <div key={ei} style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                        padding: '5px 12px', borderRadius: 8,
                                        background: ev.checked_in ? 'rgba(34,197,94,.06)' : 'var(--surface2)',
                                        border: `1px solid ${ev.checked_in ? 'rgba(34,197,94,.2)' : 'var(--border)'}`,
                                        fontSize: '.78rem', fontWeight: 500, color: 'var(--text)',
                                    }}>
                                        {ev.checked_in && <span style={{ color: '#4ade80', fontSize: '.7rem' }}>✓</span>}
                                        <span>{ev.name}</span>
                                        {ev.custom_id && <span style={{ fontSize: '.65rem', padding: '1px 5px', background: 'var(--border)', borderRadius: 4, marginLeft: 6, color: 'var(--text)', fontWeight: '500', letterSpacing: '0.05em' }}>{ev.custom_id}</span>}
                                        {ev.team_size > 1 && <span style={{ fontSize: '.6rem', color: 'var(--accent)', fontWeight: 700 }}>TEAM</span>}
                                        {ev.team_members && ev.team_members.length > 0 && (
                                            <span style={{ fontSize: '.65rem', color: 'var(--muted)' }}>
                                                ({ev.team_members.map(m => m.name).join(', ')})
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RegistrationsTab;
