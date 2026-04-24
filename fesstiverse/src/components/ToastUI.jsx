import React, { useEffect, useState } from 'react';

// ── Standalone Toast Component ──
export const ToastItem = ({ message, type, onRemove }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(onRemove, 300);
        }, 3700);
        return () => clearTimeout(timer);
    }, [onRemove]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(onRemove, 300);
    };

    const colors = {
        success: {
            bg: 'rgba(34,197,94,0.15)',
            border: 'rgba(34,197,94,0.25)',
            accent: '#22c55e',
            text: '#dcfce7',
            icon: '✓',
        },
        error: {
            bg: 'rgba(239,68,68,0.15)',
            border: 'rgba(239,68,68,0.25)',
            accent: '#ef4444',
            text: '#fee2e2',
            icon: '✕',
        },
        info: {
            bg: 'rgba(59,130,246,0.15)',
            border: 'rgba(59,130,246,0.25)',
            accent: '#3b82f6',
            text: '#dbeafe',
            icon: 'ℹ',
        },
        warning: {
            bg: 'rgba(234,179,8,0.15)',
            border: 'rgba(234,179,8,0.25)',
            accent: '#eab308',
            text: '#fef9c3',
            icon: '⚠',
        },
    };

    const c = colors[type] || colors.info;

    return (
        <div
            className={`toast-item ${isExiting ? 'toast-exit' : 'toast-enter'}`}
            onClick={handleDismiss}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderLeft: `4px solid ${c.accent}`,
                borderRadius: '14px',
                color: c.text,
                fontSize: '0.875rem',
                fontWeight: 500,
                lineHeight: 1.4,
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: `0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
                cursor: 'pointer',
                width: '100%',
                maxWidth: '100%',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
            }}
        >
            {/* Icon circle */}
            <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: `${c.accent}22`,
                border: `1px solid ${c.accent}44`,
                fontSize: '0.85rem',
                flexShrink: 0,
                color: c.accent,
            }}>
                {c.icon}
            </span>

            {/* Message */}
            <span style={{ flex: 1, wordBreak: 'break-word' }}>{message}</span>

            {/* Dismiss X */}
            <span style={{
                opacity: 0.4,
                fontSize: '0.7rem',
                flexShrink: 0,
                padding: '4px',
            }}>✕</span>

            {/* Progress bar */}
            {!isExiting && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '14px',
                    right: '14px',
                    height: '2px',
                    borderRadius: '2px',
                    overflow: 'hidden',
                }}>
                    <div className="toast-progress" style={{
                        height: '100%',
                        background: c.accent,
                        borderRadius: '2px',
                    }} />
                </div>
            )}
        </div>
    );
};

export const ToastContainerUI = ({ toasts, removeToast }) => (
    <>
        <style>{`
            /* ── Toast Animations ── */
            @keyframes toastSlideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @keyframes toastSlideDown {
                from {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translateY(20px) scale(0.92);
                }
            }

            @keyframes toastProgress {
                from { width: 100%; }
                to   { width: 0%; }
            }

            .toast-item {
                position: relative;
                overflow: hidden;
                transition: transform 0.15s ease;
            }

            .toast-item:active {
                transform: scale(0.97);
            }

            .toast-enter {
                animation: toastSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }

            .toast-exit {
                animation: toastSlideDown 0.3s cubic-bezier(0.7, 0, 1, 0.5) forwards;
            }

            .toast-progress {
                animation: toastProgress 3.7s linear forwards;
            }

            /* ── Toast Container ── */
            .toast-container {
                position: fixed;
                bottom: 1.5rem;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
                width: calc(100% - 2rem);
                max-width: 400px;
            }

            .toast-container > div {
                pointer-events: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            /* Desktop: top-right */
            @media (min-width: 769px) {
                .toast-container {
                    bottom: auto;
                    top: 5.5rem;
                    left: auto;
                    right: 1.25rem;
                    transform: none;
                    width: 380px;
                }

                .toast-enter {
                    animation-name: toastSlideInRight;
                }

                .toast-exit {
                    animation-name: toastSlideOutRight;
                }
            }

            @keyframes toastSlideInRight {
                from {
                    opacity: 0;
                    transform: translateX(30px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
            }

            @keyframes toastSlideOutRight {
                from {
                    opacity: 1;
                    transform: translateX(0) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translateX(30px) scale(0.92);
                }
            }
        `}</style>
        <div className="toast-container">
            <div>
                {toasts.map(t => (
                    <ToastItem
                        key={t.id}
                        message={t.message}
                        type={t.type}
                        onRemove={() => removeToast(t.id)}
                    />
                ))}
            </div>
        </div>
    </>
);
