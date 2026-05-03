import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --bg: #ffffff;
    --text-primary: #111111;
    --text-muted: #71717a;
    --border: #e4e4e7;
    --accent: #111111;
    --accent-text: #ffffff;
    --radius: 6px;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #09090b;
      --text-primary: #fafafa;
      --text-muted: #a1a1aa;
      --border: #27272a;
      --accent: #fafafa;
      --accent-text: #09090b;
    }
  }

  .min-footer {
    background-color: var(--bg);
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    border-top: 1px solid var(--border);
    padding: 80px 0 40px;
  }

  .min-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* ── Top Layout ── */
  .min-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 48px;
    margin-bottom: 80px;
  }

  /* ── Brand Column ── */
  .min-brand-name {
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin: 0 0 16px 0;
  }

  .min-brand-desc {
    color: var(--text-muted);
    font-size: 0.875rem;
    line-height: 1.6;
    max-width: 280px;
    margin: 0 0 32px 0;
  }

  /* ── Links Columns ── */
  .min-nav-title {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 24px;
    color: var(--text-primary);
  }

  .min-nav-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .min-nav-link {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.875rem;
    transition: color 0.2s ease;
    display: inline-block;
  }

  .min-nav-link:hover {
    color: var(--text-primary);
  }

  /* ── Newsletter ── */
  .min-newsletter-form {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }

  .min-input {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-primary);
    padding: 10px 14px;
    border-radius: var(--radius);
    font-family: inherit;
    font-size: 0.875rem;
    flex: 1;
    max-width: 240px;
    transition: border-color 0.2s;
    outline: none;
  }

  .min-input:focus {
    border-color: var(--text-primary);
  }

  .min-input::placeholder {
    color: var(--text-muted);
    opacity: 0.6;
  }

  .min-btn {
    background: var(--accent);
    color: var(--accent-text);
    border: none;
    padding: 10px 18px;
    border-radius: var(--radius);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.2s;
  }

  .min-btn:hover {
    opacity: 0.8;
  }
  
  .min-success-msg {
    font-size: 0.875rem;
    color: var(--text-primary);
    font-weight: 500;
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Bottom Bar ── */
  .min-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 32px;
    border-top: 1px solid var(--border);
    font-size: 0.875rem;
    color: var(--text-muted);
    flex-wrap: wrap;
    gap: 16px;
  }

  .min-copy {
    cursor: pointer;
    user-select: none;
  }

  .min-back-top {
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    transition: opacity 0.2s;
  }

  .min-back-top:hover {
    opacity: 0.6;
  }

  /* ── Responsive ── */
  @media (max-width: 900px) {
    .min-grid {
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }
  }

  @media (max-width: 600px) {
    .min-footer {
      padding: 64px 0 32px;
    }
    .min-grid {
      grid-template-columns: 1fr;
      gap: 40px;
    }
    .min-bottom {
      flex-direction: column-reverse;
      align-items: flex-start;
    }
    .min-input {
      max-width: 100%;
    }
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
      <footer className="min-footer">
        <div className="min-container">

          {/* Top Layout */}
          <div className="min-grid">

            {/* Brand Block */}
            <div>
              <h2 className="min-brand-name">FESTIVERSE '26</h2>
              <p className="min-brand-desc">
                Where culture, tech & music collide. The annual fest of Government Engineering College, Samastipur.
              </p>

              {/* Newsletter */}
              <div>
                <div className="min-nav-title" style={{ marginBottom: '8px' }}>Stay updated</div>
                {subscribed ? (
                  <div className="min-success-msg">
                    ✓ Subscribed successfully
                  </div>
                ) : (
                  <form className="min-newsletter-form" onSubmit={handleSubscribe}>
                    <input
                      className="min-input"
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                    <button className="min-btn" type="submit">Join</button>
                  </form>
                )}
              </div>
            </div>

            {/* Navigation Block */}
            <div>
              <div className="min-nav-title">Navigate</div>
              <div className="min-nav-list">
                <a href="#fest-home" className="min-nav-link">Home</a>
                <a href="#events" className="min-nav-link">Events</a>
                <Link to="/schedule" className="min-nav-link">Schedule</Link>
                <a href="#gallery" className="min-nav-link">Gallery</a>
              </div>
            </div>

            {/* Info Block */}
            <div>
              <div className="min-nav-title">Information</div>
              <div className="min-nav-list">
                <Link to="/about" className="min-nav-link">About</Link>
                <Link to="/sponsors" className="min-nav-link">Sponsors</Link>
                <Link to="/certificates" className="min-nav-link">Certificates</Link>
                <a href="#team" className="min-nav-link">Team</a>
                <Link to="/contact" className="min-nav-link">Contact</Link>
                <Link to="/previous-teams" className="min-nav-link">Previous Teams</Link>
              </div>
            </div>

            {/* Socials Block */}
            <div>
              <div className="min-nav-title">Socials</div>
              <div className="min-nav-list">
                <a href="https://x.com/udaan_gecs" target="_blank" rel="noopener noreferrer" className="min-nav-link">X / Twitter</a>
                <a href="https://www.instagram.com/udaan_gecsamastipur/" target="_blank" rel="noopener noreferrer" className="min-nav-link">Instagram</a>
                <a href="https://www.linkedin.com/in/udaan-arts-and-cultural-club-gec-samastipur-111153254/" target="_blank" rel="noopener noreferrer" className="min-nav-link">LinkedIn</a>
                <a href="https://www.facebook.com/profile.php?id=100086638071615" target="_blank" rel="noopener noreferrer" className="min-nav-link">Facebook</a>
                <a href="https://www.youtube.com/@udaangecsamastipur3147" target="_blank" rel="noopener noreferrer" className="min-nav-link">YouTube</a>
                <a href="mailto:contact@udaangecsamastipur.in" className="min-nav-link">Email</a>
              </div>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="min-bottom">
            <div
              className="min-copy"
              onClick={() => {
                setTapCount((prev) => prev + 1);
                if (tapCount + 1 >= 5) {
                  onAdminClick();
                  setTapCount(0);
                }
              }}
            >
              © 2026 GEC Samastipur. All rights reserved.
            </div>

            <button className="min-back-top" onClick={scrollToTop}>
              Back to top ↑
            </button>
          </div>

        </div>
      </footer>
    </>
  );
};

export default FestFooter;
