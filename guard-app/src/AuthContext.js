import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginGuard } from './api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [guard, setGuard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('guard_token');
            const info = await AsyncStorage.getItem('guard_info');
            if (token && info) {
                setGuard(JSON.parse(info));
            }
        } catch (e) {
            console.log('Auth check failed', e);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const data = await loginGuard(email, password);
        if (data.token && data.guard) {
            await AsyncStorage.setItem('guard_token', data.token);
            await AsyncStorage.setItem('guard_info', JSON.stringify(data.guard));
            setGuard(data.guard);
            return true;
        }
        return false;
    };

    const logout = async () => {
        await AsyncStorage.removeItem('guard_token');
        await AsyncStorage.removeItem('guard_info');
        setGuard(null);
    };

    return (
        <AuthContext.Provider value={{ user: guard, guard, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
