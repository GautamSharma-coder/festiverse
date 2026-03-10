import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../lib/api';

/* ── CSS ────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');

  .lb-wrap {
    min-height: 100vh;
    background: #0e0e10;
    color: #e4e4e7;
    font-family: 'Outfit', sans-serif;
  }

  .lb-topbar {
    position: sticky; top: 0; z-index: 40;
    display: flex; align-items: center; gap: 12px;
    padding: 16px 20px;
    background: rgba(14,14,16,0.92);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid #252529;
  }
  .lb-back {
    background: none; border: 1px solid #252529; color: #a1a1aa;
    border-radius: 10px; padding: 8px 14px; font-size: 0.85rem;
    cursor: pointer; transition: all .2s;
    font-family: 'Outfit', sans-serif;
  }
  .lb-back:hover { border-color: #f97316; color: #f97316; }

  .lb-body {
    max-width: 900px; margin: 0 auto;
    padding: 32px 20px 80px;
  }

  .lb-header {
    text-align: center; margin-bottom: 36px;
  }
  .lb-header h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    font-weight: 800; letter-spacing: -0.03em;
    margin-bottom: 8px;
  }
  .lb-header p { color: #71717a; font-size: 0.9rem; }

  /* ── Filter ── */
  .lb-filter {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 28px; flex-wrap: wrap;
  }
  .lb-filter select {
    background: #16161a; color: #e4e4e7; border: 1px solid #252529;
    border-radius: 10px; padding: 10px 14px; font-size: 0.85rem;
    font-family: 'Outfit', sans-serif; cursor: pointer;
    min-width: 200px;
  }
  .lb-filter select:focus { border-color: #f97316; outline: none; }

  /* ── Podium ── */
  .lb-podium {
    display: flex; align-items: flex-end; justify-content: center;
    gap: 12px; margin-bottom: 36px; padding: 20px 0;
  }
  .lb-podium-item {
    display: flex; flex-direction: column; align-items: center;
    gap: 8px; min-width: 90px; max-width: 150px; flex: 1;
  }
  .lb-podium-medal { font-size: 2rem; }
  .lb-podium-name {
    font-weight: 600; font-size: 0.85rem; text-align: center;
    line-height: 1.3;
  }
  .lb-podium-college { font-size: 0.7rem; color: #71717a; text-align: center; }
  .lb-podium-bar {
    width: 100%; border-radius: 8px 8px 0 0;
    display: flex; align-items: flex-end; justify-content: center;
    padding-bottom: 12px; font-weight: 800; font-size: 1.2rem;
    font-family: 'Syne', sans-serif;
  }
  .lb-podium-bar.gold {
    background: linear-gradient(180deg, #fbbf24, #b45309);
    height: 120px; color: #fff;
  }
  .lb-podium-bar.silver {
    background: linear-gradient(180deg, #d1d5db, #6b7280);
    height: 90px; color: #fff;
  }
  .lb-podium-bar.bronze {
    background: linear-gradient(180deg, #d97706, #78350f);
    height: 70px; color: #fff;
  }

  /* ── Results Table ── */
  .lb-event-group { margin-bottom: 32px; }
  .lb-event-title {
    font-family: 'Syne', sans-serif;
    font-size: 1.1rem; font-weight: 700;
    margin-bottom: 12px; color: #f97316;
    display: flex; align-items: center; gap: 8px;
  }

  .lb-table {
    width: 100%; border-collapse: collapse;
    background: rgba(255,255,255,0.02);
    border: 1px solid #252529;
    border-radius: 12px; overflow: hidden;
  }
  .lb-table th {
    text-align: left; padding: 12px 16px;
    font-size: 0.75rem; text-transform: uppercase;
    letter-spacing: 0.06em; color: #71717a;
    background: rgba(255,255,255,0.03);
    border-bottom: 1px solid #252529;
  }
  .lb-table td {
    padding: 12px 16px; font-size: 0.88rem;
    border-bottom: 1px solid rgba(255,255,255,0.03);
  }
  .lb-table tr:last-child td { border-bottom: none; }
  .lb-table tr:hover td { background: rgba(249,115,22,0.03); }

  .lb-pos {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 8px;
    font-weight: 700; font-size: 0.82rem;
  }
  .lb-pos.p1 { background: rgba(251,191,36,0.15); color: #fbbf24; }
  .lb-pos.p2 { background: rgba(156,163,175,0.15); color: #9ca3af; }
  .lb-pos.p3 { background: rgba(217,119,6,0.15); color: #d97706; }
  .lb-pos.pn { background: rgba(255,255,255,0.05); color: #71717a; }

  .lb-center { display: flex; align-items: center; justify-content: center; min-height: 40vh; color: #71717a; }

  .lb-empty-icon { font-size: 3rem; margin-bottom: 12px; }

  @keyframes lbFade { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  .lb-fade { animation: lbFade .4s ease both; }

  @media (max-width: 600px) {
    .lb-podium { gap: 6px; }
    .lb-podium-item { min-width: 70px; }
    .lb-podium-bar.gold { height: 90px; }
    .lb-podium-bar.silver { height: 65px; }
    .lb-podium-bar.bronze { height: 50px; }
    .lb-table th, .lb-table td { padding: 10px 12px; font-size: 0.82rem; }
  }
`;

const Leaderboard = () => {
    const navigate = useNavigate();
    const [results, setResults] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resData, evData] = await Promise.all([
                    apiFetch('/api/results'),
                    apiFetch('/api/events'),
                ]);
                setResults(resData.results || []);
                setEvents(evData.events || []);
            } catch (err) {
                console.error('Failed to load leaderboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Group results by event
    const grouped = {};
    const filtered = selectedEvent === 'all'
        ? results
        : results.filter(r => r.event_id === selectedEvent);

    filtered.forEach(r => {
        const evName = r.events?.name || 'Unknown Event';
        if (!grouped[evName]) grouped[evName] = [];
        grouped[evName].push(r);
    });

    // Sort each group by position
    Object.values(grouped).forEach(arr => arr.sort((a, b) => a.position - b.position));

    const posClass = (p) => p === 1 ? 'p1' : p === 2 ? 'p2' : p === 3 ? 'p3' : 'pn';
    const medal = (p) => p === 1 ? '🥇' : p === 2 ? '🥈' : p === 3 ? '🥉' : `#${p}`;

    // Podium: top 3 from first event group (or selected event)
    const firstGroup = Object.values(grouped)[0] || [];
    const podiumResults = firstGroup.filter(r => r.position <= 3);

    // Reorder podium: 2nd, 1st, 3rd
    const podiumOrder = [
        podiumResults.find(r => r.position === 2),
        podiumResults.find(r => r.position === 1),
        podiumResults.find(r => r.position === 3),
    ].filter(Boolean);

    return (
        <div className="lb-wrap">
            <style>{CSS}</style>

            <div className="lb-topbar">
                <button className="lb-back" onClick={() => navigate(-1)}>← Back</button>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Leaderboard</span>
            </div>

            <div className="lb-body">
                <div className="lb-header lb-fade">
                    <h1>🏆 Leaderboard & Results</h1>
                    <p>Competition results and winner announcements</p>
                </div>

                {loading ? (
                    <div className="lb-center">Loading results...</div>
                ) : results.length === 0 ? (
                    <div className="lb-center" style={{ flexDirection: 'column' }}>
                        <div className="lb-empty-icon">🏅</div>
                        <div>No results announced yet. Stay tuned!</div>
                    </div>
                ) : (
                    <>
                        {/* Event Filter */}
                        <div className="lb-filter lb-fade" style={{ animationDelay: '0.1s' }}>
                            <select value={selectedEvent} onChange={e => setSelectedEvent(e.target.value)}>
                                <option value="all">All Events</option>
                                {events.map(ev => (
                                    <option key={ev.id} value={ev.id}>{ev.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Podium */}
                        {podiumOrder.length > 0 && (
                            <div className="lb-podium lb-fade" style={{ animationDelay: '0.15s' }}>
                                {podiumOrder.map(r => {
                                    const cls = r.position === 1 ? 'gold' : r.position === 2 ? 'silver' : 'bronze';
                                    return (
                                        <div key={r.id} className="lb-podium-item">
                                            <div className="lb-podium-medal">{medal(r.position)}</div>
                                            <div className="lb-podium-name">{r.participant_name}</div>
                                            {r.participant_college && (
                                                <div className="lb-podium-college">{r.participant_college}</div>
                                            )}
                                            <div className={`lb-podium-bar ${cls}`}>
                                                {r.score || ''}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Results Tables */}
                        {Object.entries(grouped).map(([evName, items], idx) => (
                            <div key={evName} className="lb-event-group lb-fade" style={{ animationDelay: `${0.2 + idx * 0.05}s` }}>
                                <div className="lb-event-title">🎯 {evName}</div>
                                <table className="lb-table">
                                    <thead>
                                        <tr>
                                            <th>Pos</th>
                                            <th>Participant</th>
                                            <th>College</th>
                                            <th>Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(r => (
                                            <tr key={r.id}>
                                                <td><span className={`lb-pos ${posClass(r.position)}`}>{medal(r.position)}</span></td>
                                                <td style={{ fontWeight: 600 }}>{r.participant_name}</td>
                                                <td style={{ color: '#71717a' }}>{r.participant_college || '—'}</td>
                                                <td>{r.score || '—'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
