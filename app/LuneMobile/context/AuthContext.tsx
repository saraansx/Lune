import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

interface AuthContextType {
    accessToken: string | null;
    spDc: string | null;
    spT: string | null;
    loading: boolean;
    setAuth: (accessToken: string, spDc?: string, spT?: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [spDc, setSpDc] = useState<string | null>(null);
    const [spT, setSpT] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const loadAuth = async () => {
        try {
            const token = await SecureStore.getItemAsync('spotify_access_token');
            const dc = await SecureStore.getItemAsync('sp_dc');
            const t = await SecureStore.getItemAsync('sp_t');
            
            if (token) {
                setAccessToken(token);
                setSpDc(dc);
                setSpT(t);
            }
        } catch (e) {
            console.error("Failed to load auth:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAuth();
    }, []);

    const setAuth = async (token: string, dc?: string, t?: string) => {
        setAccessToken(token);
        if (dc) setSpDc(dc);
        if (t) setSpT(t);
    };

    const logout = async () => {
        await SecureStore.deleteItemAsync('sp_dc');
        await SecureStore.deleteItemAsync('sp_t');
        await SecureStore.deleteItemAsync('spotify_access_token');
        await SecureStore.deleteItemAsync('spotify_token_expiration');
        setAccessToken(null);
        setSpDc(null);
        setSpT(null);
        router.replace('/');
    };

    return (
        <AuthContext.Provider value={{ accessToken, spDc, spT, loading, setAuth, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
