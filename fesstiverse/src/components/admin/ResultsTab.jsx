import React, { useState } from 'react';

const ResultsTab = ({ results, events, users, registrations, newResult, setNewResult, addResult, deleteResult }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleNameChange = (val) => {
        setNewResult({ ...newResult, participant_name: val });
        if (val.length > 1 && newResult.event_id) {
            // Filter registrations for the selected event
            const eventRegs = registrations.filter(r => r.event_id === newResult.event_id);
            const registeredUserIds = new Set(eventRegs.map(r => r.user_id));

            // Only suggest users who are registered for this event
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

    return (
        <div className="ap-fade">
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
            
            <div className="ap-sec-head">
                <div className="ap-sec-title">{results.length} Results</div>
            </div>
            
            {results.length === 0 ? (
                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">🏆</div><h4>No results yet</h4></div></div>
            ) : (
                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="ap-table">
                        <thead><tr><th>Event</th><th>Pos</th><th>Name</th><th>Email</th><th>College</th><th>Score</th><th></th></tr></thead>
                        <tbody>
                            {results.map(r => {
                                const isTop3 = r.position >= 1 && r.position <= 3;
                                const rankColor = r.position === 1 ? '#fbbf24' : r.position === 2 ? '#94a3b8' : r.position === 3 ? '#b45309' : null;
                                
                                return (
                                    <tr key={r.id} style={isTop3 ? { background: 'rgba(255,255,255,0.02)' } : {}}>
                                        <td>{r.events?.name || '—'}</td>
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
