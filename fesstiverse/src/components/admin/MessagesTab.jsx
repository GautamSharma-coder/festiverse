import React from 'react';

const MessagesTab = ({ messages, deleteMessage }) => {
    return (
        <div className="ap-fade">
            <div className="ap-sec-head">
                <div className="ap-sec-title">{messages.length} Messages</div>
            </div>
            <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="ap-table">
                    <thead><tr><th>From</th><th>Email</th><th>Message</th><th>Date</th><th></th></tr></thead>
                    <tbody>
                        {messages.map(m => (
                            <tr key={m.id}>
                                <td style={{ fontWeight: 600 }}>{m.name}</td>
                                <td style={{ color: 'var(--muted)' }}>{m.email || '—'}</td>
                                <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.message}</td>
                                <td style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{new Date(m.created_at).toLocaleDateString()}</td>
                                <td><button className="ap-del" onClick={() => deleteMessage(m.id)}>Delete</button></td>
                            </tr>
                        ))}
                        {messages.length === 0 && <tr><td colSpan={5}><div className="ap-empty"><div className="ap-empty-icon">◉</div><h4>No messages</h4></div></td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MessagesTab;
