import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


import img2k21_1 from '../assets/preMemb/2k21/img (1).webp';
import img2k21_2 from '../assets/preMemb/2k21/img (2).webp';
import img2k21_3 from '../assets/preMemb/2k21/img (3).webp';
import img2k21_4 from '../assets/preMemb/2k21/img (4).webp';
import img2k21_5 from '../assets/preMemb/2k21/img (5).webp';

import img2k20_1 from '../assets/preMemb/2k20/img1 (1).webp';
import img2k20_2 from '../assets/preMemb/2k20/img1 (2).webp';
import img2k20_3 from '../assets/preMemb/2k20/img1 (3).webp';
import img2k20_4 from '../assets/preMemb/2k20/img1 (4).webp';
import img2k20_5 from '../assets/preMemb/2k20/img1 (5).webp';
import img2k20_6 from '../assets/preMemb/2k20/img1 (6).webp';
import img2k20_7 from '../assets/preMemb/2k20/img1 (7).webp';
import img2k20_8 from '../assets/preMemb/2k20/img1 (8).webp';
import img2k20_9 from '../assets/preMemb/2k20/img1 (9).webp';
import img2k20_10 from '../assets/preMemb/2k20/img1 (10).webp';
import img2k20_11 from '../assets/preMemb/2k20/img1 (11).webp';
import img2k20_12 from '../assets/preMemb/2k20/img1 (12).webp';
import img2k20_13 from '../assets/preMemb/2k20/img1 (13).webp';
import img2k20_14 from '../assets/preMemb/2k20/img1 (14).webp';
import img2k20_15 from '../assets/preMemb/2k20/img1 (15).webp';
import img2k20_16 from '../assets/preMemb/2k20/img1 (16).webp';
import img2k20_17 from '../assets/preMemb/2k20/img1 (17).webp';
import img2k20_18 from '../assets/preMemb/2k20/img1 (18).webp';
import img2k20_19 from '../assets/preMemb/2k20/img1 (19).webp';
import img2k20_20 from '../assets/preMemb/2k20/img1 (20).webp';

import img2k19_1 from '../assets/preMemb/2k19/img (1).webp';
import img2k19_2 from '../assets/preMemb/2k19/img (2).webp';
import img2k19_3 from '../assets/preMemb/2k19/img (3).webp';
import img2k19_4 from '../assets/preMemb/2k19/img (4).webp';
import img2k19_5 from '../assets/preMemb/2k19/img (5).webp';
import img2k19_6 from '../assets/preMemb/2k19/img (6).webp';
import img2k19_7 from '../assets/preMemb/2k19/img (7).webp';
import img2k19_8 from '../assets/preMemb/2k19/img (8).webp';
import img2k19_9 from '../assets/preMemb/2k19/img (9).webp';
import img2k19_10 from '../assets/preMemb/2k19/img (10).webp';
import img2k19_11 from '../assets/preMemb/2k19/img (11).webp';
import img2k19_12 from '../assets/preMemb/2k19/img (12).webp';
import img2k19_13 from '../assets/preMemb/2k19/img (13).webp';
import img2k19_14 from '../assets/preMemb/2k19/img (14).webp';
import img2k19_15 from '../assets/preMemb/2k19/img (15).webp';
import img2k19_16 from '../assets/preMemb/2k19/img (16).webp';
import img2k19_17 from '../assets/preMemb/2k19/img (17).webp';
import img2k19_18 from '../assets/preMemb/2k19/img (18).webp';
import img2k19_19 from '../assets/preMemb/2k19/img (19).webp';

const POSITIONS = [
  [2, 2, 130], [22, 42, 110], [38, 3, 120], [55, 48, 130],
  [60, 8, 100], [72, 30, 115], [15, 68, 105], [82, 60, 100],
  [5, 30, 110], [45, 25, 95], [10, 50, 120], [30, 75, 105],
  [65, 75, 110], [85, 10, 115], [18, 15, 100], [50, 5, 125],
  [75, 50, 105], [40, 60, 110], [12, 85, 100], [58, 85, 115],
  [88, 35, 110], [28, 55, 105], [2, 70, 115], [92, 80, 100],
];

