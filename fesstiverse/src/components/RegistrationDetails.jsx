import React from 'react';
import { useNavigate } from 'react-router-dom';

const RegistrationDetails = () => {
    const navigate = useNavigate();

    const inclusions = [
        { icon: 'solar:bomb-bold', text: 'All Core Events' },
        { icon: 'solar:pizza-slice-bold', text: 'Unlimited Food' },
        { icon: 'solar:bed-bold', text: 'Campus Stay' },
        { icon: 'solar:t-shirt-bold', text: 'Official Merch' },
        { icon: 'solar:box-bold', text: 'Swag Crates' },
        { icon: 'solar:verified-check-bold', text: 'Certificate' },
    ];

    return (
        <section id="registration" style={styles.section}>
            {/* Industrial Grid Background */}
            <div style={styles.gridOverlay}></div>

            <div className="container" style={styles.container}>
                <div className="brutalist-grid" style={styles.grid}>

                    {/* Left Content: Bold Typography */}
                    <div style={styles.contentCol}>
                        <div style={styles.tag}>
                            WARNING: HIGH ENERGY EVENT
                        </div>

                        <h2 style={styles.heading}>
                            NO EXCUSES.<br />
                            <span style={styles.accentText}>JUST EXPERIENCES.</span>
                        </h2>

                        <p style={styles.subtext}>
                            The ultimate convergence of code, culture, and chaos.
                            Grab your pass before they vanish into the void.
                        </p>

                        <div style={styles.listGrid}>
                            {inclusions.map((item, idx) => (
                                <div key={idx} className="brutalist-item" style={styles.listItem}>
                                    <div style={styles.iconBox}>
                                        <iconify-icon icon={item.icon} width="24"></iconify-icon>
                                    </div>
                                    <span style={styles.listText}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Content: The Brutalist Ticket */}
                    <div className="ticket-wrapper" style={styles.ticketWrapper}>
                        <div className="brutalist-card" style={styles.card}>

                            <div style={styles.cardHeader}>
                                <h3>EARLY BIRD PASS</h3>
                                <iconify-icon icon="solar:ticket-sale-bold" width="32"></iconify-icon>
                            </div>

                            <div style={styles.priceContainer}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, background: '#000', color: '#ccff00', padding: '2px 8px', width: 'fit-content' }}>GEC INTERNAL</span>
                                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                        <span style={{ ...styles.currency, fontSize: '1.5rem' }}>₹</span>
                                        <span style={{ ...styles.price, fontSize: '4rem' }}>349</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, background: '#000', color: '#ccff00', padding: '2px 8px', width: 'fit-content' }}>INTER-COLLEGE</span>
                                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                        <span style={{ ...styles.currency, fontSize: '1.5rem' }}>₹</span>
                                        <span style={{ ...styles.price, fontSize: '4rem' }}>699</span>
                                    </div>
                                </div>
                            </div>

                            <div style={styles.barcodeWrap}>
                                <div style={styles.barcodeLine}></div>
                                <div style={{ ...styles.barcodeLine, width: '4px' }}></div>
                                <div style={{ ...styles.barcodeLine, width: '8px' }}></div>
                                <div style={{ ...styles.barcodeLine, width: '2px' }}></div>
                                <div style={{ ...styles.barcodeLine, width: '6px' }}></div>
                                <div style={{ ...styles.barcodeLine, width: '12px' }}></div>
                                <div style={{ ...styles.barcodeLine, width: '3px' }}></div>
                                <div style={{ ...styles.barcodeLine, width: '8px' }}></div>
                                <div style={{ ...styles.barcodeLine, width: '4px' }}></div>
                            </div>

                            <button
                                onClick={() => navigate('/register')}
                                className="brutalist-btn"
                                style={styles.ctaButton}
                            >
                                SECURE TICKETS NOW
                            </button>

                            <p style={styles.disclaimer}>
                                NON-REFUNDABLE • TAXES APPLY • BRING YOUR A-GAME
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <style>{`
                /* Font import for a blocky, industrial feel */
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;900&display=swap');

                .brutalist-item {
                    transition: all 0.2s ease;
                }
                .brutalist-item:hover {
                    background: #ccff00;
                    color: #000 !important;
                    transform: translate(-4px, -4px);
                    box-shadow: 4px 4px 0px #fff;
                }
                .brutalist-item:hover span, .brutalist-item:hover div {
                    color: #000 !important;
                }

                .brutalist-card {
                    transition: all 0.2s ease;
                }
                .brutalist-card:hover {
                    transform: translate(-8px, -8px);
                    box-shadow: 16px 16px 0px #fff;
                }

                .brutalist-btn {
                    transition: all 0.1s ease;
                }
                .brutalist-btn:active {
                    transform: translate(4px, 4px);
                    box-shadow: 0px 0px 0px #ccff00 !important;
                }
                .brutalist-btn:hover {
                    background: #fff !important;
                    color: #000 !important;
                }

                @media (max-width: 968px) {
                    .brutalist-grid { grid-template-columns: 1fr !important; gap: 4rem !important; }
                    .heading { font-size: 3.5rem !important; }
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
        overflow: 'hidden',
        fontFamily: "'Space Grotesk', sans-serif"
    },
    gridOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
        backgroundSize: '40px 40px', zIndex: 0
    },
    container: { maxWidth: '1240px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5rem', alignItems: 'center' },

    // Left Side Styles
    contentCol: { display: 'flex', flexDirection: 'column' },
    tag: {
        display: 'inline-block', background: '#ccff00', color: '#000',
        padding: '6px 12px', fontSize: '0.9rem', fontWeight: 900,
        letterSpacing: '1px', marginBottom: '2rem', width: 'fit-content',
        boxShadow: '4px 4px 0px #fff', border: '2px solid #000'
    },
    heading: {
        fontSize: '5rem', fontWeight: 900, color: '#fff',
        lineHeight: '0.95', marginBottom: '1.5rem', textTransform: 'uppercase'
    },
    accentText: { color: '#ccff00' },
    subtext: {
        color: '#a3a3a3', fontSize: '1.25rem', lineHeight: '1.6',
        marginBottom: '3rem', maxWidth: '500px', fontWeight: 500
    },

    // Brutalist List
    listGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    listItem: {
        display: 'flex', alignItems: 'center', gap: '1rem',
        border: '2px solid #333', padding: '1rem', background: '#111',
        cursor: 'crosshair'
    },
    iconBox: { color: '#ccff00', display: 'flex', alignItems: 'center' },
    listText: { color: '#fff', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase' },

    // Right Side Ticket Styles
    ticketWrapper: { width: '100%', display: 'flex', justifyContent: 'flex-end' },
    card: {
        background: '#ccff00', border: '4px solid #fff',
        padding: '3rem', width: '100%', maxWidth: '480px',
        boxShadow: '12px 12px 0px #fff', display: 'flex', flexDirection: 'column', gap: '2rem'
    },
    cardHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: '#000', borderBottom: '4px solid #000', paddingBottom: '1rem'
    },
    priceContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#000', gap: '1rem' },
    currency: { fontSize: '3rem', fontWeight: 900, marginTop: '1rem' },
    price: { fontSize: '8rem', fontWeight: 900, lineHeight: '0.8', letterSpacing: '-5px' },

    // Fake Barcode
    barcodeWrap: { display: 'flex', gap: '4px', height: '40px', width: '100%', alignItems: 'center', margin: '1rem 0' },
    barcodeLine: { height: '100%', background: '#000', width: '4px' },

    ctaButton: {
        width: '100%', background: '#000', color: '#ccff00',
        border: 'none', padding: '1.5rem', fontSize: '1.25rem',
        fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase',
        boxShadow: '6px 6px 0px #fff', display: 'flex', justifyContent: 'center', gap: '10px'
    },
    disclaimer: { textAlign: 'center', fontSize: '0.75rem', color: '#000', fontWeight: 700, letterSpacing: '1px' }
};

export default RegistrationDetails;