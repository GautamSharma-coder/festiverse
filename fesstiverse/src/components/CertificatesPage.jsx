import React, { useState } from 'react';
import Navbar from './Navbar';
import FestFooter from './FestFooter';
import API_BASE_URL, { apiFetch } from '../lib/api';

const CertificatesPage = () => {
    const [searchId, setSearchId] = useState('');
    const [status, setStatus] = useState('idle'); // idle, searching, found, not_found
    const [certificates, setCertificates] = useState([]);
    const [userName, setUserName] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId) return;
        
        setStatus('searching');
        setCertificates([]);
        try {
            const data = await apiFetch(`/api/certificates/check/${searchId.trim()}`);
            if (data.success && data.certificates && data.certificates.length > 0) {
                setCertificates(data.certificates);
                setUserName(data.userName);
                setStatus('found');
            } else {
                setStatus('not_found');
            }
        } catch (err) {
            console.error('Search error:', err);
            setStatus('not_found');
        }
    };

    const handleDownload = (eventId) => {
        window.open(`${API_BASE_URL}/api/certificates/download/${searchId.toUpperCase().trim()}?event_id=${eventId}`, '_blank');
    };

    return (
        <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
            <Navbar isFestiverse={true} toggleUniverse={() => {}} />

            <main style={{ paddingTop: '140px', paddingBottom: '100px', display: 'flex', alignItems: 'center' }}>
                <div className="container" style={{ maxWidth: '800px', margin: '0 auto', padding: '0 2rem', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <div style={{ 
                            width: '80px', height: '80px', background: 'rgba(124, 58, 237, 0.1)', 
                            borderRadius: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 2rem', color: '#7c3aed', fontSize: '2.5rem'
                        }}>
                            <iconify-icon icon="solar:diploma-linear"></iconify-icon>
                        </div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
                            Download <span style={{ color: '#7c3aed' }}>Certificates</span>
                        </h1>
                        <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1.2rem' }}>
                            Enter your Registration ID (e.g., F26RD1234) to download your participation or achievement certificates.
                        </p>
                    </div>

                    <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        padding: '3rem',
                        borderRadius: '2.5rem',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                    }}>
                        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }} className="search-form">
                            <input 
                                type="text"
                                placeholder="Enter Registration ID"
                                value={searchId}
                                onChange={(e) => setSearchId(e.target.value)}
                                style={{
                                    flex: 1,
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    padding: '1.25rem 1.5rem',
                                    borderRadius: '1.25rem',
                                    color: '#fff',
                                    fontSize: '1.1rem',
                                    outline: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                className="cert-input"
                            />
                            <button 
                                type="submit"
                                disabled={status === 'searching'}
                                style={{
                                    background: '#7c3aed',
                                    color: '#fff',
                                    border: 'none',
                                    padding: '0 2rem',
                                    borderRadius: '1.25rem',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                                className="find-btn"
                            >
                                {status === 'searching' ? 'Searching...' : 'Find Certificate'}
                            </button>
                        </form>

                        {/* Status Messages */}
                        <div style={{ marginTop: '2rem' }}>
                            {status === 'not_found' && (
                                <div style={{ color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textAlign: 'center' }}>
                                    <iconify-icon icon="solar:danger-circle-linear"></iconify-icon>
                                    <span>No records found for ID "{searchId}". Please check and try again.</span>
                                </div>
                            )}
                            
                            {status === 'found' && (
                                <div>
                                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '1.4rem' }}>Found Certificates for {userName} ✨</h4>
                                        <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)' }}>
                                            Select an event below to download its certificate.
                                        </p>
                                    </div>
                                    
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {certificates.map((cert) => (
                                            <div key={cert.event_id} style={{
                                                background: 'rgba(255,255,255,0.02)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                padding: '1.5rem',
                                                borderRadius: '1.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '1.5rem'
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>{cert.event_name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: cert.type === 'Achievement' ? '#fbbf24' : '#7c3aed', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                        <iconify-icon icon={cert.type === 'Achievement' ? "solar:crown-minimalistic-bold" : "solar:verified-check-bold"} />
                                                        {cert.type === 'Achievement' ? `Winner (${cert.rank})` : 'Participation'}
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDownload(cert.event_id)}
                                                    style={{
                                                        background: '#7c3aed',
                                                        color: '#fff',
                                                        border: 'none',
                                                        padding: '0.75rem 1.5rem',
                                                        borderRadius: '1rem',
                                                        fontWeight: 700,
                                                        fontSize: '0.9rem',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        whiteSpace: 'nowrap'
                                                    }}
                                                >
                                                    <iconify-icon icon="solar:download-bold" />
                                                    Download
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginTop: '4rem', textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.9rem' }}>
                        <p>Need help? Contact our support team at <a href="mailto:contact@udaangecsamastipur.in" style={{ color: '#7c3aed', textDecoration: 'none' }}>contact@udaangecsamastipur.in</a></p>
                    </div>
                </div>
            </main>

            <FestFooter onAdminClick={() => {}} />

            <style>{`
                .cert-input:focus { border-color: #7c3aed; background: rgba(124, 58, 237, 0.05); }
                @media (max-width: 600px) {
                    .search-form { flex-direction: column; }
                    button { padding: 1.25rem !important; }
                    h1 { fontSize: 2.2rem !important; }
                }
            `}</style>
        </div>
    );
};

export default CertificatesPage;
