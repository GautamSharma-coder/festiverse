import React, { useState, useMemo } from 'react';

const ResultsTab = ({ results, events, users, registrations, newResult, setNewResult, addResult, deleteResult, toggleEventPublish, bulkTogglePublish }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [publishingId, setPublishingId] = useState(null);
    const [bulkPublishing, setBulkPublishing] = useState(false);

    // Group data by event for the publish section
    const eventsPublishInfo = useMemo(() => {
        return events.map(ev => {
            const eventResults = results.filter(r => r.event_id === ev.id);
            const eventRegs = registrations.filter(r => r.event_id === ev.id);
            return {
                id: ev.id,
                name: ev.name || 'Unknown Event',
                results_published: ev.results_published || false,
                resultCount: eventResults.length,
                regCount: eventRegs.length,
            };
        }).filter(ev => ev.resultCount > 0 || ev.regCount > 0); // Only show events with activity
    }, [results, events, registrations]);

    const handleNameChange = (val) => {
        setNewResult({ ...newResult, participant_name: val });
        if (val.length > 1 && newResult.event_id) {
            const eventRegs = registrations.filter(r => r.event_id === newResult.event_id);
            const registeredUserIds = new Set(eventRegs.map(r => r.user_id));
            const matches = users.filter(u =>
                registeredUserIds.has(u.id) && (
                    (u.name || '').toLowerCase().includes(val.toLowerCase()) ||
                    (u.phone || '').includes(val) ||
                    (u.email || '').toLowerCase().includes(val.toLowerCase())
                )
            ).slice(0, 5);
            setSuggestions(matches);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectUser = (u) => {
        setNewResult({
            ...newResult,
            user_id: u.id,
            participant_name: u.name,
            participant_college: u.college || '',
            participant_email: u.email || ''
        });
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleTogglePublish = async (eventId) => {
        setPublishingId(eventId);
        try {
            await toggleEventPublish(eventId);
        } finally {
            setPublishingId(null);
        }
    };

    return (
        <div className="ap-fade">
            {/* ── Publish Control Panel ── */}
            {eventsPublishInfo.length > 0 && (
                <div className="ap-card" style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div className="ap-card-title" style={{ margin: 0 }}><span>🚀</span> Certificate Publishing</div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                                onClick={async () => { setBulkPublishing(true); try { await bulkTogglePublish(true); } finally { setBulkPublishing(false); } }}
                                disabled={bulkPublishing}
                                style={{
                                    padding: '5px 12px', fontSize: '0.7rem', borderRadius: 6, fontWeight: 700,
                                    background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.3)',
                                    cursor: 'pointer', opacity: bulkPublishing ? 0.6 : 1
                                }}
                            >
                                {bulkPublishing ? '...' : '🚀 Publish All'}
                            </button>
                            <button 
                                onClick={async () => { setBulkPublishing(true); try { await bulkTogglePublish(false); } finally { setBulkPublishing(false); } }}
                                disabled={bulkPublishing}
                                style={{
                                    padding: '5px 12px', fontSize: '0.7rem', borderRadius: 6, fontWeight: 700,
                                    background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)',
                                    cursor: 'pointer', opacity: bulkPublishing ? 0.6 : 1
                                }}
                            >
                                {bulkPublishing ? '...' : '🔒 Unpublish All'}
                            </button>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginBottom: 16 }}>
                        Publishing enables certificate downloads for all registered participants and winners of the event.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {eventsPublishInfo.map(ev => (
                            <div key={ev.id} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 14px',
                                background: ev.results_published ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${ev.results_published ? 'rgba(34,197,94,0.2)' : 'var(--border)'}`,
                                borderRadius: 10,
                                transition: 'all .2s',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{ev.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 2 }}>
                                        {ev.regCount} Participant{ev.regCount !== 1 ? 's' : ''} · {ev.resultCount} Winner{ev.resultCount !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleTogglePublish(ev.id)}
                                    disabled={publishingId === ev.id}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: 8,
                                        border: ev.results_published
                                            ? '1px solid rgba(239,68,68,0.25)'
                                            : '1px solid rgba(34,197,94,0.35)',
                                        background: ev.results_published
                                            ? 'rgba(239,68,68,0.08)'
                                            : 'rgba(34,197,94,0.1)',
                                        color: ev.results_published ? '#fca5a5' : '#4ade80',
                                        fontSize: '0.78rem',
                                        fontWeight: 600,
                                        cursor: publishingId === ev.id ? 'wait' : 'pointer',
                                        fontFamily: 'inherit',
                                        transition: 'all .15s',
                                        opacity: publishingId === ev.id ? 0.6 : 1,
                                        minWidth: 110,
                                    }}
                                >
                                    {publishingId === ev.id
                                        ? '...'
                                        : ev.results_published
                                            ? '🔒 Unpublish'
                                            : '🚀 Publish'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Add Result Form ── */}
            <div className="ap-card">
                <div className="ap-card-title"><span>+</span> Add Result</div>
                <form onSubmit={addResult}>
                    <div className="ap-form-grid">
                        <div className="ap-field">
                            <label>Event *</label>
                            <select required value={newResult.event_id} onChange={e => setNewResult({ ...newResult, event_id: e.target.value })}>
                                <option value="">Select event...</option>
                                {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                            </select>
                        </div>
                        <div className="ap-field"><label>Position *</label><input type="number" min="1" required value={newResult.position} onChange={e => setNewResult({ ...newResult, position: parseInt(e.target.value) })} /></div>

                        <div className="ap-field" style={{ position: 'relative' }}>
                            <label>Participant Name *</label>
                            <input
                                required placeholder="Search or enter name"
                                value={newResult.participant_name}
                                onChange={e => handleNameChange(e.target.value)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div style={{
                                    position: 'absolute', top: '100%', left: 0, right: 0,
                                    background: 'var(--surface2)', border: '1px solid var(--border)',
                                    borderRadius: '8px', zIndex: 100, marginTop: '4px', overflow: 'hidden',
                                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)'
                                }}>
                                    {suggestions.map(u => (
                                        <div
                                            key={u.id}
                                            onClick={() => selectUser(u)}
                                            style={{
                                                padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                                                fontSize: '0.8rem'
                                            }}
                                            onMouseEnter={e => e.target.style.background = 'var(--surface)'}
                                            onMouseLeave={e => e.target.style.background = 'transparent'}
                                        >
                                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{u.email || u.phone} • {u.college || 'No College'}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="ap-field"><label>Email</label><input type="email" placeholder="Email address" value={newResult.participant_email} onChange={e => setNewResult({ ...newResult, participant_email: e.target.value })} /></div>
                        <div className="ap-field"><label>College</label><input placeholder="College" value={newResult.participant_college} onChange={e => setNewResult({ ...newResult, participant_college: e.target.value })} /></div>
                        <div className="ap-field"><label>Score</label><input placeholder="e.g. 95" value={newResult.score} onChange={e => setNewResult({ ...newResult, score: e.target.value })} /></div>
                    </div>
                    <button type="submit" className="ap-btn-submit">Add Result</button>
                </form>
            </div>

            {/* ── Results Table ── */}
            <div className="ap-sec-head">
                <div className="ap-sec-title">{results.length} Results</div>
            </div>

            {results.length === 0 ? (
                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">🏆</div><h4>No results yet</h4></div></div>
            ) : (
                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="ap-table">
                        <thead><tr><th>Event</th><th>Published</th><th>Pos</th><th>Name</th><th>Email</th><th>College</th><th>Score</th><th></th></tr></thead>
                        <tbody>
                            {results.map(r => {
                                const isTop3 = r.position >= 1 && r.position <= 3;
                                const rankColor = r.position === 1 ? '#fbbf24' : r.position === 2 ? '#94a3b8' : r.position === 3 ? '#b45309' : null;
                                const ev = events.find(e => e.id === r.event_id);
                                const isPublished = ev?.results_published;

                                return (
                                    <tr key={r.id} style={isTop3 ? { background: 'rgba(255,255,255,0.02)' } : {}}>
                                        <td>{r.events?.name || '—'}</td>
                                        <td>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '2px 8px',
                                                borderRadius: 12,
                                                fontSize: '0.65rem',
                                                fontWeight: 700,
                                                background: isPublished ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                                                color: isPublished ? '#4ade80' : 'var(--muted)',
                                                border: `1px solid ${isPublished ? 'rgba(34,197,94,0.25)' : 'var(--border)'}`,
                                            }}>
                                                {isPublished ? '✓ Live' : '⏳ Draft'}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                width: '24px', height: '24px', borderRadius: '50%',
                                                background: rankColor ? `${rankColor}20` : 'transparent',
                                                color: rankColor || 'inherit',
                                                fontWeight: 800, border: rankColor ? `1px solid ${rankColor}40` : 'none'
                                            }}>
                                                {r.position}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{r.participant_name}</td>
                                        <td style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>{r.participant_email || '—'}</td>
                                        <td style={{ color: 'var(--muted)' }}>{r.participant_college || '—'}</td>
                                        <td>{r.score || '—'}</td>
                                        <td><button className="ap-del" onClick={() => deleteResult(r.id)}>✕</button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ResultsTab;
