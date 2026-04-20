import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

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
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  };

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const currentEvents = events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <section id="events" className="events-section" style={styles.section}>
      {/* Ambient Background Glow */}
      <div style={styles.ambientGlow}></div>

      <div style={styles.container}>
        {/* Header Section */}
        <div style={styles.header}>
          <div>
            <span style={styles.subtitle}>
              <iconify-icon icon="solar:calendar-date-bold-duotone" style={{ marginRight: '6px' }}></iconify-icon>
              {loading ? 'LOADING LINEUP' : 'OFFICIAL LINEUP'}
            </span>
            <h2 style={styles.title}>
              Featured <span style={styles.gradientText}>Events.</span>
            </h2>
          </div>

          {!loading && events.length > 0 && (
            <button style={styles.viewAllBtn} onClick={() => navigate('/events')} className="hover-btn">
              Explore All <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={styles.grid}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-card" style={styles.skeletonCard}>
                <div className="shimmer" style={styles.shimmer}></div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div style={styles.emptyState}>
            <iconify-icon icon="solar:ghost-bold-duotone" width="48" style={{ color: '#7c3aed' }}></iconify-icon>
            <p>No events have been revealed yet. Stay tuned!</p>
          </div>
        ) : (
          <>
            {/* Event Grid */}
            <div style={styles.grid}>
              {currentEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="event-card"
                  style={styles.card}
                  onClick={() => navigate(`/events/${ev.id}`)}
                >
                  {/* Image & Badges */}
                  <div style={styles.imageWrapper}>
                    {ev.image_url ? (
                      <img
                        src={ev.image_url.startsWith('http') ? ev.image_url : `${import.meta.env.VITE_API_URL}${ev.image_url}`}
                        alt={ev.name}
                        className="card-img"
                        style={styles.image}
                      />
                    ) : (
                      <div style={styles.noImage}>FESTIVERSE</div>
                    )}
                    <div style={styles.imageOverlay}></div>

                    {ev.category && (
                      <div style={styles.categoryBadge}>
                        {ev.category}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={styles.cardContent}>
                    <div style={styles.dateWrap}>
                      <span style={styles.dateText}>{formatDate(ev.date)}</span>
                    </div>

                    <h3 style={styles.cardTitle}>{ev.name}</h3>

                    {ev.description && (
                      <p style={styles.cardDesc}>{ev.description}</p>
                    )}

                    <div style={styles.cardFooter}>
                      <div style={styles.location}>
                        <iconify-icon icon="solar:map-point-bold-duotone"></iconify-icon>
                        {ev.location || 'Venue TBA'}
                      </div>
                      <div className="card-arrow" style={styles.arrowIcon}>
                        <iconify-icon icon="solar:arrow-right-up-linear"></iconify-icon>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div style={styles.pagination}>
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <iconify-icon icon="solar:alt-arrow-left-linear"></iconify-icon> Prev
              </button>

              <div style={styles.pageIndicator}>
                <span style={{ color: '#fff' }}>{currentPage}</span>
                <span style={{ color: '#64748b', margin: '0 4px' }}>/</span>
                <span>{totalPages}</span>
              </div>

              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next <iconify-icon icon="solar:alt-arrow-right-linear"></iconify-icon>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Injected CSS for complex animations/hovers */}
      <style>{`
                .event-card {
                    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
                    cursor: pointer;
                }
                .event-card:hover {
                    transform: translateY(-8px);
                    border-color: rgba(124, 58, 237, 0.4) !important;
                    box-shadow: 0 20px 40px -10px rgba(124, 58, 237, 0.15);
                }
                .event-card:hover .card-img {
                    transform: scale(1.08);
                }
                .event-card:hover .card-arrow {
                    background: #7c3aed !important;
                    color: #fff !important;
                    transform: rotate(45deg);
                }
                .hover-btn { transition: all 0.2s ease; }
                .hover-btn:hover { background: rgba(255,255,255,0.1) !important; color: #fff !important; }
                
                .page-btn {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1);
                    color: #e2e8f0; padding: 10px 20px; border-radius: 8px; font-weight: 600;
                    display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s;
                }
                .page-btn:hover:not(:disabled) { background: rgba(124, 58, 237, 0.2); border-color: rgba(124, 58, 237, 0.5); }
                .page-btn:disabled { opacity: 0.3; cursor: not-allowed; }

                @keyframes shimmerEffect {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .shimmer {
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
                    animation: shimmerEffect 1.5s infinite;
                }
                @media (max-width: 768px) {
                    .events-section { padding: 80px 0 !important; }
                }
            `}</style>
    </section>
  );
};

const styles = {
  section: { backgroundColor: '#030303', padding: '120px 0', position: 'relative', fontFamily: "'Inter', sans-serif" },
  ambientGlow: { position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' },
  container: { maxWidth: '1240px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 },

  // Header
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' },
  subtitle: { color: '#a78bfa', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', marginBottom: '0.75rem' },
  title: { fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 800, color: '#f8fafc', margin: 0, lineHeight: 1.1, letterSpacing: '-0.03em' },
  gradientText: { background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  viewAllBtn: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '12px 24px', borderRadius: '100px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },

  // Grid
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' },

  // Cards
  card: { background: 'rgba(15, 15, 20, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  imageWrapper: { position: 'relative', width: '100%', aspectRatio: '16/10', overflow: 'hidden', backgroundColor: '#0f0f14' },
  image: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)' },
  noImage: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333', fontSize: '2rem', fontWeight: 900, letterSpacing: '0.2em' },
  imageOverlay: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, transparent 50%, rgba(15, 15, 20, 1) 100%)' },
  categoryBadge: { position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(124, 58, 237, 0.3)', color: '#d8b4fe', padding: '6px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' },

  // Card Content
  cardContent: { padding: '0 1.5rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1 },
  dateWrap: { marginBottom: '1rem', marginTop: '-10px', position: 'relative', zIndex: 2 },
  dateText: { color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' },
  cardTitle: { fontSize: '1.4rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 0.75rem 0', lineHeight: 1.3, letterSpacing: '-0.01em' },
  cardDesc: { color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 1.5rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 },

  // Footer
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' },
  location: { display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 500 },
  arrowIcon: { width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a78bfa', transition: 'all 0.3s ease' },

  // States
  skeletonCard: { aspectRatio: '3/4', background: 'rgba(20,20,25,0.8)', borderRadius: '20px', position: 'relative', overflow: 'hidden' },
  emptyState: { textAlign: 'center', padding: '4rem 0', color: '#94a3b8', fontSize: '1.1rem' },

  // Pagination
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' },
  pageIndicator: { fontSize: '0.9rem', fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)' }
};

export default FestEvents;