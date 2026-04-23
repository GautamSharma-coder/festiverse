import { useNavigate } from 'react-router-dom';

const CampusRegistration = () => {
    const navigate = useNavigate();

    const barcodeWidths = [
        '3px', '6px', '2px', '8px', '4px', '1px', '7px', '5px', 
        '2px', '9px', '3px', '6px', '4px', '7px', '2px'
    ];

    const inclusions = [
        { icon: 'solar:bomb-bold', text: 'All Core Events' },
        { icon: 'solar:pizza-slice-bold', text: 'Unlimited Food' },
        { icon: 'solar:t-shirt-bold', text: 'Official Merch' },
        { icon: 'solar:box-bold', text: 'Swag Crates' },
        { icon: 'solar:verified-check-bold', text: 'Certificate' },
        { icon: 'solar:bolt-circle-bold', text: 'Fast-Track Entry' },
    ];

    return (
        <section id="campus-registration" style={styles.section}>
            <div style={styles.gridOverlay}></div>
            
            <div className="container" style={styles.container}>
                <div className="reg-layout-campus" style={styles.layout}>
                    <div className="reg-content-campus" style={styles.content}>
                        <div style={styles.tag}>CAMPUS EXCLUSIVE</div>
                        <h2 className="reg-heading-campus" style={styles.heading}>
                            GEC SAMASTIPUR <br />
                            <span style={styles.accentText}>INTERNAL PASS</span>
                        </h2>
                        <p className="reg-subtext-campus" style={styles.subtext}>
                            Exclusive access for the home squad. 
                            Show your college spirit and dominate the arena.
                        </p>
                        
                        <div className="reg-inclusion-grid" style={styles.inclusionList}>
                            {inclusions.map((item, idx) => (
                                <div key={idx} style={styles.inclusionItem}>
                                    <iconify-icon icon={item.icon} width="24" style={{ color: '#ccff00' }}></iconify-icon>
                                    <span style={styles.inclusionText}>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={styles.ticketSide}>
                        <div className="brutalist-card" style={styles.card}>
                            <div style={styles.cardHeader}>
                                <div>
                                    <span style={styles.tierTag}>Internal Tier</span>
                                    <h3 style={styles.cardTitle}>GEC STUDENT</h3>
                                </div>
                                <iconify-icon icon="solar:ticket-sale-bold" width="40"></iconify-icon>
                            </div>
                            
                            <div style={styles.priceSection}>
                                <span style={styles.currency}>₹</span>
                                <span className="reg-price-text" style={styles.price}>349</span>
                            </div>

                            <div style={styles.barcodeWrap}>
                                {barcodeWidths.map((width, i) => (
                                    <div key={i} style={{ ...styles.barcodeLine, width }}></div>
                                ))}
                            </div>

                            <button onClick={() => navigate('/register')} style={styles.cta}>
                                SECURE YOUR TICKET
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;900&display=swap');
                
                #campus-registration {
                    font-family: 'Space Grotesk', sans-serif;
                }

                .brutalist-card {
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .brutalist-card:hover {
                    transform: translate(-8px, -8px);
                    box-shadow: 16px 16px 0px #ccff00 !important;
                }

                @media (max-width: 1024px) {
                    .reg-layout-campus {
                        grid-template-columns: 1fr !important;
                        gap: 3rem !important;
                    }
                    .reg-heading-campus {
                        font-size: 3.5rem !important;
                    }
                }

                @media (max-width: 768px) {
                    #campus-registration {
                        padding: 60px 0 !important;
                    }
                    .reg-heading-campus {
                        font-size: 2.5rem !important;
                    }
                    .reg-price-text {
                        font-size: 5rem !important;
                    }
                    .reg-inclusion-grid {
                        grid-template-columns: 1fr !important;
                        gap: 1rem !important;
                    }
                    .reg-subtext-campus {
                        font-size: 1.1rem !important;
                    }
                    .brutalist-card {
                        padding: 1.5rem !important;
                    }
                }
            `}</style>
        </section>
    );
};

const styles = {
    section: {
        padding: '100px 0',
        backgroundColor: '#050505',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    gridOverlay: {
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '30px 30px', zIndex: 0
    },
    container: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 1 },
    layout: { display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '4rem', alignItems: 'center' },
    
    content: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    tag: {
        background: '#ccff00', color: '#000', padding: '6px 16px', 
        fontSize: '0.8rem', fontWeight: 900, width: 'fit-content',
        letterSpacing: '2px', borderRadius: '2px'
    },
    heading: { fontSize: '4.5rem', fontWeight: 900, color: '#fff', lineHeight: '0.9', textTransform: 'uppercase' },
    accentText: { color: '#ccff00' },
    subtext: { color: '#888', fontSize: '1.2rem', maxWidth: '500px', lineHeight: '1.6' },
    
    inclusionList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1rem' },
    inclusionItem: { display: 'flex', alignItems: 'center', gap: '12px' },
    inclusionText: { color: '#fff', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase' },

    ticketSide: { display: 'flex', justifyContent: 'center' },
    card: {
        background: '#111', border: '4px solid #ccff00', padding: '2.5rem',
        width: '100%', maxWidth: '400px', boxShadow: '12px 12px 0px #ccff00',
        display: 'flex', flexDirection: 'column', gap: '2rem'
    },
    cardHeader: { 
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        color: '#fff', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem'
    },
    tierTag: { fontSize: '0.7rem', fontWeight: 800, color: '#ccff00', textTransform: 'uppercase', letterSpacing: '1px' },
    cardTitle: { fontSize: '1.75rem', fontWeight: 900, margin: '4px 0 0 0' },
    
    priceSection: { display: 'flex', alignItems: 'baseline', gap: '8px', color: '#fff' },
    currency: { fontSize: '2rem', fontWeight: 900, color: '#ccff00' },
    price: { fontSize: '7rem', fontWeight: 900, lineHeight: '0.8', letterSpacing: '-4px' },

    barcodeWrap: { display: 'flex', gap: '3px', height: '30px', alignItems: 'center' },
    barcodeLine: { height: '100%', background: '#ccff00' },

    cta: {
        width: '100%', background: '#ccff00', color: '#000', border: 'none',
        padding: '1.25rem', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer',
        textTransform: 'uppercase', transition: 'all 0.2s ease'
    }
};

export default CampusRegistration;
