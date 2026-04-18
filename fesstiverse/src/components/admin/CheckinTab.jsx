import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const SCANNER_CSS = `
    .qr-scanner-wrap { position: relative; border-radius: 12px; overflow: hidden; background: #000; }
    .qr-scanner-wrap video { border-radius: 12px; }
    #qr-reader { width: 100%; }
    #qr-reader__scan_region { border-radius: 12px; overflow: hidden; }
    #qr-reader__dashboard { display: none !important; }

    .qr-overlay {
        position: absolute; inset: 0; pointer-events: none; z-index: 2;
        display: flex; align-items: center; justify-content: center;
    }
    .qr-frame {
        width: 220px; height: 220px; position: relative;
    }
    .qr-frame::before, .qr-frame::after,
    .qr-frame span::before, .qr-frame span::after {
        content: ''; position: absolute; width: 32px; height: 32px;
        border-color: #f97316; border-style: solid; border-width: 0;
    }
    .qr-frame::before { top: 0; left: 0; border-top-width: 3px; border-left-width: 3px; border-radius: 6px 0 0 0; }
    .qr-frame::after { top: 0; right: 0; border-top-width: 3px; border-right-width: 3px; border-radius: 0 6px 0 0; }
    .qr-frame span::before { bottom: 0; left: 0; border-bottom-width: 3px; border-left-width: 3px; border-radius: 0 0 0 6px; }
    .qr-frame span::after { bottom: 0; right: 0; border-bottom-width: 3px; border-right-width: 3px; border-radius: 0 0 6px 0; }

    .qr-scanline {
        position: absolute; left: 16px; right: 16px; height: 2px;
        background: linear-gradient(90deg, transparent, #f97316, transparent);
        animation: qrScan 2s ease-in-out infinite; box-shadow: 0 0 12px rgba(249,115,22,.5);
    }
    @keyframes qrScan { 0%,100% { top: 15%; } 50% { top: 85%; } }

    .qr-mode-tabs { display: flex; gap: 6px; margin-bottom: 16px; }
    .qr-mode-tab {
        flex: 1; padding: 10px; border-radius: 10px; border: 1px solid var(--border);
        background: var(--surface); color: var(--muted); font-family: var(--font-b);
        font-size: .82rem; font-weight: 600; cursor: pointer; transition: all .2s;
        display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .qr-mode-tab:hover { border-color: var(--muted2); color: var(--text); }
    .qr-mode-tab.active {
        background: rgba(249,115,22,.08); border-color: rgba(249,115,22,.3);
        color: var(--accent);
    }

    .qr-status {
        display: flex; align-items: center; gap: 8px; padding: 10px 14px;
        border-radius: 9px; font-size: .8rem; margin-top: 12px;
    }
    .qr-status.scanning {
        background: rgba(249,115,22,.06); border: 1px solid rgba(249,115,22,.15);
        color: var(--accent);
    }
    .qr-status.ready {
        background: rgba(34,197,94,.06); border: 1px solid rgba(34,197,94,.15);
        color: #86efac;
    }
    .qr-status.error {
        background: rgba(239,68,68,.06); border: 1px solid rgba(239,68,68,.15);
        color: #fca5a5;
    }

    .qr-history { margin-top: 20px; }
    .qr-history-item {
        display: flex; align-items: center; gap: 12px;
        padding: 10px 14px; border-bottom: 1px solid var(--border);
        font-size: .82rem; transition: background .15s;
    }
    .qr-history-item:hover { background: rgba(255,255,255,.015); }
    .qr-history-dot {
        width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    }
    .qr-history-dot.ok { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,.4); }
    .qr-history-dot.err { background: #ef4444; box-shadow: 0 0 6px rgba(239,68,68,.4); }
`;

