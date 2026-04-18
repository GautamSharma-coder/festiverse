import React from 'react';
import { proxyImageUrl } from '../../lib/proxyImage';

const GalleryTab = ({ gallery, galleryMeta, setGalleryMeta, galleryImage, setGalleryImage, editingGallery, setEditingGallery, addGalleryImage, updateGalleryImage, deleteGalleryImage }) => {
    return (
        <div className="ap-fade">
            {editingGallery ? (
                <div className="ap-edit-wrap">
                    <div className="ap-edit-wrap-title">✎ Edit Image</div>
                    <form onSubmit={updateGalleryImage}>
                        <div className="ap-form-grid">
                            <div className="ap-field ap-field-file">
                                <input type="file" accept="image/*" onChange={e => setGalleryImage(e.target.files[0])} />
                                <div className="ap-file-label">
                                    {galleryImage ? `🖼 ${galleryImage.name}` : '🖼 Choose new image to replace (optional)'}
                                </div>
                            </div>
                            <div className="ap-field"><label>Title</label><input placeholder="Image title" value={editingGallery.title} onChange={e => setEditingGallery({ ...editingGallery, title: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                            <div className="ap-field" style={{ flex: 1 }}><label>Category</label><input placeholder="e.g. cultural, tech" value={editingGallery.category} onChange={e => setEditingGallery({ ...editingGallery, category: e.target.value })} /></div>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 0 }}>
                                <button type="submit" className="ap-btn-submit">Save</button>
                                <button type="button" className="ap-btn-ghost" onClick={() => { setEditingGallery(null); setGalleryImage(null); }}>Cancel</button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="ap-card">
                    <div className="ap-card-title"><span>+</span> Upload Image</div>
                    <form onSubmit={addGalleryImage}>
                        <div className="ap-form-grid">
                            <div className="ap-field ap-field-file">
                                <input type="file" accept="image/*" onChange={e => setGalleryImage(e.target.files[0])} />
                                <div className="ap-file-label">
                                    {galleryImage ? `🖼 ${galleryImage.name}` : '🖼 Drop or select image *'}
                                </div>
                            </div>
                            <div className="ap-field"><label>Title</label><input placeholder="Image title" value={galleryMeta.title} onChange={e => setGalleryMeta({ ...galleryMeta, title: e.target.value })} /></div>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                            <div className="ap-field" style={{ flex: 1 }}><label>Category</label><input placeholder="e.g. cultural, tech" value={galleryMeta.category} onChange={e => setGalleryMeta({ ...galleryMeta, category: e.target.value })} /></div>
                            <button type="submit" className="ap-btn-submit" style={{ marginBottom: 0 }}>Upload</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="ap-sec-head"><div className="ap-sec-title">{gallery.length} Images</div></div>
            {gallery.length === 0 ? (
                <div className="ap-card"><div className="ap-empty"><div className="ap-empty-icon">⊡</div><h4>No images</h4></div></div>
            ) : (
                <div className="ap-gal-grid">
                    {gallery.map(img => (
                        <div key={img.id} className="ap-gal-item">
                            <img className="ap-gal-img" src={proxyImageUrl(img.url)} alt={img.title} />
                            <div className="ap-gal-info">
                                <div className="ap-gal-title">{img.title || 'Untitled'}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                    <span className="ap-gal-cat">{img.category || '—'}</span>
                                    <div className="ap-actions">
                                        <button className="ap-edit" onClick={() => { setEditingGallery({ ...img, title: img.title || '', category: img.category || '' }); window.scrollTo(0, 0); }}>Edit</button>
                                        <button className="ap-del" onClick={() => deleteGalleryImage(img.id)}>✕</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GalleryTab;
