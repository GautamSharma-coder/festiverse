import React from 'react';

const OverviewTab = ({ registrations, users, messages, analytics, activeGateway, toggleGateway }) => {
    return (
        <div className="ap-fade">
            <div className="ap-stats">
                <div className="ap-stat s-orange"><div className="ap-stat-val">{registrations.length}</div><div className="ap-stat-lbl">Registrations</div></div>
                <div className="ap-stat s-blue"><div className="ap-stat-val">{users.length}</div><div className="ap-stat-lbl">Total Users</div></div>
                <div className="ap-stat s-green"><div className="ap-stat-val">{analytics.uniqueVisitors || 0}</div><div className="ap-stat-lbl">Unique Visitors</div></div>
                <div className="ap-stat s-red"><div className="ap-stat-val" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {analytics.liveUsers || 0}
                    <span className="live-indicator" style={{ width: 8, height: 8, background: '#ef4444', borderRadius: '50%', boxShadow: '0 0 10px #ef4444' }}></span>
                </div><div className="ap-stat-lbl">Live Users</div></div>
            </div>

            <div className="ap-card" style={{ marginBottom: 28 }}>
                <div className="ap-card-title"><span>⚙</span> Payment Gateway Settings</div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        onClick={() => toggleGateway('razorpay')}
                        style={{
                            padding: '10px 20px',
                            background: activeGateway === 'razorpay' ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                            border: `1px solid ${activeGateway === 'razorpay' ? 'var(--accent)' : 'var(--border)'}`,
                            color: activeGateway === 'razorpay' ? 'var(--accent)' : 'var(--muted)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        Razorpay
                    </button>
                    <button
                        onClick={() => toggleGateway('upi')}
                        style={{
                            padding: '10px 20px',
                            background: activeGateway === 'upi' ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
                            border: `1px solid ${activeGateway === 'upi' ? 'var(--accent)' : 'var(--border)'}`,
                            color: activeGateway === 'upi' ? 'var(--accent)' : 'var(--muted)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'all 0.2s'
                        }}
                    >
                        Manual UPI
                    </button>
                    <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginLeft: '1rem' }}>
                        {activeGateway === 'razorpay' ? 'Automated payments via Razorpay are currently active.' : 'Manual UPI transfers (QR Code) are currently active. You must manually verify pending payments.'}
                    </div>
                </div>
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
