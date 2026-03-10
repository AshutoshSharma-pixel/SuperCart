import axios from 'axios';

// Environment variable with production fallback
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://supercart-backend-77807676789.asia-south1.run.app/api',
});

// Attach token to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Admin Auth
export const adminLogin = (username: string, password: string) =>
    api.post('/admin/login', { username, password });

// Dashboard API
export const getAdminTransactions = () => api.get('/admin/transactions');
export const getAdminFlags = () => api.get('/admin/flags');

// Read-only specific components if needed (Store/Product views if exposed via common API)
export const getAllProducts = () => api.get('/products');

export default api;
