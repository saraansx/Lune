import React, { createContext, useContext, useMemo } from 'react';
import { SpotifyGqlApi } from '@/Plugin/gql';

interface ApiContextType {
    api: SpotifyGqlApi;
    spT?: string;
}

const ApiContext = createContext<ApiContextType | null>(null);

interface ApiProviderProps {
    accessToken: string;
    spDc?: string;
    spT?: string;
    onUnauthorized?: () => void;
    children: React.ReactNode;
}

export const ApiProvider: React.FC<ApiProviderProps> = ({ accessToken, spDc, spT, onUnauthorized, children }) => {
    const api = useMemo(() => new SpotifyGqlApi(accessToken, spDc, spT, onUnauthorized), [accessToken, spDc, spT, onUnauthorized]);

    return (
        <ApiContext.Provider value={{ api, spT }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = (): ApiContextType => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return context;
};
