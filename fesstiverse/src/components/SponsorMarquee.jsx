import React, { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import { proxyImageUrl } from '../lib/proxyImage';

const SponsorMarquee = () => {
    const [sponsors, setSponsors] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const fetchSponsors = async () => {
            try {
                const data = await apiFetch('/api/sponsors');
                setSponsors(data.sponsors || []);
            } catch {
                // Fallback to placeholder data
            } finally {
                setLoaded(true);
            }
        };
        fetchSponsors();
    }, []);

    // Fallback placeholder sponsors if none configured
    const fallbackSponsors = ['Sponsored by TechGiant', 'Café Chai', 'Coding Ninjas', 'Unacademy', 'RedBull'];
    const displayItems = sponsors.length > 0 ? sponsors : fallbackSponsors.map((name, i) => ({ id: i, name, logo_url: '', tier: 'bronze' }));

    // Triple the items for infinite scroll illusion
    const tripled = [...displayItems, ...displayItems, ...displayItems];

    const tierColor = (tier) => {
        switch (tier) {
            case 'gold': return '#fbbf24';
            case 'silver': return '#9ca3af';
            case 'bronze': return 'rgba(168, 85, 247, 0.5)';
            default: return 'rgba(168, 85, 247, 0.5)';
        }
    };

    return (
        <>
            <style>{`
                @keyframes marqueeScroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-33.333%); }
                }
            `}</style>
            <div style={{
                background: 'rgba(88, 28, 135, 0.08)',
                borderTop: '1px solid rgba(168, 85, 247, 0.15)',
                borderBottom: '1px solid rgba(168, 85, 247, 0.15)',
                padding: '1rem 0',
                overflow: 'hidden',
            }}>
                <div style={{
                    display: 'flex',
                    whiteSpace: 'nowrap',
                    gap: '3rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontSize: '0.875rem',
                    animation: 'marqueeScroll 25s linear infinite',
                    width: 'max-content',
                    alignItems: 'center',
                }}>
                    {tripled.map((s, i) => (
                        <span key={i} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            color: '#71717a',
                        }}>
                            {s.logo_url ? (
                                <img
                                    src={proxyImageUrl ? proxyImageUrl(s.logo_url) : s.logo_url}
                                    alt={s.name}
                                    style={{
                                        height: '28px', width: 'auto',
                                        objectFit: 'contain', borderRadius: '4px',
                                        filter: 'grayscale(0.3)',
                                    }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ) : (
                                <span style={{ color: tierColor(s.tier) }}>✦</span>
                            )}
                            {s.website ? (
                                <a href={s.website} target="_blank" rel="noopener noreferrer"
                                    style={{ color: 'inherit', textDecoration: 'none' }}
                                    onMouseEnter={(e) => e.target.style.color = tierColor(s.tier)}
                                    onMouseLeave={(e) => e.target.style.color = '#71717a'}>
                                    {s.name}
                                </a>
                            ) : s.name}
                        </span>
                    ))}
                </div>
            </div>
        </>
    );
};

export default SponsorMarquee;
