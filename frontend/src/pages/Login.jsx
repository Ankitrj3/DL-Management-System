import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, ShieldCheck, User } from 'lucide-react';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = async (intendedRole) => {
        setLoading(true);
        setError('');

        try {
            const userData = await loginWithGoogle();

            // Check if user has the permission for the role they intended
            // Although backend handles the actual role, this provides a better UX
            if (intendedRole === 'admin' && userData.role !== 'admin') {
                setError('You do not have administrative privileges.');
                return;
            }

            if (userData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-header">
                    <img 
                        src="https://encryptedge.in/encryptedge.ico" 
                        alt="EncryptEdge Logo"
                        className="login-logo"
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '16px',
                            border: '3px solid var(--accent-primary)',
                            boxShadow: '0 0 30px rgba(255, 23, 68, 0.4)',
                            marginBottom: '24px',
                            objectFit: 'contain',
                            background: 'var(--bg-secondary)'
                        }}
                    />
                    <h1 className="login-title" style={{ 
                        fontSize: '32px',
                        fontWeight: '700',
                        letterSpacing: '2px',
                        marginBottom: '8px'
                    }}>
                        ENCRYPT EDGE
                    </h1>
                    <p className="login-subtitle" style={{
                        color: 'var(--accent-primary)',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        fontSize: '16px'
                    }}>
                        ATTENDANCE SYSTEM
                    </p>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '14px',
                        marginTop: '8px',
                        fontFamily: 'Minecraft'
                    }}>
                        Secure • Reliable • Efficient
                    </p>
                </div>

                <div className="login-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px',
                    width: '100%',
                    maxWidth: '900px',
                    margin: '0 auto'
                }}>
                    {/* Student Login Card */}
                    <div className="login-card fade-in">
                        <div className="login-form">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'var(--accent-gradient)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                color: '#fff'
                            }}>
                                <User size={24} />
                            </div>
                            <h2 style={{ marginBottom: '8px', fontSize: '22px' }}>Student Portal</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                                Scan QR codes to mark your in/out attendance.
                            </p>

                            <button
                                onClick={() => handleGoogleLogin('student')}
                                disabled={loading}
                                className="btn-google"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    padding: '14px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    background: '#fff',
                                    color: '#333',
                                    border: '1px solid #ddd',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" />
                                Sign in as Student
                            </button>
                        </div>
                    </div>

                    {/* Admin Login Card */}
                    <div className="login-card fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="login-form">
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #FF4B2B 0%, #FF416C 100%)',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                color: '#fff'
                            }}>
                                <ShieldCheck size={24} />
                            </div>
                            <h2 style={{ marginBottom: '8px', fontSize: '22px' }}>Admin Login</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                                Manage students, generate codes and view analytics.
                            </p>

                            <button
                                onClick={() => handleGoogleLogin('admin')}
                                disabled={loading}
                                className="btn-google"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '12px',
                                    padding: '14px',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    background: '#333',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="18" style={{ filter: 'brightness(0) invert(1)' }} />
                                Admin Secure Sign In
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error slide-up" style={{
                        marginTop: '24px',
                        maxWidth: '500px',
                        margin: '24px auto 0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <div style={{
                    marginTop: '40px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '13px'
                }}>
                    <p>© 2024 Duty Leave Management System • Developed by Core Team</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
