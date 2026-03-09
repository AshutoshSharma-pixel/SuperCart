import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://supercart-backend-77807676789.asia-south1.run.app/api',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getStore = (id: string) => api.get(`/stores/${id}`);

// Mock stats for dashboard as we didn't implement stats API yet
export const getStats = () => Promise.resolve({
    data: {
        totalSales: 12500,
        activeSessions: 3,
        flaggedUsers: 1
    }
});

// Products
export const getProduct = (barcode: string, storeId: number) => api.get(`/products?barcode=${barcode}&storeId=${storeId}`);
export const addProduct = (data: any) => api.post('/products', data);

export default api;
