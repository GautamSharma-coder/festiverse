import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import Navbar from './Navbar';
import FestFooter from './FestFooter';

/* ── Scoped CSS ─────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');

  .ep-wrap {
    min-height: 100vh;
    background: #0a0a0c;
    color: #e4e4e7;
    font-family: 'Outfit', sans-serif;
    display: flex;
    flex-direction: column;
  }

  /* ── Hero Banner ── */
  .ep-hero {
    position: relative;
    padding: 100px 24px 60px;
    text-align: center;
    overflow: hidden;
  }
  .ep-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 70%),
      radial-gradient(ellipse 40% 60% at 80% 20%, rgba(147,51,234,0.08) 0%, transparent 60%);
    pointer-events: none;
  }
  .ep-hero-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: linear-gradient(to bottom, rgba(0,0,0,0.4), transparent);
    pointer-events: none;
  }

  .ep-hero-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 18px;
    background: rgba(249,115,22,0.08);
    border: 1px solid rgba(249,115,22,0.15);
    border-radius: 100px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #fb923c;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 24px;
    position: relative;
  }
  .ep-hero-dot {
    width: 6px; height: 6px;
    background: #f97316;
    border-radius: 50%;
    animation: epPulse 2s ease-in-out infinite;
  }
  @keyframes epPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.5); }
  }

  .ep-hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.5rem, 6vw, 4.5rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.05;
    letter-spacing: -0.03em;
    margin: 0 0 16px;
    position: relative;
  }
  .ep-hero-title span {
    background: linear-gradient(135deg, #f97316, #fb923c, #fbbf24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .ep-hero-sub {
    font-size: 1.1rem;
    color: #71717a;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
    position: relative;
  }

  /* ── Controls Bar ── */
  .ep-controls {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px 48px;
    width: 100%;
    position: relative;
  }

  .ep-search-wrap {
    position: relative;
    max-width: 480px;
    margin-bottom: 28px;
  }
  .ep-search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #52525b;
    font-size: 1rem;
    pointer-events: none;
  }
  .ep-search {
    width: 100%;
    padding: 14px 18px 14px 44px;
    background: #16161a;
    border: 1px solid #252529;
    border-radius: 14px;
    color: #e4e4e7;
    font-family: 'Outfit', sans-serif;
    font-size: 0.95rem;
    outline: none;
    transition: all 0.25s ease;
  }
  .ep-search::placeholder { color: #52525b; }
  .ep-search:focus {
    border-color: rgba(249,115,22,0.4);
    box-shadow: 0 0 0 3px rgba(249,115,22,0.08);
  }

  .ep-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .ep-filter-btn {
    padding: 9px 20px;
    background: transparent;
    border: 1px solid #252529;
    border-radius: 100px;
    color: #a1a1aa;
    font-family: 'Outfit', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.25s ease;
    white-space: nowrap;
  }
  .ep-filter-btn:hover {
    border-color: #3f3f46;
    color: #e4e4e7;
  }
  .ep-filter-btn.active {
    background: #f97316;
    border-color: #f97316;
    color: #fff;
    font-weight: 600;
    box-shadow: 0 2px 12px rgba(249,115,22,0.25);
  }
  .ep-filter-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 100px;
    font-size: 0.7rem;
    font-weight: 700;
    margin-left: 6px;
  }
  .ep-filter-btn:not(.active) .ep-filter-count {
    background: rgba(255,255,255,0.06);
    color: #71717a;
  }
  .ep-filter-btn.active .ep-filter-count {
    background: rgba(255,255,255,0.2);
    color: #fff;
  }

  /* ── Results Info ── */
  .ep-results-bar {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px 24px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .ep-results-text {
    font-size: 0.85rem;
    color: #52525b;
  }
  .ep-results-text strong {
    color: #a1a1aa;
    font-weight: 600;
  }

  /* ── Grid ── */
  .ep-grid {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px 80px;
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 24px;
  }

  /* ── Card ── */
  .ep-card {
    background: #131316;
    border: 1px solid #1e1e22;
    border-radius: 18px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    position: relative;
    animation: epCardIn 0.5s ease both;
  }
  .ep-card:hover {
    border-color: #2a2a30;
    transform: translateY(-6px);
    box-shadow:
      0 20px 60px rgba(0,0,0,0.4),
      0 0 40px rgba(249,115,22,0.04);
  }

  @keyframes epCardIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ep-card-img-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 16/10;
    background: #1a1a1e;
    overflow: hidden;
  }
  .ep-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .ep-card:hover .ep-card-img {
    transform: scale(1.06);
  }
  .ep-card-img-grad {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, #131316, transparent);
    pointer-events: none;
  }
  .ep-card-no-img {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, rgba(249,115,22,0.06), rgba(147,51,234,0.06));
  }
  .ep-card-no-img span {
    font-family: 'Syne', sans-serif;
    font-size: 2.5rem;
    font-weight: 800;
    color: rgba(255,255,255,0.04);
    letter-spacing: -0.02em;
  }

  .ep-card-badge {
    position: absolute;
    top: 14px;
    left: 14px;
    padding: 5px 12px;
    background: rgba(10,10,12,0.75);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 600;
    color: #fb923c;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    z-index: 5;
  }

  .ep-card-team-badge {
    position: absolute;
    top: 14px;
    right: 14px;
    padding: 5px 10px;
    background: rgba(10,10,12,0.75);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    font-size: 0.7rem;
    font-weight: 500;
    color: #a1a1aa;
    z-index: 5;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ep-card-body {
    padding: 24px;
  }
  .ep-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    margin: 0 0 10px;
    line-height: 1.3;
    letter-spacing: -0.01em;
  }
  .ep-card-desc {
    font-size: 0.88rem;
    color: #71717a;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0 0 20px;
  }

  .ep-card-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-top: 16px;
    border-top: 1px solid #1e1e22;
  }
  .ep-card-meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.8rem;
    color: #52525b;
  }
  .ep-card-meta-icon {
    font-size: 0.9rem;
  }

  .ep-card-arrow {
    margin-left: auto;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 10px;
    color: #52525b;
    font-size: 0.85rem;
    transition: all 0.3s ease;
  }
  .ep-card:hover .ep-card-arrow {
    background: rgba(249,115,22,0.1);
    border-color: rgba(249,115,22,0.2);
    color: #f97316;
    transform: translateX(2px);
  }

  /* ── Empty State ── */
  .ep-empty {
    grid-column: 1 / -1;
    text-align: center;
    padding: 80px 24px;
  }
  .ep-empty-icon {
    font-size: 3.5rem;
    margin-bottom: 20px;
    opacity: 0.4;
  }
  .ep-empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 10px;
  }
  .ep-empty-desc {
    color: #52525b;
    font-size: 0.95rem;
  }
  .ep-empty-btn {
    margin-top: 24px;
    padding: 12px 28px;
    background: transparent;
    border: 1px solid #252529;
    border-radius: 12px;
    color: #a1a1aa;
    font-family: 'Outfit', sans-serif;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .ep-empty-btn:hover {
    border-color: #f97316;
    color: #f97316;
  }

  /* ── Skeleton Loading ── */
  @keyframes epShimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  .ep-skel {
    background: linear-gradient(90deg, #18181b 25%, #1e1e24 37%, #18181b 63%);
    background-size: 800px 100%;
    animation: epShimmer 1.8s ease-in-out infinite;
    border-radius: 8px;
  }
  .ep-skel-card {
    background: #131316;
    border: 1px solid #1e1e22;
    border-radius: 18px;
    overflow: hidden;
  }
  .ep-skel-img { width: 100%; aspect-ratio: 16/10; }
  .ep-skel-body { padding: 24px; display: flex; flex-direction: column; gap: 12px; }
  .ep-skel-line { height: 14px; border-radius: 6px; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .ep-hero { padding: 80px 20px 40px; }
    .ep-grid { grid-template-columns: 1fr; padding: 0 16px 60px; }
    .ep-controls { padding: 0 16px 32px; }
    .ep-results-bar { padding: 0 16px 16px; }
    .ep-search-wrap { max-width: 100%; }
    .ep-hero-title { font-size: clamp(2rem, 8vw, 3rem); }
  }

  @media (max-width: 480px) {
    .ep-grid { grid-template-columns: 1fr; }
    .ep-card-img-wrap { aspect-ratio: 16/9; }
  }
`;

const EventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchEvents = async () => {
      try {
        const res = await apiFetch('/api/events');
        if (res.events) setEvents(res.events);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set();
    events.forEach(e => { if (e.category) cats.add(e.category); });
    return ['All', ...Array.from(cats).sort()];
  }, [events]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: events.length };
    events.forEach(e => {
      if (e.category) {
        counts[e.category] = (counts[e.category] || 0) + 1;
      }
    });
    return counts;
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    return events.filter(ev => {
      const matchesCat = activeCategory === 'All' || ev.category === activeCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch = !q
        || ev.name?.toLowerCase().includes(q)
        || ev.category?.toLowerCase().includes(q)
        || ev.description?.toLowerCase().includes(q)
        || ev.location?.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [events, activeCategory, search]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`;
  };

  /* ── Skeleton Loading ── */
  if (loading) {
    return (
      <div className="ep-wrap">
        <style>{CSS}</style>
        <Navbar isFestiverse={true} toggleUniverse={() => navigate('/')} />
        <div className="ep-hero">
          <div className="ep-hero-grid" />
          <div className="ep-hero-label"><div className="ep-hero-dot" /> Loading Events</div>
          <h1 className="ep-hero-title">All <span>Events</span></h1>
          <p className="ep-hero-sub">Fetching the latest events for you...</p>
        </div>
        <div className="ep-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ep-skel-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="ep-skel ep-skel-img" />
              <div className="ep-skel-body">
                <div className="ep-skel ep-skel-line" style={{ width: '35%' }} />
                <div className="ep-skel ep-skel-line" style={{ width: '80%', height: '20px' }} />
                <div className="ep-skel ep-skel-line" style={{ width: '65%' }} />
                <div className="ep-skel ep-skel-line" style={{ width: '45%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="ep-wrap">
      <style>{CSS}</style>
      <Navbar isFestiverse={true} toggleUniverse={() => navigate('/')} />

      {/* ── Hero Section ── */}
      <div className="ep-hero">
        <div className="ep-hero-grid" />
        <div className="ep-hero-label">
          <div className="ep-hero-dot" />
          Festiverse 2026
        </div>
        <h1 className="ep-hero-title">
          Explore All <span>Events</span>
        </h1>
        <p className="ep-hero-sub">
          Discover competitions, cultural showcases, and workshops — find the events that match your vibe.
        </p>
      </div>

      {/* ── Controls ── */}
      <div className="ep-controls">
        {/* Search */}
        <div className="ep-search-wrap">
          <span className="ep-search-icon">🔍</span>
          <input
            type="text"
            className="ep-search"
            placeholder="Search events by name, category, or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filters */}
        <div className="ep-filters">
          {categories.map(cat => (
            <button
              key={cat}
              className={`ep-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              <span className="ep-filter-count">{categoryCounts[cat] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Results Info ── */}
      <div className="ep-results-bar">
        <span className="ep-results-text">
          Showing <strong>{filteredEvents.length}</strong> of {events.length} events
          {activeCategory !== 'All' && <> in <strong>{activeCategory}</strong></>}
          {search && <> matching "<strong>{search}</strong>"</>}
        </span>
      </div>

      {/* ── Events Grid ── */}
      <div className="ep-grid">
        {filteredEvents.length === 0 ? (
          <div className="ep-empty">
            <div className="ep-empty-icon">🔭</div>
            <div className="ep-empty-title">No events found</div>
            <div className="ep-empty-desc">
              {search
                ? `No events match "${search}"${activeCategory !== 'All' ? ` in ${activeCategory}` : ''}.`
                : `No events in the "${activeCategory}" category yet.`}
            </div>
            <button
              className="ep-empty-btn"
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredEvents.map((ev, idx) => (
            <div
              key={ev.id}
              className="ep-card"
              style={{ animationDelay: `${idx * 0.06}s` }}
              onClick={() => navigate(`/events/${ev.id}`)}
            >
              {/* Image */}
              <div className="ep-card-img-wrap">
                {ev.image_url ? (
                  <>
                    <img
                      src={getImageUrl(ev.image_url)}
                      alt={ev.name}
                      className="ep-card-img"
                      loading="lazy"
                    />
                    <div className="ep-card-img-grad" />
                  </>
                ) : (
                  <div className="ep-card-no-img">
                    <span>{ev.name?.charAt(0) || 'F'}</span>
                  </div>
                )}

                {/* Category Badge */}
                {ev.category && (
                  <div className="ep-card-badge">{ev.category}</div>
                )}

                {/* Team Size Badge */}
                <div className="ep-card-team-badge">
                  👥 {ev.team_size > 1 ? `Team of ${ev.team_size}` : 'Solo'}
                </div>
              </div>

              {/* Body */}
              <div className="ep-card-body">
                <h3 className="ep-card-title">{ev.name}</h3>
                {ev.description && (
                  <p className="ep-card-desc">{ev.description}</p>
                )}

                <div className="ep-card-meta">
                  {ev.date && (
                    <div className="ep-card-meta-item">
                      <span className="ep-card-meta-icon">📅</span>
                      {formatDate(ev.date)}
                    </div>
                  )}
                  {ev.location && (
                    <div className="ep-card-meta-item">
                      <span className="ep-card-meta-icon">📍</span>
                      {ev.location}
                    </div>
                  )}
                  <div className="ep-card-arrow">→</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <FestFooter onAdminClick={() => navigate('/admin')} />
    </div>
  );
};

export default EventsPage;
