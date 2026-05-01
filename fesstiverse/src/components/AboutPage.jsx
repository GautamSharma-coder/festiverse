import { useEffect, useRef, useState } from "react";

const PILLARS = [
  {
    number: "01",
    title: "Visual Arts",
    desc: "Photography, illustration, digital design — expression through image.",
    icon: "◈",
  },
  {
    number: "02",
    title: "Performing Arts",
    desc: "Theatre, dance, spoken word — the body as instrument.",
    icon: "◉",
  },
  {
    number: "03",
    title: "Music",
    desc: "Composition, vocals, live sets — sound that moves crowds.",
    icon: "◎",
  },
  {
    number: "04",
    title: "Literary Arts",
    desc: "Poetry, storytelling, debate — the power of the written word.",
    icon: "◇",
  },
  {
    number: "05",
    title: "Film & Media",
    desc: "Direction, editing, cinematography — stories on screen.",
    icon: "◻",
  },
  {
    number: "06",
    title: "Design & Tech",
    desc: "Web, UI/UX, branding — where art meets engineering.",
    icon: "◆",
  },
];

const TEAM = [
  { name: "Aryan Mishra", role: "President", initials: "AM" },
  { name: "Priya Kumari", role: "Vice President", initials: "PK" },
  { name: "Rohan Dev", role: "Creative Director", initials: "RD" },
  { name: "Sneha Jha", role: "Events Head", initials: "SJ" },
  { name: "Kartik Singh", role: "Tech Lead", initials: "KS" },
  { name: "Aisha Rao", role: "PR & Outreach", initials: "AR" },
];

const STATS = [
  { value: "500+", label: "Active Members" },
  { value: "6", label: "Art Domains" },
  { value: "12+", label: "Events / Year" },
  { value: "2019", label: "Founded" },
];

function GrainOverlay() {
  return (
    <svg
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 99,
        opacity: 0.035,
      }}
    >
      <filter id="noise">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.9"
          numOctaves="4"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

