import React, { useRef, useEffect, useCallback } from 'react';

const NUM_ITEMS = 7;
const CARD_WIDTH = 260;
const AUTO_PLAY_SPEED = 3000;

const GalleryCarousel = () => {
    const trackRef = useRef(null);
    const currentAngleRef = useRef(0);
    const autoPlayRef = useRef(null);
    const scrollTimeoutRef = useRef(null);

    const angle = 360 / NUM_ITEMS;
    const radius = Math.round((CARD_WIDTH / 2) / Math.tan(Math.PI / NUM_ITEMS)) + 40;

    const rotateCarousel = useCallback((direction = -1, smooth = true) => {
        const track = trackRef.current;
        if (!track) return;
        track.style.transition = smooth ? 'transform 1s ease-out' : 'none';
        currentAngleRef.current += angle * direction;
        track.style.transform = `rotateY(${currentAngleRef.current}deg)`;
    }, [angle]);

    const startAutoPlay = useCallback(() => {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => rotateCarousel(-1, true), AUTO_PLAY_SPEED);
    }, [rotateCarousel]);

    const stopAutoPlay = useCallback(() => {
        clearInterval(autoPlayRef.current);
    }, []);

    useEffect(() => {
        startAutoPlay();
        return () => {
            clearInterval(autoPlayRef.current);
            clearTimeout(scrollTimeoutRef.current);
        };
    }, [startAutoPlay]);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        stopAutoPlay();

        const track = trackRef.current;
        if (!track) return;
        track.style.transition = 'none';
        currentAngleRef.current -= e.deltaY * 0.1;
        track.style.transform = `rotateY(${currentAngleRef.current}deg)`;

        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = setTimeout(() => {
            track.style.transition = 'transform 1s ease-out';
            startAutoPlay();
        }, 500);
    }, [stopAutoPlay, startAutoPlay]);

    useEffect(() => {
        const container = trackRef.current?.parentElement;
        if (!container) return;
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    const handleNext = () => { stopAutoPlay(); rotateCarousel(-1); startAutoPlay(); };
    const handlePrev = () => { stopAutoPlay(); rotateCarousel(1); startAutoPlay(); };

    const cards = Array.from({ length: NUM_ITEMS }, (_, i) => (
        <div
            key={i}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                border: '1px solid rgba(63, 63, 70, 0.5)',
                transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`,
                backfaceVisibility: 'hidden',
            }}
        >
            <img
                src={`https://picsum.photos/600/800?random=${i + 10}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                alt="Gallery Art"
            />
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent, transparent)',
                pointerEvents: 'none',
            }}></div>
        </div>
    ));

    return (
        <section style={{ padding: '5rem 0', overflow: 'hidden', position: 'relative' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem', marginBottom: '4rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 500, color: '#e4e4e7' }}>Gallery Perspectives</h2>
                <p style={{ color: '#71717a', fontSize: '0.875rem', marginTop: '0.5rem' }}>Scroll to rotate</p>
            </div>

            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '420px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    perspective: '1200px',
                    cursor: 'grab',
                }}
                onMouseEnter={stopAutoPlay}
                onMouseLeave={startAutoPlay}
            >
                <div
                    ref={trackRef}
                    style={{
                        position: 'relative',
                        width: `${CARD_WIDTH}px`,
                        height: '340px',
                        transformStyle: 'preserve-3d',
                        transition: 'transform 1s ease-out',
                    }}
                >
                    {cards}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
                <button
                    onClick={handlePrev}
                    style={{
                        padding: '0.5rem 1.5rem',
                        borderRadius: '9999px',
                        border: '1px solid #3f3f46',
                        color: '#d4d4d8',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                    }}
                >
                    ← Prev
                </button>
                <button
                    onClick={handleNext}
                    style={{
                        padding: '0.5rem 1.5rem',
                        borderRadius: '9999px',
                        border: '1px solid #3f3f46',
                        color: '#d4d4d8',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                    }}
                >
                    Next →
                </button>
            </div>
        </section>
    );
};

export default GalleryCarousel;
