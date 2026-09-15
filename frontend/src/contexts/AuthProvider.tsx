import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import axios from 'axios';
import type { User } from "./AuthContext";
import { AuthContext } from "./AuthContext";

const BASE = import.meta.env.VITE_API_BASE_URL;
const api = axios.create({
        baseURL: BASE,
        withCredentials: true
    });

export default function AuthProvider({children}: {children: ReactNode}) {
    const [isAuth, setAuth] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    const login = async (email: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        try {
            const res = await api.post('/api/auth/login', formData);
            if (res) {
                setUser(res.data.user);
                setAuth(true);
                return true;
            }
        } catch (err) {
            console.error('Failed to login', err);
            return false;
        }
    }

    const logout = async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (err) {
            console.error('Request to logout failed', err);
        } finally {
            setAuth(false);
            setUser(null);
        }
    }

    const register = async (username: string, email: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);

        try {
            const res = await api.post('/api/auth/register', formData);
            if (res.data.success) {
                return true;
            } else {
                return {'success': res.data.success, 'message': res.data.message, 'type': res.data.type};
            }
        } catch (err) {
            console.error('Could not register account', err);
            return false;
        }
    }

    useEffect(() => {
        const checkSession = async () => {
            try {
                const res = await api.get('/api/users/me');
                if (res) {
                    setUser(res.data);
                    setAuth(true);
                }
            } catch (err) {
                console.error('No session', err);
                setUser(null);
                setAuth(false);
                logout();
            }
        }
        checkSession();
    }, [])

    return (
        <AuthContext.Provider value={{ isAuth, user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    )
}