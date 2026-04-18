import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'https://supercart-backend-77807676789.asia-south1.run.app/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000,
    headers: {
        'Bypass-Tunnel-Reminder': 'true'
    }
});

// Interceptor: attach guard token to all requests
api.interceptors.request.use(async (config) => {
    try {
        const token = await AsyncStorage.getItem('guard_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        console.log('Token retrieval error', e);
    }
    return config;
});

export const loginGuard = async (email, password) => {
    const res = await api.post('/guards/login', { email, password });
    return res.data;
};

export const verifyExit = async (exitToken) => {
    const res = await api.post('/guards/verify-exit', { exitToken });
    return res.data;
};

export const getProfile = async () => {
    const res = await api.get('/guards/profile');
    return res.data;
};

export default api;
