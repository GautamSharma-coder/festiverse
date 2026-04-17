import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { proxyImageUrl } from '../lib/proxyImage';
import { apiFetch } from '../lib/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --bg: #ffffff;
    --bg-lightbox: rgba(255, 255, 255, 0.98);
    --text-primary: #111111;
    --text-muted: #71717a;
    --border: #e4e4e7;
    --skeleton: #f4f4f5;
    --radius: 4px;
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

  .min-page-root {
    background-color: var(--bg);
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    padding: 120px 0;
  }

  .min-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 32px;
  }

  /* ── Header ── */
  .min-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 64px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border);
  }

  .min-header-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .min-eyebrow {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
  }

  .min-title {
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 400;
    letter-spacing: -0.03em;
    margin: 0;
    line-height: 1;
  }

  .min-back-btn {
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    background: transparent;
    border: none;
    padding: 8px 0;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .min-back-btn:hover {
    opacity: 0.6;
  }

  /* ── Masonry Grid ── */
  .min-masonry {
    column-count: 3;
    column-gap: 24px;
    width: 100%;
  }

  .min-card {
    break-inside: avoid;
    margin-bottom: 24px;
    position: relative;
    border-radius: var(--radius);
    overflow: hidden;
    cursor: zoom-in;
    background-color: var(--skeleton);
    animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .min-card img {
    width: 100%;
    display: block;
    transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease;
    filter: grayscale(100%);
  }

  .min-card:hover img {
    transform: scale(1.03);
    filter: grayscale(0%);
  }

  /* ── Status States ── */
  .min-status {
    text-align: center;
    padding: 120px 0;
    font-size: 0.875rem;
    color: var(--text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* ── Lightbox ── */
  .min-lb-wrapper {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: var(--bg-lightbox);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: lbFadeIn 0.2s ease;
  }

  @keyframes lbFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .min-lb-image {
    max-width: 85vw;
    max-height: 85vh;
    object-fit: contain;
    border-radius: var(--radius);
    box-shadow: 0 24px 48px rgba(0,0,0,0.1);
  }

  .min-lb-controls {
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
  }

  .min-lb-controls:hover { opacity: 0.5; }
  .min-lb-close { top: 16px; right: 16px; }
  .min-lb-prev { left: 16px; top: 50%; transform: translateY(-50%); }
  .min-lb-next { right: 16px; top: 50%; transform: translateY(-50%); }
  
  .min-lb-counter {
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.875rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .min-masonry { column-count: 2; }
  }

  @media (max-width: 640px) {
    .min-page-root { padding: 80px 0; }
    .min-container { padding: 0 20px; }
    .min-header { flex-direction: column; align-items: flex-start; gap: 24px; }
    .min-masonry { column-count: 1; column-gap: 0; }
    .min-card img { filter: grayscale(0%); } /* Full color on mobile */
  }
`;

const GalleryPage = () => {
  const navigate = useNavigate();
  const [lbIdx, setLbIdx] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    (async () => {
      try {
        const res = await apiFetch('/api/gallery');
        if (res.images?.length > 0) {
          setImages(res.images.map(img => proxyImageUrl(img.url)));
        }
      } catch (e) {
        console.error("Failed to load gallery:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const prev = () => setLbIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setLbIdx(i => (i + 1) % images.length);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lbIdx === null) return;
      if (e.key === 'Escape') setLbIdx(null);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lbIdx, images.length]);

  return (
    <>
      <style>{styles}</style>

      <div className="min-page-root">
        <div className="min-container">

          {/* Header */}
          <div className="min-header">
            <div className="min-header-left">
              <span className="min-eyebrow">Visual Archive</span>
              <h1 className="min-title">Full Gallery</h1>
            </div>

            <button className="min-back-btn" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </div>

          {/* Grid Content */}
          {loading ? (
            <div className="min-status">Loading Archive...</div>
          ) : images.length > 0 ? (
            <div className="min-masonry">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="min-card"
                  style={{ animationDelay: `${(i % 10) * 0.05}s` }} // Staggered entrance
                  onClick={() => setLbIdx(i)}
                >
                  <img src={src} alt={`Archive photograph ${i + 1}`} loading="lazy" />
                </div>
              ))}
            </div>
          ) : (
            <div className="min-status">No photographs found.</div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lbIdx !== null && (
        <div className="min-lb-wrapper" onClick={() => setLbIdx(null)}>
          <img
            className="min-lb-image"
            src={images[lbIdx]}
            alt={`Fullscreen gallery view ${lbIdx + 1}`}
            onClick={(e) => e.stopPropagation()}
          />

          <button className="min-lb-controls min-lb-close" onClick={() => setLbIdx(null)}>×</button>
          <button className="min-lb-controls min-lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }}>←</button>
          <button className="min-lb-controls min-lb-next" onClick={(e) => { e.stopPropagation(); next(); }}>→</button>

          <div className="min-lb-counter">
            {lbIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryPage;