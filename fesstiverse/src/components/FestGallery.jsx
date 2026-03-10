import React, { useState, useEffect, useRef } from 'react';
import { proxyImageUrl } from '../lib/proxyImage';
import { apiFetch } from '../lib/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=Syne+Mono&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .fg2-root {
    background: #06060C;
    padding: 80px 0 100px;
    position: relative;
    overflow: hidden;
    font-family: 'Syne', sans-serif;
  }

  /* Big watermark text */
  .fg2-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: clamp(120px, 18vw, 220px);
    font-weight: 800;
    letter-spacing: -0.04em;
    color: transparent;
    -webkit-text-stroke: 1px rgba(255,140,0,0.06);
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    z-index: 0;
  }

  /* Noise overlay */
  .fg2-noise {
    position: absolute;
    inset: 0;
    opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    pointer-events: none;
    z-index: 0;
  }

  .fg2-content {
    position: relative;
    z-index: 1;
    max-width: 1300px;
    margin: 0 auto;
    padding: 0 40px;
  }

  /* ── HEADER ── */
  .fg2-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 64px;
    padding-bottom: 32px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  .fg2-label {
    font-family: 'Syne Mono', monospace;
    font-size: 11px;
    color: #FF8C00;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .fg2-label::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 1px;
    background: #FF8C00;
  }

  .fg2-title {
    font-size: clamp(48px, 6vw, 80px);
    font-weight: 800;
    line-height: 0.9;
    color: #fff;
    letter-spacing: -0.03em;
  }
  .fg2-title em {
    font-style: normal;
    color: #FF8C00;
  }

  .fg2-header-right {
    text-align: right;
    flex-shrink: 0;
  }

  .fg2-count {
    font-family: 'Syne Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.15em;
    margin-bottom: 8px;
  }

  .fg2-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #FF8C00;
    text-decoration: none;
    padding: 10px 20px;
    border: 1px solid rgba(255,140,0,0.35);
    border-radius: 2px;
    transition: background 0.2s, color 0.2s;
    cursor: pointer;
    background: transparent;
  }
  .fg2-cta:hover {
    background: #FF8C00;
    color: #000;
  }
  .fg2-cta svg {
    transition: transform 0.2s;
  }
  .fg2-cta:hover svg {
    transform: translateX(3px);
  }

  /* ── BENTO GRID ── */
  .fg2-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 260px 260px;
    gap: 10px;
  }

  .fg2-cell {
    position: relative;
    overflow: hidden;
    border-radius: 3px;
    cursor: pointer;
    background: #111118;
  }

  .fg2-cell:nth-child(1) { grid-column: 1 / 6; grid-row: 1; }
  .fg2-cell:nth-child(2) { grid-column: 6 / 9; grid-row: 1; }
  .fg2-cell:nth-child(3) { grid-column: 9 / 13; grid-row: 1 / 3; }
  .fg2-cell:nth-child(4) { grid-column: 1 / 4; grid-row: 2; }
  .fg2-cell:nth-child(5) { grid-column: 4 / 9; grid-row: 2; }

  .fg2-cell img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.7s cubic-bezier(0.23,1,0.32,1), filter 0.5s ease;
    filter: grayscale(30%) brightness(0.75);
  }
  .fg2-cell:hover img {
    transform: scale(1.07);
    filter: grayscale(0%) brightness(0.95);
  }

  /* Hover overlay with number */
  .fg2-cell-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0,0,0,0.7) 0%,
      transparent 50%
    );
    display: flex;
    align-items: flex-end;
    padding: 18px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .fg2-cell:hover .fg2-cell-overlay {
    opacity: 1;
  }

  .fg2-cell-num {
    font-family: 'Syne Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.2em;
  }

  /* Orange left-border accent on hover */
  .fg2-cell::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: #FF8C00;
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.35s cubic-bezier(0.23,1,0.32,1);
  }
  .fg2-cell:hover::after {
    transform: scaleY(1);
  }

  /* Expand icon on hover */
  .fg2-expand-icon {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 32px;
    height: 32px;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transform: scale(0.7);
    transition: opacity 0.3s, transform 0.3s;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
  }
  .fg2-cell:hover .fg2-expand-icon {
    opacity: 1;
    transform: scale(1);
  }
  .fg2-expand-icon svg {
    width: 14px;
    height: 14px;
    stroke: #fff;
    fill: none;
  }

  /* ── TICKER STRIP ── */
  .fg2-ticker {
    margin-top: 40px;
    border-top: 1px solid rgba(255,255,255,0.06);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 14px 0;
    overflow: hidden;
    position: relative;
  }
  .fg2-ticker::before,
  .fg2-ticker::after {
    content: '';
    position: absolute;
    top: 0; bottom: 0;
    width: 80px;
    z-index: 2;
    pointer-events: none;
  }
  .fg2-ticker::before { left: 0; background: linear-gradient(90deg, #06060C, transparent); }
  .fg2-ticker::after  { right: 0; background: linear-gradient(270deg, #06060C, transparent); }

  .fg2-ticker-inner {
    display: flex;
    gap: 0;
    width: max-content;
    animation: tickerScroll 18s linear infinite;
  }

  @keyframes tickerScroll {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }

  .fg2-ticker-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 0 32px;
    white-space: nowrap;
  }

  .fg2-ticker-text {
    font-family: 'Syne Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.25);
  }

  .fg2-ticker-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #FF8C00;
    flex-shrink: 0;
  }

  /* ── LIGHTBOX ── */
  .fg2-lightbox {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(4,4,10,0.96);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: lbFadeIn 0.25s ease;
  }
  @keyframes lbFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .fg2-lb-img {
    max-width: 86vw;
    max-height: 80vh;
    object-fit: contain;
    border-radius: 3px;
    box-shadow:
      0 0 0 1px rgba(255,140,0,0.15),
      0 60px 120px rgba(0,0,0,0.9);
    animation: lbZoom 0.35s cubic-bezier(0.23,1,0.32,1);
  }
  @keyframes lbZoom {
    from { transform: scale(0.85) translateY(20px); opacity: 0; }
    to   { transform: scale(1) translateY(0); opacity: 1; }
  }
  .fg2-lb-close {
    position: fixed;
    top: 28px;
    right: 28px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.5);
    width: 44px;
    height: 44px;
    border-radius: 3px;
    font-size: 18px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    font-family: 'Syne Mono', monospace;
  }
  .fg2-lb-close:hover {
    background: #FF8C00;
    border-color: #FF8C00;
    color: #000;
  }
  .fg2-lb-nav {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.5);
    width: 44px;
    height: 80px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    transition: all 0.2s;
    border-radius: 2px;
  }
  .fg2-lb-nav:hover { background: rgba(255,140,0,0.15); border-color: #FF8C00; color: #FF8C00; }
  .fg2-lb-nav.prev { left: 20px; }
  .fg2-lb-nav.next { right: 20px; }
  .fg2-lb-counter {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Syne Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.3);
  }

  @media (max-width: 768px) {
    .fg2-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 180px 180px 180px;
    }
    .fg2-cell:nth-child(1) { grid-column: 1 / 3; grid-row: 1; }
    .fg2-cell:nth-child(2) { grid-column: 1; grid-row: 2; }
    .fg2-cell:nth-child(3) { grid-column: 2; grid-row: 2; }
    .fg2-cell:nth-child(4) { grid-column: 1; grid-row: 3; }
    .fg2-cell:nth-child(5) { grid-column: 2; grid-row: 3; }
    .fg2-header { flex-direction: column; align-items: flex-start; gap: 24px; }
    .fg2-header-right { text-align: left; }
  }
