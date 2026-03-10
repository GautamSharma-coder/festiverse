import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';
import Navbar from './Navbar';
import FestFooter from './FestFooter';

/* ── CSS ────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

  .ed-wrap {
    min-height: 100vh;
    background: #0e0e10;
    color: #e4e4e7;
    font-family: 'Outfit', sans-serif;
    display: flex;
    flex-direction: column;
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

  /* ── Main Content ── */
  .ed-main {
    flex: 1;
    padding: 24px;
    max-width: 1000px;
    margin: 0 auto;
    width: 100%;
  }

  /* ── Hero Card ── */
  .ed-hero-card {
    background: #16161a;
    border: 1px solid #252529;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 40px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    position: relative;
    animation: edFadeIn .4s ease both;
  }

  .ed-hero-img-wrap {
    width: 100%;
    height: 280px;
    position: relative;
    background: #1e1e24;
  }
  .ed-hero-img-grad {
    position: absolute; inset: 0;
    background: linear-gradient(to top, #16161a 10%, transparent);
    z-index: 10;
  }
  .ed-hero-img {
    width: 100%; height: 100%;
    object-fit: cover;
  }
  .ed-hero-fallback {
    width: 100%; height: 100%;
    background: linear-gradient(135deg, rgba(234,88,12,0.1), rgba(147,51,234,0.1));
    display: flex; align-items: center; justify-content: center;
  }
  .ed-hero-fallback span {
    font-family: 'Syne', sans-serif;
    font-size: 4rem; font-weight: 800;
    color: rgba(255,255,255,0.03);
    letter-spacing: -0.05em;
  }

  .ed-hero-content {
    padding: 0 40px 40px;
    position: relative;
    z-index: 20;
    margin-top: -60px; /* pull up over the gradient */
  }
  .ed-hero-content.no-img { margin-top: 30px; }

  .ed-category {
    display: inline-block;
    padding: 6px 14px;
    background: rgba(234,88,12,0.1);
    color: #f97316;
    border: 1px solid rgba(234,88,12,0.2);
    border-radius: 8px;
    font-size: 0.75rem; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    margin-bottom: 16px;
    backdrop-filter: blur(4px);
  }

  .ed-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    color: #fff;
    line-height: 1.1;
    margin-bottom: 24px;
    letter-spacing: -0.02em;
    text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  }

  .ed-meta-grid {
    display: flex; flex-wrap: wrap; gap: 16px;
  }
  .ed-meta-item {
    display: flex; align-items: center; gap: 10px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    padding: 10px 16px;
    border-radius: 12px;
    font-size: 0.9rem; font-weight: 500;
    color: #d4d4d8;
    backdrop-filter: blur(8px);
  }
  .ed-meta-icon { color: #f97316; font-size: 1.1rem; }

  /* ── Layout Grid ── */
  .ed-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 40px;
    animation: edFadeIn .5s ease both;
    animation-delay: 0.1s;
  }

  @media (max-width: 800px) {
    .ed-grid { grid-template-columns: 1fr; gap: 30px; }
    .ed-hero-content { padding: 0 24px 30px; }
  }

  /* ── Sections ── */
  .ed-sec-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem; font-weight: 700;
    color: #fff;
    margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }
  .ed-sec-title span { color: #f97316; }

  .ed-desc {
    font-size: 0.95rem; line-height: 1.7; color: #a1a1aa;
    white-space: pre-wrap; margin-bottom: 40px;
  }

  .ed-rules {
    background: #16161a;
    border: 1px solid #252529;
    padding: 24px;
    border-radius: 16px;
    font-size: 0.95rem; line-height: 1.7; color: #a1a1aa;
    white-space: pre-wrap;
  }

  /* ── Right Column Data ── */
  .ed-box {
    background: #16161a;
    border: 1px solid #252529;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  }
  .ed-box-label {
    font-size: 0.7rem; font-weight: 700; color: #71717a;
    text-transform: uppercase; letter-spacing: 0.15em;
    border-bottom: 1px solid #252529;
    padding-bottom: 12px; margin-bottom: 16px;
  }

  /* Schedule List */
  .ed-sched-list { display: flex; flex-direction: column; gap: 12px; }
  .ed-sched-item {
    display: flex; align-items: flex-start; gap: 12px;
    font-size: 0.9rem; color: #d4d4d8;
  }
  .ed-sched-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #f97316; margin-top: 8px; flex-shrink: 0;
  }

  /* Prize Box */
  .ed-prize-box {
    background: linear-gradient(145deg, rgba(249,115,22,0.08), rgba(249,115,22,0.02));
    border: 1px solid rgba(249,115,22,0.2);
    position: relative; overflow: hidden;
  }
  .ed-prize-box::before {
    content: '🏆'; position: absolute; right: -10px; top: -10px;
    font-size: 80px; opacity: 0.05; filter: blur(2px);
  }
  .ed-prize-label { color: #fb923c; border-bottom-color: rgba(249,115,22,0.2); }
  .ed-prize-text { font-size: 0.95rem; color: #fff; font-weight: 500; white-space: pre-wrap; position: relative; z-index: 2; line-height: 1.6; }

  /* Register CTA */
  .ed-cta-btn {
    width: 100%; padding: 16px;
    background: #f97316; color: #fff; font-family: 'Outfit', sans-serif;
    font-weight: 700; font-size: 1rem;
    border: none; border-radius: 12px;
    cursor: pointer; transition: all .2s;
    box-shadow: 0 4px 16px rgba(249,115,22,0.3);
  }
  .ed-cta-btn:hover {
    background: #ea580c; transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(249,115,22,0.4);
  }

  /* Loading/Error */
  .ed-center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; }
  .ed-spinner {
    width: 40px; height: 40px;
    border: 3px solid rgba(249,115,22,0.2);
    border-top-color: #f97316; border-radius: 50%;
    animation: edSpin .8s linear infinite;
  }
  @keyframes edSpin { to { transform: rotate(360deg); } }
  @keyframes edFadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
`;

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    if (loading) return (
        <div className="ed-wrap"><style>{CSS}</style><div className="ed-center"><div className="ed-spinner"></div><div style={{ color: '#71717a' }}>Loading event info...</div></div></div>
    );

    if (error || !event) return (
        <div className="ed-wrap"><style>{CSS}</style>
            <div className="ed-topbar"><button className="ed-back" onClick={() => navigate(-1)}>← Back</button></div>
            <div className="ed-center">
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⚠️</div>
                <div style={{ fontFamily: 'Syne', fontSize: '1.5rem', fontWeight: 700, color: '#fca5a5' }}>Event Not Found</div>
                <div style={{ color: '#71717a' }}>{error || "The event you're looking for doesn't exist."}</div>
                <button className="ed-back" style={{ marginTop: 20 }} onClick={() => navigate('/')}>Return Home</button>
            </div>
        </div>
    );

    // Parse schedule string to Array if needed
    let parsedSchedule = [];
    try {
        if (event.schedule) {
            parsedSchedule = typeof event.schedule === 'string' ? JSON.parse(event.schedule) : event.schedule;
        }
    } catch (e) {
        parsedSchedule = [event.schedule];
    }

    return (
        <div className="ed-wrap">
            <style>{CSS}</style>
            <Navbar isFestiverse={true} toggleUniverse={() => navigate('/')} />

            <main className="ed-main">
                {/* Back Link */}
                <button className="ed-back" style={{ border: 'none', padding: 0, marginBottom: 24 }} onClick={() => navigate(-1)}>
                    ← Back to Events
                </button>

                {/* Hero Card */}
                <div className="ed-hero-card">
                    {/* Image Area */}
                    <div className="ed-hero-img-wrap">
                        {event.image_url ? (
                            <>
                                <img src={event.image_url.startsWith('http') ? event.image_url : `${import.meta.env.VITE_API_URL}${event.image_url}`} alt={event.name} className="ed-hero-img" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                                <div className="ed-hero-img-grad" />
                            </>
                        ) : (
                            <div className="ed-hero-fallback"><span>FESTIVERSE</span></div>
                        )}
                        {!event.image_url && <div className="ed-hero-img-grad" />}
                    </div>

                    {/* Meta Content overlaying image at bottom */}
                    <div className={`ed-hero-content ${event.image_url ? '' : 'no-img'}`}>
                        <div className="ed-category">{event.category || 'Event'}</div>
                        <h1 className="ed-title">{event.name}</h1>

                        <div className="ed-meta-grid">
                            {event.date && (
                                <div className="ed-meta-item">
                                    <span className="ed-meta-icon">📅</span>
                                    {formatDate(event.date)}
                                </div>
                            )}
                            {event.location && (
                                <div className="ed-meta-item">
                                    <span className="ed-meta-icon">📍</span>
                                    {event.location}
                                </div>
                            )}
                            <div className="ed-meta-item">
                                <span className="ed-meta-icon">👥</span>
                                {event.team_size > 1 ? `Team of ${event.team_size}` : 'Solo Event'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="ed-grid">

                    {/* Left Col (Main Text) */}
                    <div>
                        {event.description && (
                            <>
                                <h2 className="ed-sec-title"><span>◈</span> About the Event</h2>
                                <div className="ed-desc">{event.description}</div>
                            </>
                        )}

                        {event.rules && event.rules.trim() !== '' && (
                            <>
                                <h2 className="ed-sec-title"><span>◈</span> Rules & Guidelines</h2>
                                <div className="ed-rules">{event.rules}</div>
                            </>
                        )}
                    </div>

                    {/* Right Col (Sidebar) */}
                    <div>
                        {/* Schedule */}
                        {parsedSchedule && parsedSchedule.length > 0 && parsedSchedule[0] && (
                            <div className="ed-box">
                                <div className="ed-box-label">Schedule</div>
                                <div className="ed-sched-list">
                                    {parsedSchedule.map((item, idx) => (
                                        <div key={idx} className="ed-sched-item">
                                            <div className="ed-sched-dot" />
                                            <div>{item}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Prizes */}
                        {event.prizes && event.prizes.trim() !== '' && (
                            <div className="ed-box ed-prize-box">
                                <div className="ed-box-label ed-prize-label">Prizes & Rewards</div>
                                <div className="ed-prize-text">{event.prizes}</div>
                            </div>
                        )}

                        {/* Registration CTA */}
                        <div style={{ marginTop: 32, textAlign: 'center' }}>
                            <p style={{ fontSize: '0.85rem', color: '#71717a', marginBottom: 12 }}>Ready to participate?</p>
                            <button className="ed-cta-btn" onClick={() => navigate('/dashboard')}>
                                Register Now
                            </button>
                        </div>

                        {/* Share CTA */}
                        <div style={{ marginTop: 20, textAlign: 'center' }}>
                            <button
                                onClick={() => {
                                    if (navigator.share) {
                                        navigator.share({
                                            title: event.name,
                                            text: `Check out ${event.name} at Festiverse!`,
                                            url: window.location.href,
                                        }).catch(console.error);
                                    } else {
                                        navigator.clipboard.writeText(window.location.href);
                                        alert('Link copied to clipboard!');
                                    }
                                }}
                                style={{
                                    width: '100%', padding: '12px',
                                    background: 'transparent', color: '#a1a1aa',
                                    border: '1px solid #252529', borderRadius: '12px',
                                    cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                                    fontWeight: 600, fontSize: '0.9rem',
                                    transition: 'all .2s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.color = '#e4e4e7'; e.currentTarget.style.borderColor = '#3f3f46'; }}
                                onMouseOut={(e) => { e.currentTarget.style.color = '#a1a1aa'; e.currentTarget.style.borderColor = '#252529'; }}
                            >
                                🔗 Share Event
                            </button>
                        </div>
                    </div>

                </div>
            </main >

            <FestFooter onAdminClick={() => navigate('/admin')} />
        </div >
    );
};

export default EventDetails;
