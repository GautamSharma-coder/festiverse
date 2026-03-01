import React, { useState } from 'react';

const Navbar = ({ isFestiverse, toggleUniverse, onAdminClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const udaanLinks = [
    { href: '#home', label: 'Home' },
    { href: '#society', label: 'Societies' },
    { href: '#members', label: 'Members' },
    { href: '#notice', label: 'Notices' },
  ];

  const festLinks = [
    { href: '#fest-home', label: 'Fest Home' },
    { href: '#register', label: 'Register' },
    { href: '#gallery', label: 'Gallery' },
    { href: '#events', label: 'Events' },
  ];

  const links = isFestiverse ? festLinks : udaanLinks;

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

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
          onClick={() => window.scrollTo(0, 0)}
        >
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '10%', overflow: 'hidden' }}>
            <img src="/udaan.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10%' }} />
          </div>

          <span style={{ fontSize: '1.125rem', fontWeight: 500, letterSpacing: '-0.025em', color: '#fff' }}>
            {isFestiverse ? "FEST'26" : "UDAAN"}
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
            <a key={link.href} href={link.href} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }}
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
              gap: '0.25rem',
              padding: '0.25rem',
              borderRadius: '9999px',
              border: `1px solid ${isFestiverse ? '#7c3aed' : 'rgba(255,255,255,0.1)'}`,
              width: '8rem',
              position: 'relative',
              overflow: 'hidden',
              background: 'linear-gradient(90deg, #18181b, #000)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)',
              cursor: 'pointer',
              transition: 'border-color 0.5s',
            }}
          >
            <div style={{
              position: 'absolute',
              left: isFestiverse ? '52%' : '4%',
              width: '45%',
              height: '80%',
              backgroundColor: isFestiverse ? '#7c3aed' : '#991b1b',
              borderRadius: '9999px',
              transition: 'all 0.5s',
              boxShadow: isFestiverse ? '0 0 10px rgba(124,58,237,0.5)' : '0 0 10px rgba(153,27,27,0.5)',
              zIndex: 0,
            }} />
            <span style={{
              position: 'relative',
              zIndex: 10,
              width: '50%',
              fontSize: '0.625rem',
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: '0.1em',
              color: !isFestiverse ? '#fff' : '#71717a',
              transition: 'color 0.3s',
            }}>UDAAN</span>
            <span style={{
              position: 'relative',
              zIndex: 10,
              width: '50%',
              fontSize: '0.625rem',
              fontWeight: 700,
              textAlign: 'center',
              letterSpacing: '0.1em',
              color: isFestiverse ? '#fff' : '#71717a',
              transition: 'color 0.3s',
            }}>FEST'26</span>
          </button>

          {/* GEC Badge - hidden on mobile */}
          <a href="https://www.gecsamastipur.ac.in/" target="_blank">
            <div className="gec-badge" style={{
              width: '4.1rem',
              height: '3rem',
              borderRadius: '10%',
              //background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // border: '1px solid rgba(255,255,255,0.1)',
            }} title="GEC Samastipur">
              <img src="/college_logo.png" alt="GEC" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0%' }} />
            </div>
          </a>

          {/* Admin Button - subtle */}
          <button
            onClick={onAdminClick}
            title="Admin Panel (Ctrl+Shift+A)"
            style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#71717a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#a78bfa'; e.currentTarget.style.borderColor = '#7c3aed'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#71717a'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            ⚙
          </button>

          {/* Hamburger Button - shown only on mobile */}
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
              href={link.href}
              onClick={handleLinkClick}
              style={{
                color: '#a1a1aa',
                textDecoration: 'none',
                fontSize: '0.875rem',
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'block',
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