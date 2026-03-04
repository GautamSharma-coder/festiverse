import React, { useState, useEffect, useCallback } from 'react';

/**
 * Toast notification system.
 * Usage:
 *   <Toast ref={toastRef} />
 *   toastRef.current.show('Message', 'success' | 'error' | 'info')
 *
 * Or use the hook: const { ToastContainer, showToast } = useToast();
 */

// ── Standalone Toast Component ──
const ToastItem = ({ message, type, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(onRemove, 4000);
        return () => clearTimeout(timer);
    }, [onRemove]);

    const colors = {
        success: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', text: '#86efac', icon: '✓' },
        error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#fca5a5', icon: '✗' },
        info: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)', text: '#93c5fd', icon: 'ℹ' },
        warning: { bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)', text: '#fde68a', icon: '⚠' },
    };

    const c = colors[type] || colors.info;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            background: c.bg,
            border: `1px solid ${c.border}`,
            borderRadius: '10px',
            color: c.text,
            fontSize: '0.85rem',
            fontWeight: 500,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'toastSlideIn 0.3s ease',
            cursor: 'pointer',
            maxWidth: '380px',
            width: '100%',
        }}
            onClick={onRemove}
        >
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{c.icon}</span>
            <span style={{ flex: 1 }}>{message}</span>
            <span style={{ opacity: 0.5, fontSize: '0.75rem', flexShrink: 0 }}>✕</span>
        </div>
    );
};

// ── Toast Container + Hook ──
export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const ToastContainer = () => (
        <>
            <style>{`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateY(-12px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
            <div style={{
                position: 'fixed',
                top: '5.5rem',
                right: '1rem',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                pointerEvents: 'none',
            }}>
                <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {toasts.map(t => (
                        <ToastItem key={t.id} message={t.message} type={t.type} onRemove={() => removeToast(t.id)} />
                    ))}
                </div>
            </div>
        </>
    );

    return { ToastContainer, showToast };
}

export default useToast;
