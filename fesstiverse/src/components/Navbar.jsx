import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const TopFloatingNavbar = ({ isFestiverse, toggleUniverse }) => {
  const navNavigate = useNavigate();
  const location = useLocation();

  const udaanLinks = [
    { href: '#home', label: 'Home', icon: 'solar:home-smile-linear' },
    { href: '#society', label: 'Societies', icon: 'solar:users-group-rounded-linear' },
    { href: '#members', label: 'Members', icon: 'solar:user-linear' },
    { href: '#notice', label: 'Notices', icon: 'solar:bell-linear' },
  ];

  const festLinks = [
    { href: '#fest-home', label: 'Fest Home', icon: 'solar:home-smile-linear' },
    //{ href: '/register', label: 'Register', isRoute: true, icon: 'solar:pen-new-square-linear' },
    { href: '/schedule', label: 'Schedule', isRoute: true, icon: 'solar:calendar-date-linear' },
    { href: '/rulebook', label: 'Rulebook', isRoute: true, icon: 'solar:document-text-linear' },
    { href: '#events', label: 'Events', icon: 'solar:calendar-linear' },
    { href: '/sponsors', label: 'Sponsors', isRoute: true, icon: 'solar:star-linear' },
    { href: '#gallery', label: 'Gallery', icon: 'solar:gallery-linear' },
    { href: '/leaderboard', label: 'Results', isRoute: true, icon: 'lucide:trophy' },
    { href: '/certificates', label: 'Certificates', isRoute: true, icon: 'solar:diploma-linear' },
  ];

  const links = isFestiverse ? festLinks : udaanLinks;

  const handleLinkClick = (e, link) => {
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

  // Toggle calculation variables
  const UDAAN_W = 38;
  const FEST_W = 62;
  const pillLeft = isFestiverse ? `${UDAAN_W + 1}%` : '2%';
  const pillWidth = isFestiverse ? `${FEST_W - 3}%` : `${UDAAN_W - 3}%`;

  // Extracted mapping function so we can render links in two different DOM locations easily
  const renderedLinks = links.map((link) => (
    <a
      key={link.href}
      href={link.isRoute ? link.href : `/${link.href}`}
      onClick={(e) => handleLinkClick(e, link)}
      className="nav-link"
      title={link.label}
    >
      <iconify-icon icon={link.icon} width="22"></iconify-icon>
      <span className="nav-text">{link.label}</span>
    </a>
  ));

  return (
    <>
      <style>{`
        /* --- BASE STYLES --- */
        .top-floating-nav {
          position: fixed;
          top: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.75rem;
          border-radius: 9999px;
          background: rgba(18, 18, 18, 0.65);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          backdrop-filter: saturate(180%) blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          max-width: 95vw;
        }

        .nav-links-container {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .desktop-divider {
          width: 1px;
          height: 1.5rem;
          background: rgba(255,255,255,0.1);
        }

        .mobile-bottom-nav {
          display: none; /* Hidden on desktop */
        }

        .nav-link {
          display: flex;
          align-items: center;
          color: #a1a1aa;
          text-decoration: none;
          padding: 0.5rem;
          border-radius: 9999px;
          background: transparent;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          cursor: pointer;
        }

        .nav-link:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        .nav-text {
          max-width: 0px;
          opacity: 0;
          margin-left: 0px;
          overflow: hidden;
          white-space: nowrap;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .universe-toggle {
          display: flex;
          align-items: center;
          padding: 0;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: 8.5rem;
          height: 2.2rem;
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
          cursor: pointer;
          transition: border-color 0.5s;
          flex-shrink: 0;
        }

        .logo-container {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          overflow: hidden;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* --- DESKTOP HOVER LOGIC --- */
        @media (min-width: 768px) {
          .nav-link:hover .nav-text {
            max-width: 100px;
            opacity: 1;
            margin-left: 0.5rem;
          }
        }

        /* --- MOBILE RESPONSIVE LOGIC --- */
        /* --- MOBILE RESPONSIVE LOGIC --- */
        @media (max-width: 767px) {
          .top-floating-nav {
            padding: 0.4rem 0.75rem;
            width: 85vw; /* Sets the bar width to 85% of the screen */
            justify-content: space-between; /* Pushes items to opposite ends */
          }

          /* Hide elements from the top nav that belong at the bottom now */
          .desktop-links, .desktop-divider {
            display: none !important;
          }

          .logo-container {
            width: 2.1rem;
            height: 2.1rem;
          }

          .universe-toggle {
            width: 7.5rem; 
            height: 2rem;
          }

          /* Style the completely separate bottom navbar */
          .mobile-bottom-nav {
            display: flex;
            position: fixed;
            bottom: 1.25rem; /* Will now accurately calculate relative to viewport */
            left: 50%;
            transform: translateX(-50%);
            z-index: 50;
            align-items: center;
            background: rgba(18, 18, 18, 0.65);
            -webkit-backdrop-filter: saturate(180%) blur(20px);
            backdrop-filter: saturate(180%) blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.2);
            border-radius: 9999px;
            padding: 0.35rem 0.5rem;
            gap: 0.2rem;
            width: max-content;
            max-width: 95vw;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .mobile-bottom-nav::-webkit-scrollbar {
            display: none;
          }
          
          .mobile-bottom-nav {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .nav-link {
            padding: 0.5rem;
          }
        }
      `}</style>

      {/* --- TOP NAVBAR --- */}
      <nav className="top-floating-nav">
        {/* College Logo */}
        <div className="logo-container" onClick={() => { navNavigate('/'); window.scrollTo(0, 0); }} title="Home">
          <img src="/udaan.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Desktop Divider */}
        <div className="desktop-divider"></div>

        {/* Desktop Nav Links */}
        <div className="nav-links-container desktop-links">
          {renderedLinks}
        </div>

        {/* Desktop Divider */}
        <div className="desktop-divider"></div>

        {/* Universe Toggle */}
        <button onClick={toggleUniverse} className="universe-toggle">
          <div style={{
            position: 'absolute', left: pillLeft, top: '50%', transform: 'translateY(-50%)',
            width: pillWidth, height: '82%', backgroundColor: isFestiverse ? '#7c3aed' : '#991b1b',
            borderRadius: '9999px', transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 0,
          }} />

          <span style={{
            position: 'relative', zIndex: 10, width: `${UDAAN_W}%`,
            fontSize: '0.45rem', fontWeight: 700, textAlign: 'center', letterSpacing: '0.1em',
            whiteSpace: 'nowrap', color: !isFestiverse ? '#fff' : '#a1a1aa', transition: 'color 0.3s',
          }}>
            UDAAN
          </span>

          <span style={{
            position: 'relative', zIndex: 10, width: `${FEST_W}%`,
            fontSize: '0.45rem', fontWeight: 700, textAlign: 'center', letterSpacing: '0.05em',
            whiteSpace: 'nowrap', color: isFestiverse ? '#fff' : '#a1a1aa', transition: 'color 0.3s',
          }}>
            FESTIVERSE'26
          </span>
        </button>
      </nav>

      {/* --- BOTTOM NAVBAR (Mobile Only) --- */}
      {/* Lives completely outside the top nav so it isn't trapped by the CSS containing block */}
      <nav className="mobile-bottom-nav">
        {renderedLinks}
      </nav>
    </>
  );
};

export default TopFloatingNavbar;