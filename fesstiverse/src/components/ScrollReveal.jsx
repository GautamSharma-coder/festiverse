import { useEffect, useRef, useState } from 'react';

/**
 * Hook that triggers an animation when an element scrolls into view.
 * Returns a ref to attach to the element and whether it's visible.
 *
 * Usage:
 *   const { ref, isVisible } = useScrollReveal();
 *   <div ref={ref} className={isVisible ? 'reveal active' : 'reveal'}>
 */
export function useScrollReveal(options = {}) {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(el); // Animate only once
                }
            },
            { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || '0px' }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
}

/**
 * Wrapper component for scroll-reveal animations.
 * <ScrollReveal animation="fade-up" delay={100}> ... </ScrollReveal>
 */
export function ScrollReveal({ children, animation = 'fade-up', delay = 0, className = '', style = {} }) {
    const { ref, isVisible } = useScrollReveal();

    const animations = {
        'fade-up': { from: { opacity: 0, transform: 'translateY(30px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'fade-down': { from: { opacity: 0, transform: 'translateY(-30px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        'fade-left': { from: { opacity: 0, transform: 'translateX(-30px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        'fade-right': { from: { opacity: 0, transform: 'translateX(30px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        'zoom-in': { from: { opacity: 0, transform: 'scale(0.9)' }, to: { opacity: 1, transform: 'scale(1)' } },
        'fade': { from: { opacity: 0 }, to: { opacity: 1 } },
    };

    const anim = animations[animation] || animations['fade-up'];

    return (
        <div
            ref={ref}
            className={className}
            style={{
                ...style,
                ...(isVisible ? anim.to : anim.from),
                transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </div>
    );
}

export default ScrollReveal;