const teamsData = {
  '2K21': [
    { id: 1, name: 'Aman Kumar', role: 'Senior Coord.', category: 'Fine Arts', image: img2k21_1 },
    { id: 2, name: 'Sneha Kumari', role: 'Senior Coord.', category: 'Literature', image: img2k21_2 },
    { id: 3, name: 'Rahul Raj', role: 'Coordinator', category: 'Music', image: img2k21_3 },
    { id: 4, name: 'Priya Singh', role: 'Coordinator', category: 'Dance', image: img2k21_4 },
    { id: 5, name: 'Vikas Gupta', role: 'Sub Coordinator', category: 'Acting', image: img2k21_5 },
    { id: 6, name: 'Anjali Sharma', role: 'Sub Coordinator', category: 'Social Awareness', image: img2k21_1 },
  ],
  '2K20': [
    { id: 7, name: 'Sumit Verma', role: 'Senior Coord.', category: 'Fine Arts', image: img2k20_1 },
    { id: 8, name: 'Kavita Kumari', role: 'Senior Coord.', category: 'Literature', image: img2k20_2 },
    { id: 9, name: 'Rajesh Mishra', role: 'Coordinator', category: 'Music', image: img2k20_3 },
    { id: 10, name: 'Nehal Singh', role: 'Coordinator', category: 'Acting', image: img2k20_4 },
    { id: 11, name: 'Aditi Roy', role: 'Coordinator', category: 'Dance', image: img2k20_5 },
    { id: 12, name: 'Manish Jha', role: 'Coordinator', category: 'Literature', image: img2k20_6 },
    { id: 13, name: 'Pooja Singh', role: 'Sub Coord.', category: 'Music', image: img2k20_7 },
    { id: 14, name: 'Kunal Roy', role: 'Sub Coord.', category: 'Social', image: img2k20_8 },
    { id: 15, name: 'Sweta Pandey', role: 'Coordinator', category: 'Fine Arts', image: img2k20_9 },
    { id: 16, name: 'Vikram Singh', role: 'Coordinator', category: 'Tech', image: img2k20_10 },
    { id: 17, name: 'Neha Kumari', role: 'Sub Coord.', category: 'Drama', image: img2k20_11 },
    { id: 18, name: 'Rohan Gupta', role: 'Sub Coord.', category: 'Sports', image: img2k20_12 },
    { id: 19, name: 'Sonal Singh', role: 'Coordinator', category: 'Decoration', image: img2k20_13 },
    { id: 20, name: 'Deepak Kumar', role: 'Coordinator', category: 'Media', image: img2k20_14 },
    { id: 21, name: 'Anshika Raj', role: 'Sub Coord.', category: 'Hospitality', image: img2k20_15 },
    { id: 22, name: 'Saurabh Jha', role: 'Sub Coord.', category: 'Security', image: img2k20_16 },
    { id: 23, name: 'Komal Singh', role: 'Coordinator', category: 'Anchoring', image: img2k20_17 },
    { id: 24, name: 'Abhishek Roy', role: 'Coordinator', category: 'Photography', image: img2k20_18 },
    { id: 25, name: 'Shreya Roy', role: 'Sub Coord.', category: 'Web', image: img2k20_19 },
    { id: 26, name: 'Aryan Singh', role: 'Sub Coord.', category: 'Logistics', image: img2k20_20 },
  ],
  '2K19': [
    { id: 27, name: 'Deepak Pathak', role: 'Senior Coord.', category: 'Overall Incharge', image: img2k19_1 },
    { id: 28, name: 'Ritu Raj', role: 'Senior Coord.', category: 'Fine Arts', image: img2k19_2 },
    { id: 29, name: 'Aditya Narayan', role: 'Coordinator', category: 'Tech Lead', image: img2k19_3 },
    { id: 30, name: 'Sanjeev Kumar', role: 'Coordinator', category: 'Decoration', image: img2k19_4 },
    { id: 31, name: 'Anjali Gupta', role: 'Sub Coord.', category: 'Fine Arts', image: img2k19_5 },
    { id: 32, name: 'Rohan Verma', role: 'Sub Coord.', category: 'Music', image: img2k19_6 },
    { id: 33, name: 'Suman Roy', role: 'Coordinator', category: 'Dance', image: img2k19_7 },
    { id: 34, name: 'Amit Singh', role: 'Coordinator', category: 'Acting', image: img2k19_8 },
    { id: 35, name: 'Pooja Jha', role: 'Sub Coord.', category: 'Literature', image: img2k19_9 },
    { id: 36, name: 'Vikas Roy', role: 'Sub Coord.', category: 'Social', image: img2k19_10 },
    { id: 37, name: 'Kavita Mishra', role: 'Coordinator', category: 'Music', image: img2k19_11 },
    { id: 38, name: 'Sumit Raj', role: 'Coordinator', category: 'Tech', image: img2k19_12 },
    { id: 39, name: 'Neha Gupta', role: 'Sub Coord.', category: 'Drama', image: img2k19_13 },
    { id: 40, name: 'Rahul Pandey', role: 'Sub Coord.', category: 'Sports', image: img2k19_14 },
    { id: 41, name: 'Sonal Jha', role: 'Coordinator', category: 'Decoration', image: img2k19_15 },
    { id: 42, name: 'Deepak Roy', role: 'Coordinator', category: 'Media', image: img2k19_16 },
    { id: 43, name: 'Anshika Gupta', role: 'Sub Coord.', category: 'Hospitality', image: img2k19_17 },
    { id: 44, name: 'Saurabh Verma', role: 'Sub Coord.', category: 'Security', image: img2k19_18 },
    { id: 45, name: 'Komal Jha', role: 'Coordinator', category: 'Anchoring', image: img2k19_19 },
  ]
};



