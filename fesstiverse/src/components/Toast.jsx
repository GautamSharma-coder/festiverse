import React, { useState, useCallback } from 'react';
import { ToastContainerUI } from './ToastUI';

/**
 * Toast notification system.
 * Usage:
 *   const { ToastContainer, showToast } = useToast();
 *   ...
 *   <ToastContainer />
 */

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Memoize the container to avoid unnecessary re-renders of the component definition
    // Note: It's better to render <ToastContainerUI toasts={toasts} ... /> directly in App.jsx
    // but we keep this for backward compatibility with the user's current pattern.
    const ToastContainer = useCallback(() => (
        <ToastContainerUI toasts={toasts} removeToast={removeToast} />
    ), [toasts, removeToast]);

    return { ToastContainer, showToast };
}

export default useToast;

