import React, { useState, useEffect } from 'react';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Debugging: Log when the component mounts
    console.log('[PWA] Install Prompt UI Component Mounted. Waiting for browser to fire beforeinstallprompt event...');

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA] 🚀 Browser fired beforeinstallprompt event! PWA is installable.');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If the app is already installed, or we install it, hide the prompt
    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);

    // Hide our custom UI if they accepted
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        .pwa-prompt-overlay {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 10000;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .pwa-prompt-card {
          background: rgba(24, 24, 27, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
          max-width: 360px;
        }

        .pwa-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .pwa-content {
          flex: 1;
        }

        .pwa-title {
          color: #fff;
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0 0 2px 0;
          font-family: 'Inter', sans-serif;
        }

        .pwa-desc {
          color: #a1a1aa;
          font-size: 0.8rem;
          margin: 0;
          font-family: 'Inter', sans-serif;
          line-height: 1.4;
        }

        .pwa-actions {
          display: flex;
          gap: 8px;
        }

        .pwa-btn-install {
          background: #fff;
          color: #000;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .pwa-btn-install:active {
          transform: scale(0.95);
        }

        .pwa-btn-close {
          background: transparent;
          color: #a1a1aa;
          border: none;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: background 0.2s, color 0.2s;
        }

        .pwa-btn-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }

        @media (max-width: 640px) {
          .pwa-prompt-overlay {
            bottom: 24px;
            right: 16px;
            left: 16px;
          }
          .pwa-prompt-card {
            max-width: 100%;
          }
        }
      `}</style>
      <div className="pwa-prompt-overlay">
        <div className="pwa-prompt-card">
          <img src="/udaan.png" alt="UDAAN App Icon" className="pwa-icon" />
          <div className="pwa-content">
            <h4 className="pwa-title">Install Festiverse App</h4>
            <p className="pwa-desc">Get a better, faster, full-screen experience.</p>
          </div>
          <div className="pwa-actions">
            <button onClick={handleInstallClick} className="pwa-btn-install">
              Install
            </button>
            <button onClick={handleClose} className="pwa-btn-close" aria-label="Close">
              ×
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PWAInstallPrompt;
