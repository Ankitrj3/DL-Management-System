import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    QrCode,
    LayoutDashboard,
    ScanLine,
    History,
    LogOut,
    Users
} from 'lucide-react';

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <Link to="/" className="navbar-brand">
                    <img 
                        src="https://encryptedge.in/encryptedge.ico" 
                        alt="EncryptEdge Logo"
                        className="navbar-logo"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            border: '2px solid var(--accent-primary)',
                            boxShadow: '0 0 20px rgba(255, 23, 68, 0.3)',
                            objectFit: 'contain',
                            background: 'var(--bg-secondary)'
                        }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <span className="navbar-title" style={{ 
                            fontSize: '18px', 
                            fontWeight: '700',
                            letterSpacing: '1px'
                        }}>
                            ENCRYPT EDGE
                        </span>
                        <span style={{ 
                            fontSize: '11px', 
                            color: 'var(--text-muted)',
                            fontWeight: '400',
                            letterSpacing: '0.5px'
                        }}>
                            ATTENDANCE SYSTEM
                        </span>
                    </div>
                </Link>

                <div className="navbar-nav">
                    {isAdmin ? (
                        <>
                            <Link
                                to="/admin"
                                className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                            >
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Link>
                            <Link
                                to="/admin/qr"
                                className={`nav-link ${isActive('/admin/qr') ? 'active' : ''}`}
                            >
                                <QrCode size={18} />
                                QR Code
                            </Link>
                            <Link
                                to="/admin/attendance"
                                className={`nav-link ${isActive('/admin/attendance') ? 'active' : ''}`}
                            >
                                <History size={18} />
                                Attendance
                            </Link>
                            <Link
                                to="/admin/students"
                                className={`nav-link ${isActive('/admin/students') ? 'active' : ''}`}
                            >
                                <Users size={18} />
                                Students
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/dashboard"
                                className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                            >
                                <LayoutDashboard size={18} />
                                Dashboard
                            </Link>
                            <Link
                                to="/scan"
                                className={`nav-link ${isActive('/scan') ? 'active' : ''}`}
                            >
                                <ScanLine size={18} />
                                Scan QR
                            </Link>
                            <Link
                                to="/history"
                                className={`nav-link ${isActive('/history') ? 'active' : ''}`}
                            >
                                <History size={18} />
                                History
                            </Link>
                        </>
                    )}
                </div>

                <div className="user-info">
                    <div className="user-avatar">
                        {getInitials(user?.name)}
                    </div>
                    <div>
                        <div className="user-name">{user?.name}</div>
                        <div className="user-role">{user?.role}</div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn btn-secondary"
                        style={{ padding: '8px' }}
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
