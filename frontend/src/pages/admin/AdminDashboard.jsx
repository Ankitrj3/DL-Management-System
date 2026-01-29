import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { attendanceService, authService } from '../../services/api';
import {
    Users,
    Calendar,
    CheckCircle2,
    QrCode,
    TrendingUp,
    Clock,
    LogIn,
    LogOut,
    ExternalLink,
    FileSpreadsheet
} from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [todayAttendance, setTodayAttendance] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, todayRes, studentsRes] = await Promise.all([
                    attendanceService.getStats(),
                    attendanceService.getTodayAttendance(),
                    authService.getStudents()
                ]);

                setStats({
                    ...statsRes.data,
                    totalStudents: studentsRes.data.length
                });
                setTodayAttendance(todayRes.data);
            } catch (error) {
                console.error('Dashboard fetch error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                <div style={{ 
                    fontFamily: 'Minecraft', 
                    fontSize: '10px', 
                    color: '#00ff41', 
                    marginBottom: '8px',
                    opacity: 0.7
                }}>
                    PROTOCOL HTTPS/TLS 1.3
                </div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                    Command Center
                </h1>
                <div style={{ 
                    fontFamily: 'Minecraft', 
                    fontSize: '10px', 
                    color: '#ff1744', 
                    marginBottom: '4px'
                }}>
                    SERVER STATUS: OPERATIONAL
                </div>
                <div style={{ 
                    fontFamily: 'Minecraft', 
                    fontSize: '10px', 
                    color: '#00ff41'
                }}>
                    BACKUP SYSTEMS READY
                </div>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                    {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid" style={{ marginBottom: '32px' }}>
                <div className="stat-card">
                    <div className="stat-icon">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.totalStudents || 0}</div>
                        <div className="stat-label">Whitelisted Users</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                        <CheckCircle2 size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.todayCount || 0}</div>
                        <div className="stat-label">Active Today</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                        <LogIn size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.currentlyIn || 0}</div>
                        <div className="stat-label">Currently IN</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.totalDays || 0}</div>
                        <div className="stat-label">Total Days</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <Link to="/admin/qr" className="stat-card" style={{
                    cursor: 'pointer',
                    textDecoration: 'none',
                    padding: '24px',
                    borderColor: 'var(--accent-primary)',
                    background: 'rgba(52, 115, 245, 0.05)'
                }}>
                    <QrCode size={32} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>QR Scanner Display</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Open IN/OUT QR codes for students to scan.</p>
                </Link>

                <Link to="/admin/students" className="stat-card" style={{ cursor: 'pointer', textDecoration: 'none', padding: '24px' }}>
                    <Users size={32} color="var(--success)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Manage Whitelist</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Add students, upload CSV, or block users.</p>
                </Link>

                <Link to="/admin/attendance" className="stat-card" style={{ cursor: 'pointer', textDecoration: 'none', padding: '24px' }}>
                    <Calendar size={32} color="var(--warning)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>View Logs</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Check attendance records and download CSVs.</p>
                </Link>

                <a 
                    href="https://docs.google.com/spreadsheets/d/1dP_nCefeXfha3RtDW5lGh_FhubKGW8w5-D27-GadM1k/edit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="stat-card" 
                    style={{ 
                        cursor: 'pointer', 
                        textDecoration: 'none', 
                        padding: '24px',
                        borderColor: 'var(--success)',
                        background: 'rgba(16, 185, 129, 0.05)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <FileSpreadsheet size={32} color="var(--success)" />
                        <ExternalLink size={16} color="var(--success)" />
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>Google Sheets</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
                        View live attendance data in Google Sheets.
                    </p>
                    <div style={{ 
                        marginTop: '12px', 
                        padding: '4px 8px', 
                        background: 'var(--success-bg)', 
                        color: 'var(--success)', 
                        borderRadius: '12px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        width: 'fit-content'
                    }}>
                        Auto-syncing
                    </div>
                </a>
            </div>

            {/* Today's Activity */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Recent Activity</h3>
                        <p className="card-subtitle">
                            {todayAttendance.length} students have participated today
                        </p>
                    </div>
                    <Link to="/admin/attendance" className="btn btn-secondary" style={{ padding: '8px 16px' }}>
                        Full Audit Log
                    </Link>
                </div>

                {todayAttendance.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student</th>
                                    <th>Latest Punch</th>
                                    <th>Current Status</th>
                                    <th>Time Spent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {todayAttendance.slice(0, 5).map((record, index) => {
                                    const latestPunch = record.punches?.length > 0
                                        ? record.punches[record.punches.length - 1]
                                        : null;

                                    return (
                                        <tr key={record._id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div style={{ fontWeight: '600' }}>{record.name}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{record.email}</div>
                                            </td>
                                            <td>
                                                {latestPunch ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span className={`badge ${latestPunch.type === 'in' ? 'badge-success' : 'badge-warning'}`}>
                                                            {latestPunch.type.toUpperCase()}
                                                        </span>
                                                        <span style={{ fontSize: '13px' }}>{formatTime(latestPunch.time)}</span>
                                                    </div>
                                                ) : 'No punches'}
                                            </td>
                                            <td>
                                                <span className={`badge ${record.currentStatus === 'in' ? 'badge-success' : 'badge-secondary'}`}>
                                                    {record.currentStatus.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: '500' }}>{record.totalDuration} mins</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state" style={{ padding: '40px' }}>
                        <div className="empty-icon">
                            <Clock size={32} color="var(--text-muted)" />
                        </div>
                        <h4 className="empty-title">No activity recorded yet today</h4>
                        <Link to="/admin/qr" className="btn btn-primary" style={{ marginTop: '16px' }}>
                            Open QR Display
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
