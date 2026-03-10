import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const fallbackNotices = [
    { id: 1, title: 'Auditions 2026 Open', description: 'Register before 20th Oct.', color: '#ef4444' },
    { id: 2, title: 'Art Exhibition', description: 'Visit Room 204.', color: '#f59e0b' },
    { id: 3, title: 'Debate Finals', description: 'Main Auditorium, 4 PM.', color: '#3b82f6' },
    { id: 4, title: 'Nukkad Natak Practice', description: 'OAT, 5 PM.', color: '#22c55e' },
];

const NoticeBoard = () => {
    const [notices, setNotices] = useState(fallbackNotices);
    const [hasNew, setHasNew] = useState(false);

    const fetchNotices = async () => {
        try {
            const r = await fetch(`${API}/api/notices`);
            const d = await r.json();
            if (d.success && d.notices && d.notices.length > 0) {
                const lastCount = parseInt(sessionStorage.getItem('fv_notice_count') || '0');
                if (d.notices.length > lastCount && lastCount > 0) {
                    setHasNew(true);
                    setTimeout(() => setHasNew(false), 5000);
                }
                sessionStorage.setItem('fv_notice_count', d.notices.length.toString());
                setNotices(d.notices);
            }
        } catch { }
    };

    useEffect(() => {
        fetchNotices();
        const interval = setInterval(fetchNotices, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <section id="notice" style={{ padding: '5rem 0', backgroundColor: '#0a0a0a' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
                {/* Notice Board */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <div className="animate-pulse" style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 500, color: '#e4e4e7' }}>Digital Notice Board</h2>
                    </div>
                    <div style={{
                        height: '20rem',
                        background: '#18181b',
                        border: '4px solid #27272a',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 0 20px rgba(0,0,0,1)',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: '2.5rem',
                            background: 'linear-gradient(to bottom, #18181b, transparent)',
                            zIndex: 10,
                        }}></div>
                        <div className="notice-scroll" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {notices.map((n, i) => (
                                <div key={n.id || i} style={{
                                    padding: '0.75rem',
                                    background: 'rgba(39, 39, 42, 0.5)',
                                    borderLeft: `2px solid ${n.color || '#3b82f6'}`,
                                    borderRadius: '0.25rem',
                                }}>
                                    <p style={{ fontSize: '0.875rem', color: '#fff', fontWeight: 500 }}>{n.title}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#71717a' }}>{n.description || n.desc}</p>
                                </div>
                            ))}
                            {notices.length === 0 && (
                                <div style={{ textAlign: 'center', color: '#71717a', padding: '2rem' }}>
                                    <p>No notices at this time.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Connect */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '1.5rem', color: '#e4e4e7' }}>Connect</h2>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        <a href="#" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <iconify-icon icon="logos:twitter" width="20"></iconify-icon>
                        </a>
                        <a href="#" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <iconify-icon icon="skill-icons:instagram" width="20"></iconify-icon>
                        </a>
                        <a href="#" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <iconify-icon icon="logos:youtube-icon" width="20"></iconify-icon>
                        </a>
                        <a href="#" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <iconify-icon icon="logos:whatsapp-icon" width="20"></iconify-icon>
                        </a>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#71717a' }}>
                        © 2026 UDAAN - Arts & Cultural Club, GEC Samastipur.<br />
                        Designed with ❤️ for creativity.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default NoticeBoard;
