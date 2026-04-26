import React, { useState, useEffect } from 'react';
import { proxyImageUrl } from '../lib/proxyImage';
import { apiFetchCached } from '../lib/api';

const styles = `
  /* Imported Playfair Display for elegant headings, alongside Inter for crisp UI */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap');

  :root {
    --bg: #ffffff;
    --bg-lightbox: rgba(255, 255, 255, 0.98);
    --text-primary: #111111;
    --text-muted: #71717a;
    --border: #e4e4e7;
    --skeleton: #f4f4f5;
    --radius: 4px;
    
    /* Typography variables */
    --font-sans: 'Inter', sans-serif;
    --font-serif: 'Playfair Display', serif;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #09090b;
      --bg-lightbox: rgba(9, 9, 11, 0.98);
      --text-primary: #fafafa;
      --text-muted: #a1a1aa;
      --border: #27272a;
      --skeleton: #18181b;
    }
  }

  .masonry-root {
    background-color: var(--bg);
    color: var(--text-primary);
    padding: 120px 0;
    min-height: 100vh;
  }

  .masonry-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 32px;
  }

  /* ── Typography & Header ── */
  .masonry-header {
    text-align: center;
    margin-bottom: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .masonry-eyebrow {
    font-family: var(--font-sans);
    font-size: 0.6875rem; /* Very small */
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.25em; /* Extremely wide tracking */
    color: var(--text-muted);
  }

  .masonry-title {
    font-family: var(--font-serif);
    font-size: clamp(3rem, 7vw, 5.5rem); /* Massive scale */
    font-weight: 500;
    letter-spacing: -0.02em; /* Tight tracking for large serif */
    margin: 0;
    line-height: 1;
  }

  .masonry-title em {
    font-style: italic;
    font-weight: 400;
    color: var(--text-muted); /* Subtle contrast for the italicized word */
  }

  /* ── Masonry Grid ── */
  .masonry-grid {
    column-count: 3;
    column-gap: 24px;
    width: 100%;
  }

  .masonry-item {
    break-inside: avoid;
    margin-bottom: 24px;
    position: relative;
    border-radius: var(--radius);
    overflow: hidden;
    cursor: zoom-in;
    background-color: var(--skeleton);
    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .masonry-img {
    width: 100%;
    display: block;
    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.4s ease;
    filter: grayscale(100%);
  }

  .masonry-item:hover .masonry-img {
    transform: scale(1.04);
    filter: grayscale(0%);
  }

  .masonry-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%);
    opacity: 0;
    transition: opacity 0.4s ease;
    display: flex;
    align-items: flex-end;
    padding: 32px 24px;
    pointer-events: none;
  }

  .masonry-item:hover .masonry-overlay {
    opacity: 1;
  }

  /* Elegant serif overlay text */
  .masonry-overlay-text {
    font-family: var(--font-serif);
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: 400;
    font-style: italic;
    letter-spacing: 0.02em;
    transform: translateY(10px);
    transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .masonry-item:hover .masonry-overlay-text {
    transform: translateY(0);
  }

  /* ── View All Button ── */
  .masonry-footer {
    display: flex;
    justify-content: center;
    margin-top: 80px;
  }

  .masonry-btn {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 14px 32px;
    border-radius: 99px;
    font-family: var(--font-sans);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .masonry-btn:hover {
    background: var(--text-primary);
    color: var(--bg);
    border-color: var(--text-primary);
  }

  /* ── Lightbox ── */
  .lb-wrapper {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: var(--bg-lightbox);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: lbFade 0.2s ease;
  }

  @keyframes lbFade {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .lb-image {
    max-width: 85vw;
    max-height: 85vh;
    object-fit: contain;
    border-radius: var(--radius);
    box-shadow: 0 24px 48px rgba(0,0,0,0.1);
  }

  .lb-controls {
    position: fixed;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 2rem;
    font-weight: 300;
    cursor: pointer;
    padding: 24px;
    transition: opacity 0.2s;
    z-index: 10000;
    font-family: var(--font-sans); /* Ensure arrows use Sans */
  }

  .lb-controls:hover { opacity: 0.5; }
  .lb-close { top: 16px; right: 16px; }
  .lb-prev { left: 16px; top: 50%; transform: translateY(-50%); }
  .lb-next { right: 16px; top: 50%; transform: translateY(-50%); }

  /* Lightbox Typography */
  .lb-counter {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-sans);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .masonry-grid { column-count: 2; }
  }

  @media (max-width: 640px) {
    .masonry-root { padding: 80px 0; }
    .masonry-container { padding: 0 20px; }
    .masonry-grid { column-count: 1; column-gap: 0; }
    .masonry-title { font-size: 3rem; }
    .masonry-img { filter: grayscale(0%); }
  }
`;

const FestGallery = () => {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await apiFetchCached('/api/gallery');
        if (res.images && res.images.length > 0) {
          setGalleryImages(res.images.slice(0, 9).map(img => proxyImageUrl(img.url)));
        }
      } catch (err) {
        console.error('Error fetching gallery images:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const prev = () => {
    if (galleryImages.length === 0) return;
    setLightboxIdx(i => (i - 1 + galleryImages.length) % galleryImages.length);
  };

  const next = () => {
    if (galleryImages.length === 0) return;
    setLightboxIdx(i => (i + 1) % galleryImages.length);
  };

  useEffect(() => {
    const handler = (e) => {
      if (lightboxIdx === null || galleryImages.length === 0) return;
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx, galleryImages.length]);

  if (loading || galleryImages.length === 0) return null;

  return (
    <>
      <style>{styles}</style>

      <section id="gallery" className="masonry-root">
        <div className="masonry-container">

          {/* Centered Editorial Header */}
          <div className="masonry-header">
            <span className="masonry-eyebrow">Exhibition</span>
            <h2 className="masonry-title">Captured <em>Moments</em></h2>
          </div>

          {/* Pure CSS Masonry Grid */}
          <div className="masonry-grid">
            {galleryImages.map((src, i) => (
              <div
                key={i}
                className="masonry-item"
                style={{ animationDelay: `${i * 0.1}s` }}
                onClick={() => setLightboxIdx(i)}
                role="button"
                aria-label={`View image ${i + 1} in fullscreen`}
              >
                <img src={src} alt={`Festival memory ${i + 1}`} className="masonry-img" loading="lazy" />
                <div className="masonry-overlay">
                  {/* Elegant italic overlay text */}
                  <span className="masonry-overlay-text">Glimpse 0{i + 1}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="masonry-footer">
            <button className="masonry-btn" onClick={() => window.location.href = '/gallery'}>
              Explore Full Archive
            </button>
          </div>

        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="lb-wrapper" onClick={() => setLightboxIdx(null)}>
          <img
            className="lb-image"
            src={galleryImages[lightboxIdx]}
            alt={`Gallery fullscreen ${lightboxIdx + 1}`}
            onClick={e => e.stopPropagation()}
          />

          <button className="lb-controls lb-close" onClick={() => setLightboxIdx(null)}>×</button>
          <button className="lb-controls lb-prev" onClick={e => { e.stopPropagation(); prev(); }}>←</button>
          <button className="lb-controls lb-next" onClick={e => { e.stopPropagation(); next(); }}>→</button>

          <div className="lb-counter">
            0{lightboxIdx + 1} / 0{galleryImages.length}
          </div>
        </div>
      )}
    </>
  );
};

export default FestGallery;