import React, { useState } from 'react';

const UsersTab = ({ users, search, setSearch, editingUser, setEditingUser, updateUser, deleteUser }) => {
    const [paymentFilter, setPaymentFilter] = useState('all'); // all | paid | unpaid

    const filteredUsers = users.filter(u => {
        // Payment filter
        if (paymentFilter === 'paid' && !u.has_paid) return false;
        if (paymentFilter === 'unpaid' && u.has_paid) return false;
        // Search filter
        if (!search) return true;
        const s = search.toLowerCase();
        return (u.name || '').toLowerCase().includes(s) ||
            (u.phone || '').includes(s) ||
            (u.email || '').toLowerCase().includes(s) ||
            (u.festiverse_id || '').toLowerCase().includes(s) ||
            (u.college || '').toLowerCase().includes(s);
    });

    const paidCount = users.filter(u => u.has_paid).length;
    const unpaidCount = users.filter(u => !u.has_paid).length;

    const exportCSV = () => {
        const headers = ['Name', 'Phone', 'Email', 'College', 'Festiverse ID', 'T-Shirt Size', 'Payment', 'Joined'];
        const rows = filteredUsers.map(u => [
            u.name || '',
            u.phone || '',
            u.email || '',
            u.college || '',
            u.festiverse_id || '',
            u.t_shirt_size || '',
            u.has_paid ? 'Paid' : 'Unpaid',
            new Date(u.created_at).toLocaleDateString(),
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${(c || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `festiverse_users_${new Date().toISOString().slice(0,10)}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    return (
        <div className="ap-fade">
            {editingUser && (
                <div className="ap-edit-wrap">
                    <div className="ap-edit-wrap-title">✎ Edit User</div>
                    <form onSubmit={updateUser}>
                        <div className="ap-form-grid">
                            <div className="ap-field"><label>Name *</label><input required placeholder="User name" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} /></div>
                            <div className="ap-field"><label>Phone</label><input placeholder="Phone number" value={editingUser.phone} onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })} /></div>
                            <div className="ap-field"><label>Email</label><input type="email" placeholder="Email address" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} /></div>
                            <div className="ap-field"><label>College</label><input placeholder="College name" value={editingUser.college} onChange={e => setEditingUser({ ...editingUser, college: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                            <button type="submit" className="ap-btn-submit">Save Changes</button>
                            <button type="button" className="ap-btn-ghost" onClick={() => setEditingUser(null)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="ap-sec-head">
                <div>
                    <div className="ap-sec-title">{users.length} Users</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 2, display: 'flex', gap: 12 }}>
                        <span style={{ color: '#86efac' }}>● {paidCount} paid</span>
                        <span style={{ color: '#fca5a5' }}>● {unpaidCount} unpaid</span>
                        <span>Showing {filteredUsers.length}</span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input className="ap-search" placeholder="Search name, email, phone, ID..." value={search} onChange={e => setSearch(e.target.value)} />
                    <div style={{ display: 'flex', gap: 4 }}>
                        {['all', 'paid', 'unpaid'].map(f => (
                            <button key={f} onClick={() => setPaymentFilter(f)} style={{
                                padding: '6px 12px', borderRadius: 7, fontSize: '.72rem', fontWeight: 600,
                                fontFamily: 'var(--font-b)', cursor: 'pointer', transition: 'all .15s',
                                textTransform: 'uppercase', letterSpacing: '.06em',
                                background: paymentFilter === f ? (f === 'paid' ? 'rgba(34,197,94,.15)' : f === 'unpaid' ? 'rgba(239,68,68,.15)' : 'rgba(249,115,22,.15)') : 'none',
                                border: `1px solid ${paymentFilter === f ? (f === 'paid' ? 'rgba(34,197,94,.4)' : f === 'unpaid' ? 'rgba(239,68,68,.4)' : 'rgba(249,115,22,.4)') : 'var(--border)'}`,
                                color: paymentFilter === f ? (f === 'paid' ? '#86efac' : f === 'unpaid' ? '#fca5a5' : 'var(--accent)') : 'var(--muted)',
                            }}>{f}</button>
                        ))}
                    </div>
                    <button className="ap-btn-ghost" onClick={exportCSV} style={{ fontSize: '.72rem', padding: '6px 12px' }}>
                        ⬇ CSV
                    </button>
                </div>
            </div>
            <div className="ap-card" style={{ padding: 0, overflow: 'auto' }}>
                <table className="ap-table">
                    <thead><tr><th>Name</th><th>Festiverse ID</th><th>Phone</th><th>Email</th><th>College</th><th>T-Shirt</th><th>Payment</th><th>Joined</th><th></th></tr></thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id}>
                                <td style={{ fontWeight: 600 }}>{u.name}</td>
                                <td>
                                    {u.festiverse_id
                                        ? <span style={{ fontFamily: 'var(--font-h)', fontWeight: 700, color: 'var(--accent)', fontSize: '.8rem', letterSpacing: '.04em' }}>{u.festiverse_id}</span>
                                        : <span style={{ color: 'var(--muted2)' }}>—</span>
                                    }
                                </td>
                                <td>{u.phone}</td>
                                <td style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{u.email || '—'}</td>
                                <td style={{ color: 'var(--muted)', fontSize: '.78rem', maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.college || '—'}</td>
                                <td>
                                    {u.t_shirt_size
                                        ? <span style={{ padding: '2px 8px', borderRadius: 5, background: 'rgba(168,85,247,.1)', color: '#c084fc', fontSize: '.7rem', fontWeight: 700, border: '1px solid rgba(168,85,247,.2)' }}>{u.t_shirt_size}</span>
                                        : <span style={{ color: 'var(--muted2)' }}>—</span>
                                    }
                                </td>
                                <td>{u.has_paid ? <span style={{ color: '#86efac', background: 'rgba(34,197,94,.1)', padding: '2px 6px', borderRadius: 4, fontSize: '.7rem' }}>Paid</span> : <span style={{ color: '#fca5a5', background: 'rgba(239,68,68,.1)', padding: '2px 6px', borderRadius: 4, fontSize: '.7rem' }}>Unpaid</span>}</td>
                                <td style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                                <td>
                                    <div className="ap-actions">
                                        <button className="ap-edit" onClick={() => { setEditingUser({ ...u, name: u.name || '', phone: u.phone || '', email: u.email || '', college: u.college || '' }); window.scrollTo(0, 0); }}>Edit</button>
                                        <button className="ap-del" onClick={() => deleteUser(u.id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && <tr><td colSpan={9}><div className="ap-empty"><div className="ap-empty-icon">⊙</div><h4>No users match filters</h4></div></td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTab;
