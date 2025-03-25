import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

interface AuthContextData {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const response = await api.get('/users/me');
            setUser(response.data);
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            setUser(user);
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            throw error;
        }
    };

    const signOut = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 