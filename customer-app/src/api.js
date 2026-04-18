import axios from 'axios';
import { Platform } from 'react-native';

// PRODUCTION CLOUD API
export const API_URL = 'https://supercart-backend-77807676789.asia-south1.run.app/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Bypass-Tunnel-Reminder': 'true'
    }
});

export const startSession = async (userId, storeId) => {
    return api.post('/cart/start', { userId, storeId });
};

export const addToCart = async (sessionId, barcode, quantity = 1) => {
    return api.post('/cart/add', { sessionId, barcode, quantity });
};

export const createOrder = async (sessionId) => {
    return api.post('/payment/create-order', { sessionId });
};

export const verifyPayment = async (data) => {
    return api.post('/payment/verify', data);
};

export default api;
