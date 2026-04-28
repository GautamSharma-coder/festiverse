import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import Navbar from './Navbar';
import FestFooter from './FestFooter';

/* ── CSS ────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap');

  .rb-wrap {
    min-height: 100vh;
    background: #0a0a0c;
    color: #e4e4e7;
    font-family: 'Outfit', sans-serif;
    display: flex;
    flex-direction: column;
  }

  /* ── Hero ── */
  .rb-hero {
    position: relative;
    padding: 120px 24px 60px;
    text-align: center;
    overflow: hidden;
  }
  .rb-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 100%, rgba(124,58,237,0.06) 0%, transparent 50%);
    pointer-events: none;
  }
  .rb-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    background: rgba(249,115,22,0.08);
    border: 1px solid rgba(249,115,22,0.2);
    border-radius: 100px;
    color: #fb923c;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  .rb-hero-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.5rem, 6vw, 4rem);
    font-weight: 800;
    color: #fff;
    margin: 0 0 16px;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }
  .rb-hero-title span {
    background: linear-gradient(135deg, #f97316, #7c3aed);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .rb-hero-sub {
    color: #71717a;
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto 32px;
    line-height: 1.6;
  }
  .rb-stats-row {
    display: flex;
    justify-content: center;
    gap: 32px;
    flex-wrap: wrap;
  }
  .rb-stat-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 16px 28px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    backdrop-filter: blur(8px);
  }
  .rb-stat-val {
    font-family: 'Syne', sans-serif;
    font-size: 1.8rem;
    font-weight: 800;
    color: #fff;
  }
  .rb-stat-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* ── Filter Bar ── */
  .rb-filter-bar {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 0 24px;
    margin-bottom: 40px;
    flex-wrap: wrap;
  }
  .rb-filter-btn {
    padding: 10px 20px;
    border-radius: 100px;
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.03);
    color: #a1a1aa;
    font-family: 'Outfit', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: capitalize;
  }
  .rb-filter-btn:hover {
    border-color: rgba(249,115,22,0.3);
    color: #d4d4d8;
  }
  .rb-filter-btn.active {
    background: rgba(249,115,22,0.1);
    border-color: rgba(249,115,22,0.4);
    color: #fb923c;
  }

  /* ── Main Content ── */
  .rb-main {
    flex: 1;
    max-width: 900px;
    margin: 0 auto;
    width: 100%;
    padding: 0 24px 80px;
  }

  /* ── Rule Card ── */
  .rb-card {
    background: #131316;
    border: 1px solid #1e1e24;
    border-radius: 16px;
    margin-bottom: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  .rb-card:hover {
    border-color: rgba(249,115,22,0.2);
  }
  .rb-card.expanded {
    border-color: rgba(249,115,22,0.3);
    box-shadow: 0 8px 32px rgba(249,115,22,0.06);
  }

  .rb-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    cursor: pointer;
    user-select: none;
    gap: 16px;
  }
  .rb-card-left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
    min-width: 0;
  }
  .rb-card-num {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: rgba(249,115,22,0.08);
    border: 1px solid rgba(249,115,22,0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 0.85rem;
    font-weight: 800;
    color: #fb923c;
    flex-shrink: 0;
  }
  .rb-card-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .rb-card-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    color: #f4f4f5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .rb-card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.8rem;
    color: #71717a;
  }
  .rb-card-meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .rb-card-chevron {
    color: #52525b;
    font-size: 1.2rem;
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }
  .rb-card-chevron.open {
    transform: rotate(180deg);
    color: #fb923c;
  }

  /* ── Card Body ── */
  .rb-card-body {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .rb-card-body.open {
    max-height: 2000px;
  }
  .rb-card-content {
    padding: 0 24px 24px;
    border-top: 1px solid #1e1e24;
  }

  /* Rules Sections */
  .rb-section {
    margin-top: 20px;
  }
  .rb-section-title {
    font-size: 0.75rem;
    font-weight: 700;
    color: #52525b;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .rb-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #1e1e24;
  }
  .rb-rules-text {
    font-size: 0.95rem;
    line-height: 1.8;
    color: #a1a1aa;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .rb-desc-text {
    font-size: 0.95rem;
    line-height: 1.7;
    color: #71717a;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .rb-prize-highlight {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    background: linear-gradient(135deg, rgba(249,115,22,0.08), rgba(249,115,22,0.02));
    border: 1px solid rgba(249,115,22,0.2);
    border-radius: 12px;
    color: #fb923c;
    font-weight: 600;
    font-size: 0.95rem;
    margin-top: 12px;
  }
  .rb-view-event-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 16px;
    padding: 10px 20px;
    background: rgba(124,58,237,0.08);
    border: 1px solid rgba(124,58,237,0.2);
    border-radius: 10px;
    color: #a78bfa;
    font-family: 'Outfit', sans-serif;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .rb-view-event-btn:hover {
    background: rgba(124,58,237,0.15);
    border-color: rgba(124,58,237,0.4);
    color: #c4b5fd;
  }

  /* ── Empty / Loading ── */
  .rb-center {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 40vh;
    gap: 16px;
  }
  .rb-spinner {
    width: 40px; height: 40px;
    border: 3px solid rgba(249,115,22,0.2);
    border-top-color: #f97316; border-radius: 50%;
    animation: rbSpin .8s linear infinite;
  }
  @keyframes rbSpin { to { transform: rotate(360deg); } }

  /* ── No Rules Notice ── */
  .rb-no-rules {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: rgba(255,255,255,0.02);
    border-radius: 10px;
    color: #52525b;
    font-size: 0.9rem;
    font-style: italic;
    margin-top: 12px;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .rb-hero { padding: 100px 16px 40px; }
    .rb-stats-row { gap: 16px; }
    .rb-stat-box { padding: 12px 20px; }
    .rb-stat-val { font-size: 1.4rem; }
    .rb-main { padding: 0 16px 60px; }
    .rb-card-header { padding: 16px 18px; }
    .rb-card-content { padding: 0 18px 20px; }
    .rb-card-name { font-size: 1rem; }
    .rb-filter-bar { gap: 6px; }
    .rb-filter-btn { padding: 8px 16px; font-size: 0.8rem; }
  }
`;

const RulebookPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiFetch('/api/events');
        if (res.events) {
          setEvents(res.events);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const categories = ['all', ...new Set(events.map(e => e.category).filter(Boolean))];

  const filteredEvents = activeCategory === 'all'
    ? events
    : events.filter(e => e.category === activeCategory);

  const toggleCard = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }).toUpperCase();
  };

  return (
    <div className="rb-wrap">
      <style>{CSS}</style>
      <Navbar isFestiverse={true} toggleUniverse={() => navigate('/')} />

      {/* ── Hero Header ── */}
      <div className="rb-hero">
        <div className="rb-hero-badge">
          <iconify-icon icon="solar:document-text-bold-duotone" width="16"></iconify-icon>
          Official Festiverse '26 Rulebook
        </div>
        <h1 className="rb-hero-title">
          Event <span>Rulebook</span>
        </h1>
        <p className="rb-hero-sub">
          Complete rules, guidelines, and prize details for every event at Festiverse '26. 
          Know the rules before you compete.
        </p>
        <div className="rb-stats-row">
          <div className="rb-stat-box">
            <span className="rb-stat-val">{loading ? '—' : events.length}</span>
            <span className="rb-stat-label">Total Events</span>
          </div>
          <div className="rb-stat-box">
            <span className="rb-stat-val">₹60K+</span>
            <span className="rb-stat-label">Prize Pool</span>
          </div>
          <div className="rb-stat-box">
            <span className="rb-stat-val">3</span>
            <span className="rb-stat-label">Days</span>
          </div>
        </div>
      </div>

      {/* ── Category Filters ── */}
      {!loading && categories.length > 2 && (
        <div className="rb-filter-bar">
          {categories.map(cat => (
            <button
              key={cat}
              className={`rb-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'all' ? 'All Events' : cat}
            </button>
          ))}
        </div>
      )}

      {/* ── Main Content ── */}
      <main className="rb-main">
        {loading ? (
          <div className="rb-center">
            <div className="rb-spinner"></div>
            <div style={{ color: '#71717a' }}>Loading rulebook...</div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rb-center">
            <iconify-icon icon="solar:ghost-bold-duotone" width="48" style={{ color: '#52525b' }}></iconify-icon>
            <p style={{ color: '#71717a' }}>No events found in this category.</p>
          </div>
        ) : (
          filteredEvents.map((ev, idx) => {
            const isExpanded = expandedId === ev.id;
            const hasRules = ev.rules && ev.rules.trim() !== '';
            const hasPrizes = ev.prizes && ev.prizes.trim() !== '';

            return (
              <div key={ev.id} className={`rb-card ${isExpanded ? 'expanded' : ''}`}>
                <div className="rb-card-header" onClick={() => toggleCard(ev.id)}>
                  <div className="rb-card-left">
                    <div className="rb-card-num">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="rb-card-info">
                      <div className="rb-card-name">{ev.name}</div>
                      <div className="rb-card-meta">
                        {ev.category && (
                          <span className="rb-card-meta-item">
                            <iconify-icon icon="solar:tag-linear" width="14"></iconify-icon>
                            {ev.category}
                          </span>
                        )}
                        <span className="rb-card-meta-item">
                          <iconify-icon icon="solar:users-group-rounded-linear" width="14"></iconify-icon>
                          {ev.team_size > 1 ? `Team of ${ev.team_size}` : 'Solo'}
                        </span>
                        <span className="rb-card-meta-item">
                          <iconify-icon icon="solar:calendar-date-linear" width="14"></iconify-icon>
                          {formatDate(ev.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`rb-card-chevron ${isExpanded ? 'open' : ''}`}>
                    <iconify-icon icon="solar:alt-arrow-down-linear" width="20"></iconify-icon>
                  </div>
                </div>

                <div className={`rb-card-body ${isExpanded ? 'open' : ''}`}>
                  <div className="rb-card-content">
                    {/* Description */}
                    {ev.description && (
                      <div className="rb-section">
                        <div className="rb-section-title">About</div>
                        <div className="rb-desc-text">{ev.description}</div>
                      </div>
                    )}

                    {/* Rules */}
                    {hasRules ? (
                      <div className="rb-section">
                        <div className="rb-section-title">Rules & Guidelines</div>
                        <div className="rb-rules-text">{ev.rules}</div>
                      </div>
                    ) : (
                      <div className="rb-no-rules">
                        <iconify-icon icon="solar:info-circle-linear" width="16"></iconify-icon>
                        Rules will be updated soon. Stay tuned!
                      </div>
                    )}

                    {/* Prizes */}
                    {hasPrizes && (
                      <div className="rb-section">
                        <div className="rb-section-title">Prizes & Rewards</div>
                        <div className="rb-prize-highlight">
                          🏆 {ev.prizes}
                        </div>
                      </div>
                    )}

                    {/* View Event Button */}
                    <button
                      className="rb-view-event-btn"
                      onClick={(e) => { e.stopPropagation(); navigate(`/events/${ev.id}`); }}
                    >
                      <iconify-icon icon="solar:arrow-right-up-linear" width="16"></iconify-icon>
                      View Full Event Page
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </main>

      <FestFooter onAdminClick={() => navigate('/admin')} />
    </div>
  );
};

export default RulebookPage;
