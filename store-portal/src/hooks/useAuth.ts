import { useState } from 'react'
import type { Store } from '../types'

export function useAuth() {
    const [token, setToken] = useState<string | null>(localStorage.getItem('store_token'))
    const [store, setStore] = useState<Store | null>(() => {
        const storeRaw = localStorage.getItem('store_info')
        if (storeRaw) {
            try {
                return JSON.parse(storeRaw) as Store
            } catch (e) {
                console.error("Failed to parse store info from localStorage");
                return null
            }
        }
        return null
    })

    const isAuthenticated = !!token && !!store

    const logout = () => {
        localStorage.removeItem('store_token')
        localStorage.removeItem('store_info')
        window.location.href = '/login'
    }

    // Update localStorage when setting token/store during login
    const login = (newToken: string, newStore: Store) => {
        localStorage.setItem('store_token', newToken)
        localStorage.setItem('store_info', JSON.stringify(newStore))
        setToken(newToken)
        setStore(newStore)
    }

    return { token, store, isAuthenticated, logout, login }
}
