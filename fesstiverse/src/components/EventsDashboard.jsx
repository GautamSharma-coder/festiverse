import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

/* ── CSS ────────────────────────────────────────── */
const CSS = `
  .cal-wrap {
    font-family: 'Outfit', sans-serif;
  }

  .cal-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 20px;
  }
  .cal-header h2 {
    font-family: 'Syne', sans-serif;
    font-size: 1.3rem; font-weight: 700; color: #fff;
  }
  .cal-nav {
    display: flex; gap: 8px;
  }
  .cal-nav button {
    background: rgba(255,255,255,0.04); border: 1px solid #252529;
    color: #a1a1aa; border-radius: 8px; padding: 6px 12px;
    cursor: pointer; font-size: 0.85rem; transition: all .2s;
    font-family: 'Outfit', sans-serif;
  }
  .cal-nav button:hover { border-color: #f97316; color: #f97316; }

  .cal-grid {
    display: grid; grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  .cal-day-name {
    text-align: center; font-size: 0.7rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.06em;
    color: #71717a; padding: 8px 0;
  }
  .cal-cell {
    min-height: 70px; padding: 6px;
    background: rgba(255,255,255,0.02);
    border: 1px solid transparent;
    border-radius: 8px; transition: all .2s;
    cursor: pointer; position: relative;
  }
  .cal-cell:hover { border-color: #252529; background: rgba(255,255,255,0.04); }
  .cal-cell.today { border-color: rgba(249,115,22,0.4); background: rgba(249,115,22,0.04); }
  .cal-cell.empty { background: none; cursor: default; }
  .cal-cell.empty:hover { border-color: transparent; background: none; }
  .cal-date {
    font-size: 0.78rem; color: #71717a; font-weight: 500;
    margin-bottom: 4px;
  }
  .cal-cell.today .cal-date { color: #f97316; font-weight: 700; }
  .cal-dots {
    display: flex; flex-wrap: wrap; gap: 3px;
  }
  .cal-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #f97316;
  }
  .cal-event-count {
    font-size: 0.65rem; color: #f97316; font-weight: 600;
    margin-top: 2px;
  }

  /* ── Expanded Day Events ── */
  .cal-expanded {
    margin-top: 16px;
    background: rgba(255,255,255,0.02);
    border: 1px solid #252529;
    border-radius: 12px; padding: 16px;
    animation: calSlide .25s ease;
  }
  @keyframes calSlide { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
  .cal-expanded-title {
    font-size: 0.85rem; color: #71717a; margin-bottom: 12px;
    font-weight: 600;
  }
  .cal-ev-item {
    display: flex; align-items: center; gap: 12px;
    padding: 10px 12px; border-radius: 8px;
    background: rgba(255,255,255,0.02);
    border: 1px solid transparent;
    margin-bottom: 6px; cursor: pointer;
    transition: all .2s;
  }
  .cal-ev-item:hover { border-color: rgba(249,115,22,0.3); background: rgba(249,115,22,0.04); }
  .cal-ev-item:last-child { margin-bottom: 0; }
  .cal-ev-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #fb923c);
    flex-shrink: 0;
  }
  .cal-ev-name { font-size: 0.88rem; font-weight: 600; color: #e4e4e7; }
  .cal-ev-loc { font-size: 0.75rem; color: #71717a; }

  @media (max-width: 600px) {
    .cal-cell { min-height: 50px; padding: 4px; }
    .cal-date { font-size: 0.7rem; }
    .cal-dot { width: 5px; height: 5px; }
  }
`;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const EventsDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await apiFetch('/api/events');
                setEvents(data.events || []);

                // Auto-navigate to a month with events if current month has none
                const evts = data.events || [];
                if (evts.length > 0) {
                    const firstEventDate = new Date(evts[0].date);
                    if (!isNaN(firstEventDate)) {
                        setCurrentDate(new Date(firstEventDate.getFullYear(), firstEventDate.getMonth(), 1));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch events:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Map events to days
    const eventsByDay = {};
    events.forEach(ev => {
        if (!ev.date) return;
        const d = new Date(ev.date);
        if (d.getMonth() === month && d.getFullYear() === year) {
            const day = d.getDate();
            if (!eventsByDay[day]) eventsByDay[day] = [];
            eventsByDay[day].push(ev);
        }
    });

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDay(null);
    };
    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDay(null);
    };

    const handleDayClick = (day) => {
        if (eventsByDay[day]) {
            setSelectedDay(selectedDay === day ? null : day);
        }
    };

    const cells = [];
    // Empty cells before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
        cells.push(<div key={`empty-${i}`} className="cal-cell empty" />);
    }
    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
        const dayEvents = eventsByDay[d] || [];
        cells.push(
            <div
                key={d}
                className={`cal-cell ${isToday(d) ? 'today' : ''}`}
                onClick={() => handleDayClick(d)}
            >
                <div className="cal-date">{d}</div>
                {dayEvents.length > 0 && (
                    <>
                        <div className="cal-dots">
                            {dayEvents.slice(0, 4).map((_, i) => (
                                <div key={i} className="cal-dot" />
                            ))}
                        </div>
                        {dayEvents.length > 1 && (
                            <div className="cal-event-count">{dayEvents.length} events</div>
                        )}
                    </>
                )}
            </div>
        );
    }

    const selectedEvents = selectedDay ? (eventsByDay[selectedDay] || []) : [];

    return (
        <div className="cal-wrap">
            <style>{CSS}</style>

            <div className="cal-header">
                <h2>📅 {MONTHS[month]} {year}</h2>
                <div className="cal-nav">
                    <button onClick={prevMonth}>◀</button>
                    <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(null); }}>Today</button>
                    <button onClick={nextMonth}>▶</button>
                </div>
            </div>

            {loading ? (
                <p style={{ color: '#71717a', textAlign: 'center', padding: '2rem' }}>Loading events...</p>
            ) : (
                <>
                    <div className="cal-grid">
                        {DAYS.map(d => (
                            <div key={d} className="cal-day-name">{d}</div>
                        ))}
                        {cells}
                    </div>

                    {/* Expanded Day Events */}
                    {selectedDay && selectedEvents.length > 0 && (
                        <div className="cal-expanded">
                            <div className="cal-expanded-title">
                                {selectedDay} {MONTHS[month]} — {selectedEvents.length} event{selectedEvents.length > 1 ? 's' : ''}
                            </div>
                            {selectedEvents.map(ev => (
                                <div
                                    key={ev.id}
                                    className="cal-ev-item"
                                    onClick={() => navigate(`/events/${ev.id}`)}
                                >
                                    <div className="cal-ev-dot" />
                                    <div>
                                        <div className="cal-ev-name">{ev.name}</div>
                                        {ev.location && <div className="cal-ev-loc">📍 {ev.location}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default EventsDashboard;
