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
    { href: '/register', label: 'Register', isRoute: true },
    { href: '#events', label: 'Events' },
    { href: '#gallery', label: 'Gallery' },
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
      /* --- Apple Glassy Effect Start --- */
      background: 'rgba(18, 18, 18, 0.65)',
      WebkitBackdropFilter: 'saturate(180%) blur(20px)', // Safari support
      backdropFilter: 'saturate(180%) blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      /* --- Apple Glassy Effect End --- */
      display: 'flex',
      flexDirection: 'column',
    }}>
      <style>
        {`
          @keyframes slideFadeSwitch {
            0% { opacity: 0; transform: translateY(8px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div style={{
        maxWidth: '80rem',
        width: '100%',
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
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '22%', overflow: 'hidden' }}> {/* Increased border-radius slightly for Apple look */}
            <img src="/udaan.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'grid', alignItems: 'center' }}>
            <span style={{
              gridArea: '1/1',
              fontSize: '1.025rem', fontWeight: 600, letterSpacing: '-0.025em', color: '#fff',
              opacity: !isFestiverse ? 1 : 0,
              transform: !isFestiverse ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
              pointerEvents: !isFestiverse ? 'auto' : 'none',
            }}>
              UDAAN
            </span>
            <span style={{
              gridArea: '1/1',
              fontSize: '1.025rem', fontWeight: 600, letterSpacing: '-0.025em', color: '#fff',
              opacity: isFestiverse ? 1 : 0,
              transform: isFestiverse ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
              pointerEvents: isFestiverse ? 'auto' : 'none',
            }}>
              FESTIVERSE'26
            </span>
          </div>
        </div>

        {/* Desktop Links */}
        <div key={isFestiverse ? 'fest' : 'udaan'} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          fontSize: '0.875rem',
          color: '#a1a1aa',
          fontWeight: 500, // Slightly bolder for better readability on glass
          animation: 'slideFadeSwitch 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards'
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

          {/* Universe Toggle - Updated for iOS style */}
          <button
            onClick={toggleUniverse}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0',
              borderRadius: '9999px',
              border: `1px solid rgba(255, 255, 255, 0.1)`,
              width: '9.5rem',
              height: '2.2rem',
              position: 'relative',
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.05)', // iOS style inner dark background
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
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
              height: '82%',
              backgroundColor: isFestiverse ? '#7c3aed' : '#991b1b',
              borderRadius: '9999px',
              transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', // Apple spring animation
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)', // Solid shadow on the pill itself
              zIndex: 0,
            }} />

            {/* Divider line between the two labels */}
            <div style={{
              position: 'absolute',
              left: `${UDAAN_W}%`,
              top: '25%',
              height: '50%',
              width: '1px',
              background: 'rgba(255,255,255,0.1)',
              zIndex: 5,
              opacity: isFestiverse ? 0 : 1, // Optional: hide divider when festiverse is active
              transition: 'opacity 0.3s',
            }} />

            {/* UDAAN */}
            <span style={{
              position: 'relative',
              zIndex: 10,
              width: `${UDAAN_W}%`,
              fontSize: '0.5rem',
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: '0.1em',
              whiteSpace: 'nowrap',
              padding: '0 0.25rem',
              boxSizing: 'border-box',
              color: !isFestiverse ? '#fff' : '#a1a1aa',
              transition: 'color 0.3s',
            }}>
              UDAAN
            </span>

            {/* FESTIVERSE'26 */}
            <span style={{
              position: 'relative',
              zIndex: 10,
              width: `${FEST_W}%`,
              fontSize: '0.5rem',
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: '0.05em',
              whiteSpace: 'nowrap',
              padding: '0 0.25rem',
              boxSizing: 'border-box',
              color: isFestiverse ? '#fff' : '#a1a1aa',
              transition: 'color 0.3s',
            }}>
              FESTIVERSE'26
            </span>
          </button>

          {/* GEC Badge */}
          <a href="https://www.gecsamastipur.ac.in/" target="_blank" rel="noreferrer">
            <div className="gec-badge" style={{
              width: '4.1rem',
              height: '3rem',
              borderRadius: '8px', // Slightly softer corners
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }} title="GEC Samastipur">
              <img src="/college_logo.png" alt="GEC" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
          transition: 'max-height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', // Apple-style spring ease
          borderTop: menuOpen ? '1px solid rgba(255,255,255,0.08)' : 'none',
          /* Extend glass effect to drawer */
          background: 'rgba(18, 18, 18, 0.65)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        }}
      >
        <div key={isFestiverse ? 'fest-mobile' : 'udaan-mobile'} style={{
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          animation: menuOpen ? 'slideFadeSwitch 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) forwards' : 'none'
        }}>
          {links.map((link) => (
            <a
              key={link.href}
              href={link.isRoute ? link.href : `/${link.href}`}
              onClick={(e) => handleLinkClick(e, link)}
              style={{
                color: '#e4e4e7',
                textDecoration: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                padding: '0.75rem 0', // slightly larger tap targets for mobile
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