// import { ScrollReveal } from './ScrollReveal'; // Uncomment if used

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

  /* Portrait Wrapper to handle absolute positioning without clipping tooltip */
  .pt-portrait-wrapper {
    position: absolute;
    z-index: 1;
  }
  
  .pt-portrait-wrapper:hover {
    z-index: 10;
  }

  /* Portrait Image */
  .pt-portrait {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    background: #1a1a1a;
    border: 2px solid rgba(255,255,255,0.07);
    cursor: pointer;
    transition: transform 0.35s cubic-bezier(0.4,0,0.2,1), border-color 0.3s, filter 0.3s;
    filter: grayscale(100%);
  }
  
  .pt-portrait-wrapper:hover .pt-portrait {
    transform: scale(1.06);
    border-color: #c0392b;
    filter: grayscale(0%);
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
    bottom: calc(100% + 15px);
    left: 50%;
    transform: translateX(-50%);
    background: #111;
    border: 1px solid rgba(192,57,43,0.4);
    border-radius: 8px;
    padding: 8px 14px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s, bottom 0.2s;
    z-index: 20;
    text-align: center;
  }
  
  .pt-portrait-wrapper:hover .pt-portrait-tooltip { 
    opacity: 1; 
    bottom: calc(100% + 10px);
  }
  
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

  /* -------------------------------------------
     MOBILE ENHANCEMENTS
  ---------------------------------------------*/
  @media (max-width: 768px) {
    .pt-topbar {
      padding: 1rem 1.5rem;
    }
    
    .pt-main {
      display: flex;
      flex-direction: column;
      padding-top: 5rem;
    }
    
    /* Bring Text and Tabs to the Top */
    .pt-right {
      order: 1;
      padding: 2rem 1.5rem 1rem;
      text-align: center;
      align-items: center;
    }
    
    .pt-heading {
      font-size: clamp(3.5rem, 14vw, 5.5rem);
      margin-bottom: 1.5rem;
    }
    
    .pt-desc {
      border-left: none;
      border-top: 2px solid rgba(192,57,43,0.4);
      padding-left: 0;
      padding-top: 1.5rem;
      margin: 0 auto 2.5rem;
    }
    
    .pt-tabs {
      justify-content: center;
    }
    
    /* Portraits below text */
    .pt-left {
      order: 2;
      padding: 1rem 1rem 3rem;
    }
    
    /* Convert Scattered Layout to a clean Mobile Grid */
    .pt-scatter {
      height: auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
      gap: 1.5rem 1rem;
      justify-content: center;
      width: 100%;
    }
    
    /* Strip absolute positioning & resize for grid */
    .pt-portrait-wrapper {
      position: relative !important;
      top: auto !important;
      left: auto !important;
      width: 100% !important;
      height: auto !important;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .pt-portrait {
      width: 80px !important;
      height: 80px !important;
      filter: grayscale(0%); /* Always colorful on mobile since hover is disabled */
      margin-bottom: 0.5rem;
    }
    
    /* Make tooltips static labels under images on mobile */
    .pt-portrait-tooltip {
      position: static;
      transform: none;
      opacity: 1;
      background: transparent;
      border: none;
      padding: 0;
    }
    
    .pt-portrait-tooltip h4 {
      font-size: 0.75rem;
      white-space: normal;
      line-height: 1.2;
    }
    
    .pt-portrait-tooltip p {
      font-size: 0.65rem;
    }

    .pt-count { display: none; }
  }
`;

// [KEEP YOUR EXISTING IMPORTS AND DATA HERE]
// import img2k21_1 from '../assets/preMemb/2k21/img (1).png';
// ... etc ...
// const POSITIONS = [...];
// const teamsData = {...};

const WaveDecoration = () => (
  <svg
    viewBox="0 0 900 900"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }}
    preserveAspectRatio="xMidYMid slice"
  >
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

          {/* Left — scattered portraits (Desktop) / Grid (Mobile) */}
          <div className="pt-left">
            <div className="pt-scatter">
              {members.map((member, idx) => {
                const [top, left, size] = POSITIONS[idx % POSITIONS.length];
                return (
                  <div
                    key={member.id}
                    className="pt-portrait-wrapper"
                    style={{
                      top: `${top}%`,
                      left: `${left}%`,
                      width: size,
                      height: size,
                    }}
                  >
                    <div className="pt-portrait">
                      <img src={member.image} alt={member.name} />
                    </div>
                    <div className="pt-portrait-tooltip">
                      {/* <h4>{member.name}</h4> */}
                      {/* <p>{member.category}</p> */}
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

            {/* Member count dot (Hidden on mobile) */}
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