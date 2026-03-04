import React from 'react';
import { ScrollReveal } from './ScrollReveal';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:wght@300;400;500;700&display=swap');

  .about-root {
    min-height: 100vh;
    background: #07070a;
    color: #f4f4f5;
    font-family: 'DM Sans', sans-serif;
  }

  /* Top bar */
  .about-topbar {
    position: sticky;
    top: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: rgba(7,7,10,0.88);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .about-logo {
    font-family: 'Cinzel', serif;
    font-size: 1.1rem;
    font-weight: 900;
    letter-spacing: 0.06em;
    color: #f4f4f5;
  }
  .about-logo span { color: #8b5cf6; }
  .about-back {
    padding: 7px 18px;
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 8px;
    background: none;
    color: #a1a1aa;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    font-family: 'DM Sans', sans-serif;
  }
  .about-back:hover { border-color: #8b5cf6; color: #c084fc; }

  /* Hero */
  .about-hero {
    position: relative;
    padding: 5rem 2rem 3rem;
    text-align: center;
    overflow: hidden;
  }
  .about-hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at center top, rgba(139,92,246,0.15) 0%, transparent 60%);
    pointer-events: none;
  }
  .about-hero-eyebrow {
    font-size: 0.7rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: #8b5cf6;
    margin-bottom: 1rem;
    font-weight: 500;
  }
  .about-hero h1 {
    font-family: 'Cinzel', serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 900;
    letter-spacing: 0.04em;
    line-height: 1.15;
    margin: 0 0 1rem;
    background: linear-gradient(135deg, #c084fc, #22d3ee);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .about-hero p {
    max-width: 600px;
    margin: 0 auto;
    font-size: 1rem;
    color: #a1a1aa;
    line-height: 1.7;
  }

  /* Section layout */
  .about-section {
    max-width: 900px;
    margin: 0 auto;
    padding: 3rem 2rem;
  }
  .about-section-title {
    font-family: 'Cinzel', serif;
    font-size: 1.5rem;
    font-weight: 900;
    margin-bottom: 1.5rem;
    color: #f4f4f5;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .about-section-title::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(180deg, #8b5cf6, #22d3ee);
    border-radius: 2px;
    flex-shrink: 0;
  }

  /* Cards */
  .about-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin-bottom: 1rem;
  }
  .about-card {
    background: #0f0f14;
    border: 1px solid #1e1e28;
    border-radius: 14px;
    padding: 24px;
    transition: border-color 0.3s;
  }
  .about-card:hover { border-color: rgba(139,92,246,0.3); }
  .about-card-icon {
    font-size: 1.5rem;
    margin-bottom: 12px;
    display: block;
  }
  .about-card h3 {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 8px;
    color: #f4f4f5;
  }
  .about-card p {
    font-size: 0.85rem;
    color: #71717a;
    line-height: 1.6;
    margin: 0;
  }

  /* Stats strip */
  .about-stats {
    display: flex;
    gap: 0;
    border: 1px solid #1e1e28;
    border-radius: 14px;
    overflow: hidden;
    margin-bottom: 2rem;
  }
  .about-stat {
    flex: 1;
    text-align: center;
    padding: 24px 16px;
    border-right: 1px solid #1e1e28;
  }
  .about-stat:last-child { border-right: none; }
  .about-stat-val {
    font-family: 'Cinzel', serif;
    font-size: 1.75rem;
    font-weight: 900;
    color: #c084fc;
    line-height: 1;
    margin-bottom: 6px;
  }
  .about-stat-lbl {
    font-size: 0.7rem;
    color: #52525b;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 600;
  }

  /* Timeline */
  .about-timeline {
    position: relative;
    padding-left: 28px;
  }
  .about-timeline::before {
    content: '';
    position: absolute;
    left: 6px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(180deg, #8b5cf6, transparent);
  }
  .about-tl-item {
    position: relative;
    margin-bottom: 28px;
  }
  .about-tl-item::before {
    content: '';
    position: absolute;
    left: -24px;
    top: 6px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: #8b5cf6;
    border: 2px solid #07070a;
  }
  .about-tl-year {
    font-size: 0.7rem;
    color: #8b5cf6;
    font-weight: 700;
    letter-spacing: 0.1em;
    margin-bottom: 4px;
  }
  .about-tl-text {
    font-size: 0.88rem;
    color: #a1a1aa;
    line-height: 1.6;
  }

  /* College block */
  .about-college {
    background: linear-gradient(135deg, rgba(139,92,246,0.08), rgba(34,211,238,0.04));
    border: 1px solid rgba(139,92,246,0.2);
    border-radius: 16px;
    padding: 32px;
    text-align: center;
  }
  .about-college h3 {
    font-family: 'Cinzel', serif;
    font-size: 1.3rem;
    font-weight: 900;
    margin: 0 0 8px;
    color: #f4f4f5;
  }
  .about-college p {
    font-size: 0.88rem;
    color: #71717a;
    line-height: 1.7;
    max-width: 600px;
    margin: 0 auto;
  }
  .about-college-link {
    display: inline-block;
    margin-top: 16px;
    padding: 10px 24px;
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    color: #fff;
    font-weight: 700;
    font-size: 0.85rem;
    border-radius: 10px;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .about-college-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(139,92,246,0.3);
  }

  /* Footer */
  .about-footer {
    text-align: center;
    padding: 2rem;
    border-top: 1px solid #1e1e28;
    color: #3f3f46;
    font-size: 0.75rem;
    letter-spacing: 0.08em;
  }

  @media (max-width: 640px) {
    .about-stats { flex-direction: column; }
    .about-stat { border-right: none; border-bottom: 1px solid #1e1e28; }
    .about-stat:last-child { border-bottom: none; }
    .about-hero { padding: 3rem 1.5rem 2rem; }
    .about-section { padding: 2rem 1.5rem; }
  }
`;

const AboutPage = ({ onClose }) => {
    return (
        <>
            <style>{styles}</style>
            <div className="about-root">
                {/* Top bar */}
                <div className="about-topbar">
                    <div className="about-logo">FESTI<span>VERSE</span></div>
                    <button className="about-back" onClick={onClose}>← Back to Site</button>
                </div>

                {/* Hero */}
                <div className="about-hero">
                    <div className="about-hero-eyebrow">About Us</div>
                    <h1>UDAAN Cultural Club</h1>
                    <p>
                        The heartbeat of GEC Samastipur's cultural life. UDAAN brings together
                        artists, performers, thinkers, and creators under one roof — nurturing talent
                        and building a vibrant community.
                    </p>
                </div>

                {/* Stats */}
                <div className="about-section">
                    <ScrollReveal>
                        <div className="about-stats">
                            <div className="about-stat">
                                <div className="about-stat-val">5</div>
                                <div className="about-stat-lbl">Societies</div>
                            </div>
                            <div className="about-stat">
                                <div className="about-stat-val">50+</div>
                                <div className="about-stat-lbl">Members</div>
                            </div>
                            <div className="about-stat">
                                <div className="about-stat-val">20+</div>
                                <div className="about-stat-lbl">Events / Year</div>
                            </div>
                            <div className="about-stat">
                                <div className="about-stat-val">1st</div>
                                <div className="about-stat-lbl">Edition 2026</div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Societies */}
                <div className="about-section">
                    <ScrollReveal>
                        <div className="about-section-title">Our Societies</div>
                    </ScrollReveal>
                    <div className="about-grid">
                        {[
                            { icon: '🎨', title: 'Fine & Art Society', desc: 'Painting, sketching, sculpture, and all forms of visual expression.' },
                            { icon: '🎵', title: 'Music & Dance Society', desc: 'Classical, contemporary, folk — from solo performances to grand ensembles.' },
                            { icon: '🎭', title: 'Acting & Drama Society', desc: 'Theatre, street plays, mime, and the art of storytelling on stage.' },
                            { icon: '📚', title: 'Literature & Debate Society', desc: 'Poetry, prose, debates, quizzes, and the power of the written word.' },
                            { icon: '🌍', title: 'Social Awareness Society', desc: 'Drives, campaigns, and events that create impact beyond the campus.' },
                        ].map((s, i) => (
                            <ScrollReveal key={i} delay={i * 80}>
                                <div className="about-card">
                                    <span className="about-card-icon">{s.icon}</span>
                                    <h3>{s.title}</h3>
                                    <p>{s.desc}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>

                {/* Vision & Mission */}
                <div className="about-section">
                    <ScrollReveal>
                        <div className="about-section-title">Our Vision</div>
                    </ScrollReveal>
                    <div className="about-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        <ScrollReveal>
                            <div className="about-card">
                                <span className="about-card-icon">🚀</span>
                                <h3>Mission</h3>
                                <p>To provide a platform for every student to discover, develop, and showcase their
                                    creative talents — regardless of background or experience.</p>
                            </div>
                        </ScrollReveal>
                        <ScrollReveal delay={100}>
                            <div className="about-card">
                                <span className="about-card-icon">🌟</span>
                                <h3>Vision</h3>
                                <p>To build GEC Samastipur's most vibrant cultural ecosystem where art, creativity,
                                    and innovation thrive alongside academics.</p>
                            </div>
                        </ScrollReveal>
                    </div>
                </div>

                {/* Timeline */}
                <div className="about-section">
                    <ScrollReveal>
                        <div className="about-section-title">Journey</div>
                    </ScrollReveal>
                    <ScrollReveal>
                        <div className="about-timeline">
                            <div className="about-tl-item">
                                <div className="about-tl-year">2024</div>
                                <div className="about-tl-text">UDAAN Cultural Club was founded with a vision to unite students through arts and culture.</div>
                            </div>
                            <div className="about-tl-item">
                                <div className="about-tl-year">2025</div>
                                <div className="about-tl-text">Five dedicated societies formed. Regular workshops, open mics, and inter-college collaborations began.</div>
                            </div>
                            <div className="about-tl-item">
                                <div className="about-tl-year">2026</div>
                                <div className="about-tl-text">Festiverse'26 — the first-ever annual cultural fest — launched with 20+ events spanning music, dance, drama, art, and tech.</div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                {/* College */}
                <div className="about-section">
                    <ScrollReveal>
                        <div className="about-college">
                            <h3>Government Engineering College, Samastipur</h3>
                            <p>
                                Established under the Government of Bihar, GEC Samastipur is committed to
                                engineering excellence, innovation, and holistic student development.
                                UDAAN is the cultural pillar of the college — fostering creativity alongside academics.
                            </p>
                            <a href="https://www.gecsamastipur.ac.in/" target="_blank" rel="noopener noreferrer"
                                className="about-college-link">
                                Visit College Website →
                            </a>
                        </div>
                    </ScrollReveal>
                </div>

                {/* Footer */}
                <div className="about-footer">
                    © 2026 UDAAN × FESTIVERSE · GEC Samastipur
                </div>
            </div>
        </>
    );
};

export default AboutPage;
