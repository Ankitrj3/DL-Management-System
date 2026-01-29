import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, RotateCcw, AlertCircle } from 'lucide-react';

const QRScanner = ({ onScan, onError }) => {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const html5QrCodeRef = useRef(null);
    const isMountedRef = useRef(true);

    const startScanning = async () => {
        try {
            setError(null);
            setPermissionDenied(false);

            // Check if camera permission is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError('Camera not supported on this browser. Please use a modern browser.');
                return;
            }

            // Request camera permission first
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());
            } catch (permErr) {
                console.error('Permission error:', permErr);
                setPermissionDenied(true);
                setError('Camera access denied. Please allow camera permission and try again.');
                return;
            }

            // Create scanner instance if not exists
            if (!html5QrCodeRef.current) {
                html5QrCodeRef.current = new Html5Qrcode('qr-reader');
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1
            };

            await html5QrCodeRef.current.start(
                { facingMode: 'environment' },
                config,
                (decodedText) => {
                    if (isMountedRef.current) {
                        onScan(decodedText);
                        stopScanning();
                    }
                },
                (errorMessage) => {
                    // Ignore continuous scan errors
                }
            );

            if (isMountedRef.current) {
                setIsScanning(true);
            }
        } catch (err) {
            console.error('Scanner error:', err);

            let errorMessage = 'Unable to start camera. ';
            if (err.message?.includes('NotAllowedError') || err.message?.includes('Permission')) {
                errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
                setPermissionDenied(true);
            } else if (err.message?.includes('NotFoundError')) {
                errorMessage = 'No camera found on this device.';
            } else if (err.message?.includes('NotReadableError')) {
                errorMessage = 'Camera is being used by another application.';
            } else {
                errorMessage += err.message || 'Please try again.';
            }

            if (isMountedRef.current) {
                setError(errorMessage);
                if (onError) onError(err);
            }
        }
    };

    const stopScanning = async () => {
        try {
            if (html5QrCodeRef.current) {
                const state = html5QrCodeRef.current.getState();
                if (state === 2) { // SCANNING state
                    await html5QrCodeRef.current.stop();
                }
            }
            if (isMountedRef.current) {
                setIsScanning(false);
            }
        } catch (err) {
            console.error('Stop scanning error:', err);
            if (isMountedRef.current) {
                setIsScanning(false);
            }
        }
    };

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            if (html5QrCodeRef.current) {
                try {
                    html5QrCodeRef.current.stop().catch(() => { });
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        };
    }, []);

    return (
        <div className="scanner-container">
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">QR Code Scanner</h3>
                </div>

                {error && (
                    <div className="alert alert-error" style={{ margin: '16px', marginBottom: 0 }}>
                        <AlertCircle size={20} />
                        <div>
                            <span>{error}</span>
                            {permissionDenied && (
                                <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>
                                    Go to browser settings → Site Settings → Camera → Allow
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <div
                    id="qr-reader"
                    className="scanner-view"
                    style={{
                        minHeight: '300px',
                        display: isScanning ? 'block' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-secondary)',
                        margin: '16px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden'
                    }}
                >
                    {!isScanning && !error && (
                        <div className="empty-state" style={{ padding: '40px' }}>
                            <div className="empty-icon">
                                <Camera size={32} color="var(--text-muted)" />
                            </div>
                            <p className="empty-text">Click "Start Scanning" to activate camera</p>
                        </div>
                    )}
                </div>

                <div style={{ padding: '0 16px 16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {!isScanning ? (
                        <button onClick={startScanning} className="btn btn-primary">
                            <Camera size={18} />
                            Start Scanning
                        </button>
                    ) : (
                        <>
                            <button onClick={stopScanning} className="btn btn-danger">
                                <CameraOff size={18} />
                                Stop
                            </button>
                            <button
                                onClick={async () => {
                                    await stopScanning();
                                    setTimeout(startScanning, 500);
                                }}
                                className="btn btn-secondary"
                            >
                                <RotateCcw size={18} />
                                Restart
                            </button>
                        </>
                    )}
                </div>

                <div style={{
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    Position the QR code within the scanning area
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
