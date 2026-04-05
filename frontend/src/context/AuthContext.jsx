import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkLoggedIn = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`);
            setUser(res.data);
        } catch (error) {
            console.error("Token expired or invalid", error);
            setUser(null);
        }
        setLoading(false);
    };

    useEffect(() => {
        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
        setUser(res.data.user);
    };

    const googleLogin = async (credential) => {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, { credential });
        setUser(res.data.user);
    };

    const register = async (name, email, password) => {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { name, email, password });
        await login(email, password);
    };

    const logout = async () => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`);
        } catch (error) {
            console.error("Error logging out", error);
        }
        setUser(null);
    };

    const updateUserDetails = (updatedUser) => {
        setUser(updatedUser);
    };

    return (
        <AuthContext.Provider value={{ user, login, googleLogin, register, logout, updateUserDetails, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
