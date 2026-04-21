import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScrollReveal } from './ScrollReveal';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;700&display=swap');

  .pt-root {
    min-height: 100vh;
    background: #080808;
    color: #f0f0f0;
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
  }

  /* Top Bar */
  .pt-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 2.5rem;
    background: rgba(8,8,8,0.8);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255,255,255,0.04);
  }
  .pt-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.35rem;
    letter-spacing: 0.12em;
    color: #f0f0f0;
  }
  .pt-logo span { color: #c0392b; }
  .pt-back {
    padding: 6px 16px;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 6px;
    background: none;
    color: #888;
    font-size: 0.78rem;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.2s;
    letter-spacing: 0.04em;
  }
  .pt-back:hover { border-color: #c0392b; color: #e74c3c; }

  /* Main layout */
  .pt-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 100vh;
    padding-top: 4.5rem;
    position: relative;
  }

  /* SVG wave background */
  .pt-wave-bg {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
  }

  /* Left: scattered portraits */
  .pt-left {
    position: relative;
    padding: 3rem 1rem 3rem 3rem;
    display: flex;
    align-items: center;
  }

  .pt-scatter {
    position: relative;
    width: 100%;
    height: 680px;
  }

  /* Portrait cards scattered */
  .pt-portrait {
    position: absolute;
    border-radius: 50%;
    overflow: hidden;
    background: #1a1a1a;
    border: 2px solid rgba(255,255,255,0.07);
    cursor: pointer;
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.3s;
    filter: grayscale(100%);
  }
  .pt-portrait:hover {
    transform: scale(1.06) !important;
    border-color: #c0392b;
    filter: grayscale(0%);
    z-index: 10;
  }
  .pt-portrait img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Tooltip on hover */
  .pt-portrait-tooltip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    background: #111;
    border: 1px solid rgba(192,57,43,0.4);
    border-radius: 8px;
    padding: 8px 14px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
    z-index: 20;
  }
  .pt-portrait:hover .pt-portrait-tooltip { opacity: 1; }
  .pt-portrait-tooltip h4 {
    font-size: 0.82rem;
    font-weight: 700;
    color: #f0f0f0;
    margin: 0 0 2px;
  }
  .pt-portrait-tooltip p {
    font-size: 0.72rem;
    color: #e74c3c;
    margin: 0;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  /* Right: editorial heading */
  .pt-right {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem 3rem 3rem 2rem;
  }

  .pt-year-badge {
    font-size: 0.85rem;
    letter-spacing: 0.12em;
    color: #555;
    margin-bottom: 1.5rem;
  }

  .pt-heading {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(4.5rem, 8vw, 7.5rem);
    line-height: 0.92;
    letter-spacing: 0.02em;
    color: #f0f0f0;
    margin: 0 0 2.5rem;
    text-transform: uppercase;
  }

  .pt-heading .accent { color: #c0392b; }

  .pt-desc {
    font-size: 0.9rem;
    color: #555;
    max-width: 340px;
    line-height: 1.75;
    margin-bottom: 3rem;
    border-left: 2px solid rgba(192,57,43,0.4);
    padding-left: 1rem;
  }

  /* Year tabs */
  .pt-tabs {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
  }
  .pt-tab {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem;
    letter-spacing: 0.1em;
    padding: 0.4rem 1.4rem;
    border-radius: 4px;
    border: 1px solid rgba(255,255,255,0.08);
    background: transparent;
    color: #444;
    cursor: pointer;
    transition: all 0.25s;
  }
  .pt-tab.active {
    background: #c0392b;
    border-color: #c0392b;
    color: #fff;
  }
  .pt-tab:hover:not(.active) {
    border-color: rgba(192,57,43,0.4);
    color: #aaa;
  }

  /* Count indicator */
  .pt-count {
    position: absolute;
    bottom: 3rem;
    right: 3rem;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: #444;
    letter-spacing: 0.04em;
    flex-direction: column;
  }
  .pt-count strong {
    font-size: 1.1rem;
    color: #c0392b;
    font-weight: 700;
    display: block;
    line-height: 1;
  }

  /* Bottom member list strip */
  .pt-strip {
    display: none;
  }

  /* Mobile */
  @media (max-width: 768px) {
    .pt-main {
      grid-template-columns: 1fr;
      padding-top: 4rem;
    }
    .pt-right {
      padding: 2rem 1.5rem 1rem;
    }
    .pt-heading {
      font-size: clamp(3.5rem, 14vw, 5.5rem);
    }
    .pt-left {
      padding: 1rem 1rem 2rem;
    }
    .pt-scatter {
      height: 420px;
    }
    .pt-count { display: none; }
  }
`;

/* Scatter positions for up to 8 members [top%, left%, size px] */
const POSITIONS = [
  [2, 2, 130],
  [22, 42, 110],
  [38, 3, 120],
  [55, 48, 130],
  [60, 8, 100],
  [72, 30, 115],
  [15, 68, 105],
  [82, 60, 100],
];

const teamsData = {
  '2K21': [
    { id: 1, name: 'Aman Kumar', role: 'Senior Coord.', category: 'Fine Arts', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aman' },
    { id: 2, name: 'Sneha Kumari', role: 'Senior Coord.', category: 'Literature', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sneha' },
    { id: 3, name: 'Rahul Raj', role: 'Coordinator', category: 'Music', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Rahul' },
    { id: 4, name: 'Priya Singh', role: 'Coordinator', category: 'Dance', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Priya' },
    { id: 5, name: 'Vikas Gupta', role: 'Sub Coordinator', category: 'Acting', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Vikas' },
    { id: 6, name: 'Anjali Sharma', role: 'Sub Coordinator', category: 'Social Awareness', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Anjali' },
  ],
  '2K20': [
    { id: 7, name: 'Sumit Verma', role: 'Senior Coord.', category: 'Fine Arts', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Sumit' },
    { id: 8, name: 'Kavita Kumari', role: 'Senior Coord.', category: 'Literature', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Kavita' },
    { id: 9, name: 'Rajesh Mishra', role: 'Coordinator', category: 'Music', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Rajesh' },
    { id: 10, name: 'Nehal Singh', role: 'Coordinator', category: 'Acting', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Nehal' },
  ],
  '2K19': [
    { id: 11, name: 'Deepak Pathak', role: 'Senior Coord.', category: 'Overall Incharge', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Deepak' },
    { id: 12, name: 'Ritu Raj', role: 'Senior Coord.', category: 'Fine Arts', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Ritu' },
    { id: 13, name: 'Aditya Narayan', role: 'Coordinator', category: 'Tech Lead', image: 'https://api.dicebear.com/7.x/notionists/svg?seed=Aditya' },
  ]
};

const WaveDecoration = () => (
  <svg
    viewBox="0 0 900 900"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }}
    preserveAspectRatio="xMidYMid slice"
  >
    {/* Multiple offset wave strands */}
    {[0, 6, 12, 18, 24, 30, 36, 42, 48].map((offset, i) => (
      <path
        key={i}
        d={`M ${-50 + offset} ${200 + offset * 3}
            C ${150 + offset} ${100 + offset * 2},
              ${300 + offset} ${450 + offset * 2},
              ${500 + offset} ${300 + offset * 2}
            S ${700 + offset} ${100 + offset * 2},
              ${950 + offset} ${350 + offset * 2}`}
        fill="none"
        stroke="#c0392b"
        strokeWidth="0.8"
        opacity={0.7 - i * 0.06}
      />
    ))}
    {[0, 5, 10, 15, 20, 25, 30, 35, 40].map((offset, i) => (
      <path
        key={'b' + i}
        d={`M ${-50 + offset} ${650 + offset * 2}
            C ${200 + offset} ${550 + offset * 1.5},
              ${380 + offset} ${800 + offset * 1.5},
              ${600 + offset} ${620 + offset * 1.5}
            S ${800 + offset} ${500 + offset * 1.5},
              ${980 + offset} ${700 + offset * 1.5}`}
        fill="none"
        stroke="#c0392b"
        strokeWidth="0.8"
        opacity={0.6 - i * 0.05}
      />
    ))}
  </svg>
);

const PreviousTeamsPage = () => {
  const [activeYear, setActiveYear] = useState('2K21');
  const navigate = useNavigate();

  const members = teamsData[activeYear] || [];
  const years = Object.keys(teamsData);

  return (
    <>
      <style>{styles}</style>
      <div className="pt-root">

        {/* Top Bar */}
        <div className="pt-topbar">
          <div className="pt-logo">UDAAN</div>
          <button className="pt-back" onClick={() => navigate('/')}>← Back</button>
        </div>

        {/* Main 2-col layout */}
        <div className="pt-main">

          {/* Wave decorations */}
          <div className="pt-wave-bg">
            <WaveDecoration />
          </div>

          {/* Left — scattered portraits */}
          <div className="pt-left">
            <div className="pt-scatter">
              {members.map((member, idx) => {
                const [top, left, size] = POSITIONS[idx % POSITIONS.length];
                return (
                  <div
                    key={member.id}
                    className="pt-portrait"
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      width: size,
                      height: size,
                    }}
                  >
                    <img src={member.image} alt={member.name} />
                    <div className="pt-portrait-tooltip">
                      <h4>{member.name}</h4>
                      <p>{member.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — editorial heading + tabs */}
          <div className="pt-right">
            <p className="pt-year-badge">UDAAN — GEC SAMASTIPUR</p>

            <h1 className="pt-heading">
              LEGACY<br />
              OF<br />
              <span className="accent">UDAAN</span>
            </h1>

            <p className="pt-desc">
              Honoring the brilliant minds and passionate souls who built
              the culture, ran the stages, and paved the way for Festiverse.
            </p>

            <div className="pt-tabs">
              {years.map(year => (
                <button
                  key={year}
                  className={`pt-tab ${activeYear === year ? 'active' : ''}`}
                  onClick={() => setActiveYear(year)}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Member count dot */}
            <div className="pt-count">
              <strong>{members.length}</strong>
              members
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default PreviousTeamsPage;