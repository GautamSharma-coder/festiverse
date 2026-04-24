import React from 'react';

const NoticesTab = ({ notices, newNotice, setNewNotice, editingNotice, setEditingNotice, addNotice, updateNotice, deleteNotice }) => {
    const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ec4899'];

    return (
        <div className="ap-fade">
            {editingNotice ? (
                <div className="ap-edit-wrap" style={{ marginBottom: 20 }}>
                    <div className="ap-edit-wrap-title">✎ Edit Notice</div>
                    <form onSubmit={updateNotice}>
                        <div className="ap-form-grid">
                            <div className="ap-field"><label>Title *</label><input placeholder="Notice title" value={editingNotice.title} onChange={e => setEditingNotice({ ...editingNotice, title: e.target.value })} required /></div>
                            <div className="ap-field"><label>Description</label><input placeholder="Short description" value={editingNotice.description} onChange={e => setEditingNotice({ ...editingNotice, description: e.target.value })} /></div>
                            <div className="ap-field"><label>Link URL</label><input type="url" placeholder="https://example.com" value={editingNotice.link_url || ''} onChange={e => setEditingNotice({ ...editingNotice, link_url: e.target.value })} /></div>
                            <div className="ap-field"><label>Link Text</label><input placeholder="Click here, Read more…" value={editingNotice.link_text || ''} onChange={e => setEditingNotice({ ...editingNotice, link_text: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
                            <div className="ap-field" style={{ marginBottom: 0 }}>
                                <label>Color</label>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    {COLORS.map(c => (
                                        <button type="button" key={c} onClick={() => setEditingNotice({ ...editingNotice, color: c })} style={{
                                            width: 28, height: 28, borderRadius: '50%', background: c, border: editingNotice.color === c ? '3px solid #fff' : '2px solid transparent',
                                            cursor: 'pointer', transition: 'all .15s', transform: editingNotice.color === c ? 'scale(1.15)' : 'scale(1)',
                                        }} />
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto', marginTop: 16 }}>
                                <button className="ap-btn-submit" type="submit">Save</button>
                                <button className="ap-btn-ghost" type="button" onClick={() => setEditingNotice(null)}>Cancel</button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="ap-card" style={{ marginBottom: 20 }}>
                    <div className="ap-card-title"><span>◆</span> Add Notice</div>
                    <form onSubmit={addNotice}>
                        <div className="ap-form-grid">
                            <div className="ap-field"><label>Title *</label><input placeholder="Notice title" value={newNotice.title} onChange={e => setNewNotice({ ...newNotice, title: e.target.value })} required /></div>
                            <div className="ap-field"><label>Description</label><input placeholder="Short description" value={newNotice.description} onChange={e => setNewNotice({ ...newNotice, description: e.target.value })} /></div>
                            <div className="ap-field"><label>Link URL</label><input type="url" placeholder="https://example.com" value={newNotice.link_url || ''} onChange={e => setNewNotice({ ...newNotice, link_url: e.target.value })} /></div>
                            <div className="ap-field"><label>Link Text</label><input placeholder="Click here, Read more…" value={newNotice.link_text || ''} onChange={e => setNewNotice({ ...newNotice, link_text: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12 }}>
                            <div className="ap-field" style={{ marginBottom: 0 }}>
                                <label>Color</label>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    {COLORS.map(c => (
                                        <button type="button" key={c} onClick={() => setNewNotice({ ...newNotice, color: c })} style={{
                                            width: 28, height: 28, borderRadius: '50%', background: c, border: newNotice.color === c ? '3px solid #fff' : '2px solid transparent',
                                            cursor: 'pointer', transition: 'all .15s', transform: newNotice.color === c ? 'scale(1.15)' : 'scale(1)',
                                        }} />
                                    ))}
                                </div>
                            </div>
                            <button className="ap-btn-submit" type="submit" style={{ marginLeft: 'auto', marginTop: 16 }}>+ Add Notice</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="ap-sec-head"><div className="ap-sec-title">{notices.length} Notices</div></div>
            {notices.length === 0 ? (
                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">◆</div><h4>No notices yet</h4><p>Add one above to display on the Notice Board</p></div></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {notices.map(n => (
                        <div key={n.id} className="ap-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 4, height: 40, borderRadius: 4, background: n.color || '#3b82f6', flexShrink: 0 }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{n.title}</div>
                                {n.description && <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 2 }}>{n.description}</div>}
                                {n.link_url && (
                                    <div style={{ fontSize: '.7rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ color: 'var(--blue)' }}>🔗</span>
                                        <a href={n.link_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)', textDecoration: 'none', fontSize: '.72rem' }}>
                                            {n.link_text || n.link_url}
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div style={{ fontSize: '.65rem', color: 'var(--muted)', flexShrink: 0, marginRight: 10 }}>{new Date(n.created_at).toLocaleDateString()}</div>
                            <div className="ap-actions">
                                <button className="ap-edit" onClick={() => { setEditingNotice({ ...n, title: n.title || '', description: n.description || '', color: n.color || '#3b82f6', link_url: n.link_url || '', link_text: n.link_text || '' }); window.scrollTo(0, 0); }}>Edit</button>
                                <button className="ap-del" onClick={() => deleteNotice(n.id)}>✕</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NoticesTab;
