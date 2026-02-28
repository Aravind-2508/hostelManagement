import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_URL from '../config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const adminInfo = localStorage.getItem('adminInfo');
            if (adminInfo) {
                setAdmin(JSON.parse(adminInfo));
            }
        } catch (e) {
            localStorage.removeItem('adminInfo');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post(`${API_URL}/api/admin/login`, { email, password });
            setAdmin(data);
            localStorage.setItem('adminInfo', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Check your credentials.'
            };
        }
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem('adminInfo');
    };

    /**
     * Call this after a successful profile update so the sidebar/topbar
     * reflects the new name immediately, without requiring a re-login.
     */
    const updateAdmin = (updatedData) => {
        const merged = { ...admin, ...updatedData };
        setAdmin(merged);
        localStorage.setItem('adminInfo', JSON.stringify(merged));
    };

    // Don't render children until we've checked localStorage
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-indigo-50">
                <div className="text-indigo-600 text-lg font-semibold">Loading...</div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ admin, login, logout, updateAdmin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
