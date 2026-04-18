import React from 'react';

const ResultsTab = ({ results, events, newResult, setNewResult, addResult, deleteResult }) => {
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
                        <div className="ap-field"><label>Participant Name *</label><input required placeholder="Name" value={newResult.participant_name} onChange={e => setNewResult({ ...newResult, participant_name: e.target.value })} /></div>
                        <div className="ap-field"><label>College</label><input placeholder="College" value={newResult.participant_college} onChange={e => setNewResult({ ...newResult, participant_college: e.target.value })} /></div>
                        <div className="ap-field"><label>Score</label><input placeholder="e.g. 95" value={newResult.score} onChange={e => setNewResult({ ...newResult, score: e.target.value })} /></div>
                    </div>
                    <button type="submit" className="ap-btn-submit">Add Result</button>
                </form>
            </div>
            <div className="ap-sec-head"><div className="ap-sec-title">{results.length} Results</div></div>
            {results.length === 0 ? (
                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">🏆</div><h4>No results yet</h4></div></div>
            ) : (
                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="ap-table">
                        <thead><tr><th>Event</th><th>Pos</th><th>Name</th><th>College</th><th>Score</th><th></th></tr></thead>
                        <tbody>
                            {results.map(r => (
                                <tr key={r.id}>
                                    <td>{r.events?.name || '—'}</td>
                                    <td><strong>{r.position}</strong></td>
                                    <td style={{ fontWeight: 600 }}>{r.participant_name}</td>
                                    <td style={{ color: 'var(--muted)' }}>{r.participant_college || '—'}</td>
                                    <td>{r.score || '—'}</td>
                                    <td><button className="ap-del" onClick={() => deleteResult(r.id)}>✕</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ResultsTab;
