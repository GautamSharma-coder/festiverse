import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

/* ─────────────────────────────────────────────────────────────
   CATEGORY COLOR SYSTEM
   Each event.category maps to a distinct accent colour.
   Falls back to orange (brand default) if unknown.
───────────────────────────────────────────────────────────────*/
const CATEGORY_PALETTE = {
    competition: { dot: '#f97316', glow: 'rgba(249,115,22,0.25)', label: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    cultural: { dot: '#a855f7', glow: 'rgba(168,85,247,0.25)', label: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
    performance: { dot: '#ec4899', glow: 'rgba(236,72,153,0.25)', label: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
    workshop: { dot: '#22d3ee', glow: 'rgba(34,211,238,0.25)', label: '#22d3ee', bg: 'rgba(34,211,238,0.12)' },
    technical: { dot: '#3b82f6', glow: 'rgba(59,130,246,0.25)', label: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    sports: { dot: '#4ade80', glow: 'rgba(74,222,128,0.25)', label: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    default: { dot: '#f97316', glow: 'rgba(249,115,22,0.25)', label: '#f97316', bg: 'rgba(249,115,22,0.12)' },
};

const PAYMENT_STATUS = {
    paid: { label: 'Paid', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
    pending: { label: 'Pending', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
    unpaid: { label: 'Unpaid', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
    free: { label: 'Free', color: '#a1a1aa', bg: 'rgba(161,161,170,0.10)' },
};

const getCategory = (ev) =>
    CATEGORY_PALETTE[(ev.category || '').toLowerCase()] || CATEGORY_PALETTE.default;

const getPayment = (ev) =>
    PAYMENT_STATUS[(ev.paymentStatus || '').toLowerCase()] || PAYMENT_STATUS.free;

/* ─────────────────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────────────────────*/
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Outfit:wght@400;500;600;700&display=swap');

  .cal-wrap {
    font-family: 'Outfit', sans-serif;
    position: relative;
  }

  /* ── Header ── */
  .cal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 10px;
  }
  .cal-month-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.4rem;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .cal-month-title .cal-year {
    color: #52525b;
    font-weight: 600;
    font-size: 1.1rem;
  }
  .cal-nav {
    display: flex;
    gap: 6px;
  }
  .cal-nav button {
    background: rgba(255,255,255,0.03);
    border: 1px solid #27272a;
    color: #71717a;
    border-radius: 8px;
    padding: 6px 13px;
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 600;
    transition: border-color .2s, color .2s, background .2s;
    font-family: 'Outfit', sans-serif;
  }
  .cal-nav button:hover {
    border-color: #f97316;
    color: #f97316;
    background: rgba(249,115,22,0.06);
  }
  .cal-nav .today-btn {
    padding: 6px 16px;
    font-size: 0.78rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* ── Legend ── */
  .cal-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }
  .cal-legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #52525b;
  }
  .cal-legend-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }

  /* ── Grid ── */
  .cal-grid-outer {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
  }
  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 3px;
  }

  /* Month slide animations */
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .cal-grid.slide-next { animation: slideInRight 0.28s cubic-bezier(.4,0,.2,1); }
  .cal-grid.slide-prev { animation: slideInLeft  0.28s cubic-bezier(.4,0,.2,1); }

  .cal-day-name {
    text-align: center;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #3f3f46;
    padding: 10px 0 6px;
  }
  .cal-cell {
    min-height: 72px;
    padding: 7px 6px 5px;
    background: rgba(255,255,255,0.015);
    border: 1px solid transparent;
    border-radius: 8px;
    transition: border-color .2s, background .2s, transform .15s;
    cursor: pointer;
    position: relative;
  }
  .cal-cell:hover:not(.empty) {
    border-color: #3f3f46;
    background: rgba(255,255,255,0.035);
  }
  .cal-cell.has-events:hover {
    border-color: rgba(249,115,22,0.35);
    background: rgba(249,115,22,0.04);
    transform: translateY(-1px);
  }
  .cal-cell.today {
    border-color: rgba(249,115,22,0.5) !important;
    background: rgba(249,115,22,0.06) !important;
    box-shadow: 0 0 0 1px rgba(249,115,22,0.15) inset;
  }
  .cal-cell.empty {
    background: none;
    cursor: default;
  }
  .cal-cell.empty:hover {
    border-color: transparent !important;
    background: none !important;
    transform: none !important;
  }

  .cal-date {
    font-size: 0.75rem;
    color: #52525b;
    font-weight: 600;
    margin-bottom: 5px;
    line-height: 1;
  }
  .cal-cell.today .cal-date {
    color: #f97316;
    font-weight: 800;
  }

  /* ── Category dots ── */
  .cal-dots {
    display: flex;
    flex-wrap: wrap;
    gap: 3px;
    margin-top: 2px;
  }
  .cal-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .cal-overflow-count {
    font-size: 0.6rem;
    color: #52525b;
    font-weight: 700;
    margin-top: 3px;
    line-height: 1;
  }

  /* ── Hover Tooltip ── */
  .cal-tooltip {
    position: fixed;
    z-index: 1000;
    width: 230px;
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 12px;
    padding: 10px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset;
    pointer-events: none;
    animation: tooltipIn .15s ease;
  }
  @keyframes tooltipIn {
    from { opacity: 0; transform: scale(0.94) translateY(4px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .cal-tooltip-date {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #52525b;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid #27272a;
  }
  .cal-tooltip-ev {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .cal-tooltip-item {
    display: flex;
    gap: 8px;
    align-items: flex-start;
  }
  .cal-tooltip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-top: 3px;
    flex-shrink: 0;
  }
  .cal-tooltip-body { flex: 1; min-width: 0; }
  .cal-tooltip-name {
    font-size: 0.82rem;
    font-weight: 600;
    color: #e4e4e7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 3px;
  }
  .cal-tooltip-meta {
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
  }
  .cal-tooltip-loc {
    font-size: 0.68rem;
    color: #52525b;
  }
  .cal-badge {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 1px 5px;
    border-radius: 4px;
  }
  .cal-tooltip-more {
    font-size: 0.68rem;
    color: #3f3f46;
    font-weight: 600;
    margin-top: 4px;
    text-align: center;
  }

  /* ── Expanded Day Panel ── */
  .cal-expanded {
    margin-top: 14px;
    background: rgba(255,255,255,0.02);
    border: 1px solid #27272a;
    border-radius: 12px;
    padding: 14px;
    animation: calSlide .22s cubic-bezier(.4,0,.2,1);
  }
  @keyframes calSlide {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .cal-expanded-hd {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .cal-expanded-title {
    font-size: 0.82rem;
    color: #71717a;
    font-weight: 700;
    letter-spacing: 0.03em;
  }
  .cal-expanded-close {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    background: rgba(255,255,255,0.04);
    border: 1px solid #27272a;
    color: #52525b;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    transition: all .15s;
  }
  .cal-expanded-close:hover {
    background: rgba(249,115,22,0.1);
    border-color: rgba(249,115,22,0.4);
    color: #f97316;
  }

  .cal-ev-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(255,255,255,0.02);
    border: 1px solid transparent;
    margin-bottom: 6px;
    cursor: pointer;
    transition: border-color .2s, background .2s, transform .15s;
  }
  .cal-ev-item:hover {
    border-color: rgba(249,115,22,0.25);
    background: rgba(249,115,22,0.04);
    transform: translateX(3px);
  }
  .cal-ev-item:last-child { margin-bottom: 0; }
  .cal-ev-accent {
    width: 3px;
    align-self: stretch;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .cal-ev-info { flex: 1; min-width: 0; }
  .cal-ev-name {
    font-size: 0.88rem;
    font-weight: 600;
    color: #e4e4e7;
    margin-bottom: 3px;
  }
  .cal-ev-sub {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }
  .cal-ev-loc {
    font-size: 0.72rem;
    color: #52525b;
  }
  .cal-ev-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
    flex-shrink: 0;
  }
  .cal-ev-cat-badge {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 5px;
  }
  .cal-ev-pay-badge {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 5px;
  }
  .cal-arrow {
    color: #3f3f46;
    font-size: 0.8rem;
    transition: color .2s;
  }
  .cal-ev-item:hover .cal-arrow { color: #f97316; }

  /* ── Empty State ── */
  .cal-empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #3f3f46;
  }
  .cal-empty-state .icon { font-size: 2rem; margin-bottom: 8px; }
  .cal-empty-state p { font-size: 0.82rem; font-weight: 500; }

  /* ── Mobile ── */
  @media (max-width: 600px) {
    .cal-month-title { font-size: 1.1rem; }
    .cal-cell { min-height: 48px; padding: 4px 3px 3px; }
    .cal-date { font-size: 0.68rem; }
    .cal-dot { width: 5px; height: 5px; }
    .cal-day-name { font-size: 0.6rem; letter-spacing: 0.04em; padding: 7px 0 4px; }
    .cal-ev-item { padding: 8px 10px; gap: 8px; }
    .cal-ev-name { font-size: 0.82rem; }
    .cal-legend { gap: 6px; }
    .cal-legend-item { font-size: 0.62rem; }
    .cal-overflow-count { font-size: 0.55rem; }
    .cal-ev-right { gap: 3px; }
  }
  @media (max-width: 380px) {
    .cal-grid { gap: 2px; }
    .cal-cell { min-height: 42px; padding: 3px 2px; }
    .cal-date { font-size: 0.62rem; margin-bottom: 3px; }
  }
`;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────*/
const EventsDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);
    const [slideDir, setSlideDir] = useState(null);   // 'next' | 'prev'
    const [slideKey, setSlideKey] = useState(0);
    const [tooltip, setTooltip] = useState(null);   // { day, x, y, events[] }
    const tooltipRef = useRef(null);
    const hoverTimer = useRef(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const data = await apiFetch('/api/events');
                const evts = data.events || [];
                setEvents(evts);
                if (evts.length > 0) {
                    const firstDate = new Date(evts[0].date);
                    if (!isNaN(firstDate)) {
                        setCurrentDate(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
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
    const isToday = (d) =>
        d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    /* Group events by day */
    const eventsByDay = {};
    events.forEach(ev => {
        if (!ev.date) return;
        const d = new Date(ev.date);
        if (d.getMonth() === month && d.getFullYear() === year) {
            const day = d.getDate();
            (eventsByDay[day] = eventsByDay[day] || []).push(ev);
        }
    });

    /* Categories present this month — for legend */
    const activeCats = [...new Set(
        Object.values(eventsByDay).flat().map(e => (e.category || '').toLowerCase()).filter(Boolean)
    )];

    /* ── Navigation ── */
    const changeMonth = (dir) => {
        setSlideDir(dir);
        setSlideKey(k => k + 1);
        setSelectedDay(null);
        setTooltip(null);
        setCurrentDate(new Date(year, month + (dir === 'next' ? 1 : -1), 1));
    };
    const goToday = () => {
        const t = new Date();
        const dir = currentDate < t ? 'next' : 'prev';
        setSlideDir(dir);
        setSlideKey(k => k + 1);
        setCurrentDate(new Date());
        setSelectedDay(null);
        setTooltip(null);
    };

    /* ── Tooltip handlers ── */
    const handleCellMouseEnter = useCallback((e, day) => {
        if (!eventsByDay[day]) return;
        clearTimeout(hoverTimer.current);
        hoverTimer.current = setTimeout(() => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = rect.right + 10;
            const y = rect.top;
            setTooltip({ day, x, y, events: eventsByDay[day] });
        }, 200);
    }, [eventsByDay]);

    const handleCellMouseLeave = useCallback(() => {
        clearTimeout(hoverTimer.current);
        setTooltip(null);
    }, []);

    /* ── Build cells ── */
    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        cells.push(<div key={`e-${i}`} className="cal-cell empty" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dayEvts = eventsByDay[d] || [];
        const hasEvts = dayEvts.length > 0;
        const dotsShow = dayEvts.slice(0, 5);
        const overflow = dayEvts.length > 5 ? dayEvts.length - 5 : 0;

        cells.push(
            <div
                key={d}
                className={`cal-cell ${isToday(d) ? 'today' : ''} ${hasEvts ? 'has-events' : ''}`}
                onClick={() => hasEvts && setSelectedDay(selectedDay === d ? null : d)}
                onMouseEnter={(e) => handleCellMouseEnter(e, d)}
                onMouseLeave={handleCellMouseLeave}
            >
                <div className="cal-date">{d}</div>
                {hasEvts && (
                    <>
                        <div className="cal-dots">
                            {dotsShow.map((ev, i) => (
                                <div
                                    key={i}
                                    className="cal-dot"
                                    style={{ background: getCategory(ev).dot }}
                                />
                            ))}
                        </div>
                        {overflow > 0 && (
                            <div className="cal-overflow-count">+{overflow}</div>
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

            {/* ── Header ── */}
            <div className="cal-header">
                <div className="cal-month-title">
                    📅 {MONTHS[month]} <span className="cal-year">{year}</span>
                </div>
                <div className="cal-nav">
                    <button onClick={() => changeMonth('prev')}>◀</button>
                    <button className="today-btn" onClick={goToday}>Today</button>
                    <button onClick={() => changeMonth('next')}>▶</button>
                </div>
            </div>

            {/* ── Category Legend ── */}
            {activeCats.length > 0 && (
                <div className="cal-legend">
                    {activeCats.map(cat => {
                        const p = CATEGORY_PALETTE[cat] || CATEGORY_PALETTE.default;
                        return (
                            <div key={cat} className="cal-legend-item">
                                <div className="cal-legend-dot" style={{ background: p.dot }} />
                                {cat}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Calendar Grid ── */}
            {loading ? (
                <p style={{ color: '#3f3f46', textAlign: 'center', padding: '3rem', fontSize: '0.85rem' }}>
                    Loading events…
                </p>
            ) : (
                <>
                    <div className="cal-grid-outer">
                        <div
                            key={slideKey}
                            className={`cal-grid ${slideDir ? `slide-${slideDir}` : ''}`}
                            onAnimationEnd={() => setSlideDir(null)}
                        >
                            {DAYS.map(d => (
                                <div key={d} className="cal-day-name">{d}</div>
                            ))}
                            {cells}
                        </div>
                    </div>

                    {/* ── Expanded Day Panel ── */}
                    {selectedDay && selectedEvents.length > 0 && (
                        <div className="cal-expanded">
                            <div className="cal-expanded-hd">
                                <div className="cal-expanded-title">
                                    {selectedDay} {MONTHS[month]} — {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
                                </div>
                                <button
                                    className="cal-expanded-close"
                                    onClick={() => setSelectedDay(null)}
                                >✕</button>
                            </div>

                            {selectedEvents.map(ev => {
                                const cat = getCategory(ev);
                                const pay = getPayment(ev);
                                return (
                                    <div
                                        key={ev.id}
                                        className="cal-ev-item"
                                        onClick={() => navigate(`/events/${ev.id}`)}
                                    >
                                        <div
                                            className="cal-ev-accent"
                                            style={{ background: cat.dot }}
                                        />
                                        <div className="cal-ev-info">
                                            <div className="cal-ev-name">{ev.name}</div>
                                            <div className="cal-ev-sub">
                                                {ev.location && (
                                                    <span className="cal-ev-loc">📍 {ev.location}</span>
                                                )}
                                                {ev.time && (
                                                    <span className="cal-ev-loc">🕐 {ev.time}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="cal-ev-right">
                                            {ev.category && (
                                                <span
                                                    className="cal-ev-cat-badge"
                                                    style={{ color: cat.label, background: cat.bg }}
                                                >
                                                    {ev.category}
                                                </span>
                                            )}
                                            <span
                                                className="cal-ev-pay-badge"
                                                style={{ color: pay.color, background: pay.bg }}
                                            >
                                                {pay.label}
                                            </span>
                                        </div>
                                        <span className="cal-arrow">›</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Empty month state ── */}
                    {Object.keys(eventsByDay).length === 0 && (
                        <div className="cal-empty-state">
                            <div className="icon">🗓️</div>
                            <p>No events this month</p>
                        </div>
                    )}
                </>
            )}

            {/* ── Hover Tooltip ── */}
            {tooltip && (() => {
                const TOOLTIP_W = 240;
                const TOOLTIP_H_APPROX = 80 + tooltip.events.slice(0, 3).length * 52;
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                let x = tooltip.x;
                let y = tooltip.y;
                if (x + TOOLTIP_W > vw - 12) x = tooltip.x - TOOLTIP_W - 20;
                if (y + TOOLTIP_H_APPROX > vh - 12) y = vh - TOOLTIP_H_APPROX - 12;
                const previewEvts = tooltip.events.slice(0, 3);
                const moreCount = tooltip.events.length - previewEvts.length;

                return (
                    <div
                        ref={tooltipRef}
                        className="cal-tooltip"
                        style={{ left: x, top: y, width: TOOLTIP_W }}
                    >
                        <div className="cal-tooltip-date">
                            {tooltip.day} {MONTHS[month]} {year}
                        </div>
                        <div className="cal-tooltip-ev">
                            {previewEvts.map(ev => {
                                const cat = getCategory(ev);
                                const pay = getPayment(ev);
                                return (
                                    <div key={ev.id} className="cal-tooltip-item">
                                        <div className="cal-tooltip-dot" style={{ background: cat.dot }} />
                                        <div className="cal-tooltip-body">
                                            <div className="cal-tooltip-name">{ev.name}</div>
                                            <div className="cal-tooltip-meta">
                                                {ev.location && (
                                                    <span className="cal-tooltip-loc">📍 {ev.location}</span>
                                                )}
                                                <span
                                                    className="cal-badge"
                                                    style={{ color: pay.color, background: pay.bg }}
                                                >
                                                    {pay.label}
                                                </span>
                                                {ev.category && (
                                                    <span
                                                        className="cal-badge"
                                                        style={{ color: cat.label, background: cat.bg }}
                                                    >
                                                        {ev.category}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {moreCount > 0 && (
                                <div className="cal-tooltip-more">+{moreCount} more event{moreCount > 1 ? 's' : ''}</div>
                            )}
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default EventsDashboard;