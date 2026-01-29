import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { signInWithGoogle, firebaseSignOut } from '../config/firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (storedToken && storedUser) {
                try {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                    const response = await authService.getProfile();
                    setUser(response.data);
                    localStorage.setItem('user', JSON.stringify(response.data));
                } catch (error) {
                    console.error('Auth init error:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const loginWithGoogle = async () => {
        try {
            // Sign in with Google Firebase
            const { idToken } = await signInWithGoogle();

            // Authenticate with our backend
            const response = await authService.firebaseAuth(idToken);
            const { token: newToken, ...userData } = response.data;

            setToken(newToken);
            setUser(userData);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            return userData;
        } catch (error) {
            console.error('Google login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await firebaseSignOut();
        } catch (e) {
            console.error('Firebase signout error:', e);
        }
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const isAuthenticated = !!token && !!user;
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            loginWithGoogle,
            logout,
            isAuthenticated,
            isAdmin
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
