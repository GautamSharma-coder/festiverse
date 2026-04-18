import React from 'react';

const SponsorsTab = ({ sponsors, newSponsor, setNewSponsor, sponsorLogo, setSponsorLogo, addSponsor, deleteSponsor }) => {
    return (
        <div className="ap-fade">
            <div className="ap-card">
                <div className="ap-card-title"><span>+</span> Add Sponsor</div>
                <form onSubmit={addSponsor}>
                    <div className="ap-form-grid">
                        <div className="ap-field"><label>Name *</label><input required placeholder="Sponsor name" value={newSponsor.name} onChange={e => setNewSponsor({ ...newSponsor, name: e.target.value })} /></div>
                        <div className="ap-field">
                            <label>Tier</label>
                            <select value={newSponsor.tier} onChange={e => setNewSponsor({ ...newSponsor, tier: e.target.value })}>
                                <option value="gold">Gold</option>
                                <option value="silver">Silver</option>
                                <option value="bronze">Bronze</option>
                            </select>
                        </div>
                        <div className="ap-field"><label>Website</label><input placeholder="https://..." value={newSponsor.website} onChange={e => setNewSponsor({ ...newSponsor, website: e.target.value })} /></div>
                        <div className="ap-field"><label>Sort Order</label><input type="number" value={newSponsor.sort_order} onChange={e => setNewSponsor({ ...newSponsor, sort_order: parseInt(e.target.value) || 0 })} /></div>
                        <div className="ap-field ap-field-file">
                            <label>Logo</label>
                            <input type="file" accept="image/*" onChange={e => setSponsorLogo(e.target.files[0])} />
                            <div className="ap-file-label">{sponsorLogo ? `✓ ${sponsorLogo.name}` : '📎 Choose logo image'}</div>
                        </div>
                    </div>
                    <button type="submit" className="ap-btn-submit">Add Sponsor</button>
                </form>
            </div>
            <div className="ap-sec-head"><div className="ap-sec-title">{sponsors.length} Sponsors</div></div>
            {sponsors.length === 0 ? (
                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">★</div><h4>No sponsors yet</h4></div></div>
            ) : (
                <div className="ap-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="ap-table">
                        <thead><tr><th>Logo</th><th>Name</th><th>Tier</th><th>Website</th><th>Order</th><th></th></tr></thead>
                        <tbody>
                            {sponsors.map(s => (
                                <tr key={s.id}>
                                    <td>{s.logo_url ? <img src={s.logo_url} alt="" style={{ height: 28, objectFit: 'contain' }} /> : '—'}</td>
                                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                                    <td><span style={{ textTransform: 'capitalize', color: s.tier === 'gold' ? '#fbbf24' : s.tier === 'silver' ? '#9ca3af' : '#d97706' }}>{s.tier}</span></td>
                                    <td style={{ color: 'var(--muted)' }}>{s.website ? <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>Visit</a> : '—'}</td>
                                    <td>{s.sort_order}</td>
                                    <td><button className="ap-del" onClick={() => deleteSponsor(s.id)}>✕</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SponsorsTab;
