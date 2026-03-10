import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;700;800&family=Syne+Mono&display=swap');

  .ff-root {
    background: #06060C;
    position: relative;
    overflow: hidden;
    font-family: 'Syne', sans-serif;
    border-top: 1px solid rgba(255, 140, 0, 0.12);
  }

  /* Top glowing line */
  .ff-root::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #FF8C00 40%, #FF8C00 60%, transparent);
    opacity: 0.5;
  }

  /* Big background word */
  .ff-bg-text {
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(80px, 18vw, 240px);
    letter-spacing: -0.02em;
    color: transparent;
    -webkit-text-stroke: 1px rgba(255, 140, 0, 0.05);
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    line-height: 1;
  }

  /* Noise grain */
  .ff-noise {
    position: absolute;
    inset: 0;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 180px;
    pointer-events: none;
  }

  .ff-inner {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 40px;
  }

  /* ── TOP BAND ── */
  .ff-top {
    padding: 64px 0 48px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 40px;
    flex-wrap: wrap;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }

  /* Brand block */
  .ff-brand {
    flex: 1;
    min-width: 280px;
  }

  .ff-brand-eyebrow {
    font-family: 'Syne Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.3em;
    color: #FF8C00;
    text-transform: uppercase;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ff-brand-eyebrow::before {
    content: '';
    display: inline-block;
    width: 24px; height: 1px;
    background: #FF8C00;
  }

  .ff-brand-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(40px, 5vw, 64px);
    letter-spacing: 0.06em;
    color: #fff;
    line-height: 1;
    margin-bottom: 14px;
  }
  .ff-brand-name span { color: #FF8C00; }

  .ff-brand-tagline {
    font-size: 13px;
    color: rgba(255,255,255,0.3);
    line-height: 1.6;
    max-width: 260px;
    font-weight: 400;
  }

  /* Center divider with year pill */
  .ff-center-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding-top: 8px;
    flex: 0 0 auto;
  }

  .ff-year-badge {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px;
    letter-spacing: 0.2em;
    color: #000;
    background: #FF8C00;
    padding: 6px 16px;
    border-radius: 2px;
  }

  .ff-v-line {
    width: 1px;
    height: 80px;
    background: linear-gradient(to bottom, rgba(255,140,0,0.4), transparent);
  }

  /* Links block */
  .ff-links-block {
    flex: 1;
    min-width: 280px;
    display: flex;
    gap: 60px;
    justify-content: flex-end;
  }

  .ff-links-heading {
    font-family: 'Syne Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    color: rgba(255,255,255,0.25);
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .ff-link {
    display: block;
    font-size: 14px;
    font-weight: 700;
    color: rgba(255,255,255,0.55);
    text-decoration: none;
    margin-bottom: 10px;
    transition: color 0.2s, transform 0.2s;
    letter-spacing: 0.02em;
  }
  .ff-link:hover {
    color: #FF8C00;
    transform: translateX(4px);
  }

  /* ── SOCIAL STRIP ── */
  .ff-social-strip {
    padding: 28px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    gap: 24px;
    flex-wrap: wrap;
  }

  .ff-social-label {
    font-family: 'Syne Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    color: rgba(255,255,255,0.2);
    text-transform: uppercase;
  }

  .ff-socials {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
  }

  .ff-social-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 2px;
    background: transparent;
    color: rgba(255,255,255,0.45);
    font-family: 'Syne Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.2s;
  }
  .ff-social-btn:hover {
    border-color: #FF8C00;
    color: #FF8C00;
    background: rgba(255,140,0,0.06);
  }
  .ff-social-btn svg {
    width: 14px; height: 14px;
    fill: currentColor;
    flex-shrink: 0;
  }

  /* Newsletter prompt */
  .ff-newsletter {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .ff-nl-text {
    font-size: 12px;
    color: rgba(255,255,255,0.25);
  }

  .ff-nl-form {
    display: flex;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 2px;
    overflow: hidden;
    width: 100%;
    max-width: 320px;
  }

  .ff-nl-input {
    background: rgba(255,255,255,0.03);
    border: none;
    outline: none;
    padding: 9px 14px;
    font-family: 'Syne Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,0.6);
    flex: 1;
    min-width: 120px;
  }
  .ff-nl-input::placeholder { color: rgba(255,255,255,0.2); }

  .ff-nl-btn {
    background: #FF8C00;
    border: none;
    padding: 9px 16px;
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #000;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }
  .ff-nl-btn:hover { background: #ffaa33; }

  /* ── BOTTOM BAR ── */
  .ff-bottom {
    padding: 20px 0 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  .ff-copy {
    font-family: 'Syne Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.12em;
    cursor: pointer;
  }
  .ff-copy span { color: #FF8C00; }

  .ff-college {
    font-family: 'Syne Mono', monospace;
    font-size: 11px;
    color: rgba(255,255,255,0.15);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-align: center;
  }

  .ff-back-top {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 2px;
    padding: 7px 14px;
    font-family: 'Syne Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: rgba(255,255,255,0.3);
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.2s;
    text-decoration: none;
  }
  .ff-back-top:hover {
    border-color: #FF8C00;
    color: #FF8C00;
    background: rgba(255,140,0,0.06);
  }

  /* ── RESPONSIVE BREAKPOINTS ── */
  @media (max-width: 900px) {
    .ff-center-col { display: none; } /* Hide center line on medium screens */
    .ff-links-block { justify-content: flex-start; }
  }

  @media (max-width: 650px) {
    .ff-inner { padding: 0 24px; }
    
    .ff-top { flex-direction: column; gap: 48px; }
    
    .ff-links-block { width: 100%; justify-content: space-between; gap: 20px; }
    
    .ff-social-strip { flex-direction: column; align-items: flex-start; }
    .ff-socials { width: 100%; }
    .ff-social-btn { flex: 1; justify-content: center; }
    
    .ff-newsletter { width: 100%; flex-direction: column; align-items: flex-start; }
    .ff-nl-form { max-width: 100%; }
    
    .ff-bottom { flex-direction: column; justify-content: center; text-align: center; }
  }
`;

const FestFooter = ({ onAdminClick }) => {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState('');
  const [tapCount, setTapCount] = useState(0);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) setSubscribed(true);
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <style>{styles}</style>
      <footer className="ff-root">
        <div className="ff-noise" />
        <div className="ff-bg-text">FESTIVERSE</div>

        <div className="ff-inner">

          {/* Top section */}
          <div className="ff-top">
            {/* Brand */}
            <div className="ff-brand">
              <div className="ff-brand-eyebrow">Est. 2026</div>
              <div className="ff-brand-name">FESTI<span>VERSE</span></div>
              <p className="ff-brand-tagline">
                Where culture, tech & music collide. The annual fest of GEC Samastipur.
              </p>
            </div>

            {/* Center divider */}
            <div className="ff-center-col">
              <div className="ff-year-badge">2026</div>
              <div className="ff-v-line" />
            </div>

            {/* Links */}
            <div className="ff-links-block">
              <div className="ff-links-col">
                <div className="ff-links-heading">Navigate</div>
                {['Home', 'Events', 'Schedule', 'Gallery'].map(l => (
                  <a key={l} href={`#${l.toLowerCase()}`} className="ff-link">{l}</a>
                ))}
              </div>
              <div className="ff-links-col">
                <div className="ff-links-heading">Info</div>
                {['About'].map(l => (
                  <Link key={l} to={`/${l.toLowerCase()}`} className="ff-link">{l}</Link>
                ))}
                {['Sponsors', 'Team', 'Contact'].map(l => (
                  <a key={l} href={`#${l.toLowerCase()}`} className="ff-link">{l}</a>
                ))}
              </div>
            </div>
          </div>

          {/* Social strip */}
          <div className="ff-social-strip">
            <div className="ff-socials">
              <span className="ff-social-label">Follow Us</span>
              <a href="#" className="ff-social-btn">
                <svg viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" /></svg>
                X / Twitter
              </a>
              <a href="#" className="ff-social-btn">
                <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
                Instagram
              </a>
              <a href="#" className="ff-social-btn">
                <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                LinkedIn
              </a>
            </div>

            {/* Newsletter */}
            <div className="ff-newsletter">
              <span className="ff-nl-text">Stay updated →</span>
              {subscribed ? (
                <span style={{ fontFamily: "'Syne Mono', monospace", fontSize: '11px', color: '#FF8C00', letterSpacing: '0.15em' }}>
                  ✓ YOU'RE IN
                </span>
              ) : (
                <form className="ff-nl-form" onSubmit={handleSubscribe}>
                  <input
                    className="ff-nl-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <button className="ff-nl-btn" type="submit">Notify Me</button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="ff-bottom">
            <div
              className="ff-copy"
              onClick={() => {
                setTapCount((prev) => prev + 1);
                if (tapCount + 1 >= 5) {
                  onAdminClick();
                  setTapCount(0);
                }
              }}
            >
              © 2026 FESTIVERSE — All rights reserved
            </div>
            <div className="ff-college">
              Government Engineering College · Samastipur
            </div>
            <a className="ff-back-top" onClick={scrollToTop}>
              ↑ Back to Top
            </a>
          </div>

        </div>
      </footer>
    </>
  );
};

export default FestFooter;