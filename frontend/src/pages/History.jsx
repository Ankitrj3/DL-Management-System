import { useState, useEffect } from 'react';
import { attendanceService } from '../services/api';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

const History = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await attendanceService.getMyAttendance();
                setAttendance(response.data);
            } catch (error) {
                console.error('History fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
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

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
                <p style={{ 
                    fontSize: '10px', 
                    fontFamily: 'Minecraft, monospace', 
                    color: '#00ff41', 
                }}>View all your attendance records</p>
            </div>

            <div className="stats-grid" style={{ marginBottom: '32px' }}>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Calendar size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{attendance.length}</div>
                        <div className="stat-label">Total Days Present</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">
                            {attendance.filter(a => a.currentStatus === 'out' && a.punches?.length > 0).length}
                        </div>
                        <div className="stat-label">On Time</div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">All Records</h3>
                </div>

                {attendance.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Punch History</th>
                                    <th>Current Status</th>
                                    <th>Total Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((record, index) => (
                                    <tr key={record._id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Calendar size={16} color="var(--text-muted)" />
                                                {formatDate(record.date)}
                                            </div>
                                        </td>
                                        <td>
                                            {record.punches && record.punches.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                    {record.punches.map((punch, punchIndex) => (
                                                        <div key={punchIndex} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <span className={`badge ${punch.type === 'in' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                                                {punch.type.toUpperCase()}
                                                            </span>
                                                            <Clock size={12} color="var(--text-muted)" />
                                                            <span style={{ fontSize: '12px' }}>{formatTime(punch.time)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>No punches</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${record.currentStatus === 'in' ? 'badge-success' : 'badge-warning'}`}>
                                                {record.currentStatus?.toUpperCase() || 'OUT'}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Clock size={14} color="var(--text-muted)" />
                                                <span style={{ fontWeight: '500' }}>{record.totalDuration || 0} mins</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Calendar size={32} color="var(--text-muted)" />
                        </div>
                        <h4 className="empty-title">No Attendance Records</h4>
                        <p className="empty-text">Start scanning QR codes to build your attendance history</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
