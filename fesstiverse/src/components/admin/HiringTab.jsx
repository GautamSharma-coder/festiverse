import React from 'react';

const HiringTab = ({ hiringApps, search, setSearch, loading, deleteHiringApp }) => {
    const filtered = hiringApps.filter(a => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (a.name || '').toLowerCase().includes(s) ||
            (a.email || '').toLowerCase().includes(s) ||
            (a.role || '').toLowerCase().includes(s) ||
            (a.branch || '').toLowerCase().includes(s) ||
            (a.roll_no || '').toLowerCase().includes(s);
    });

    return (
        <div className="ap-fade">
            <div className="ap-sec-head">
                <div>
                    <div className="ap-sec-title">{hiringApps.length} Applications</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 2 }}>
                        {hiringApps.filter(a => a.role === 'coordinator').length} coordinators · {hiringApps.filter(a => a.role === 'volunteer').length} volunteers
                    </div>
                </div>
                <input className="ap-search" placeholder="Search by name, email, role, branch..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loading ? (
                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                            <div className="ap-skel ap-skel-bar" style={{ width: '20%', opacity: 1 - i * 0.1 }} />
                            <div className="ap-skel ap-skel-bar" style={{ width: '25%', opacity: 1 - i * 0.1 }} />
                            <div className="ap-skel ap-skel-bar" style={{ width: '15%', opacity: 1 - i * 0.1 }} />
                            <div className="ap-skel ap-skel-bar" style={{ width: '15%', opacity: 1 - i * 0.1 }} />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">📋</div><h4>No hiring applications yet</h4></div></div>
            ) : (
                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="ap-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Branch</th>
                                    <th>Batch</th>
                                    <th>Reg / Roll</th>
                                    <th>Resume</th>
                                    <th>Date</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(a => (
                                    <tr key={a.id}>
                                        <td style={{ fontWeight: 600 }}>{a.name}</td>
                                        <td>
                                            <span style={{
                                                textTransform: 'capitalize',
                                                color: a.role === 'coordinator' ? '#c084fc' : '#22d3ee',
                                                background: a.role === 'coordinator' ? 'rgba(168,85,247,.1)' : 'rgba(6,182,212,.1)',
                                                padding: '2px 8px', borderRadius: 4, fontSize: '.72rem', fontWeight: 600,
                                                border: a.role === 'coordinator' ? '1px solid rgba(168,85,247,.2)' : '1px solid rgba(6,182,212,.2)',
                                            }}>{a.role}</span>
                                        </td>
                                        <td style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{a.email}</td>
                                        <td style={{ color: 'var(--muted)' }}>{a.phone}</td>
                                        <td>{a.branch}</td>
                                        <td>{a.batch}</td>
                                        <td style={{ fontSize: '.78rem' }}>{a.reg_no} / {a.roll_no}</td>
                                        <td>
                                            {a.resume_url ? (
                                                <a href={a.resume_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontSize: '.78rem', fontWeight: 600 }}>View</a>
                                            ) : '—'}
                                        </td>
                                        <td style={{ color: 'var(--muted)', fontSize: '.72rem', whiteSpace: 'nowrap' }}>
                                            {a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}
                                        </td>
                                        <td>
                                            <div className="ap-actions">
                                                <button className="ap-del" onClick={() => deleteHiringApp(a.id)}>✕</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HiringTab;
