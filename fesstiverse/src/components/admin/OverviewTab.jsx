import React from 'react';

const OverviewTab = ({ registrations, users, events, messages }) => {
    return (
        <div className="ap-fade">
            <div className="ap-stats">
                <div className="ap-stat s-orange"><div className="ap-stat-val">{registrations.length}</div><div className="ap-stat-lbl">Registrations</div></div>
                <div className="ap-stat s-blue"><div className="ap-stat-val">{users.length}</div><div className="ap-stat-lbl">Users</div></div>
                <div className="ap-stat s-green"><div className="ap-stat-val">{events.length}</div><div className="ap-stat-lbl">Events</div></div>
                <div className="ap-stat s-red"><div className="ap-stat-val">{messages.length}</div><div className="ap-stat-lbl">Messages</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="ap-card">
                    <div className="ap-card-title"><span>◎</span> Recent Registrations</div>
                    {registrations.slice(0, 5).map(r => (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '.82rem' }}>
                            <span>{r.users?.name || '—'}</span>
                            <span style={{ color: 'var(--muted)', fontSize: '.75rem' }}>{r.events?.name || '—'}</span>
                        </div>
                    ))}
                    {registrations.length === 0 && <div className="ap-empty"><p>No registrations yet</p></div>}
                </div>
                <div className="ap-card">
                    <div className="ap-card-title"><span>◉</span> Recent Messages</div>
                    {messages.slice(0, 5).map(m => (
                        <div key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ fontSize: '.82rem', fontWeight: 600 }}>{m.name}</div>
                            <div style={{ fontSize: '.75rem', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.message}</div>
                        </div>
                    ))}
                    {messages.length === 0 && <div className="ap-empty"><p>No messages yet</p></div>}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
