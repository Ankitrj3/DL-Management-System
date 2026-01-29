import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/api';
import {
    CheckCircle2,
    XCircle,
    Camera,
    LogIn,
    LogOut,
    Clock,
    AlertCircle,
    History
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [scannerEnabled, setScannerEnabled] = useState(false);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await attendanceService.getTodayStatus();
            setStatus(response.data);
        } catch (error) {
            console.error('Status fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await attendanceService.getMyAttendance();
            setHistory(response.data);
            setShowHistory(true);
        } catch (error) {
            console.error('History fetch error:', error);
        }
    };

    const handleScan = async (detectedCodes) => {
        if (processing || !detectedCodes || detectedCodes.length === 0) return;

        const qrData = detectedCodes[0].rawValue;
        if (!qrData) return;

        setScannerEnabled(false);
        setProcessing(true);

        try {
            const response = await attendanceService.punchAttendance(qrData);
            setResult({
                success: true,
                type: response.data.type,
                message: response.data.message,
                time: response.data.time
            });
            // Refresh status
            fetchStatus();
        } catch (error) {
            setResult({
                success: false,
                message: error.response?.data?.message || 'Failed to punch attendance'
            });
        } finally {
            setProcessing(false);
        }
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    // Result view
    if (result) {
        return (
            <div className="fade-in" style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
                <div className="card">
                    <div className="punch-status">
                        <div
                            className={`punch-icon ${result.success ? 'success' : ''}`}
                            style={!result.success ? { background: 'var(--error-bg)', color: 'var(--error)' } : {}}
                        >
                            {result.success ? (
                                result.type === 'in' ? <LogIn size={48} /> : <LogOut size={48} />
                            ) : (
                                <XCircle size={48} />
                            )}
                        </div>
                        <h2 className="punch-title">
                            {result.success ? (result.type === 'in' ? 'Checked IN' : 'Checked OUT') : 'Failed'}
                        </h2>
                        <p className="punch-text">{result.message}</p>
                        {result.success && result.time && (
                            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
                                Time: {formatTime(result.time)}
                            </p>
                        )}
                        <button
                            onClick={() => setResult(null)}
                            className="btn btn-primary"
                            style={{ marginTop: '24px' }}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // History view
    if (showHistory) {
        return (
            <div className="fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
                <button
                    onClick={() => setShowHistory(false)}
                    className="btn btn-secondary"
                    style={{ marginBottom: '20px' }}
                >
                    ← Back to Scanner
                </button>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Attendance History</h3>
                    </div>

                    {history.length > 0 ? (
                        <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
                            {history.map((record) => (
                                <div key={record._id} style={{
                                    padding: '16px',
                                    borderBottom: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ fontWeight: '600', marginBottom: '8px' }}>{record.date}</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {record.punches?.map((punch, idx) => (
                                            <span
                                                key={idx}
                                                className={`badge ${punch.type === 'in' ? 'badge-success' : 'badge-warning'}`}
                                            >
                                                {punch.type.toUpperCase()} {formatTime(punch.time)}
                                            </span>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        Total: {record.totalDuration} mins
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>No attendance records found</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
            {/* User Info */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.name}
                            style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                        />
                    ) : (
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'var(--accent-gradient)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            fontWeight: '600'
                        }}>
                            {user?.name?.charAt(0) || '?'}
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0 }}>{user?.name}</h3>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>{user?.email}</p>
                    </div>
                    <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* Current Status */}
            <div className="card" style={{ marginBottom: '20px', textAlign: 'center', padding: '20px' }}>
                <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>Current Status</h4>
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    borderRadius: 'var(--radius-md)',
                    background: status?.currentStatus === 'in' ? 'var(--success-bg)' : 'var(--bg-secondary)',
                    color: status?.currentStatus === 'in' ? 'var(--success)' : 'var(--text-muted)'
                }}>
                    {status?.currentStatus === 'in' ? <LogIn size={20} /> : <LogOut size={20} />}
                    <span style={{ fontWeight: '600', fontSize: '18px' }}>
                        {status?.currentStatus === 'in' ? 'CHECKED IN' : 'CHECKED OUT'}
                    </span>
                </div>

                {status?.punches?.length > 0 && (
                    <div style={{ marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        Today's punches: {status.punches.length} |
                        Duration: {status.totalDuration} mins
                    </div>
                )}
            </div>

            {/* Scanner */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Camera size={20} style={{ marginRight: '8px' }} />
                        Scan QR Code
                    </h3>
                </div>

                {processing ? (
                    <div className="loading-container" style={{ padding: '60px' }}>
                        <div className="loading-spinner"></div>
                        <p style={{ marginTop: '16px' }}>Processing...</p>
                    </div>
                ) : scannerEnabled ? (
                    <div style={{ margin: '16px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <Scanner
                            onScan={handleScan}
                            onError={(err) => console.error('Scan error:', err)}
                            constraints={{ facingMode: 'environment' }}
                            styles={{ container: { width: '100%' }, video: { width: '100%' } }}
                        />
                    </div>
                ) : (
                    <div style={{
                        margin: '16px',
                        padding: '60px 20px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md)',
                        textAlign: 'center'
                    }}>
                        <Camera size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                        <p style={{ color: 'var(--text-muted)' }}>
                            {status?.currentStatus === 'in'
                                ? 'Scan OUT QR to check out'
                                : 'Scan IN QR to check in'}
                        </p>
                    </div>
                )}

                <div style={{ padding: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    {!scannerEnabled ? (
                        <button onClick={() => setScannerEnabled(true)} className="btn btn-primary">
                            <Camera size={18} />
                            Start Scanner
                        </button>
                    ) : (
                        <button onClick={() => setScannerEnabled(false)} className="btn btn-danger">
                            Stop Scanner
                        </button>
                    )}
                </div>
            </div>

            {/* History Button */}
            <button
                onClick={fetchHistory}
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: '20px' }}
            >
                <History size={18} />
                View History
            </button>
        </div>
    );
};

export default Dashboard;