function useIntersect(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, visible] = useIntersect();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function UdaanAbout() {
  const [hoveredPillar, setHoveredPillar] = useState(null);
  const [hoveredMember, setHoveredMember] = useState(null);

  const styles = {
    root: {
      background: "#07070F",
      color: "#E8E4DC",
      fontFamily: "'Syne', sans-serif",
      minHeight: "100vh",
      overflowX: "hidden",
    },

    // ── HERO ──────────────────────────────────────────────
    hero: {
      position: "relative",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-end",
      padding: "0 5vw 8vh",
      borderBottom: "1px solid rgba(255,106,26,0.2)",
    },
    heroGrid: {
      position: "absolute",
      inset: 0,
      backgroundImage:
        "linear-gradient(rgba(255,106,26,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,106,26,0.04) 1px, transparent 1px)",
      backgroundSize: "80px 80px",
      pointerEvents: "none",
    },
    heroGlow: {
      position: "absolute",
      top: "-10%",
      right: "-5%",
      width: "55vw",
      height: "70vh",
      background:
        "radial-gradient(ellipse at center, rgba(255,106,26,0.07) 0%, transparent 65%)",
      pointerEvents: "none",
    },
    heroTag: {
      fontSize: "11px",
      letterSpacing: "0.3em",
      color: "#FF6A1A",
      textTransform: "uppercase",
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    heroTagLine: {
      width: "32px",
      height: "1px",
      background: "#FF6A1A",
    },
    heroTitle: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(72px, 14vw, 180px)",
      lineHeight: "0.9",
      margin: "0 0 28px",
      letterSpacing: "-0.02em",
      color: "#FFFFFF",
    },
    heroTitleAccent: {
      color: "#FF6A1A",
      display: "block",
    },
    heroMeta: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "24px",
    },
    heroDesc: {
      fontSize: "clamp(14px, 1.6vw, 17px)",
      lineHeight: "1.7",
      maxWidth: "480px",
      color: "#9A9490",
    },
    scrollHint: {
      fontSize: "11px",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "#4A4642",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "8px",
    },
    scrollLine: {
      width: "1px",
      height: "48px",
      background: "linear-gradient(to bottom, #FF6A1A, transparent)",
      animation: "scrollPulse 2s ease-in-out infinite",
    },

    // ── STATS ──────────────────────────────────────────────
    statsStrip: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    statCell: {
      padding: "40px 5vw",
      borderRight: "1px solid rgba(255,255,255,0.06)",
    },
    statValue: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(36px, 5vw, 64px)",
      color: "#FF6A1A",
      lineHeight: 1,
      marginBottom: "6px",
    },
    statLabel: {
      fontSize: "12px",
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      color: "#555250",
    },

    // ── SECTION COMMON ─────────────────────────────────────
    section: {
      padding: "100px 5vw",
    },
    sectionHeader: {
      display: "flex",
      alignItems: "flex-start",
      gap: "32px",
      marginBottom: "64px",
    },
    sectionNum: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "11px",
      letterSpacing: "0.25em",
      color: "#FF6A1A",
      paddingTop: "4px",
    },
    sectionTitle: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(36px, 6vw, 76px)",
      lineHeight: "0.95",
      color: "#FFFFFF",
      margin: 0,
    },

    // ── MANIFESTO ──────────────────────────────────────────
    manifestoLayout: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "5vw",
      alignItems: "start",
    },
    manifestoBody: {
      fontSize: "clamp(15px, 1.5vw, 17px)",
      lineHeight: "1.8",
      color: "#7A7672",
    },
    manifestoQuote: {
      borderLeft: "2px solid #FF6A1A",
      paddingLeft: "28px",
      margin: "32px 0",
    },
    manifestoQuoteText: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(22px, 3vw, 38px)",
      lineHeight: "1.15",
      color: "#E8E4DC",
      fontStyle: "normal",
    },
    festTag: {
      display: "inline-block",
      padding: "6px 16px",
      border: "1px solid rgba(255,106,26,0.4)",
      fontSize: "11px",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      color: "#FF6A1A",
      borderRadius: "2px",
      marginBottom: "20px",
    },
    festCard: {
      background: "rgba(255,106,26,0.04)",
      border: "1px solid rgba(255,106,26,0.12)",
      borderRadius: "4px",
      padding: "32px",
    },
    festTitle: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(28px, 4vw, 52px)",
      color: "#FF6A1A",
      marginBottom: "12px",
      lineHeight: 1,
    },
    festDesc: {
      fontSize: "14px",
      lineHeight: "1.7",
      color: "#6A6662",
    },
    festHighlights: {
      marginTop: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    festHighlightItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "13px",
      color: "#8A8680",
    },
    festDot: {
      width: "4px",
      height: "4px",
      borderRadius: "50%",
      background: "#FF6A1A",
      flexShrink: 0,
    },

    // ── PILLARS ────────────────────────────────────────────
    pillarsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "1px",
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.06)",
    },
    pillarCell: (isHovered) => ({
      padding: "40px 32px",
      background: isHovered ? "rgba(255,106,26,0.06)" : "#07070F",
      transition: "background 0.3s ease",
      cursor: "default",
      position: "relative",
    }),
    pillarNum: {
      fontSize: "11px",
      letterSpacing: "0.2em",
      color: isHovered => isHovered ? "#FF6A1A" : "#2E2C28",
      marginBottom: "20px",
      transition: "color 0.3s ease",
    },
    pillarIcon: (isHovered) => ({
      fontSize: "22px",
      color: isHovered ? "#FF6A1A" : "#3A3832",
      marginBottom: "16px",
      display: "block",
      transition: "color 0.3s ease",
    }),
    pillarTitle: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(20px, 2vw, 28px)",
      color: "#E8E4DC",
      marginBottom: "10px",
      letterSpacing: "0.02em",
    },
    pillarDesc: {
      fontSize: "13px",
      lineHeight: "1.65",
      color: "#5A5652",
    },

    // ── TEAM ───────────────────────────────────────────────
    teamGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "24px",
    },
    memberCard: (isHovered) => ({
      padding: "28px",
      border: isHovered ? "1px solid rgba(255,106,26,0.3)" : "1px solid rgba(255,255,255,0.06)",
      borderRadius: "4px",
      transition: "border-color 0.3s ease, transform 0.3s ease",
      transform: isHovered ? "translateY(-4px)" : "translateY(0)",
      cursor: "default",
    }),
    memberAvatar: {
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      background: "rgba(255,106,26,0.12)",
      border: "1px solid rgba(255,106,26,0.25)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "15px",
      letterSpacing: "0.05em",
      color: "#FF6A1A",
      marginBottom: "16px",
    },
    memberName: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "20px",
      color: "#E8E4DC",
      letterSpacing: "0.03em",
      marginBottom: "4px",
    },
    memberRole: {
      fontSize: "12px",
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      color: "#5A5652",
    },

    // ── CTA ────────────────────────────────────────────────
    ctaSection: {
      padding: "120px 5vw",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      position: "relative",
    },
    ctaGlow: {
      position: "absolute",
      bottom: "0",
      left: "50%",
      transform: "translateX(-50%)",
      width: "60vw",
      height: "50vh",
      background:
        "radial-gradient(ellipse at center bottom, rgba(255,106,26,0.08) 0%, transparent 65%)",
      pointerEvents: "none",
    },
    ctaLabel: {
      fontSize: "11px",
      letterSpacing: "0.3em",
      textTransform: "uppercase",
      color: "#FF6A1A",
      marginBottom: "24px",
    },
    ctaTitle: {
      fontFamily: "'Bebas Neue', sans-serif",
      fontSize: "clamp(48px, 10vw, 120px)",
      lineHeight: "0.9",
      color: "#FFFFFF",
      margin: "0 0 40px",
      maxWidth: "900px",
    },
    ctaButtons: {
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    ctaPrimary: {
      padding: "14px 36px",
      background: "#FF6A1A",
      color: "#07070F",
      fontFamily: "'Syne', sans-serif",
      fontWeight: 700,
      fontSize: "13px",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      border: "none",
      cursor: "pointer",
      borderRadius: "2px",
      transition: "opacity 0.2s",
    },
    ctaSecondary: {
      padding: "14px 36px",
      background: "transparent",
      color: "#E8E4DC",
      fontFamily: "'Syne', sans-serif",
      fontWeight: 600,
      fontSize: "13px",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      border: "1px solid rgba(255,255,255,0.15)",
      cursor: "pointer",
      borderRadius: "2px",
      transition: "border-color 0.2s",
    },

    divider: {
      height: "1px",
      background: "rgba(255,255,255,0.06)",
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        ::selection { background: rgba(255,106,26,0.25); }
        @media (max-width: 768px) {
          .stats-strip { grid-template-columns: repeat(2, 1fr) !important; }
          .pillars-grid { grid-template-columns: 1fr 1fr !important; }
          .team-grid { grid-template-columns: 1fr 1fr !important; }
          .manifesto-layout { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 500px) {
          .pillars-grid { grid-template-columns: 1fr !important; }
          .team-grid { grid-template-columns: 1fr !important; }
          .stats-strip { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

      <div style={styles.root}>
        <GrainOverlay />

        {/* ── HERO ── */}
        <section style={styles.hero}>
          <div style={styles.heroGrid} />
          <div style={styles.heroGlow} />

          <div style={styles.heroTag}>
            <span style={styles.heroTagLine} />
            GEC Samastipur · Arts & Culture Club
          </div>

          <h1 style={styles.heroTitle}>
            We Are
            <span style={styles.heroTitleAccent}>UDAAN</span>
          </h1>

          <div style={styles.heroMeta}>
            <p style={styles.heroDesc}>
              A collective of artists, makers, performers and thinkers at GEC
              Samastipur — united by one belief: that creativity belongs in
              engineering too.
            </p>
            <div style={styles.scrollHint}>
              <div style={styles.scrollLine} />
              Scroll
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <div
          className="stats-strip"
          style={styles.statsStrip}
        >
          {STATS.map((s, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{ ...styles.statCell, borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* ── MANIFESTO ── */}
        <section style={styles.section}>
          <FadeIn>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>— 01</span>
              <h2 style={styles.sectionTitle}>
                Our<br />Manifesto
              </h2>
            </div>
          </FadeIn>

          <div className="manifesto-layout" style={styles.manifestoLayout}>
            <FadeIn delay={0.1}>
              <p style={styles.manifestoBody}>
                UDAAN was born from a simple frustration: that engineering
                college culture often leaves no room for art. We disagreed.
              </p>
              <br />
              <p style={styles.manifestoBody}>
                We believe that the same mind that debugs at 2am can write
                poetry at 3. That circuit boards and canvases aren't opposites —
                they're different frequencies of the same creative signal.
              </p>

              <blockquote style={styles.manifestoQuote}>
                <p style={styles.manifestoQuoteText}>
                  "Art is not a break<br />from engineering.<br />It is its<br />highest form."
                </p>
              </blockquote>

              <p style={styles.manifestoBody}>
                Since 2019, we've been building that culture — one event, one
                performance, one late-night rehearsal at a time.
              </p>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div>
                <span style={styles.festTag}>Flagship Event</span>
                <div style={styles.festCard}>
                  <div style={styles.festTitle}>FESTIVERSE '26</div>
                  <p style={styles.festDesc}>
                    Our annual cultural festival — the largest at GEC
                    Samastipur. Three days of performances, competitions,
                    installations and chaos. The moment everything we build
                    towards comes to life.
                  </p>
                  <div style={styles.festHighlights}>
                    {[
                      "3-day immersive cultural festival",
                      "20+ competitive events across art forms",
                      "Live performances & open-mic nights",
                      "Art installations & film screenings",
                      "Colleges from across Bihar participate",
                    ].map((h, i) => (
                      <div key={i} style={styles.festHighlightItem}>
                        <div style={styles.festDot} />
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <div style={styles.divider} />

        {/* ── COLLEGE FOUNDATION ── */}
        <section style={styles.section}>
          <FadeIn>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>— 02</span>
              <h2 style={styles.sectionTitle}>
                Our<br />Foundation
              </h2>
            </div>
          </FadeIn>

          <div className="manifesto-layout" style={styles.manifestoLayout}>
            <FadeIn delay={0.1}>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <img 
                  src="/college_logo.webp" 
                  alt="GEC Samastipur Logo" 
                  style={{ width: '100%', height: 'auto', display: 'block', opacity: 0.8 }} 
                />
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div style={{ paddingTop: '20px' }}>
                <span style={{ ...styles.festTag, borderColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' }}>GEC Samastipur</span>
                <h3 style={{ ...styles.festTitle, color: '#FFFFFF', fontSize: 'clamp(24px, 3vw, 42px)' }}>Government Engineering College (GEC)</h3>
                <p style={styles.manifestoBody}>
                  UDAAN is the official Arts and Cultural Club of <strong>Government Engineering College (GEC), Samastipur</strong>. 
                  Our college provides the canvas upon which we paint our visions. Under the visionary guidance of our administration, 
                  we have grown from a small group of enthusiasts to a vibrant community of over 500 active members.
                </p>
                <br />
                <p style={styles.manifestoBody}>
                  GEC Samastipur stands as a beacon of technical excellence in Bihar, and its unwavering support for the arts ensures 
                  that its students graduate as well-rounded individuals ready to lead with both logic and heart.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        <div style={styles.divider} />

        {/* ── PILLARS ── */}
        <section style={styles.section}>
          <FadeIn>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>— 03</span>
              <h2 style={styles.sectionTitle}>
                What We<br />Do
              </h2>
            </div>
          </FadeIn>

          <div
            className="pillars-grid"
            style={styles.pillarsGrid}
          >
            {PILLARS.map((p, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div
                  style={styles.pillarCell(hoveredPillar === i)}
                  onMouseEnter={() => setHoveredPillar(i)}
                  onMouseLeave={() => setHoveredPillar(null)}
                >
                  <div style={{ fontSize: "11px", letterSpacing: "0.2em", color: hoveredPillar === i ? "#FF6A1A" : "#2E2C28", marginBottom: "20px", transition: "color 0.3s ease" }}>
                    {p.number}
                  </div>
                  <span style={styles.pillarIcon(hoveredPillar === i)}>
                    {p.icon}
                  </span>
                  <div style={styles.pillarTitle}>{p.title}</div>
                  <p style={styles.pillarDesc}>{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <div style={styles.divider} />

        {/* ── TEAM ── */}
        <section style={styles.section}>
          <FadeIn>
            <div style={styles.sectionHeader}>
              <span style={styles.sectionNum}>— 04</span>
              <h2 style={styles.sectionTitle}>
                Core<br />Team
              </h2>
            </div>
          </FadeIn>

          <div
            className="team-grid"
            style={styles.teamGrid}
          >
            {TEAM.map((m, i) => (
              <FadeIn key={i} delay={i * 0.07}>
                <div
                  style={styles.memberCard(hoveredMember === i)}
                  onMouseEnter={() => setHoveredMember(i)}
                  onMouseLeave={() => setHoveredMember(null)}
                >
                  <div style={styles.memberAvatar}>{m.initials}</div>
                  <div style={styles.memberName}>{m.name}</div>
                  <div style={styles.memberRole}>{m.role}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={styles.ctaSection}>
          <div style={styles.ctaGlow} />
          <FadeIn>
            <p style={styles.ctaLabel}>Join the movement</p>
            <h2 style={styles.ctaTitle}>
              Ready to
              <br />
              Take Flight?
            </h2>
            <div style={styles.ctaButtons}>
              <button style={styles.ctaPrimary}>
                Apply to UDAAN
              </button>
              <button style={styles.ctaSecondary}>
                Know More
              </button>
            </div>
          </FadeIn>
        </section>
      </div>
    </>
  );
}