import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [role, setRole] = useState(() => localStorage.getItem('role'));
    const [user, setUser] = useState(() => {
        const name = localStorage.getItem('name');
        return name ? { name } : null;
    });
    const [loading, setLoading] = useState(true);

    const refreshMe = async () => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setUser(null);
            setRole(null);
            setLoading(false);
            return;
        }

        try {
            const res = await api.get('/auth/me');
            if (res.data?.user) {
                setUser(res.data.user);
                setRole(res.data.user.role);
                localStorage.setItem('role', res.data.user.role);
                localStorage.setItem('name', res.data.user.name);
            }
        } catch (err) {
            console.warn('Failed to refresh user profile from /auth/me:', err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshMe();
    }, [token]);

    const login = (authToken, userRole, userName) => {
        localStorage.setItem('token', authToken);
        localStorage.setItem('role', userRole);
        localStorage.setItem('name', userName);
        setToken(authToken);
        setRole(userRole);
        setUser({ name: userName, role: userRole });
    };

    const logout = () => {
        localStorage.clear();
        setToken(null);
        setRole(null);
        setUser(null);
        window.location.href = '/login';
    };

    const getErrorMessage = (err) => {
        return err.response?.data?.message || err.message || 'An unexpected error occurred';
    };

    return (
        <AuthContext.Provider value={{
            token,
            role,
            user,
            loading,
            isAuthenticated: Boolean(token),
            login,
            logout,
            refreshMe,
            getErrorMessage
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
