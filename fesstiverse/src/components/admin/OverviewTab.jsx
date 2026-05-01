import React from 'react';

const OverviewTab = ({ registrations, users, events, messages, analytics }) => {
    const paidUsers = users.filter(u => u.has_paid);
    const unpaidUsers = users.filter(u => !u.has_paid);
    const checkedIn = registrations.filter(r => r.checked_in);
    // Revenue estimate: assume ₹349 internal, ₹699 external — rough average ₹500 per paid user
    const revenueEstimate = paidUsers.length * 500;

    return (
        <div className="ap-fade">
            {/* Stats Row 1: Core Metrics */}
            <div className="ap-stats">
                <div className="ap-stat s-orange"><div className="ap-stat-val">{registrations.length}</div><div className="ap-stat-lbl">Registrations</div></div>
                <div className="ap-stat s-blue"><div className="ap-stat-val">{users.length}</div><div className="ap-stat-lbl">Total Users</div></div>
                <div className="ap-stat s-green">
                    <div className="ap-stat-val">{paidUsers.length}</div>
                    <div className="ap-stat-lbl">Paid Users</div>
                </div>
                <div className="ap-stat s-red"><div className="ap-stat-val" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {analytics.liveUsers || 0}
                    <span className="live-indicator" style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }}></span>
                </div><div className="ap-stat-lbl">Live Users</div></div>
            </div>

            {/* Stats Row 2: Secondary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
                <div className="ap-stat" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>{events.length}</div>
                    <div className="ap-stat-lbl">Events</div>
                </div>
                <div className="ap-stat" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa' }}>{checkedIn.length}</div>
                    <div className="ap-stat-lbl">Checked In</div>
                </div>
                <div className="ap-stat" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.4rem', fontWeight: 800, color: '#fb923c' }}>{unpaidUsers.length}</div>
                    <div className="ap-stat-lbl">Unpaid</div>
                </div>
                <div className="ap-stat" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px 18px' }}>
                    <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.2rem', fontWeight: 800, color: '#4ade80' }}>₹{revenueEstimate.toLocaleString('en-IN')}</div>
                    <div className="ap-stat-lbl">Est. Revenue</div>
                </div>
            </div>

            {/* Unique Visitors */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                <div style={{ flex: 1, background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.03))', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: '1.8rem' }}>👁</div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: '#93c5fd' }}>{analytics.uniqueVisitors || 0}</div>
                        <div style={{ fontSize: '.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginTop: 1 }}>Unique Visitors</div>
                    </div>
                </div>
                <div style={{ flex: 1, background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.03))', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ fontSize: '1.8rem' }}>📊</div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-h)', fontSize: '1.3rem', fontWeight: 800, color: '#86efac' }}>{paidUsers.length > 0 ? ((registrations.length / paidUsers.length).toFixed(1)) : '0'}</div>
                        <div style={{ fontSize: '.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600, marginTop: 1 }}>Avg Events / User</div>
                    </div>
                </div>
            </div>

            {/* Content Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Recent Registrations */}
                <div className="ap-card">
                    <div className="ap-card-title"><span>◎</span> Recent Registrations</div>
                    {registrations.slice(0, 6).map(r => (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '.82rem' }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.users?.name || '—'}</div>
                                <div style={{ fontSize: '.7rem', color: 'var(--muted)' }}>{r.users?.college || ''}</div>
                            </div>
                            <span style={{ color: 'var(--muted)', fontSize: '.72rem', flexShrink: 0, marginLeft: 8, maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.events?.name || '—'}</span>
                        </div>
                    ))}
                    {registrations.length === 0 && <div className="ap-empty"><p>No registrations yet</p></div>}
                </div>

                {/* Recent Users */}
                <div className="ap-card">
                    <div className="ap-card-title"><span>⊙</span> Recent Users</div>
                    {users.slice(0, 6).map(u => (
                        <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '.82rem' }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {u.name || '—'}
                                    {u.festiverse_id && <span style={{ fontSize: '.6rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '.04em' }}>{u.festiverse_id}</span>}
                                </div>
                                <div style={{ fontSize: '.68rem', color: 'var(--muted)' }}>{u.email || u.phone || ''}</div>
                            </div>
                            {u.has_paid
                                ? <span style={{ color: '#86efac', background: 'rgba(34,197,94,.1)', padding: '2px 6px', borderRadius: 4, fontSize: '.65rem', fontWeight: 600, flexShrink: 0 }}>Paid</span>
                                : <span style={{ color: '#fca5a5', background: 'rgba(239,68,68,.1)', padding: '2px 6px', borderRadius: 4, fontSize: '.65rem', fontWeight: 600, flexShrink: 0 }}>Unpaid</span>
                            }
                        </div>
                    ))}
                    {users.length === 0 && <div className="ap-empty"><p>No users yet</p></div>}
                </div>

                {/* Recent Messages */}
                <div className="ap-card" style={{ gridColumn: '1 / -1' }}>
                    <div className="ap-card-title"><span>◉</span> Recent Messages</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {messages.slice(0, 6).map(m => (
                            <div key={m.id} style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '.82rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{m.name}</span>
                                    <span style={{ fontSize: '.65rem', color: 'var(--muted)' }}>{m.email}</span>
                                </div>
                                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.message}</div>
                            </div>
                        ))}
                    </div>
                    {messages.length === 0 && <div className="ap-empty"><p>No messages yet</p></div>}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
