import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import FestFooter from './FestFooter';
import { apiFetch } from '../lib/api';
import { proxyImageUrl } from '../lib/proxyImage';

const SponsorCard = ({ sponsor }) => (
  <div style={{
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '1.5rem',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
    transition: 'all 0.3s ease',
    textAlign: 'center'
  }} className="sponsor-card">
    <div style={{
      width: '180px',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      padding: '1rem',
      borderRadius: '1rem'
    }}>
      {sponsor.logo_url ? (
        <img
          src={proxyImageUrl ? proxyImageUrl(sponsor.logo_url) : sponsor.logo_url}
          alt={sponsor.name}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
        />
      ) : null}
      <span style={{ display: sponsor.logo_url ? 'none' : 'block', color: '#000', fontWeight: 700, fontSize: '1.2rem' }}>{sponsor.name}</span>
    </div>
    <div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>{sponsor.name}</h3>
      <div style={{
        display: 'inline-block',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        backgroundColor: sponsor.tier === 'gold' ? '#fbbf24' : sponsor.tier === 'silver' ? '#9ca3af' : 'rgba(124, 58, 237, 0.2)',
        color: sponsor.tier === 'gold' || sponsor.tier === 'silver' ? '#000' : '#c4b5fd'
      }}>
        {sponsor.tier} Partner
      </div>
    </div>
    {sponsor.website && (
      <a href={sponsor.website} target="_blank" rel="noopener noreferrer" style={{
        marginTop: 'auto',
        color: '#7c3aed',
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: 600
      }}>
        Visit Website →
      </a>
    )}
  </div>
);

const SponsorsPage = () => {
  const [sponsors, setSponsors] = useState([]);
  //const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        const data = await apiFetch('/api/sponsors');
        setSponsors(data.sponsors || []);
      } catch (err) {
        console.error("Failed to fetch sponsors:", err);
      } finally {
        //setLoading(false);

      }
    };
    fetchSponsors();
  }, []);

  const tiers = ['gold', 'silver', 'bronze'];
  const fallbackSponsors = [
    { name: 'TechGiant', tier: 'gold', logo_url: '', website: '#' },
    { name: 'Café Chai', tier: 'silver', logo_url: '', website: '#' },
    { name: 'Coding Ninjas', tier: 'silver', logo_url: '', website: '#' },
    { name: 'Unacademy', tier: 'bronze', logo_url: '', website: '#' },
    { name: 'RedBull', tier: 'bronze', logo_url: '', website: '#' },
  ];

  const currentSponsors = sponsors.length > 0 ? sponsors : fallbackSponsors;

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', color: '#fff' }}>
      <Navbar isFestiverse={true} toggleUniverse={() => { }} />

      <main style={{ paddingTop: '140px', paddingBottom: '100px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
            <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Partnerships</span>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginTop: '1rem', letterSpacing: '-0.02em' }}>Our <span style={{ color: '#fbbf24' }}>Sponsors</span></h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1.2rem', maxWidth: '700px', margin: '1.5rem auto 0' }}>
              We are proud to be supported by these amazing organizations who help make Festiverse '26 a reality.
            </p>
          </div>

          {tiers.map(tier => {
            const tierSponsors = currentSponsors.filter(s => s.tier === tier);
            if (tierSponsors.length === 0) return null;

            return (
              <div key={tier} style={{ marginBottom: '5rem' }}>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'rgba(255, 255, 255, 0.3)',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  {tier} Partners
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.05)' }}></div>
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: tier === 'gold' ? 'repeat(auto-fit, minmax(300px, 1fr))' : 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '2rem'
                }}>
                  {tierSponsors.map((s, idx) => <SponsorCard key={idx} sponsor={s} />)}
                </div>
              </div>
            );
          })}

          <div style={{
            marginTop: '8rem',
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
            padding: '4rem',
            borderRadius: '2.5rem',
            textAlign: 'center',
            border: '1px solid rgba(251, 191, 36, 0.2)'
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>Interested in Sponsoring?</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
              Connect with thousands of students and showcasing your brand at Bihar's most awaited engineering fest.
            </p>
            <a href="mailto:sponsors@udaangecsamastipur.in" style={{
              background: '#fbbf24',
              color: '#000',
              padding: '1rem 2.5rem',
              borderRadius: '9999px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '1rem',
              display: 'inline-block',
              transition: 'all 0.3s ease'
            }} className="cta-btn">
              Get in Touch →
            </a>
          </div>
        </div>
      </main>

      <FestFooter onAdminClick={() => { }} />

      <style>{`
        .sponsor-card:hover { transform: scale(1.02); border-color: rgba(251, 191, 36, 0.3); background: rgba(255, 255, 255, 0.05); }
        .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 10px 25px rgba(251, 191, 36, 0.3); }
        @media (max-width: 600px) {
          h1 { fontSize: 2.5rem !important; }
        }
      `}</style>
    </div>
  );
};

export default SponsorsPage;