`;

const tickerItems = [
  'MUSIC FESTIVAL', 'LIVE PERFORMANCES', 'CULTURAL NIGHTS',
  'TECH SUMMIT', 'FOOD & ARTS', 'COMMUNITY VIBES',
  'MUSIC FESTIVAL', 'LIVE PERFORMANCES', 'CULTURAL NIGHTS',
  'TECH SUMMIT', 'FOOD & ARTS', 'COMMUNITY VIBES',
];

const FestGallery2 = () => {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await apiFetch('/api/gallery');
        if (res.images && res.images.length > 0) {
          // The bento grid supports exactly 5 image slots
          setGalleryImages(res.images.slice(0, 5).map(img => proxyImageUrl(img.url)));
        }
      } catch (err) {
        console.error('Error fetching gallery images:', err);
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

  return (
    <>
      <style>{styles}</style>

      <section id="gallery" className="fg2-root">
        <div className="fg2-watermark">MEMORIES</div>
        <div className="fg2-noise" />

        <div className="fg2-content">

          {/* Header */}
          <div className="fg2-header">
            <div>
              <div className="fg2-label">Past Glimpses</div>
              <h2 className="fg2-title">
                WE <em>WERE</em><br />THERE
              </h2>
            </div>
            <div className="fg2-header-right">
              <div className="fg2-count">0{galleryImages.length} PHOTOGRAPHS</div>
              <button className="fg2-cta">
                View All
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 7h12M8 2l5 5-5 5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Bento Grid */}
          <div className="fg2-grid">
            {galleryImages.map((src, i) => (
              <div
                key={i}
                className="fg2-cell"
                onClick={() => setLightboxIdx(i)}
              >
                <img src={src} alt={`Event ${i + 1}`} loading="lazy" />
                <div className="fg2-cell-overlay">
                  <span className="fg2-cell-num">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="fg2-expand-icon">
                  <svg strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="5,2 2,2 2,5" />
                    <polyline points="9,2 12,2 12,5" />
                    <polyline points="5,12 2,12 2,9" />
                    <polyline points="9,12 12,12 12,9" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Ticker */}
          <div className="fg2-ticker">
            <div className="fg2-ticker-inner">
              {tickerItems.map((item, i) => (
                <div key={i} className="fg2-ticker-item">
                  <span className="fg2-ticker-text">{item}</span>
                  <span className="fg2-ticker-dot" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="fg2-lightbox" onClick={() => setLightboxIdx(null)}>
          <img
            className="fg2-lb-img"
            src={galleryImages[lightboxIdx]}
            alt={`Gallery ${lightboxIdx + 1}`}
            onClick={e => e.stopPropagation()}
          />
          <button className="fg2-lb-close" onClick={() => setLightboxIdx(null)}>✕</button>
          <button className="fg2-lb-nav prev" onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
          <button className="fg2-lb-nav next" onClick={e => { e.stopPropagation(); next(); }}>›</button>
          <div className="fg2-lb-counter">
            {String(lightboxIdx + 1).padStart(2, '0')} / {String(galleryImages.length).padStart(2, '0')}
          </div>
        </div>
      )}
    </>
  );
};

export default FestGallery2;