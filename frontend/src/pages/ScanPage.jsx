import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { attendanceService } from '../services/api';
import { CheckCircle2, XCircle, ArrowLeft, AlertCircle, Camera } from 'lucide-react';

const ScanPage = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);
    const [alreadyMarked, setAlreadyMarked] = useState(null);
    const [scannerEnabled, setScannerEnabled] = useState(false);
    const [scanError, setScanError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkTodayStatus();
    }, []);

    const checkTodayStatus = async () => {
        try {
            const response = await attendanceService.getTodayStatus();
            if (response.data.hasPunched) {
                setAlreadyMarked(response.data.attendance);
            }
        } catch (error) {
            console.error('Status check error:', error);
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleScan = async (detectedCodes) => {
        if (loading || !detectedCodes || detectedCodes.length === 0) return;

        const qrCode = detectedCodes[0].rawValue;
        if (!qrCode) return;

        setScannerEnabled(false);
        setLoading(true);

        try {
            const response = await attendanceService.punchAttendance(qrCode);
            setResult({
                success: true,
                message: response.data.message,
                attendance: response.data.attendance
            });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to punch attendance';
            const isAlreadyMarkedError = errorMessage.toLowerCase().includes('already marked');

            setResult({
                success: false,
                isAlreadyMarked: isAlreadyMarkedError,
                message: errorMessage,
                attendance: error.response?.data?.attendance
            });
        } finally {
            setLoading(false);
        }
    };

    const handleError = (error) => {
        console.error('Scanner error:', error);
        if (error?.message?.includes('Permission')) {
            setScanError('Camera permission denied. Please allow camera access.');
        }
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Loading state
    if (checkingStatus) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
                    Checking attendance status...
                </p>
            </div>
        );
    }

    // Already marked state
    if (alreadyMarked) {
        return (
            <div className="fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-secondary"
                    style={{ marginBottom: '24px' }}
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>

                <div className="card">
                    <div className="punch-status">
                        <div className="punch-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                            <AlertCircle size={48} />
                        </div>
                        <h2 className="punch-title">Already Marked</h2>
                        <p className="punch-text">
                            Your attendance for today has already been recorded.
                        </p>

                        <div style={{
                            background: 'var(--bg-secondary)',
                            padding: '20px 24px',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: '24px',
                            width: '100%',
                            maxWidth: '280px'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                                <span style={{ fontWeight: '500' }}>{alreadyMarked.date}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Time:</span>
                                <span style={{ fontWeight: '500' }}>{formatTime(alreadyMarked.punchTime)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                                <span className="badge badge-success">{alreadyMarked.status}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-primary"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Result state
    if (result) {
        return (
            <div className="fade-in" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="card">
                    <div className="punch-status">
                        <div className={`punch-icon ${result.success ? 'success' : ''}`}
                            style={!result.success ? {
                                background: result.isAlreadyMarked ? 'var(--warning-bg)' : 'var(--error-bg)',
                                color: result.isAlreadyMarked ? 'var(--warning)' : 'var(--error)'
                            } : {}}>
                            {result.success ? <CheckCircle2 size={48} /> :
                                result.isAlreadyMarked ? <AlertCircle size={48} /> : <XCircle size={48} />}
                        </div>
                        <h2 className="punch-title">
                            {result.success ? 'Success' :
                                result.isAlreadyMarked ? 'Already Marked' : 'Failed'}
                        </h2>
                        <p className="punch-text">{result.message}</p>

                        {result.success && result.time && (
                            <div style={{
                                background: 'var(--bg-secondary)',
                                padding: '16px 24px',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '24px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                                    <span style={{ fontWeight: '500' }}>{result.attendance?.date || new Date().toISOString().split('T')[0]}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Time:</span>
                                    <span style={{ fontWeight: '500' }}>{formatTime(result.time)}</span>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                                Go to Dashboard
                            </button>
                            {!result.success && !result.isAlreadyMarked && (
                                <button onClick={() => { setResult(null); setScannerEnabled(true); }} className="btn btn-secondary">
                                    Try Again
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Processing state
    if (loading) {
        return (
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="loading-container" style={{ padding: '60px' }}>
                    <div className="loading-spinner"></div>
                    <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
                        Processing attendance...
                    </p>
                </div>
            </div>
        );
    }

    // Main scanner view
    return (
        <div className="fade-in">
            <div style={{ marginBottom: '24px' }}>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn btn-secondary"
                    style={{ marginBottom: '16px' }}
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </button>
                <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                    Scan Attendance QR
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Point your camera at the QR code displayed by admin
                </p>
            </div>

            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                {scanError && (
                    <div className="alert alert-error" style={{ margin: '16px', marginBottom: 0 }}>
                        <AlertCircle size={20} />
                        {scanError}
                    </div>
                )}

                {scannerEnabled ? (
                    <div style={{
                        margin: '16px',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                        background: '#000'
                    }}>
                        <Scanner
                            onScan={handleScan}
                            onError={handleError}
                            constraints={{ facingMode: 'environment' }}
                            styles={{
                                container: { width: '100%' },
                                video: { width: '100%' }
                            }}
                        />
                    </div>
                ) : (
                    <div style={{
                        margin: '16px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '300px',
                        padding: '40px'
                    }}>
                        <Camera size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                            Click the button below to start camera
                        </p>
                    </div>
                )}

                <div style={{ padding: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {!scannerEnabled ? (
                        <button onClick={() => setScannerEnabled(true)} className="btn btn-primary">
                            <Camera size={18} />
                            Start Camera
                        </button>
                    ) : (
                        <button onClick={() => setScannerEnabled(false)} className="btn btn-danger">
                            Stop Camera
                        </button>
                    )}
                </div>
            </div>

            <div style={{
                maxWidth: '500px',
                margin: '24px auto 0',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '14px'
            }}>
                <p>Position the QR code within the camera view</p>
            </div>
        </div>
    );
};

export default ScanPage;
