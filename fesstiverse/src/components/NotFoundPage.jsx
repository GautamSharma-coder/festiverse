import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: 1,
      }} />

      <h1 style={{
        fontSize: 'clamp(8rem, 20vw, 15rem)',
        fontWeight: 900,
        margin: 0,
        lineHeight: 1,
        color: 'rgba(255, 255, 255, 0.03)',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 0,
        userSelect: 'none'
      }}>
        404
      </h1>

      <div style={{ position: 'relative', zIndex: 2 }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: '#fff',
          marginBottom: '1rem',
          letterSpacing: '-0.02em'
        }}>
          Lost in the <span style={{ color: '#7c3aed' }}>Festiverse?</span>
        </h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '1.1rem',
          maxWidth: '500px',
          margin: '0 auto 2.5rem',
          lineHeight: '1.6'
        }}>
          The page you're looking for has drifted into deep space. Let's get you back to the main stage.
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            background: '#7c3aed',
            color: '#fff',
            border: 'none',
            padding: '1rem 2.5rem',
            borderRadius: '9999px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(124, 58, 237, 0.3)',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 15px rgba(124, 58, 237, 0.3)';
          }}
        >
          Return Home
        </button>
      </div>

      {/* Decorative Stars */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 3 + 'px',
            height: Math.random() * 3 + 'px',
            backgroundColor: '#fff',
            borderRadius: '50%',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            opacity: Math.random() * 0.5,
            animation: `pulse ${Math.random() * 3 + 2}s infinite`,
          }}
        />
      ))}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
