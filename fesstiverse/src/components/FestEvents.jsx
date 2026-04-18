import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --bg: #ffffff;
    --text-primary: #111111;
    --text-muted: #71717a;
    --border: #e4e4e7;
    --skeleton: #f4f4f5;
    --radius: 8px;
  }

  /* Automatically adapts to Dark Mode for a sleek minimal dark aesthetic */
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #09090b;
      --text-primary: #fafafa;
      --text-muted: #a1a1aa;
      --border: #27272a;
      --skeleton: #18181b;
    }
  }

  .min-root {
    background-color: var(--bg);
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    padding: 96px 0;
    min-height: 100vh;
  }

  .min-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
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

  .min-title-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .min-count {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    font-weight: 500;
  }

  .min-title {
    font-size: clamp(2rem, 4vw, 2.5rem);
    font-weight: 500;
    letter-spacing: -0.03em;
    margin: 0;
    line-height: 1.1;
  }

  .min-explore-btn {
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-primary);
    background: transparent;
    border: none;
    padding: 0;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .min-explore-btn:hover {
    opacity: 0.6;
  }

  /* ── Grid ── */
  .min-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 48px 32px;
  }

  /* ── Card ── */
  .min-card {
    display: flex;
    flex-direction: column;
    cursor: pointer;
    text-decoration: none;
  }

  .min-card-img-wrap {
    width: 100%;
    aspect-ratio: 4/3;
    background-color: var(--skeleton);
    border-radius: var(--radius);
    overflow: hidden;
    margin-bottom: 20px;
  }

  .min-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
  }

  .min-card:hover .min-card-img {
    transform: scale(1.03);
    opacity: 0.9;
  }

  .min-card-no-img {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
    font-weight: 300;
    font-size: 0.875rem;
  }

  /* ── Card Content ── */
  .min-card-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 0.75rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 10px;
  }

  .min-card-title {
    font-size: 1.25rem;
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 12px 0;
    letter-spacing: -0.01em;
  }

  .min-card-desc {
    font-size: 0.875rem;
    color: var(--text-muted);
    line-height: 1.6;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .min-card-footer {
    margin-top: 16px;
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  /* ── Skeletons ── */
  @keyframes pulse-opacity {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .min-skeleton-block {
    background-color: var(--skeleton);
    border-radius: 4px;
    animation: pulse-opacity 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* ── Pagination ── */
  .min-pagination {
    margin-top: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 24px;
    border-top: 1px solid var(--border);
    font-size: 0.875rem;
    color: var(--text-muted);
  }

  .min-page-btn {
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    padding: 8px 0;
    transition: opacity 0.2s;
  }

  .min-page-btn:disabled {
    color: var(--text-muted);
    cursor: not-allowed;
    opacity: 0.5;
  }

  .min-page-btn:not(:disabled):hover {
    opacity: 0.6;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .min-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 40px;
    }
    .min-root { padding: 64px 0; }
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
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <section className="min-root">
        <style>{styles}</style>
        <div className="min-container">
          <div className="min-header">
            <div className="min-title-wrapper">
              <span className="min-count">Loading Events</span>
              <h2 className="min-title">Featured Events</h2>
            </div>
          </div>
          <div className="min-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="min-skeleton-block" style={{ width: '100%', aspectRatio: '4/3', borderRadius: 'var(--radius)' }} />
                <div className="min-skeleton-block" style={{ width: '30%', height: '14px' }} />
                <div className="min-skeleton-block" style={{ width: '80%', height: '24px' }} />
                <div className="min-skeleton-block" style={{ width: '60%', height: '16px' }} />
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
    <section id="events" className="min-root">
      <style>{styles}</style>
      <div className="min-container">

        {/* Header */}
        <div className="min-header">
          <div className="min-title-wrapper">
            <span className="min-count">{events.length} Events Listed</span>
            <h2 className="min-title">Featured Events</h2>
          </div>
          <button className="min-explore-btn" onClick={() => navigate('/events')}>
            View All Events →
          </button>
        </div>

        {/* Grid */}
        <div className="min-grid">
          {currentEvents.map((ev) => (
            <div
              key={ev.id}
              className="min-card"
              onClick={() => navigate(`/events/${ev.id}`)}
            >
              {/* Image Wrapper */}
              <div className="min-card-img-wrap">
                {ev.image_url ? (
                  <img
                    src={ev.image_url.startsWith('http')
                      ? ev.image_url
                      : `${import.meta.env.VITE_API_URL}${ev.image_url}`}
                    alt={ev.name}
                    className="min-card-img"
                  />
                ) : (
                  <div className="min-card-no-img">No Image Provided</div>
                )}
              </div>

              {/* Text Content */}
              <div className="min-card-meta">
                {ev.category && <span>{ev.category}</span>}
                {ev.category && ev.date && <span>•</span>}
                <span>{formatDate(ev.date)}</span>
              </div>

              <h3 className="min-card-title">{ev.name}</h3>

              {ev.description && (
                <p className="min-card-desc">{ev.description}</p>
              )}

              {ev.location && (
                <div className="min-card-footer">
                  {ev.location}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 ? (
          <div className="min-pagination">
            <button
              className="min-page-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              ← Previous
            </button>
            <span>{currentPage} / {totalPages}</span>
            <button
              className="min-page-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next →
            </button>
          </div>
        ) : (
          <div className="min-pagination" style={{ justifyContent: 'center' }}>
            End of Events
          </div>
        )}
      </div>
    </section>
  );
};

export default FestEvents;