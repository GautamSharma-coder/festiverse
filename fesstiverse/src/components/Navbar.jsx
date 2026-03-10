import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ isFestiverse, toggleUniverse }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navNavigate = useNavigate();
  const location = useLocation();

  const udaanLinks = [
    { href: '#home', label: 'Home' },
    { href: '#society', label: 'Societies' },
    { href: '#members', label: 'Members' },
    { href: '#notice', label: 'Notices' },
  ];

  const festLinks = [
    { href: '#fest-home', label: 'Fest Home' },
    { href: '#register', label: 'Register' },
    { href: '#events', label: 'Events' },
    { href: '#gallery', label: 'Gallery' },
    // { href: '/dashboard', label: 'Dashboard', isRoute: true },
    { href: '/leaderboard', label: 'Results', isRoute: true },
  ];

  const links = isFestiverse ? festLinks : udaanLinks;

  const handleLinkClick = (e, link) => {
    setMenuOpen(false);
    if (link.isRoute) {
      e.preventDefault();
      navNavigate(link.href);
    } else {
      e.preventDefault();
      if (location.pathname !== '/') {
        navNavigate('/' + link.href);
      } else {
        const el = document.querySelector(link.href);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      setTimeout(() => {
        const el = document.querySelector(location.hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location]);

  // Asymmetric split: UDAAN=38%, FESTIVERSE'26=62%
  const UDAAN_W = 38;
  const FEST_W = 62;
  const pillLeft = isFestiverse ? `${UDAAN_W + 1}%` : '2%';
  const pillWidth = isFestiverse ? `${FEST_W - 3}%` : `${UDAAN_W - 3}%`;

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 50,
      background: 'rgba(5, 5, 5, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    }}>
      <div style={{
        maxWidth: '80rem',
        margin: '0 auto',
        padding: '0 1rem',
        height: '4.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>

        {/* Logo */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          onClick={() => { navNavigate('/'); window.scrollTo(0, 0); }}
        >
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10%', overflow: 'hidden' }}>
            <img src="/udaan.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10%' }} />
          </div>
          <span style={{ fontSize: '1.025rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#fff' }}>
            {isFestiverse ? "FESTIVERSE'26" : "UDAAN"}
          </span>
        </div>

        {/* Desktop Links */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          fontSize: '0.875rem',
          color: '#a1a1aa',
        }} className="desktop-nav">
          {links.map((link) => (
            <a key={link.href} href={link.isRoute ? link.href : `/${link.href}`}
              onClick={(e) => handleLinkClick(e, link)}
              style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }}
              onMouseEnter={(e) => e.target.style.color = '#fff'}
              onMouseLeave={(e) => e.target.style.color = '#a1a1aa'}>
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: Toggle + Badge + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>

          {/* Universe Toggle */}
          <button
            onClick={toggleUniverse}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0',
              borderRadius: '9999px',
              border: `1px solid ${isFestiverse ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
              width: '9.5rem',
              height: '2.2rem',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(90deg, #18181b, #000)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              transition: 'border-color 0.5s',
              flexShrink: 0,
            }}
          >
            {/* Sliding pill */}
            <div style={{
              position: 'absolute',
              left: pillLeft,
              top: '50%',
              transform: 'translateY(-50%)',
              width: pillWidth,
              height: '78%',
              backgroundColor: isFestiverse ? '#7c3aed' : '#991b1b',
              borderRadius: '9999px',
              transition: 'left 0.4s ease, width 0.4s ease, background-color 0.4s ease',
              boxShadow: isFestiverse ? '0 0 10px rgba(124,58,237,0.5)' : '0 0 10px rgba(153,27,27,0.5)',
              zIndex: 0,
            }} />

            {/* Divider line between the two labels */}
            <div style={{
              position: 'absolute',
              left: `${UDAAN_W}%`,
              top: '20%',
              height: '60%',
              width: '1px',
              background: 'rgba(255,255,255,0.08)',
              zIndex: 5,
            }} />

            {/* UDAAN */}
            <span style={{
              position: 'relative',
              zIndex: 10,
              width: `${UDAAN_W}%`,
              fontSize: '0.48rem',
              fontWeight: 800,
              textAlign: 'center',
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
              padding: '0 0.25rem',
              boxSizing: 'border-box',
              color: !isFestiverse ? '#fff' : '#52525b',
              transition: 'color 0.3s',
            }}>
              UDAAN
            </span>

            {/* FESTIVERSE'26 */}
            <span style={{
              position: 'relative',
              zIndex: 10,
              width: `${FEST_W}%`,
              fontSize: '0.48rem',
              fontWeight: 800,
              textAlign: 'center',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              padding: '0 0.25rem',
              boxSizing: 'border-box',
              color: isFestiverse ? '#fff' : '#52525b',
              transition: 'color 0.3s',
            }}>
              FESTIVERSE'26
            </span>
          </button>

          {/* GEC Badge */}
          <a href="https://www.gecsamastipur.ac.in/" target="_blank">
            <div className="gec-badge" style={{
              width: '4.1rem',
              height: '3rem',
              borderRadius: '10%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }} title="GEC Samastipur">
              <img src="/college_logo.png" alt="GEC" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0%' }} />
            </div>
          </a>

          {/* Hamburger Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="hamburger-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              color: '#fff',
            }}
          >
            <iconify-icon icon={menuOpen ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"} width="24"></iconify-icon>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className="mobile-drawer"
        style={{
          maxHeight: menuOpen ? '300px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-in-out',
          borderTop: menuOpen ? '1px solid rgba(255,255,255,0.05)' : 'none',
        }}
      >
        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.isRoute ? link.href : `/${link.href}`}
              onClick={(e) => handleLinkClick(e, link)}
              style={{
                color: '#a1a1aa',
                textDecoration: 'none',
                fontSize: '0.875rem',
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'block',
                cursor: 'pointer',
              }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;