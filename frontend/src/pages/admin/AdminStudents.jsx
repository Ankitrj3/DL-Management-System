import { useState, useEffect } from 'react';
import { authService } from '../../services/api';
import {
    Users,
    UserPlus,
    Upload,
    Search,
    Ban,
    CheckCircle,
    Trash2,
    Mail,
    FileText,
    AlertCircle
} from 'lucide-react';

const AdminStudents = () => {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStudent, setNewStudent] = useState({ email: '', name: '' });
    const [message, setMessage] = useState(null);

    const fetchStudents = async () => {
        try {
            const response = await authService.getStudents();
            setStudents(response.data);
            setFilteredStudents(response.data);
        } catch (error) {
            console.error('Fetch students error:', error);
            setMessage({ type: 'error', text: 'Failed to load students' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        if (search) {
            const filtered = students.filter(s =>
                s.name?.toLowerCase().includes(search.toLowerCase()) ||
                s.email?.toLowerCase().includes(search.toLowerCase())
            );
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents(students);
        }
    }, [search, students]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        setMessage(null);

        try {
            const response = await authService.uploadUsers(formData);
            const { results } = response.data;
            setMessage({
                type: 'success',
                text: `Successfully uploaded: ${results.added} added, ${results.reactivated} reactivated, ${results.skipped} skipped.`
            });
            fetchStudents();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Upload failed' });
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setMessage(null);
        try {
            await authService.addUser(newStudent);
            setMessage({ type: 'success', text: 'Student added successfully' });
            setNewStudent({ email: '', name: '' });
            setShowAddForm(false);
            fetchStudents();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add student' });
        }
    };

    const handleToggleBlock = async (userId) => {
        try {
            await authService.toggleBlock(userId);
            fetchStudents();
        } catch (error) {
            setMessage({ type: 'error', text: 'Action failed' });
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to remove this user from the whitelist? They will no longer be able to login.')) {
            return;
        }
        try {
            await authService.deleteUser(userId);
            fetchStudents();
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to delete user' });
        }
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
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        Whitelist Management 
                        <Users size={28} style={{ color: 'var(--accent-primary)' }} />
                    </h1>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Control which students can access the system
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                        <Upload size={18} />
                        <span className="btn-text">{isUploading ? 'Uploading...' : 'Bulk CSV Upload'}</span>
                        <input
                            type="file"
                            accept=".csv"
                            hidden
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </label>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary"
                    >
                        <UserPlus size={18} />
                        <span className="btn-text">Add Student</span>
                    </button>
                </div>
            </div>

            {message && (
                <div className={`alert alert-${message.type} slide-up`} style={{ marginBottom: '24px' }}>
                    <AlertCircle size={20} />
                    {message.text}
                </div>
            )}

            {showAddForm && (
                <div className="card slide-down" style={{ marginBottom: '24px', maxWidth: '500px' }}>
                    <div className="card-header">
                        <h3 className="card-title">Add Student to Whitelist</h3>
                    </div>
                    <form onSubmit={handleAddStudent} style={{ padding: '20px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Email Address</label>
                            <input
                                type="email"
                                required
                                className="form-input"
                                value={newStudent.email}
                                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                placeholder="student@example.com"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Full Name (Optional)</label>
                            <input
                                type="text"
                                className="form-input"
                                value={newStudent.name}
                                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                placeholder="Paramjit Singh"
                                style={{ width: '100%' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="btn btn-primary">Add Entry</button>
                            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-icon"><Users size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-value">{students.length}</div>
                        <div className="stat-label">Total Whitelisted</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--success)' }}><CheckCircle size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-value">{students.filter(s => !s.isBlocked).length}</div>
                        <div className="stat-label">Active Access</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'var(--error)' }}><Ban size={24} /></div>
                    <div className="stat-content">
                        <div className="stat-value">{students.filter(s => s.isBlocked).length}</div>
                        <div className="stat-label">Blocked Access</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="form-input"
                        style={{ flex: 1 }}
                    />
                </div>
            </div>

            {/* Students List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Access Directory</h3>
                </div>

                {filteredStudents.length > 0 ? (
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Student Details</th>
                                    <th>Account Status</th>
                                    <th>Last Seen</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student, index) => (
                                    <tr key={student._id}>
                                        <td>{index + 1}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    background: 'var(--accent-gradient)',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    color: '#fff'
                                                }}>
                                                    {student.name?.charAt(0) || <Mail size={16} />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600' }}>{student.name || 'Invited Student'}</div>
                                                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{student.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${student.isBlocked ? 'badge-error' : 'badge-success'}`}>
                                                {student.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                            {student.lastLogin ? new Date(student.lastLogin).toLocaleString('en-IN') : 'Never'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleToggleBlock(student._id)}
                                                    className={`btn ${student.isBlocked ? 'btn-success' : 'btn-danger'}`}
                                                    style={{ padding: '6px 12px', fontSize: '12px' }}
                                                    title={student.isBlocked ? 'Unblock' : 'Block Access'}
                                                >
                                                    {student.isBlocked ? <CheckCircle size={14} /> : <Ban size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(student._id)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--error)' }}
                                                    title="Remove from Whitelist"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <Users size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                        <h4 className="empty-title">Whitelist Empty</h4>
                        <p className="empty-text">No students found. Upload a CSV or add them manually.</p>
                    </div>
                )}
            </div>

            {/* CSV Template Info */}
            <div style={{
                marginTop: '32px',
                padding: '24px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px dashed var(--border-color)'
            }}>
                <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={20} color="var(--accent-primary)" />
                    CSV Format Instructions
                </h4>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', fontSize: '14px' }}>
                    Your CSV file should have at least an <code>email</code> column. You can also include a <code>name</code> column.
                </p>
                <div style={{
                    padding: '12px',
                    background: '#000',
                    color: '#0f0',
                    fontFamily: 'monospace',
                    borderRadius: '8px',
                    fontSize: '13px',
                    display: 'inline-block'
                }}>
                    email,name<br />
                    student1@google.com,Paramjit Singh<br />
                    student2@gmail.com,Ankit Ranjan
                </div>
            </div>
        </div>
    );
};

export default AdminStudents;