const CheckinTab = ({ checkinId, setCheckinId, checkinLoading, checkinResult, handleCheckin }) => {
    const [mode, setMode] = useState('manual'); // 'manual' | 'camera'
    const [scannerActive, setScannerActive] = useState(false);
    const [scannerStatus, setScannerStatus] = useState(''); // 'scanning' | 'ready' | 'error'
    const [statusMsg, setStatusMsg] = useState('');
    const [history, setHistory] = useState([]);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState('');

    const scannerRef = useRef(null);
    const scannerContainerId = 'qr-reader';
    const lastScanRef = useRef('');
    const scanCooldownRef = useRef(false);

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                const state = scannerRef.current.getState();
                if (state === 2) { // SCANNING state
                    await scannerRef.current.stop();
                }
                scannerRef.current.clear();
            } catch (err) {
                console.error('Scanner stop error:', err);
            }
            scannerRef.current = null;
        }
        setScannerActive(false);
        setScannerStatus('');
        setStatusMsg('');
    };

    // Get available cameras when switching to camera mode; clean up on switch or unmount
    useEffect(() => {
        if (mode === 'camera') {
            Html5Qrcode.getCameras().then(devices => {
                if (devices && devices.length > 0) {
                    setCameras(devices);
                    // Prefer back camera
                    const backCam = devices.find(d =>
                        d.label.toLowerCase().includes('back') ||
                        d.label.toLowerCase().includes('rear') ||
                        d.label.toLowerCase().includes('environment')
                    );
                    setSelectedCamera(backCam?.id || devices[0].id);
                } else {
                    setScannerStatus('error');
                    setStatusMsg('No cameras found on this device.');
                }
            }).catch(err => {
                setScannerStatus('error');
                setStatusMsg('Camera permission denied. Please allow camera access.');
                console.error('Camera error:', err);
            });
        }

        return () => {
            stopScanner();
        };
    }, [mode]);

    const startScanner = async () => {
        if (scannerRef.current) {
            await stopScanner();
        }

        try {
            const html5QrCode = new Html5Qrcode(scannerContainerId);
            scannerRef.current = html5QrCode;

            setScannerStatus('scanning');
            setStatusMsg('Point camera at a QR code...');

            await html5QrCode.start(
                selectedCamera || { facingMode: 'environment' },
                {
                    fps: 10,
                    qrbox: { width: 220, height: 220 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    onScanSuccess(decodedText);
                },
                () => { /* ignore scan failures */ }
            );

            setScannerActive(true);
        } catch (err) {
            setScannerStatus('error');
            setStatusMsg(err.message || 'Failed to start camera.');
            console.error('Scanner start error:', err);
        }
    };

    const parseQrData = (raw) => {
        try {
            const data = JSON.parse(raw);
            return {
                registrationId: data.registrationId || data.id || raw,
                customId: data.customId || '',
                userName: data.userName || '',
                eventName: data.eventName || '',
            };
        } catch {
            // Not JSON — treat the raw string as a registration ID
            return { registrationId: raw.trim(), customId: '', userName: '', eventName: '' };
        }
    };

    const onScanSuccess = (decodedText) => {
        // Debounce: prevent re-scanning same code within 3s
        if (scanCooldownRef.current || decodedText === lastScanRef.current) return;
        lastScanRef.current = decodedText;
        scanCooldownRef.current = true;
        setTimeout(() => { scanCooldownRef.current = false; lastScanRef.current = ''; }, 3000);

        const qr = parseQrData(decodedText);

        setScannerStatus('ready');
        setStatusMsg(qr.userName
            ? `✓ ${qr.userName} — ${qr.eventName} (${qr.customId || qr.registrationId.slice(0, 8)})`
            : `Scanned: ${qr.registrationId.slice(0, 12)}…`
        );

        // Auto-fill with the extracted ID
        setCheckinId(qr.registrationId);

        // Add pending entry to history
        setHistory(prev => [{
            id: qr.registrationId,
            displayId: qr.customId || qr.registrationId.slice(0, 12),
            name: qr.userName || null,
            event: qr.eventName || null,
            time: new Date(),
            status: 'pending',
        }, ...prev.slice(0, 19)]);

        // Trigger check-in after a brief visual pause
        setTimeout(async () => {
            const result = await handleCheckin(qr.registrationId);
            if (result) {
                setHistory(prev => {
                    const updated = [...prev];
                    const idx = updated.findIndex(h => h.id === qr.registrationId && h.status === 'pending');
                    if (idx !== -1) {
                        updated[idx] = {
                            ...updated[idx],
                            status: result.success ? 'ok' : 'err',
                            name: result.registration?.users?.name || updated[idx].name,
                            event: result.registration?.events?.name || updated[idx].event,
                            message: result.message,
                        };
                    }
                    return updated;
                });
            }
        }, 300);
    };

    return (
        <div className="ap-fade">
            <style>{SCANNER_CSS}</style>

            {/* Mode tabs */}
            <div className="qr-mode-tabs">
                <button className={`qr-mode-tab ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>
                    ⌨ Manual Entry
                </button>
                <button className={`qr-mode-tab ${mode === 'camera' ? 'active' : ''}`} onClick={() => setMode('camera')}>
                    📷 Camera Scanner
                </button>
            </div>

            <div className="ap-card">
                <div className="ap-card-title"><span>✓</span> QR Check-In</div>

                {mode === 'camera' && (
                    <>
                        {/* Camera selector */}
                        {cameras.length > 1 && (
                            <div style={{ marginBottom: 12 }}>
                                <select
                                    className="ap-search"
                                    style={{ width: '100%' }}
                                    value={selectedCamera}
                                    onChange={e => { setSelectedCamera(e.target.value); if (scannerActive) stopScanner(); }}
                                >
                                    {cameras.map(cam => (
                                        <option key={cam.id} value={cam.id}>
                                            {cam.label || `Camera ${cam.id.slice(0, 8)}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Scanner viewport */}
                        <div className="qr-scanner-wrap" style={{ maxWidth: 380, margin: '0 auto', marginBottom: 16 }}>
                            <div id={scannerContainerId} style={{ width: '100%' }} />
                            {scannerActive && (
                                <div className="qr-overlay">
                                    <div className="qr-frame">
                                        <span />
                                        <div className="qr-scanline" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Scanner controls */}
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 12 }}>
                            {!scannerActive ? (
                                <button className="ap-btn-submit" onClick={startScanner} style={{ gap: 8 }}>
                                    📷 Start Scanning
                                </button>
                            ) : (
                                <button className="ap-btn-ghost" onClick={stopScanner} style={{ borderColor: 'rgba(239,68,68,.3)', color: '#fca5a5' }}>
                                    ⏹ Stop Scanner
                                </button>
                            )}
                        </div>

                        {/* Scanner status */}
                        {scannerStatus && (
                            <div className={`qr-status ${scannerStatus}`}>
                                {scannerStatus === 'scanning' && <span className="ap-spin" />}
                                {scannerStatus === 'ready' && '✓'}
                                {scannerStatus === 'error' && '⚠'}
                                {statusMsg}
                            </div>
                        )}
                    </>
                )}

                {/* Manual entry — always visible as fallback */}
                <div style={{ marginTop: mode === 'camera' ? 20 : 0 }}>
                    {mode === 'manual' && (
                        <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: 12 }}>
                            Enter a registration ID to check in a participant.
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <input
                            className="ap-search"
                            style={{ flex: 1, width: 'auto' }}
                            placeholder="Registration ID..."
                            value={checkinId}
                            onChange={e => setCheckinId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCheckin()}
                        />
                        <button className="ap-btn-submit" disabled={checkinLoading} onClick={() => handleCheckin()}>
                            {checkinLoading ? <><span className="ap-spin" /> Checking...</> : '✓ Check In'}
                        </button>
                    </div>
                </div>

                {/* Check-in result */}
                {checkinResult && (
                    <div className={`ap-msg ${checkinResult.success ? 'ok' : 'err'}`} style={{ marginTop: 16 }}>
                        {checkinResult.message}
                        {checkinResult.registration && (
                            <div style={{ marginTop: 8, fontSize: '.78rem' }}>
                                <div>Name: <strong>{checkinResult.registration.users?.name}</strong></div>
                                <div>Event: <strong>{checkinResult.registration.events?.name}</strong></div>
                                {checkinResult.registration.team_members && checkinResult.registration.team_members.length > 0 && (
                                    <div style={{ marginTop: 4 }}>Team: <strong>{checkinResult.registration.team_members.map(m => m.name || m).join(', ')}</strong></div>
                                )}
                                <div style={{ marginTop: 4 }}>Payment: <strong>{checkinResult.registration.users?.has_paid ? <span style={{ color: '#86efac' }}>Paid ✅</span> : <span style={{ color: '#fca5a5' }}>Unpaid ❌</span>}</strong></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Scan history */}
            {history.length > 0 && (
                <div className="ap-card qr-history" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                        <div className="ap-card-title" style={{ marginBottom: 0 }}><span>◎</span> Scan History</div>
                    </div>
                    {history.map((h, i) => (
                        <div key={i} className="qr-history-item">
                            <div className={`qr-history-dot ${h.status === 'pending' ? '' : h.status}`}
                                style={h.status === 'pending' ? { background: 'var(--muted2)' } : {}} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '.78rem', color: 'var(--text)', letterSpacing: '.03em' }}>{h.displayId || h.id}</span>
                                    {h.status === 'pending' && <span className="ap-spin" style={{ width: 10, height: 10 }} />}
                                </div>
                                {h.name && <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{h.name} → {h.event}</div>}
                                {h.status === 'err' && h.message && <div style={{ fontSize: '.72rem', color: '#fca5a5' }}>{h.message}</div>}
                            </div>
                            <div style={{ fontSize: '.68rem', color: 'var(--muted2)', flexShrink: 0 }}>
                                {h.time.toLocaleTimeString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CheckinTab;
