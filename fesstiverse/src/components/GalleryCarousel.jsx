import React, { useRef, useEffect, useCallback, useState } from 'react';
import { proxyImageUrl } from '../lib/proxyImage';
import { apiFetchCached } from '../lib/api';

const AUTO_PLAY_SPEED = 3000;

const GalleryCarousel = () => {
    const trackRef = useRef(null);
    const currentAngleRef = useRef(0);
    const autoPlayRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const touchStartXRef = useRef(null);
    const touchStartYRef = useRef(null);

    const [images, setImages] = useState([]);
    const [cardWidth, setCardWidth] = useState(260);

    // Responsive card width based on viewport
    useEffect(() => {
        const updateCardWidth = () => {
            const vw = window.innerWidth;
            if (vw < 400) setCardWidth(140);
            else if (vw < 600) setCardWidth(180);
            else if (vw < 900) setCardWidth(220);
            else setCardWidth(260);
        };
        updateCardWidth();
        window.addEventListener('resize', updateCardWidth);
        return () => window.removeEventListener('resize', updateCardWidth);
    }, []);

    useEffect(() => {
        const loadImages = async () => {
            try {
                const res = await apiFetchCached('/api/gallery');
                if (res.images && res.images.length > 0) {
                    setImages(res.images.slice(0, 20));
                }
            } catch (err) {
                console.error('Error fetching gallery images:', err);
            }
        };
        loadImages();
    }, []);

    const numItems = Math.max(images.length, 1);
    const angle = 360 / numItems;

    // Scale down card width further when there are many images
    const effectiveCardWidth = numItems > 10
        ? Math.max(Math.floor(cardWidth * (10 / numItems)), 100)
        : cardWidth;

    const cardHeight = Math.round(effectiveCardWidth * (340 / 260));

    const radius = Math.max(
        Math.round((effectiveCardWidth / 2) / Math.tan(Math.PI / numItems)) + 40,
        180
    );

    const rotateCarousel = useCallback((direction = -1, smooth = true) => {
        const track = trackRef.current;
        if (!track || images.length <= 1) return;
        track.style.transition = smooth ? 'transform 1s ease-out' : 'none';
        currentAngleRef.current += angle * direction;
        track.style.transform = `rotateY(${currentAngleRef.current}deg)`;
    }, [angle, images.length]);

    const startAutoPlay = useCallback(() => {
        if (images.length <= 1) return;
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = setInterval(() => rotateCarousel(-1, true), AUTO_PLAY_SPEED);
    }, [rotateCarousel, images.length]);

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

    // Desktop scroll
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        if (images.length <= 1) return;
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
    }, [stopAutoPlay, startAutoPlay, images.length]);

    // Touch swipe
    const handleTouchStart = useCallback((e) => {
        touchStartXRef.current = e.touches[0].clientX;
        touchStartYRef.current = e.touches[0].clientY;
        stopAutoPlay();
    }, [stopAutoPlay]);

    const handleTouchMove = useCallback((e) => {
        if (touchStartXRef.current === null || images.length <= 1) return;
        const dx = e.touches[0].clientX - touchStartXRef.current;
        const dy = e.touches[0].clientY - touchStartYRef.current;
        // Only handle horizontal swipes; let vertical scroll pass through
        if (Math.abs(dx) < Math.abs(dy)) return;
        e.preventDefault();
        const track = trackRef.current;
        if (!track) return;
        track.style.transition = 'none';
        currentAngleRef.current += dx * 0.3;
        track.style.transform = `rotateY(${currentAngleRef.current}deg)`;
        touchStartXRef.current = e.touches[0].clientX;
        touchStartYRef.current = e.touches[0].clientY;
    }, [images.length]);

    const handleTouchEnd = useCallback(() => {
        touchStartXRef.current = null;
        touchStartYRef.current = null;
        if (trackRef.current) {
            trackRef.current.style.transition = 'transform 1s ease-out';
        }
        startAutoPlay();
    }, [startAutoPlay]);

    useEffect(() => {
        const container = trackRef.current?.parentElement;
        if (!container) return;
        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        return () => {
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('touchmove', handleTouchMove);
        };
    }, [handleWheel, handleTouchMove]);

    if (images.length === 0) {
        return (
            <section style={{ padding: '5rem 0', textAlign: 'center' }}>
                <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
                    <h2 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.875rem)', fontWeight: 500, color: '#e4e4e7' }}>
                        Gallery Perspectives
                    </h2>
                    <p style={{ color: '#71717a', fontSize: '0.875rem', marginTop: '1rem' }}>No images to display yet.</p>
                </div>
            </section>
        );
    }

    const cards = images.map((img, i) => (
        <div
            key={img.id || i}
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                border: '1px solid rgba(63, 63, 70, 0.5)',
                transform: images.length > 1
                    ? `rotateY(${i * angle}deg) translateZ(${radius}px)`
                    : 'none',
                backfaceVisibility: 'hidden',
            }}
        >
            <img
                src={proxyImageUrl(img.url)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                alt={img.title || 'Gallery Art'}
            />
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent, transparent)',
                pointerEvents: 'none',
            }} />
        </div>
    ));

    return (
        <section style={{ padding: '3rem 0', overflow: 'hidden', position: 'relative' }}>
            <div style={{
                maxWidth: '80rem',
                margin: '0 auto',
                padding: '0 1rem',
                marginBottom: '2.5rem',
                textAlign: 'center',
            }}>
                <h2 style={{
                    fontSize: 'clamp(1.25rem, 4vw, 1.875rem)',
                    fontWeight: 500,
                    color: '#e4e4e7',
                }}>
                    Gallery Perspectives
                </h2>
                {images.length > 1 && (
                    <p style={{ color: '#71717a', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                        Swipe or scroll to rotate
                    </p>
                )}
            </div>

            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: `${cardHeight + 80}px`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    perspective: '1000px',
                    cursor: images.length > 1 ? 'grab' : 'default',
                    touchAction: 'pan-y',
                }}
                onMouseEnter={stopAutoPlay}
                onMouseLeave={startAutoPlay}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    ref={trackRef}
                    style={{
                        position: 'relative',
                        width: `${effectiveCardWidth}px`,
                        height: `${cardHeight}px`,
                        transformStyle: 'preserve-3d',
                        transition: 'transform 1s ease-out',
                    }}
                >
                    {cards}
                </div>
            </div>
        </section>
    );
};

export default GalleryCarousel;
