import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import FestFooter from './FestFooter';
import { apiFetch } from '../lib/api';

/* ── CSS ─────────────────────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

  .sch-root {
    min-height: 100vh;
    background: #0e0e10;
    color: #e4e4e7;
    font-family: 'Outfit', sans-serif;
    padding-top: 100px;
    position: relative;
    overflow-x: hidden;
  }

  .sch-bg-glow {
    position: absolute;
    top: 10%;
    right: -10%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%);
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
  }

  .sch-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 40px 20px 100px;
    position: relative;
    z-index: 10;
  }

  .sch-header {
    text-align: center;
    margin-bottom: 60px;
    animation: schFadeUp 0.6s ease both;
  }

  .sch-header h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.5rem, 8vw, 4.5rem);
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1;
    margin-bottom: 16px;
    background: linear-gradient(to bottom, #fff, #a1a1aa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .sch-header p {
    color: #71717a;
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
  }

  /* ── Day Tabs ── */
  .sch-tabs {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 60px;
    animation: schFadeUp 0.6s ease both 0.1s;
  }

  .sch-tab {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 14px 28px;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    text-align: center;
    min-width: 140px;
  }

  .sch-tab:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .sch-tab.active {
    background: #7c3aed;
    border-color: #8b5cf6;
    box-shadow: 0 10px 30px rgba(124, 58, 237, 0.3);
  }

  .sch-tab-day {
    display: block;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.7;
    margin-bottom: 4px;
    color: #fff;
  }

  .sch-tab.active .sch-tab-day { opacity: 0.9; }

  .sch-tab-date {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    color: #fff;
  }

  /* ── Timeline ── */
  .sch-timeline {
    position: relative;
    padding-left: 40px;
    animation: schFadeUp 0.6s ease both 0.2s;
  }

  .sch-timeline::before {
    content: '';
    position: absolute;
    left: 0;
    top: 10px;
    bottom: 10px;
    width: 2px;
    background: linear-gradient(to bottom, #7c3aed, rgba(124, 58, 237, 0.1));
    border-radius: 2px;
  }

  .sch-item {
    position: relative;
    margin-bottom: 40px;
  }

  .sch-dot {
    position: absolute;
    left: -46px;
    top: 6px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #0e0e10;
    border: 3px solid #7c3aed;
    z-index: 10;
    box-shadow: 0 0 15px rgba(124, 58, 237, 0.5);
    transition: all 0.3s ease;
  }

  .sch-item:hover .sch-dot {
    transform: scale(1.4);
    background: #7c3aed;
  }

  .sch-time-wrap {
    margin-bottom: 12px;
  }

  .sch-time {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(124, 58, 237, 0.1);
    color: #a78bfa;
    padding: 6px 14px;
    border-radius: 100px;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  .sch-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 20px;
    padding: 24px;
    display: flex;
    gap: 24px;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
    cursor: pointer;
    overflow: hidden;
    position: relative;
  }

  .sch-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateX(10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .sch-card-img {
    width: 120px;
    height: 120px;
    border-radius: 12px;
    object-fit: cover;
    flex-shrink: 0;
    background: #1e1e24;
  }

  .sch-card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .sch-event-name {
    font-family: 'Syne', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  .sch-event-venue {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #71717a;
    font-size: 0.95rem;
  }

  .sch-event-venue iconify-icon {
    color: #7c3aed;
  }

  .sch-card-arrow {
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #a1a1aa;
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateY(-50%) translateX(20px);
  }

  .sch-card:hover .sch-card-arrow {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
    background: #7c3aed;
    color: #fff;
  }

  /* ── Mobile ── */
  @media (max-width: 768px) {
    .sch-container { padding-top: 20px; }
    .sch-header h1 { font-size: 3rem; }
    .sch-tabs { gap: 8px; overflow-x: auto; justify-content: flex-start; padding: 4px 20px 20px; margin: 0 -20px 40px; scrollbar-width: none; }
    .sch-tabs::-webkit-scrollbar { display: none; }
    .sch-tab { min-width: 120px; padding: 12px 20px; }
    .sch-card { flex-direction: column; gap: 16px; padding: 16px; }
    .sch-card-img { width: 100%; height: 160px; }
    .sch-event-name { font-size: 1.2rem; }
    .sch-card-arrow { display: none; }
    .sch-card:hover { transform: translateY(-4px); }
  }

  @keyframes schFadeUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .sch-empty {
    text-align: center;
    padding: 80px 20px;
    color: #71717a;
  }

  .sch-empty-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.3;
  }
`;

const SchedulePage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);

  const days = [
    { num: 1, date: '15 MAY', fullDate: '2026-05-15' },
    { num: 2, date: '16 MAY', fullDate: '2026-05-16' },
    { num: 3, date: '17 MAY', fullDate: '2026-05-17' },
  ];

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
    window.scrollTo(0, 0);
  }, []);

  // Filter and parse events for the selected day
  const filteredEvents = events
    .filter(ev => {
      if (!ev.date) return false;
      const evDate = new Date(ev.date).toISOString().split('T')[0];
      return evDate === days.find(d => d.num === activeDay).fullDate;
    })
    .map(ev => {
      let timeStr = 'TBA';
      let venueStr = ev.location || 'Venue TBA';

      try {
        if (ev.schedule) {
          const sched = typeof ev.schedule === 'string' ? JSON.parse(ev.schedule) : ev.schedule;
          // Example: "10:00 AM | Main Stage"
          if (Array.isArray(sched) && sched.length > 0) {
            const first = sched[0];
            if (first.includes('|')) {
              [timeStr, venueStr] = first.split('|').map(s => s.trim());
            } else if (first.toLowerCase().includes('am') || first.toLowerCase().includes('pm')) {
              timeStr = first;
            }
          }
        }
      } catch (e) {
        console.log("Schedule parse error", e);
      }

      return { ...ev, displayTime: timeStr, displayVenue: venueStr };
    })
    // Simple sort by time (approximate since it's a string)
    .sort((a, b) => {
      const getTimeVal = (s) => {
        if (s === 'TBA') return 9999;
        const match = s.match(/(\d+):?(\d+)?\s*(AM|PM)/i);
        if (!match) return 8888;
        let [_, h, m, p] = match;
        h = parseInt(h); m = parseInt(m || 0);
        if (p.toUpperCase() === 'PM' && h < 12) h += 12;
        if (p.toUpperCase() === 'AM' && h === 12) h = 0;
        return h * 60 + m;
      };
      return getTimeVal(a.displayTime) - getTimeVal(b.displayTime);
    });

  return (
    <div className="sch-root">
      <style>{CSS}</style>
      <Navbar isFestiverse={true} toggleUniverse={() => navigate('/')} />

      <div className="sch-bg-glow"></div>

      <div className="sch-container">
        <header className="sch-header">
          <h1>Festival <em>Timeline</em></h1>
          <p>The master plan for Festiverse '26. Navigate through three days of innovation, culture, and pure energy.</p>
        </header>

        <div className="sch-tabs">
          {days.map(d => (
            <div
              key={d.num}
              className={`sch-tab ${activeDay === d.num ? 'active' : ''}`}
              onClick={() => setActiveDay(d.num)}
            >
              <span className="sch-tab-day">Day {d.num}</span>
              <span className="sch-tab-date">{d.date}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <iconify-icon icon="line-md:loading-twotone-loop" width="40" style={{ color: '#7c3aed' }}></iconify-icon>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="sch-timeline">
            {filteredEvents.map((ev, idx) => (
              <div key={ev.id} className="sch-item">
                <div className="sch-dot"></div>
                <div className="sch-time-wrap">
                  <div className="sch-time">
                    <iconify-icon icon="solar:clock-circle-linear"></iconify-icon>
                    {ev.displayTime}
                  </div>
                </div>

                <div className="sch-card" onClick={() => navigate(`/events/${ev.id}`)}>
                  {ev.image_url ? (
                    <img
                      src={ev.image_url.startsWith('http') ? ev.image_url : `${import.meta.env.VITE_API_URL}${ev.image_url}`}
                      alt={ev.name}
                      className="sch-card-img"
                    />
                  ) : (
                    <div className="sch-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#16161a', color: '#333', fontWeight: 800, fontSize: '0.8rem' }}>FESTIVERSE</div>
                  )}

                  <div className="sch-card-content">
                    <h3 className="sch-event-name">{ev.name}</h3>
                    <div className="sch-event-venue">
                      <iconify-icon icon="solar:map-point-linear"></iconify-icon>
                      {ev.displayVenue}
                    </div>
                  </div>

                  <div className="sch-card-arrow">
                    <iconify-icon icon="solar:alt-arrow-right-linear" width="24"></iconify-icon>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sch-empty">
            <div className="sch-empty-icon">
              <iconify-icon icon="solar:calendar-search-linear"></iconify-icon>
            </div>
            <h3>No events scheduled for this day yet.</h3>
            <p>Check back soon as we reveal the full lineup!</p>
          </div>
        )}
      </div>

      <FestFooter onAdminClick={() => navigate('/admin')} />
    </div>
  );
};

export default SchedulePage;
