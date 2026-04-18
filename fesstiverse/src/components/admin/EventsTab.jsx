import React from 'react';

const EventsTab = ({ events, newEvent, setNewEvent, eventImage, setEventImage, editingEvent, setEditingEvent, addEvent, updateEvent, deleteEvent }) => {
    return (
        <div className="ap-fade">
            {editingEvent ? (
                <div className="ap-edit-wrap">
                    <div className="ap-edit-wrap-title">✎ Edit Event</div>
                    <form onSubmit={updateEvent}>
                        <div className="ap-form-grid">
                            <div className="ap-field"><label>Event Name *</label><input required placeholder="e.g. Solo Dance" value={editingEvent.name} onChange={e => setEditingEvent({ ...editingEvent, name: e.target.value })} /></div>
                            <div className="ap-field"><label>Location</label><input placeholder="e.g. Main Stage" value={editingEvent.location} onChange={e => setEditingEvent({ ...editingEvent, location: e.target.value })} /></div>
                            <div className="ap-field"><label>Date</label><input type="date" value={editingEvent.date ? new Date(editingEvent.date).toISOString().split('T')[0] : ''} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} /></div>
                            <div className="ap-field"><label>Short Description</label><input placeholder="Brief description" value={editingEvent.description} onChange={e => setEditingEvent({ ...editingEvent, description: e.target.value })} /></div>

                            <div className="ap-field" style={{ gridColumn: '1 / -1' }}><label>Rules</label><textarea placeholder="Event rules" value={editingEvent.rules || ''} onChange={e => setEditingEvent({ ...editingEvent, rules: e.target.value })} rows="3" /></div>
                            <div className="ap-field"><label>Schedule</label><input placeholder="e.g. 10:00 AM - 12:00 PM" value={(Array.isArray(editingEvent.schedule) ? editingEvent.schedule[0] : editingEvent.schedule) || ''} onChange={e => setEditingEvent({ ...editingEvent, schedule: e.target.value })} /></div>
                            <div className="ap-field"><label>Prizes</label><input placeholder="e.g. 1st: $500" value={editingEvent.prizes || ''} onChange={e => setEditingEvent({ ...editingEvent, prizes: e.target.value })} /></div>

                            <div className="ap-field ap-field-file" style={{ gridColumn: '1 / -1' }}>
                                <label>Event Image (Banner/Poster)</label>
                                <input type="file" accept="image/*" onChange={e => setEventImage(e.target.files[0])} />
                                <div className="ap-file-label">{eventImage ? `📷 ${eventImage.name}` : '📷 Change cover image (optional)'}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                            <button type="submit" className="ap-btn-submit">Save Changes</button>
                            <button type="button" className="ap-btn-ghost" onClick={() => { setEditingEvent(null); setEventImage(null); }}>Cancel</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="ap-card">
                    <div className="ap-card-title"><span>+</span> Add New Event</div>
                    <form onSubmit={addEvent}>
                        <div className="ap-form-grid">
                            <div className="ap-field"><label>Event Name *</label><input required placeholder="e.g. Solo Dance" value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} /></div>
                            <div className="ap-field"><label>Location</label><input placeholder="e.g. Main Stage" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} /></div>
                            <div className="ap-field"><label>Date</label><input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} /></div>
                            <div className="ap-field"><label>Short Description</label><input placeholder="Brief description" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} /></div>

                            <div className="ap-field" style={{ gridColumn: '1 / -1' }}><label>Rules</label><textarea placeholder="Event rules" value={newEvent.rules} onChange={e => setNewEvent({ ...newEvent, rules: e.target.value })} rows="3" /></div>
                            <div className="ap-field"><label>Schedule</label><input placeholder="e.g. 10:00 AM - 12:00 PM" value={newEvent.schedule} onChange={e => setNewEvent({ ...newEvent, schedule: e.target.value })} /></div>
                            <div className="ap-field"><label>Prizes</label><input placeholder="e.g. 1st: $500" value={newEvent.prizes} onChange={e => setNewEvent({ ...newEvent, prizes: e.target.value })} /></div>

                            <div className="ap-field ap-field-file" style={{ gridColumn: '1 / -1' }}>
                                <label>Event Image (Banner/Poster)</label>
                                <input type="file" accept="image/*" onChange={e => setEventImage(e.target.files[0])} />
                                <div className="ap-file-label">{eventImage ? `📷 ${eventImage.name}` : '📷 Choose cover image (optional)'}</div>
                            </div>
                        </div>
                        <button type="submit" className="ap-btn-submit">+ Add Event</button>
                    </form>
                </div>
            )}

            <div className="ap-sec-head"><div className="ap-sec-title">{events.length} Events</div></div>
            <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="ap-table">
                    <thead><tr><th>Name</th><th>Location</th><th>Date</th><th>Team Size</th><th></th></tr></thead>
                    <tbody>
                        {events.map(ev => (
                            <tr key={ev.id}>
                                <td style={{ fontWeight: 600 }}>{ev.name}</td>
                                <td style={{ color: 'var(--muted)' }}>{ev.location || '—'}</td>
                                <td style={{ color: 'var(--muted)' }}>{ev.date ? new Date(ev.date).toLocaleDateString() : '—'}</td>
                                <td>{ev.team_size > 1 ? <span style={{ color: 'var(--accent)' }}>Team ×{ev.team_size}</span> : <span style={{ color: 'var(--muted)' }}>Solo</span>}</td>
                                <td>
                                    <div className="ap-actions">
                                        <button className="ap-edit" onClick={() => { setEditingEvent({ ...ev, name: ev.name || '', location: ev.location || '', date: ev.date || '', description: ev.description || '', rules: ev.rules || '', schedule: ev.schedule || '', prizes: ev.prizes || '' }); window.scrollTo(0, 0); }}>Edit</button>
                                        <button className="ap-del" onClick={() => deleteEvent(ev.id)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {events.length === 0 && <tr><td colSpan={5}><div className="ap-empty"><div className="ap-empty-icon">◎</div><h4>No events</h4></div></td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EventsTab;
