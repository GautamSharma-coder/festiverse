import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --ink:       #08080a;
    --surface:   #101013;
    --card:      #141417;
    --border:    #1e1e24;
    --border-hi: #2e2e38;
    --ember:     #ff5c1a;
    --ember-dim: rgba(255,92,26,0.12);
    --ember-glow:rgba(255,92,26,0.06);
    --silver:    #9898a8;
    --fog:       #4a4a58;
    --white:     #f5f5f7;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }

  @keyframes pulse-ring {
    0%   { transform: scale(0.9); opacity: 0.6; }
    50%  { transform: scale(1.05); opacity: 0.3; }
    100% { transform: scale(0.9); opacity: 0.6; }
  }

  /* ── Root ── */
  .fe-root {
    background: var(--ink);
    padding: 120px 0 140px;
    position: relative;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }

  /* Ambient background radial */
  .fe-root::before {
    content: '';
    position: absolute;
    top: -180px; left: 50%;
    transform: translateX(-50%);
    width: 900px; height: 500px;
    background: radial-gradient(ellipse at center, rgba(255,92,26,0.055) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Horizontal rule at top */
  .fe-root::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border-hi) 30%, var(--ember) 50%, var(--border-hi) 70%, transparent);
  }

  .fe-container {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 32px;
    position: relative;
    z-index: 10;
  }

  /* ── Header ── */
  .fe-header {
    margin-bottom: 72px;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    gap: 24px;
  }

  .fe-eyebrow {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  }

  .fe-eyebrow-line {
    width: 32px; height: 1px;
    background: var(--ember);
  }

  .fe-eyebrow-text {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    color: var(--ember);
    text-transform: uppercase;
    letter-spacing: 0.25em;
    font-weight: 500;
  }

  .fe-eyebrow-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--ember);
    animation: pulse-ring 2.2s ease-in-out infinite;
  }

  .fe-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(3rem, 6vw, 5.5rem);
    font-weight: 900;
    color: var(--white);
    line-height: 0.95;
    letter-spacing: -0.02em;
  }

  .fe-title em {
    font-style: italic;
    color: var(--ember);
    position: relative;
  }

  /* underline squiggle on the italic word */
  .fe-title em::after {
    content: '';
    position: absolute;
    bottom: -4px; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--ember), transparent);
    border-radius: 2px;
  }

  .fe-header-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 16px;
    padding-bottom: 6px;
  }

  .fe-count {
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    color: var(--fog);
    letter-spacing: 0.12em;
  }

  .fe-explore-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--white);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    text-decoration: none;
    background: transparent;
    border: 1px solid var(--border-hi);
    padding: 12px 22px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.25s ease;
    position: relative;
    overflow: hidden;
  }

  .fe-explore-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,92,26,0.08), transparent);
    transform: translateX(-100%);
    transition: transform 0.4s ease;
  }

  .fe-explore-btn:hover {
    border-color: var(--ember);
    color: var(--ember);
    box-shadow: 0 0 18px var(--ember-dim);
  }
  .fe-explore-btn:hover::before { transform: translateX(100%); }

  .fe-btn-arrow {
    font-size: 1rem;
    transition: transform 0.25s ease;
    display: inline-block;
  }
  .fe-explore-btn:hover .fe-btn-arrow { transform: translateX(4px); }

  /* ── Grid ── */
  .fe-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--border);
    border: 1px solid var(--border);
    border-radius: 12px;
    overflow: hidden;
  }

  /* ── Card ── */
  .fe-card {
    background: var(--card);
    display: flex;
    flex-direction: column;
    cursor: pointer;
    transition: background 0.2s ease;
    position: relative;
    animation: fadeUp 0.55s ease both;
  }

  .fe-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--ember-glow), transparent 60%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .fe-card:hover { background: #18181c; }
  .fe-card:hover::after { opacity: 1; }

  /* top accent bar on hover */
  .fe-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--ember), transparent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.35s ease;
  }
  .fe-card:hover::before { transform: scaleX(1); }

  /* ── Card image ── */
  .fe-card-img-wrap {
    width: 100%;
    aspect-ratio: 16/9;
    position: relative;
    overflow: hidden;
    background: var(--surface);
  }

  .fe-card-img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.23,1,0.32,1), filter 0.4s ease;
    filter: brightness(0.85) saturate(0.9);
  }
  .fe-card:hover .fe-card-img {
    transform: scale(1.07);
    filter: brightness(1) saturate(1.05);
  }

  .fe-img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, var(--card) 0%, rgba(20,20,23,0.4) 50%, transparent 100%);
  }

  .fe-card-no-img {
    width: 100%;
    aspect-ratio: 16/9;
    background: linear-gradient(135deg, var(--surface) 0%, #18181e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .fe-card-no-img-icon {
    width: 48px; height: 48px;
    border-radius: 50%;
    border: 1px solid var(--border-hi);
    display: flex; align-items: center; justify-content: center;
    color: var(--fog);
    font-size: 1.2rem;
  }

  /* ── Card content ── */
  .fe-card-content {
    padding: 24px 28px 28px;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .fe-card-meta-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }

  .fe-card-cat {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--ember);
    background: var(--ember-dim);
    padding: 3px 8px;
    border-radius: 3px;
  }

  .fe-card-sep {
    width: 3px; height: 3px;
    border-radius: 50%;
    background: var(--fog);
  }

  .fe-card-date {
    font-family: 'DM Mono', monospace;
    font-size: 0.68rem;
    color: var(--fog);
    letter-spacing: 0.08em;
  }

  .fe-card-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--white);
    line-height: 1.25;
    margin-bottom: 12px;
    letter-spacing: -0.01em;
    transition: color 0.2s ease;
  }
  .fe-card:hover .fe-card-title { color: #fff; }

  .fe-card-desc {
    font-size: 0.84rem;
    font-weight: 300;
    color: var(--silver);
    line-height: 1.7;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 24px;
  }

  /* ── Card footer ── */
  .fe-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 18px;
    border-top: 1px solid var(--border);
  }

  .fe-card-loc {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.78rem;
    color: var(--fog);
    font-weight: 400;
  }

  .fe-card-loc-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--ember);
    opacity: 0.7;
    flex-shrink: 0;
  }

  .fe-card-cta {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--fog);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    transition: color 0.2s ease, gap 0.2s ease;
  }
  .fe-card:hover .fe-card-cta {
    color: var(--ember);
    gap: 10px;
  }

  /* ── Loading skeleton ── */
  .fe-skeleton-card {
    background: var(--card);
    display: flex;
    flex-direction: column;
  }

  .fe-skeleton-img {
    width: 100%;
    aspect-ratio: 16/9;
    background: linear-gradient(90deg, var(--surface) 25%, #1a1a1f 50%, var(--surface) 75%);
    background-size: 800px 100%;
    animation: shimmer 1.6s infinite linear;
  }

  .fe-skeleton-content { padding: 24px 28px; display: flex; flex-direction: column; gap: 10px; }
  .fe-skeleton-line {
    height: 12px; border-radius: 4px;
    background: linear-gradient(90deg, var(--surface) 25%, #1a1a1f 50%, var(--surface) 75%);
    background-size: 800px 100%;
    animation: shimmer 1.6s infinite linear;
  }

  /* ── Bottom rule ── */
  .fe-bottom {
    margin-top: 56px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: var(--fog);
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  .fe-bottom::before, .fe-bottom::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .fe-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (max-width: 640px) {
    .fe-root { padding: 80px 0 100px; }
    .fe-header { grid-template-columns: 1fr; gap: 28px; }
    .fe-header-right { align-items: flex-start; }
    .fe-grid { grid-template-columns: 1fr; }
    .fe-title { font-size: 2.8rem; }
    .fe-container { padding: 0 20px; }
    .fe-card-content { padding: 20px; }
  }
`;

const FestEvents = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await apiFetch('/api/events');
                if (res.events) {
                    setEvents(res.events);
                }
            } catch (err) {
                console.error("Failed to fetch events for landing page:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const formatDate = (dateStr) => {
        if (!dateStr) return 'TBA';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' });
    };

    // Skeleton loader
    if (loading) {
        return (
            <section className="fe-root">
                <style>{styles}</style>
                <div className="fe-container">
                    <div className="fe-header">
                        <div>
                            <div className="fe-eyebrow">
                                <div className="fe-eyebrow-line" />
                                <span className="fe-eyebrow-text">Competitions & Highlights</span>
                                <div className="fe-eyebrow-dot" />
                            </div>
                            <h2 className="fe-title">Featured <em>Events</em></h2>
                        </div>
                    </div>
                    <div className="fe-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="fe-skeleton-card">
                                <div className="fe-skeleton-img" />
                                <div className="fe-skeleton-content">
                                    <div className="fe-skeleton-line" style={{ width: '40%' }} />
                                    <div className="fe-skeleton-line" style={{ width: '80%', height: 18 }} />
                                    <div className="fe-skeleton-line" style={{ width: '70%' }} />
                                    <div className="fe-skeleton-line" style={{ width: '55%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (events.length === 0) return null;

    const totalPages = Math.ceil(events.length / itemsPerPage);
    const currentEvents = events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <section id="events" className="fe-root">
            <style>{styles}</style>
            <div className="fe-container">

                {/* Header */}
                <div className="fe-header">
                    <div>
                        <div className="fe-eyebrow">
                            <div className="fe-eyebrow-line" />
                            <span className="fe-eyebrow-text">Competitions & Highlights</span>
                            <div className="fe-eyebrow-dot" />
                        </div>
                        <h2 className="fe-title">Featured <em>Events</em></h2>
                    </div>

                    <div className="fe-header-right">
                        <span className="fe-count">{String(events.length).padStart(2, '0')} events listed</span>
                        <button className="fe-explore-btn" onClick={() => navigate('/dashboard')}>
                            View All
                            <span className="fe-btn-arrow">→</span>
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="fe-grid">
                    {currentEvents.map((ev, i) => (
                        <div
                            key={ev.id}
                            className="fe-card"
                            onClick={() => navigate(`/events/${ev.id}`)}
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            {/* Image */}
                            {ev.image_url ? (
                                <div className="fe-card-img-wrap">
                                    <img
                                        src={ev.image_url.startsWith('http')
                                            ? ev.image_url
                                            : `${import.meta.env.VITE_API_URL}${ev.image_url}`}
                                        alt={ev.name}
                                        className="fe-card-img"
                                    />
                                    <div className="fe-img-overlay" />
                                </div>
                            ) : (
                                <div className="fe-card-no-img">
                                    <div className="fe-card-no-img-icon">✦</div>
                                </div>
                            )}

                            {/* Content */}
                            <div className="fe-card-content">
                                <div className="fe-card-meta-row">
                                    {ev.category && <span className="fe-card-cat">{ev.category}</span>}
                                    {ev.category && ev.date && <div className="fe-card-sep" />}
                                    <span className="fe-card-date">{formatDate(ev.date)}</span>
                                </div>

                                <h3 className="fe-card-title">{ev.name}</h3>

                                {ev.description && (
                                    <p className="fe-card-desc">{ev.description}</p>
                                )}

                                <div className="fe-card-footer">
                                    <div className="fe-card-loc">
                                        {ev.location && (
                                            <>
                                                <div className="fe-card-loc-dot" />
                                                {ev.location}
                                            </>
                                        )}
                                    </div>
                                    <div className="fe-card-cta">
                                        Details <span>→</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Pagination */}
                {totalPages > 1 ? (
                    <div className="fe-bottom">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                            style={{
                                background: 'transparent', border: 'none', outline: 'none',
                                color: currentPage === 1 ? 'var(--fog)' : 'var(--ember)',
                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit',
                                transition: 'color 0.2s ease', padding: '0 8px'
                            }}
                        >← Prev</button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                            style={{
                                background: 'transparent', border: 'none', outline: 'none',
                                color: currentPage === totalPages ? 'var(--fog)' : 'var(--ember)',
                                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                fontFamily: 'inherit', fontSize: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit',
                                transition: 'color 0.2s ease', padding: '0 8px'
                            }}
                        >Next →</button>
                    </div>
                ) : (
                    <div className="fe-bottom">All Events</div>
                )}
            </div>
        </section>
    );
};

export default FestEvents;