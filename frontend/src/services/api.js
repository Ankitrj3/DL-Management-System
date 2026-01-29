import axios from 'axios';

// Use environment variable for API URL, fallback to same hostname for local dev
const API_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:5001/api`;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const authService = {
    firebaseAuth: (idToken) => api.post('/auth/firebase', { idToken }),
    getProfile: () => api.get('/auth/profile'),
    getUsers: () => api.get('/auth/users'),
    getStudents: () => api.get('/auth/students'),
    addUser: (data) => api.post('/auth/users', data),
    uploadUsers: (formData) => api.post('/auth/users/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    toggleBlock: (userId) => api.patch(`/auth/users/${userId}/toggle-block`),
    deleteUser: (userId) => api.delete(`/auth/users/${userId}`)
};

export const qrService = {
    generateQR: (type) => api.post('/qr/generate', { type }),
    getTodayQR: () => api.get('/qr/today'),
    validateQR: (code, type) => api.post('/qr/validate', { code, type })
};

export const attendanceService = {
    punchAttendance: (qrData) => api.post('/attendance/punch', { qrData }),
    getTodayStatus: () => api.get('/attendance/status'),
    getMyAttendance: () => api.get('/attendance/my'),
    getAllAttendance: (params) => api.get('/attendance/all', { params }),
    getTodayAttendance: () => api.get('/attendance/today'),
    downloadCSV: (params) => api.get('/attendance/download', { params, responseType: 'blob' }),
    getStats: () => api.get('/attendance/stats'),
    getGoogleSheetsUrl: () => api.get('/attendance/sheets-url')
};

export default api;
