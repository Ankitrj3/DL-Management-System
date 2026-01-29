import { useState, useEffect, useCallback } from 'react';
import { qrService } from '../../services/api';
import { QrCode, RefreshCw, Clock, Calendar, CheckCircle2, ArrowRightLeft } from 'lucide-react';

const AdminQR = () => {
    const [activeType, setActiveType] = useState('in'); // 'in' or 'out'
    const [qrData, setQrData] = useState({ in: null, out: null });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState(15);

    const fetchQR = useCallback(async (type) => {
        try {
            const response = await qrService.generateQR(type);
            setQrData(prev => ({ ...prev, [type]: response.data.qr }));
        } catch (err) {
            console.error(`Failed to fetch ${type} QR:`, err);
            setError(`Failed to update ${type.toUpperCase()} QR code`);
        }
    }, []);

    // Initial fetch and rotation logic
    useEffect(() => {
        const loadInitial = async () => {
            setLoading(true);
            await Promise.all([fetchQR('in'), fetchQR('out')]);
            setLoading(false);
        };
        loadInitial();
    }, [fetchQR]);

    // Timer logic for rotation (every 15s)
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    // Refresh both codes
                    fetchQR('in');
                    fetchQR('out');
                    return 15;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [fetchQR]);

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading && !qrData.in && !qrData.out) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p style={{ marginTop: '16px' }}>Initializing rotating QR codes...</p>
            </div>
        );
    }

    const currentQR = qrData[activeType];

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ 
                        fontFamily: 'Minecraft', 
                        fontSize: '10px', 
                        color: '#ff1744', 
                        marginBottom: '8px',
                        opacity: 0.8
                    }}>
                        MONITORING: 24/7 ACTIVE
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                        Attendance QR Display
                    </h1>
                    <div style={{ 
                        fontFamily: 'Minecraft', 
                        fontSize: '10px', 
                        color: '#00ff41',
                        marginBottom: '4px'
                    }}>
                        SECURITY CLEARANCE: TOP SECRET
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Codes rotate every 15 seconds for security
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontSize: '14px',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '6px'
                    }}>
                        <Clock size={14} />
                        Next rotation in
                    </div>
                    <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: countdown <= 5 ? 'var(--error)' : countdown <= 10 ? 'var(--warning)' : 'var(--accent-primary)'
                    }}>
                        {countdown}s
                    </div>
                </div>
            </div>

            {error && (
                <div className="alert alert-error slide-up" style={{ marginBottom: '24px' }}>
                    {error}
                    <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
                </div>
            )}

            {/* Type Selector */}
            <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
                padding: '6px',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                width: 'fit-content',
                margin: '0 auto 24px'
            }}>
                <button
                    onClick={() => setActiveType('in')}
                    className={`btn ${activeType === 'in' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ borderRadius: '8px', padding: '10px 24px' }}
                >
                    Entry (IN)
                </button>
                <button
                    onClick={() => setActiveType('out')}
                    className={`btn ${activeType === 'out' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ borderRadius: '8px', padding: '10px 24px' }}
                >
                    Exit (OUT)
                </button>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                {currentQR ? (
                    <div className="qr-container" style={{ padding: '20px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '20px',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            background: activeType === 'in' ? 'var(--success-bg)' : 'var(--warning-bg)',
                            color: activeType === 'in' ? 'var(--success)' : 'var(--warning)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            {activeType === 'in' ? 'Entry Mode' : 'Exit Mode'}
                        </div>

                        <div className="qr-code-wrapper" style={{
                            background: '#fff',
                            padding: '20px',
                            borderRadius: '24px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            margin: '0 auto 24px',
                            maxWidth: '350px',
                            border: countdown <= 5 ? '3px solid var(--error)' : countdown <= 10 ? '2px solid var(--warning)' : 'none',
                            animation: countdown <= 5 ? 'qr-pulse 1s infinite' : 'none'
                        }}>
                            <img
                                src={currentQR.qrImage}
                                alt={`${activeType} QR Code`}
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>

                        <div className="qr-info">
                            <div className="qr-date" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                                <Calendar size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                                {formatDate(currentQR.date)}
                            </div>
                            <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                Scan this code to mark your {activeType === 'in' ? 'entry' : 'exit'}
                            </p>
                        </div>

                        <div style={{
                            marginTop: '24px',
                            padding: '12px',
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            color: 'var(--text-muted)'
                        }}>
                            ID: {currentQR.code}
                        </div>
                    </div>
                ) : (
                    <div className="qr-container" style={{ padding: '60px' }}>
                        <RefreshCw size={48} className="spin" style={{ color: 'var(--text-muted)' }} />
                        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Generating QR code...</p>
                    </div>
                )}
            </div>

            <div style={{
                maxWidth: '600px',
                margin: '32px auto 0',
                padding: '24px',
                background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)'
            }}>
                <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowRightLeft size={18} color="var(--accent-primary)" />
                    System Rules
                </h4>
                <ul style={{ color: 'var(--text-secondary)', paddingLeft: '20px', lineHeight: '1.8', fontSize: '14px' }}>
                    <li><strong>Rotation:</strong> Codes change every 15s to prevent social media sharing or misuse.</li>
                    <li><strong>Sequence:</strong> Users <strong>MUST</strong> scan EXIT before they can scan ENTRY again.</li>
                    <li><strong>Multiple Punches:</strong> The system supports multiple in/out cycles (e.g., for lunch breaks).</li>
                    <li><strong>History:</strong> All punches are recorded with exact timestamps in the database and synced.</li>
                </ul>
            </div>
        </div>
    );
};

export default AdminQR;
