import { useState, useEffect } from 'react';
import { attendanceService } from '../../services/api';
import { Calendar, Download, Search, Clock, User, ExternalLink, FileSpreadsheet } from 'lucide-react';

const AdminAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [filters, setFilters] = useState({
        date: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async (params = {}) => {
        setLoading(true);
        try {
            const response = await attendanceService.getAllAttendance(params);
            setAttendance(response.data);
        } catch (error) {
            console.error('Fetch attendance error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        const params = {};
        if (filters.date) {
            params.date = filters.date;
        } else if (filters.startDate && filters.endDate) {
            params.startDate = filters.startDate;
            params.endDate = filters.endDate;
        }
        fetchAttendance(params);
    };

    const handleClearFilters = () => {
        setFilters({ date: '', startDate: '', endDate: '' });
        fetchAttendance();
    };

    const handleDownloadCSV = async () => {
        setDownloading(true);
        try {
            const params = {};
            if (filters.date) {
                params.date = filters.date;
            } else if (filters.startDate && filters.endDate) {
                params.startDate = filters.startDate;
                params.endDate = filters.endDate;
            }

            const response = await attendanceService.downloadCSV(params);

            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_${filters.date || 'all'}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
        } finally {
            setDownloading(false);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
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

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                    Attendance Records
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    View and export attendance data
                </p>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="filter-bar">
                    <div className="filter-group">
                        <label className="filter-label">Specific Date</label>
                        <input
                            type="date"
                            name="date"
                            value={filters.date}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />
                    </div>

                    <div style={{ color: 'var(--text-muted)', alignSelf: 'flex-end', paddingBottom: '10px' }}>
                        OR
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            className="filter-input"
                        />
                    </div>

                    <button onClick={handleSearch} className="btn btn-primary" style={{ alignSelf: 'flex-end' }}>
                        <Search size={18} />
                        Search
                    </button>

                    <button onClick={handleClearFilters} className="btn btn-secondary" style={{ alignSelf: 'flex-end' }}>
                        Clear
                    </button>

                    <button
                        onClick={handleDownloadCSV}
                        className="btn btn-success"
                        style={{ alignSelf: 'flex-end' }}
                        disabled={downloading || attendance.length === 0}
                    >
                        <Download size={18} />
                        {downloading ? 'Downloading...' : 'Download CSV'}
                    </button>

                    <a
                        href="https://docs.google.com/spreadsheets/d/1dP_nCefeXfha3RtDW5lGh_FhubKGW8w5-D27-GadM1k/edit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ alignSelf: 'flex-end', textDecoration: 'none' }}
                    >
                        <FileSpreadsheet size={18} />
                        <ExternalLink size={14} />
                        Google Sheets
                    </a>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="card">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Records</h3>
                        <p className="card-subtitle">{attendance.length} entries found</p>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                    </div>
                ) : attendance.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Email</th>
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
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    background: 'var(--accent-gradient)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    {record.name?.charAt(0)}
                                                </div>
                                                <span style={{ fontWeight: '500' }}>{record.name}</span>
                                            </div>
                                        </td>
                                        <td>{record.email}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} color="var(--text-muted)" />
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
                        <h4 className="empty-title">No Records Found</h4>
                        <p className="empty-text">No attendance records match your search criteria</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAttendance;
