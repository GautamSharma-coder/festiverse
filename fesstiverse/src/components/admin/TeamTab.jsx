import React from 'react';
import { proxyImageUrl } from '../../lib/proxyImage';

const CATEGORIES = ['Senior Coordinator', 'Coordinator', 'Sub Coordinator'];
const SOCIETIES = ['Fine and Art Society', 'Music and Dance Society', 'Acting and Drama Society', 'Literature and Debate Society', 'Social Awareness Society'];

const badgeClass = (cat) => cat === 'Senior Coordinator' ? 'ap-badge-senior' : cat === 'Sub Coordinator' ? 'ap-badge-sub' : 'ap-badge-coord';

const TeamTab = ({ team, newTeam, setNewTeam, teamImage, setTeamImage, editingTeam, setEditingTeam, addTeamMember, updateTeamMember, deleteTeamMember }) => {
    return (
        <div className="ap-fade">
            {editingTeam ? (
                <div className="ap-edit-wrap">
                    <div className="ap-edit-wrap-title">✎ Edit Team Member</div>
                    <form onSubmit={updateTeamMember}>
                        <div className="ap-form-grid">
                            <div className="ap-field"><label>Name *</label><input required placeholder="Full name" value={editingTeam.name} onChange={e => setEditingTeam({ ...editingTeam, name: e.target.value })} /></div>
                            <div className="ap-field"><label>Role / Title *</label><input required placeholder="e.g. Event Lead" value={editingTeam.role} onChange={e => setEditingTeam({ ...editingTeam, role: e.target.value })} /></div>
                            <div className="ap-field">
                                <label>Category *</label>
                                <select value={editingTeam.category} onChange={e => setEditingTeam({ ...editingTeam, category: e.target.value })}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="ap-field">
                                <label>Society</label>
                                <select value={editingTeam.society} onChange={e => setEditingTeam({ ...editingTeam, society: e.target.value })}>
                                    <option value="">Select society</option>
                                    {SOCIETIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="ap-field"><label>Bio</label><input placeholder="Short bio (optional)" value={editingTeam.bio} onChange={e => setEditingTeam({ ...editingTeam, bio: e.target.value })} /></div>
                            <div className="ap-field"><label>Social Link</label><input placeholder="Instagram / LinkedIn URL" value={editingTeam.social_link} onChange={e => setEditingTeam({ ...editingTeam, social_link: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                            <div className="ap-field ap-field-file" style={{ flex: 1 }}>
                                <input type="file" accept="image/*" onChange={e => setTeamImage(e.target.files[0])} />
                                <div className="ap-file-label">
                                    {teamImage ? `📷 ${teamImage.name}` : '📷 Choose photo to replace (optional)'}
                                </div>
                            </div>
                            <button type="submit" className="ap-btn-submit">Save</button>
                            <button type="button" className="ap-btn-ghost" onClick={() => { setEditingTeam(null); setTeamImage(null); }}>Cancel</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="ap-card">
                    <div className="ap-card-title"><span>+</span> Add Team Member</div>
                    <form onSubmit={addTeamMember}>
                        <div className="ap-form-grid">
                            <div className="ap-field"><label>Name *</label><input required placeholder="Full name" value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} /></div>
                            <div className="ap-field"><label>Role / Title *</label><input required placeholder="e.g. Event Lead" value={newTeam.role} onChange={e => setNewTeam({ ...newTeam, role: e.target.value })} /></div>
                            <div className="ap-field">
                                <label>Category *</label>
                                <select value={newTeam.category} onChange={e => setNewTeam({ ...newTeam, category: e.target.value })}>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="ap-field">
                                <label>Society</label>
                                <select value={newTeam.society} onChange={e => setNewTeam({ ...newTeam, society: e.target.value })}>
                                    <option value="">Select society</option>
                                    {SOCIETIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="ap-field"><label>Bio</label><input placeholder="Short bio (optional)" value={newTeam.bio} onChange={e => setNewTeam({ ...newTeam, bio: e.target.value })} /></div>
                            <div className="ap-field"><label>Social Link</label><input placeholder="Instagram / LinkedIn URL" value={newTeam.social_link} onChange={e => setNewTeam({ ...newTeam, social_link: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                            <div className="ap-field ap-field-file" style={{ flex: 1 }}>
                                <input type="file" accept="image/*" onChange={e => setTeamImage(e.target.files[0])} />
                                <div className="ap-file-label">
                                    {teamImage ? `📷 ${teamImage.name}` : '📷 Choose photo (optional)'}
                                </div>
                            </div>
                            <button type="submit" className="ap-btn-submit">+ Add Member</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="ap-sec-head"><div className="ap-sec-title">{team.length} Team Members</div></div>
            {team.length === 0 ? (
                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">◇</div><h4>No team members</h4><p style={{ fontSize: '.82rem' }}>Add members using the form above.</p></div></div>
            ) : (
                <div className="ap-team-grid">
                    {team.map(m => (
                        <div key={m.id} className="ap-team-card">
                            <img className="ap-team-avatar" src={proxyImageUrl(m.image_url) || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`} onError={e => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`; }} alt={m.name} />
                            <div className="ap-team-name">{m.name}</div>
                            <div className="ap-team-role">{m.role}</div>
                            {m.society && <div className="ap-team-society">{m.society}</div>}
                            <div className={`ap-badge ${badgeClass(m.category)}`}>{m.category || 'Coordinator'}</div>
                            <div className="ap-actions" style={{ marginTop: 10, justifyContent: 'center' }}>
                                <button className="ap-edit" onClick={() => { setEditingTeam({ ...m, name: m.name || '', role: m.role || '', category: m.category || 'Coordinator', society: m.society || '', bio: m.bio || '', social_link: m.social_link || '' }); window.scrollTo(0, 0); }}>Edit</button>
                                <button className="ap-del" onClick={() => deleteTeamMember(m.id)}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TeamTab;
