import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.5.185:5001/api',
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
