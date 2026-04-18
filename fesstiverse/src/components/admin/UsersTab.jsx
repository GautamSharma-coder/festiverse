import React from 'react';

const UsersTab = ({ users, search, setSearch, editingUser, setEditingUser, updateUser, deleteUser }) => {
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
                <div className="ap-sec-title">{users.length} Users</div>
                <input className="ap-search" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="ap-table">
                    <thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>College</th><th>Payment</th><th>Joined</th><th></th></tr></thead>
                    <tbody>
                        {users.filter(u => !search || (u.name || '').toLowerCase().includes(search.toLowerCase()) || (u.phone || '').includes(search)).map(u => (
                            <tr key={u.id}>
                                <td style={{ fontWeight: 600 }}>{u.name}</td>
                                <td>{u.phone}</td>
                                <td style={{ color: 'var(--muted)' }}>{u.email || '—'}</td>
                                <td style={{ color: 'var(--muted)' }}>{u.college || '—'}</td>
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
                        {users.length === 0 && <tr><td colSpan={6}><div className="ap-empty"><div className="ap-empty-icon">⊙</div><h4>No users yet</h4></div></td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTab;
