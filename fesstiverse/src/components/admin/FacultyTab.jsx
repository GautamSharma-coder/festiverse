import React from 'react';
import { proxyImageUrl } from '../../lib/proxyImage';

const FacultyTab = ({ faculty, newFaculty, setNewFaculty, facultyImage, setFacultyImage, editingFaculty, setEditingFaculty, addFacultyMember, updateFacultyMember, deleteFacultyMember }) => {
    return (
        <div className="ap-fade">
            {editingFaculty ? (
                <div className="ap-edit-wrap">
                    <div className="ap-edit-wrap-title">✎ Edit Faculty Member</div>
                    <form onSubmit={updateFacultyMember}>
                        <div className="ap-form-grid">
                            <div className="ap-field"><label>Name *</label><input required placeholder="Full name" value={editingFaculty.name} onChange={e => setEditingFaculty({ ...editingFaculty, name: e.target.value })} /></div>
                            <div className="ap-field"><label>Role / Title *</label><input required placeholder="e.g. Chief Coordinator" value={editingFaculty.role} onChange={e => setEditingFaculty({ ...editingFaculty, role: e.target.value })} /></div>
                            <div className="ap-field"><label>Department</label><input placeholder="e.g. Department of Arts" value={editingFaculty.department} onChange={e => setEditingFaculty({ ...editingFaculty, department: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                            <div className="ap-field ap-field-file" style={{ flex: 1 }}>
                                <input type="file" accept="image/*" onChange={e => setFacultyImage(e.target.files[0])} />
                                <div className="ap-file-label">
                                    {facultyImage ? `📷 ${facultyImage.name}` : '📷 Choose photo to replace (optional)'}
                                </div>
                            </div>
                            <button type="submit" className="ap-btn-submit">Save</button>
                            <button type="button" className="ap-btn-ghost" onClick={() => { setEditingFaculty(null); setFacultyImage(null); }}>Cancel</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="ap-card">
                    <div className="ap-card-title"><span>+</span> Add Faculty Member</div>
                    <form onSubmit={addFacultyMember}>
                        <div className="ap-form-grid">
                            <div className="ap-field"><label>Name *</label><input required placeholder="Full name" value={newFaculty.name} onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })} /></div>
                            <div className="ap-field"><label>Role / Title *</label><input required placeholder="e.g. Chief Coordinator" value={newFaculty.role} onChange={e => setNewFaculty({ ...newFaculty, role: e.target.value })} /></div>
                            <div className="ap-field"><label>Department</label><input placeholder="e.g. Department of Arts" value={newFaculty.department} onChange={e => setNewFaculty({ ...newFaculty, department: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                            <div className="ap-field ap-field-file" style={{ flex: 1 }}>
                                <input type="file" accept="image/*" onChange={e => setFacultyImage(e.target.files[0])} />
                                <div className="ap-file-label">
                                    {facultyImage ? `📷 ${facultyImage.name}` : '📷 Choose photo (optional)'}
                                </div>
                            </div>
                            <button type="submit" className="ap-btn-submit">+ Add Member</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="ap-sec-head"><div className="ap-sec-title">{faculty.length} Faculty Members</div></div>
            {faculty.length === 0 ? (
                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">🎓</div><h4>No faculty members</h4><p style={{ fontSize: '.82rem' }}>Add members using the form above.</p></div></div>
            ) : (
                <div className="ap-team-grid">
                    {faculty.map(m => (
                        <div key={m.id} className="ap-team-card">
                            <img className="ap-team-avatar" src={proxyImageUrl(m.image_url) || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`} onError={e => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${m.id}`; }} alt={m.name} />
                            <div className="ap-team-name">{m.name}</div>
                            <div className="ap-team-role">{m.role}</div>
                            {m.department && <div className="ap-team-society">{m.department}</div>}
                            <div className="ap-actions" style={{ marginTop: 10, justifyContent: 'center' }}>
                                <button className="ap-edit" onClick={() => { setEditingFaculty({ ...m, name: m.name || '', role: m.role || '', department: m.department || '' }); window.scrollTo(0, 0); }}>Edit</button>
                                <button className="ap-del" onClick={() => deleteFacultyMember(m.id)}>Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FacultyTab;
