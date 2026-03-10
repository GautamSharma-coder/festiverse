import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

/* ── CSS ────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

  .ed-wrap {
    min-height: 100vh;
    background: #0e0e10;
    color: #e4e4e7;
    font-family: 'Outfit', sans-serif;
  }

  /* ── Top Bar ── */
  .ed-topbar {
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; gap: 12px;
    padding: 16px 20px;
    background: rgba(14,14,16,0.92);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid #252529;
  }
  .ed-back {
    background: none; border: 1px solid #252529; color: #a1a1aa;
    border-radius: 10px; padding: 8px 14px; font-size: 0.85rem;
    cursor: pointer; transition: all .2s;
    font-family: 'Outfit', sans-serif;
  }
  .ed-back:hover { border-color: #f97316; color: #f97316; }
  .ed-topbar-title {
    font-family: 'Syne', sans-serif;
    font-size: 1rem; font-weight: 700;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ── Hero ── */
  .ed-hero {
    position: relative; padding: 60px 20px 40px;
    max-width: 900px; margin: 0 auto;
  }
  .ed-category {
    display: inline-block;
    font-size: 0.7rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em;
    padding: 4px 12px; border-radius: 6px;
    background: rgba(249,115,22,0.12); color: #f97316;
    border: 1px solid rgba(249,115,22,0.25);
    margin-bottom: 12px;
  }
  .ed-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    font-weight: 800; letter-spacing: -0.03em;
    line-height: 1.1; margin-bottom: 16px;
  }
  .ed-meta { display: flex; flex-wrap: wrap; gap: 16px; color: #71717a; font-size: 0.85rem; }
  .ed-meta-item { display: flex; align-items: center; gap: 6px; }

  /* ── Body ── */
  .ed-body { max-width: 900px; margin: 0 auto; padding: 0 20px 80px; }

  .ed-section { margin-bottom: 32px; }
  .ed-section-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.15rem; font-weight: 700;
    margin-bottom: 12px; color: #fff;
    display: flex; align-items: center; gap: 8px;
  }

  .ed-desc {
    font-size: 0.9rem; line-height: 1.7; color: #a1a1aa;
    white-space: pre-wrap;
  }

  .ed-rules {
    font-size: 0.88rem; line-height: 1.7; color: #a1a1aa;
    white-space: pre-wrap;
    background: rgba(255,255,255,0.02);
    border: 1px solid #252529;
    border-radius: 12px; padding: 20px;
  }

  /* Schedule timeline */
  .ed-timeline { display: flex; flex-direction: column; gap: 0; }
  .ed-timeline-item {
    display: flex; gap: 16px; position: relative;
    padding-bottom: 20px;
  }
  .ed-timeline-item:last-child { padding-bottom: 0; }
  .ed-timeline-dot {
    width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
    margin-top: 4px;
    background: linear-gradient(135deg, #f97316, #fb923c);
    box-shadow: 0 0 8px rgba(249,115,22,0.4);
  }
  .ed-timeline-line {
    position: absolute; left: 5px; top: 18px; bottom: 0;
    width: 2px; background: #252529;
  }
  .ed-timeline-item:last-child .ed-timeline-line { display: none; }
  .ed-timeline-time {
    font-size: 0.78rem; color: #f97316; font-weight: 600;
    min-width: 60px;
  }
  .ed-timeline-text { font-size: 0.88rem; color: #a1a1aa; }

  /* ── Share Buttons ── */
  .ed-share {
    display: flex; gap: 10px; flex-wrap: wrap;
    margin-top: 20px;
  }
  .ed-share-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 18px; border-radius: 10px;
    font-size: 0.82rem; font-weight: 600;
    cursor: pointer; transition: all .2s;
    border: 1px solid #252529; background: rgba(255,255,255,0.03);
    color: #e4e4e7;
    font-family: 'Outfit', sans-serif;
  }
  .ed-share-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
  .ed-share-btn.wa { border-color: rgba(37,211,102,0.3); }
  .ed-share-btn.wa:hover { background: rgba(37,211,102,0.1); color: #25d366; }
  .ed-share-btn.tw { border-color: rgba(29,155,240,0.3); }
  .ed-share-btn.tw:hover { background: rgba(29,155,240,0.1); color: #1d9bf0; }
  .ed-share-btn.cp { border-color: rgba(168,85,247,0.3); }
  .ed-share-btn.cp:hover { background: rgba(168,85,247,0.1); color: #a855f7; }

  /* ── Loading / Error ── */
  .ed-center { display: flex; align-items: center; justify-content: center; min-height: 60vh; color: #71717a; }

  @keyframes edFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .ed-fade { animation: edFadeIn .4s ease both; }

  @media (max-width: 600px) {
    .ed-hero { padding: 40px 16px 24px; }
    .ed-body { padding: 0 16px 60px; }
    .ed-share { flex-direction: column; }
    .ed-share-btn { justify-content: center; }
  }
`;

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await apiFetch(`/api/events/${id}`);
                setEvent(data.event);
            } catch (err) {
                setError(err.message || 'Event not found');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareText = event ? `Check out "${event.name}" at Festiverse'26! 🎉` : '';

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: event.name, text: shareText, url: shareUrl });
            } catch { /* user cancelled */ }
        }
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
    };

    const handleTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="ed-wrap"><style>{CSS}</style><div className="ed-center">Loading event...</div></div>
    );

    if (error) return (
        <div className="ed-wrap"><style>{CSS}</style>
            <div className="ed-topbar">
                <button className="ed-back" onClick={() => navigate(-1)}>← Back</button>
            </div>
            <div className="ed-center">{error}</div>
        </div>
    );

    const schedule = Array.isArray(event.schedule) ? event.schedule : [];

    return (
        <div className="ed-wrap">
            <style>{CSS}</style>

            {/* Top Bar */}
            <div className="ed-topbar">
                <button className="ed-back" onClick={() => navigate(-1)}>← Back</button>
                <span className="ed-topbar-title">{event.name}</span>
            </div>

            {/* Hero */}
            <div className="ed-hero ed-fade">
                {event.category && event.category !== 'general' && (
                    <span className="ed-category">{event.category}</span>
                )}
                <h1 className="ed-title">{event.name}</h1>
                <div className="ed-meta">
                    {event.date && (
                        <span className="ed-meta-item">📅 {formatDate(event.date)}</span>
                    )}
                    {event.location && (
                        <span className="ed-meta-item">📍 {event.location}</span>
                    )}
                    {event.team_size > 1 && (
                        <span className="ed-meta-item">👥 Team of {event.team_size}</span>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="ed-body">
                {/* Description */}
                {event.description && (
                    <div className="ed-section ed-fade" style={{ animationDelay: '0.1s' }}>
                        <div className="ed-section-title">📝 About this Event</div>
                        <div className="ed-desc">{event.description}</div>
                    </div>
                )}

                {/* Rules */}
                {event.rules && (
                    <div className="ed-section ed-fade" style={{ animationDelay: '0.15s' }}>
                        <div className="ed-section-title">📋 Rules & Guidelines</div>
                        <div className="ed-rules">{event.rules}</div>
                    </div>
                )}

                {/* Schedule */}
                {schedule.length > 0 && (
                    <div className="ed-section ed-fade" style={{ animationDelay: '0.2s' }}>
                        <div className="ed-section-title">🕐 Schedule</div>
                        <div className="ed-timeline">
                            {schedule.map((item, i) => (
                                <div key={i} className="ed-timeline-item">
                                    <div style={{ position: 'relative' }}>
                                        <div className="ed-timeline-dot" />
                                        <div className="ed-timeline-line" />
                                    </div>
                                    <div>
                                        {item.time && <div className="ed-timeline-time">{item.time}</div>}
                                        <div className="ed-timeline-text">{item.activity || item.title || ''}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Share */}
                <div className="ed-section ed-fade" style={{ animationDelay: '0.25s' }}>
                    <div className="ed-section-title">🔗 Share this Event</div>
                    <div className="ed-share">
                        <button className="ed-share-btn wa" onClick={handleWhatsApp}>
                            💬 WhatsApp
                        </button>
                        <button className="ed-share-btn tw" onClick={handleTwitter}>
                            🐦 Twitter / X
                        </button>
                        <button className="ed-share-btn cp" onClick={handleCopy}>
                            {copied ? '✅ Copied!' : '📋 Copy Link'}
                        </button>
                        {navigator.share && (
                            <button className="ed-share-btn" onClick={handleShare} style={{ borderColor: 'rgba(249,115,22,0.3)' }}>
                                📤 Share
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDetails;
