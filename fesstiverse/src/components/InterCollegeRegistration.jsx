import React from 'react';
import { useNavigate } from 'react-router-dom';

const InterCollegeRegistration = () => {
    const navigate = useNavigate();

    const barcodeWidths = [
        '4px', '2px', '7px', '1px', '5px', '3px', '8px', '2px',
        '6px', '4px', '1px', '7px', '3px', '5px', '2px', '6px',
        '4px', '8px', '2px', '5px'
    ];

    const inclusions = [
        { icon: 'solar:bomb-bold', text: 'All Core Events' },
        { icon: 'solar:pizza-slice-bold', text: 'Unlimited Food' },
        { icon: 'solar:bed-bold', text: 'Campus Stay Included' },
        { icon: 'solar:t-shirt-bold', text: 'Official Merch' },
        { icon: 'solar:box-bold', text: 'Premium Swag' },
        { icon: 'solar:verified-check-bold', text: 'Certificate' },
    ];

    return (
        <section id="intercollege-registration" style={styles.section}>
            <div style={styles.industrialBg}></div>

            <div className="container" style={styles.container}>
                <div className="reg-layout-inter" style={styles.layout}>
                    <div style={styles.ticketSide}>
                        <div className="brutalist-card-elite" style={styles.card}>
                            <div style={styles.cardHeader}>
                                <div>
                                    <span style={styles.tierTag}>Elite Tier</span>
                                    <h3 style={styles.cardTitle}>INTER-COLLEGE</h3>
                                </div>
                                <iconify-icon icon="solar:crown-bold" width="45"></iconify-icon>
                            </div>

                            <div style={styles.priceSection}>
                                <span style={styles.currency}>₹</span>
                                <span className="reg-price-text" style={styles.price}>699</span>
                            </div>

                            <div style={styles.benefitStack}>
                                {inclusions.slice(0, 3).map((item, idx) => (
                                    <div key={idx} style={styles.miniBenefit}>
                                        <iconify-icon icon={item.icon} width="16"></iconify-icon>
                                        <span>{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => navigate('/register')} style={styles.cta}>
                                GET ELITE PASS
                            </button>

                            <div style={styles.barcodeWrap}>
                                {barcodeWidths.map((width, i) => (
                                    <div key={i} style={{ ...styles.barcodeLine, width }}></div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="reg-content-inter" style={styles.content}>
                        <div style={styles.tag}>OPEN FOR ALL COLLEGES</div>
                        <h2 className="reg-heading-inter" style={styles.heading}>
                            JOIN THE <br />
                            <span style={styles.accentText}>CONVERGENCE</span>
                        </h2>
                        <p className="reg-subtext-inter" style={styles.subtext}>
                            Calling all innovators, creators, and competitors from across the nation.
                            Your journey to the Festiverse starts here.
                        </p>

                        <div className="perk-grid-inter" style={styles.perkGrid}>
                            {inclusions.map((item, idx) => (
                                <div key={idx} className="perk-item" style={styles.perkItem}>
                                    <div style={styles.iconCircle}>
                                        <iconify-icon icon={item.icon} width="24"></iconify-icon>
                                    </div>
                                    <span style={styles.perkText}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;900&display=swap');
                
                #intercollege-registration {
                    font-family: 'Space Grotesk', sans-serif;
                }

                .brutalist-card-elite {
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .brutalist-card-elite:hover {
                    transform: scale(1.02) rotate(-1deg);
                    box-shadow: 20px 20px 0px #fff !important;
                }

                .perk-item {
                    transition: all 0.3s ease;
                }

                .perk-item:hover {
                    transform: translateX(10px);
                    color: #ccff00 !important;
                }

                .perk-item:hover div {
                    background: #ccff00;
                    color: #000;
                    box-shadow: 0 0 20px rgba(204, 255, 0, 0.4);
                }

                @media (max-width: 1024px) {
                    .reg-layout-inter {
                        grid-template-columns: 1fr !important;
                        gap: 3rem !important;
                    }
                    .reg-heading-inter {
                        font-size: 3.5rem !important;
                    }
                }

                @media (max-width: 768px) {
                    #intercollege-registration {
                        padding: 60px 0 !important;
                    }
                    .reg-heading-inter {
                        font-size: 2.5rem !important;
                    }
                    .reg-price-text {
                        font-size: 5rem !important;
                    }
                    .perk-grid-inter {
                        grid-template-columns: 1fr !important;
                        gap: 1rem !important;
                    }
                    .reg-subtext-inter {
                        font-size: 1.1rem !important;
                    }
                    .brutalist-card-elite {
                        padding: 1.5rem !important;
                    }
                }
            `}</style>
        </section>
    );
};

const styles = {
    section: {
        padding: '120px 0',
        backgroundColor: '#0a0a0a',
        position: 'relative',
        overflow: 'hidden'
    },
    industrialBg: {
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(204, 255, 0, 0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px', zIndex: 0
    },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 },
    layout: { display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: '5rem', alignItems: 'center' },

    content: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    tag: {
        background: 'rgba(255,255,255,0.05)', color: '#ccff00', padding: '8px 16px',
        fontSize: '0.8rem', fontWeight: 900, width: 'fit-content',
        letterSpacing: '3px', border: '1px solid rgba(204, 255, 0, 0.3)'
    },
    heading: { fontSize: '5rem', fontWeight: 900, color: '#fff', lineHeight: '0.85', textTransform: 'uppercase' },
    accentText: { color: '#ccff00', textShadow: '0 0 30px rgba(204, 255, 0, 0.2)' },
    subtext: { color: '#aaa', fontSize: '1.25rem', maxWidth: '540px', lineHeight: '1.6' },

    perkGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' },
    perkItem: { display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' },
    iconCircle: {
        width: '48px', height: '48px', borderRadius: '50%', background: '#111',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccff00',
        border: '1px solid rgba(204, 255, 0, 0.2)', transition: 'all 0.3s ease'
    },
    perkText: { color: '#eee', fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase' },

    ticketSide: { display: 'flex', justifyContent: 'flex-start' },
    card: {
        background: '#ccff00', border: '5px solid #fff', padding: '3rem',
        width: '100%', maxWidth: '440px', boxShadow: '15px 15px 0px #fff',
        display: 'flex', flexDirection: 'column', gap: '2rem'
    },
    cardHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        color: '#000', borderBottom: '3px solid #000', paddingBottom: '2rem'
    },
    tierTag: { fontSize: '0.8rem', fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: '2px', opacity: 0.6 },
    cardTitle: { fontSize: '2rem', fontWeight: 900, margin: '6px 0 0 0' },

    priceSection: { display: 'flex', alignItems: 'baseline', gap: '10px', color: '#000' },
    currency: { fontSize: '2.5rem', fontWeight: 900 },
    price: { fontSize: '8rem', fontWeight: 900, lineHeight: '0.8', letterSpacing: '-6px' },

    benefitStack: { display: 'flex', flexDirection: 'column', gap: '8px' },
    miniBenefit: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 800, color: '#000', textTransform: 'uppercase' },

    barcodeWrap: { display: 'flex', gap: '4px', height: '40px', alignItems: 'center', opacity: 0.7 },
    barcodeLine: { height: '100%', background: '#000' },

    cta: {
        width: '100%', background: '#000', color: '#ccff00', border: 'none',
        padding: '1.5rem', fontSize: '1.25rem', fontWeight: 900, cursor: 'pointer',
        textTransform: 'uppercase', transition: 'all 0.3s ease',
        boxShadow: '8px 8px 0px #fff'
    }
};

export default InterCollegeRegistration;
